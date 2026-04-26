'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLessonDetail, useUpdateStepProgress } from '../hooks/useLesson';
import { useStepNavigation } from '../hooks/useStepNavigation';
import { StepRenderer } from './StepRenderer';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { StepData } from '../types';

interface LessonPlayerProps {
  lessonId: string;
  userId?: string;
}

export function LessonPlayer({ lessonId, userId }: LessonPlayerProps) {
  const router = useRouter();
  const { data, isLoading, error } = useLessonDetail(lessonId);
  const navigation = useStepNavigation();
  const updateProgress = useUpdateStepProgress();

  // Initialize lesson when data loads
  useEffect(() => {
    if (data?.steps && data.steps.length > 0 && navigation.lessonId !== lessonId) {
      navigation.startLesson(lessonId, data.steps);
    }
  }, [data, lessonId, navigation]);

  // Handle answer submission
  const handleAnswer = (isCorrect: boolean) => {
    if (!navigation.currentStep) return;

    // Persist progress if userId is available
    if (userId && isCorrect) {
      updateProgress.mutate({
        userId,
        stepId: navigation.currentStep.id,
        status: 'CORRECT',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-foreground/60">Memuat pelajaran...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-red-600 font-medium mb-2">Gagal memuat pelajaran</p>
            <p className="text-sm text-foreground/60">{String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !navigation.currentStep) {
    return null;
  }

  // Completion card
  if (navigation.isLessonComplete) {
    const totalXP = data.steps.reduce((sum: number, s: StepData) => sum + s.xpReward, 0);
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-xl font-bold mb-2">Pelajaran Selesai!</h2>
            <p className="text-foreground/60 mb-4">
              Kamu mendapatkan {totalXP} XP dari pelajaran ini.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get step status for current step
  const currentStepStatus = navigation.stepStatus.get(navigation.currentStep.id);
  const isCurrentCompleted = currentStepStatus === 'CORRECT';

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <span>{navigation.completedCount}/{navigation.steps.length} langkah selesai</span>
          <span>{Math.round(navigation.progressPercent)}%</span>
        </div>
        <Progress value={navigation.progressPercent} />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2">
        {navigation.steps.map((step: StepData, index: number) => {
          const status = navigation.stepStatus.get(step.id);
          const isCurrent = index === navigation.currentStepIndex;
          return (
            <button
              key={step.id}
              onClick={() => navigation.goToStep(index)}
              className={[
                'w-3 h-3 rounded-full transition-all border-2',
                isCurrent
                  ? 'border-foreground bg-foreground scale-125'
                  : status === 'CORRECT'
                    ? 'border-green-500 bg-green-500'
                    : status === 'WRONG'
                      ? 'border-red-400 bg-red-400'
                      : 'border-foreground/30 bg-transparent',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Step ${index + 1}`}
            />
          );
        })}
      </div>

      {/* Current step */}
      <StepRenderer
        step={navigation.currentStep}
        onAnswer={handleAnswer}
        isCompleted={isCurrentCompleted}
      />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={navigation.prevStep}
          disabled={navigation.currentStepIndex === 0}
        >
          ← Sebelumnya
        </Button>

        <Button
          onClick={navigation.nextStep}
          disabled={navigation.isLastStep || !isCurrentCompleted}
        >
          {navigation.isLastStep ? 'Selesai' : 'Selanjutnya →'}
        </Button>
      </div>
    </div>
  );
}
