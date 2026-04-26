import { create } from 'zustand';
import { StepData } from '@/features/lesson-player/types';

export type Step = StepData;
export type StepStatus = 'CORRECT' | 'WRONG' | 'PENDING';

interface LessonPlayerState {
  lessonId: string | null;
  steps: Step[];
  currentStepIndex: number;
  answers: Map<string, string>;
  attempts: Map<string, number>;
  stepStatus: Map<string, StepStatus>;
  lessonStartTime: number | null;
}

interface LessonPlayerActions {
  startLesson: (lessonId: string, steps: Step[]) => void;
  goToStep: (index: number) => void;
  submitAnswer: (stepId: string, answer: string) => void;
  markCorrect: (stepId: string) => void;
  markWrong: (stepId: string) => void;
  resetLesson: () => void;
}

export const useLessonPlayerStore = create<LessonPlayerState & LessonPlayerActions>()(
  (set, get) => ({
    lessonId: null,
    steps: [],
    currentStepIndex: 0,
    answers: new Map(),
    attempts: new Map(),
    stepStatus: new Map(),
    lessonStartTime: null,

    startLesson: (lessonId, steps) => set({
      lessonId,
      steps,
      currentStepIndex: 0,
      answers: new Map(),
      attempts: new Map(),
      stepStatus: new Map(),
      lessonStartTime: Date.now(),
    }),

    goToStep: (index) => set({ currentStepIndex: index }),

    submitAnswer: (stepId, answer) => {
      const newAnswers = new Map(get().answers);
      const newAttempts = new Map(get().attempts);
      newAnswers.set(stepId, answer);
      newAttempts.set(stepId, (newAttempts.get(stepId) || 0) + 1);
      set({ answers: newAnswers, attempts: newAttempts });
    },

    markCorrect: (stepId) => {
      const newStatus = new Map(get().stepStatus);
      newStatus.set(stepId, 'CORRECT');
      set({ stepStatus: newStatus });
    },

    markWrong: (stepId) => {
      const newStatus = new Map(get().stepStatus);
      newStatus.set(stepId, 'WRONG');
      set({ stepStatus: newStatus });
    },

    resetLesson: () => set({
      lessonId: null,
      steps: [],
      currentStepIndex: 0,
      answers: new Map(),
      attempts: new Map(),
      stepStatus: new Map(),
      lessonStartTime: null,
    }),
  })
);
