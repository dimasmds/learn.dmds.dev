'use client';

import { useCallback } from 'react';
import { useLessonPlayerStore } from '@/lib/presentations/stores/lesson-player-store';
import { validateStepAnswer } from '@/lib/applications/services/StepValidator';
import type { StepData, StepStatus } from '../types';

export function useStepNavigation() {
  const store = useLessonPlayerStore();

  const startLesson = useCallback((lessonId: string, steps: StepData[]) => {
    store.startLesson(lessonId, steps);
  }, [store]);

  const submitAnswer = useCallback((stepId: string, answer: unknown) => {
    // Find the step
    const step = store.steps.find(s => s.id === stepId);
    if (!step) return;

    // Record the answer
    store.submitAnswer(stepId, String(answer));

    // Validate
    const result = validateStepAnswer(step, answer);
    if (result.isCorrect) {
      store.markCorrect(stepId);
    } else {
      store.markWrong(stepId);
    }

    return result;
  }, [store]);

  const goToStep = useCallback((index: number) => {
    store.goToStep(index);
  }, [store]);

  const nextStep = useCallback(() => {
    if (store.currentStepIndex < store.steps.length - 1) {
      store.goToStep(store.currentStepIndex + 1);
    }
  }, [store]);

  const prevStep = useCallback(() => {
    if (store.currentStepIndex > 0) {
      store.goToStep(store.currentStepIndex - 1);
    }
  }, [store]);

  const isLastStep = store.currentStepIndex === store.steps.length - 1;
  const currentStep = store.steps[store.currentStepIndex] ?? null;
  const completedCount = Array.from(store.stepStatus.values()).filter(s => s === 'CORRECT').length;
  const progressPercent = store.steps.length > 0 ? (completedCount / store.steps.length) * 100 : 0;
  const isLessonComplete = store.steps.length > 0 && completedCount === store.steps.length;

  return {
    ...store,
    startLesson,
    submitAnswer,
    goToStep,
    nextStep,
    prevStep,
    isLastStep,
    currentStep,
    completedCount,
    progressPercent,
    isLessonComplete,
  };
}
