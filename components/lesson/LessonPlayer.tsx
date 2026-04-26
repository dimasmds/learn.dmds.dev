'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLearningStore } from '@/lib/presentations/stores/learning-store';
import { useProgressStore } from '@/lib/presentations/stores/progress-store';
import { StepRenderer } from '@/components/steps/StepRenderer';
import { StepData } from '@/components/steps/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LessonPlayerProps {
  lessonId: string;
  userId?: string;
}

export function LessonPlayer({ lessonId, userId }: LessonPlayerProps) {
  const router = useRouter();

  const {
    lessonDetail,
    isLoading: lessonLoading,
    error: lessonError,
    fetchLessonDetail,
    clearError: clearLessonError,
  } = useLearningStore();

  const {
    progress,
    updateStepProgress,
  } = useProgressStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchLessonDetail(lessonId);
  }, [lessonId, fetchLessonDetail]);

  useEffect(() => {
    if (userId) {
      useProgressStore.getState().fetchProgress(userId);
    }
  }, [userId]);

  // Sync progress data into completed set
  useEffect(() => {
    if (progress.length > 0 && lessonDetail) {
      const lessonProgress = progress.filter(
        (p) => p.lessonId === lessonId && p.status === 'completed'
      );
      setCompletedStepIds(new Set(lessonProgress.map((p) => p.stepId)));
    }
  }, [progress, lessonId]);

  // Sort steps by order
  const steps: StepData[] = lessonDetail
    ? [...lessonDetail.steps].sort((a, b) => a.order - b.order).map((s) => ({
        id: s.id,
        type: s.type as StepData['type'],
        order: s.order,
        instruction: s.instruction,
        content: s.content,
        solution: {},
        hints: [],
        xpReward: s.xpReward,
      }))
    : [];

  const totalSteps = steps.length;
  const completedCount = completedStepIds.size;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const currentStep = steps[currentStepIndex] || null;
  const isAllCompleted = totalSteps > 0 && completedCount >= totalSteps;

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (!currentStep) return;

      if (isCorrect && userId) {
        updateStepProgress(userId, currentStep.id, 'completed');
        setCompletedStepIds((prev) => {
          const next = new Set(prev);
          next.add(currentStep.id);
          return next;
        });
      } else if (isCorrect) {
        setCompletedStepIds((prev) => {
          const next = new Set(prev);
          next.add(currentStep.id);
          return next;
        });
      }

      // Auto advance after delay
      if (isCorrect && currentStepIndex < totalSteps - 1) {
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 1500);
      }
    },
    [currentStep, userId, updateStepProgress, currentStepIndex, totalSteps]
  );

  const handleNext = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const handlePrev = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleRetry = useCallback(() => {
    clearLessonError();
    fetchLessonDetail(lessonId);
  }, [clearLessonError, fetchLessonDetail, lessonId]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  // Loading state
  if (lessonLoading && !lessonDetail) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-foreground/10 rounded w-1/3" />
            <div className="h-4 bg-foreground/10 rounded w-full" />
            <div className="h-48 bg-foreground/10 rounded" />
            <div className="flex justify-center gap-2">
              <div className="h-3 w-3 bg-foreground/10 rounded-full" />
              <div className="h-3 w-3 bg-foreground/10 rounded-full" />
              <div className="h-3 w-3 bg-foreground/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (lessonError) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-6 text-center">
          <p className="text-lg font-medium mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-foreground/60 mb-4">{lessonError}</p>
          <Button onClick={handleRetry} variant="default" size="md">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // No lesson data
  if (!lessonDetail || steps.length === 0) {
    return null;
  }

  // Completion state
  if (isAllCompleted) {
    const totalXp = steps.reduce((sum, s) => sum + s.xpReward, 0);
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Pelajaran Selesai!</h2>
          <p className="text-foreground/70 mb-4">
            Kamu telah menyelesaikan <strong>{lessonDetail.lesson.title}</strong>
          </p>
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-main px-4 py-2 text-main-foreground font-bold text-lg shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]">
            ⭐ +{totalXp} XP
          </div>
          <div className="mt-6">
            <Button onClick={() => router.back()} variant="default" size="md">
              Kembali ke Daftar Pelajaran
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isStepCompleted = (stepId: string) => completedStepIds.has(stepId);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[var(--color-border)]">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            ← Kembali
          </button>
          <h1 className="text-lg font-bold text-foreground truncate mx-4">
            {lessonDetail.lesson.title}
          </h1>
          <span className="text-sm font-medium text-foreground/60 whitespace-nowrap">
            Langkah {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2 border-b-2 border-[var(--color-border)] bg-secondary-background">
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-xs font-medium text-foreground/60 w-10 text-right">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="p-4 min-h-[300px]">
          {currentStep && (
            <StepRenderer
              step={currentStep}
              onAnswer={handleAnswer}
              isCompleted={isStepCompleted(currentStep.id)}
            />
          )}
        </div>

        {/* Step indicator dots and navigation */}
        <div className="border-t-2 border-[var(--color-border)] p-4">
          {/* Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((step, idx) => {
              const completed = isStepCompleted(step.id);
              const isCurrent = idx === currentStepIndex;

              let dotClass =
                'w-3 h-3 rounded-full border-2 border-[var(--color-border)] transition-colors';

              if (completed) {
                dotClass += ' bg-main border-main';
              } else if (isCurrent) {
                dotClass += ' bg-foreground/20 ring-2 ring-main ring-offset-1';
              } else {
                dotClass += ' bg-secondary-background';
              }

              return (
                <button
                  key={step.id}
                  className={dotClass}
                  onClick={() => setCurrentStepIndex(idx)}
                  aria-label={`Langkah ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
            >
              ← Sebelumnya
            </Button>
            <Button
              variant="default"
              size="md"
              onClick={handleNext}
              disabled={currentStepIndex === totalSteps - 1}
            >
              Berikutnya →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
