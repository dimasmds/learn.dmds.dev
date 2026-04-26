import { StepTypeValue } from '@/lib/domains/learning/value-objects/StepType';

export interface StepData {
  id: string;
  type: StepTypeValue;
  order: number;
  instruction: string;
  content: Record<string, unknown>;
  solution: Record<string, unknown>;
  hints: string[];
  xpReward: number;
}

export interface StepProps {
  step: StepData;
  onAnswer: (isCorrect: boolean) => void;
  isCompleted: boolean;
  disabled?: boolean;
}

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}

export type StepStatus = 'CORRECT' | 'WRONG' | 'PENDING';

export interface Unit {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  lessonIds: string[];
  lessonCount?: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
}

export interface LessonDetail {
  lesson: Lesson;
  steps: StepData[];
}

export interface UnitDetail {
  unit: Omit<Unit, 'lessonCount'>;
  lessons: Lesson[];
}

export interface ProgressItem {
  id: string;
  stepId: string;
  lessonId: string;
  status: string;
  attempts: number;
  completedAt: string | null;
}
