import { StepTypeValue } from '@/lib/domains/learning/value-objects/StepType';

// The Step data coming from API/store
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

// Props for each step component
export interface StepProps {
  step: StepData;
  onAnswer: (isCorrect: boolean) => void;
  isCompleted: boolean;
  disabled?: boolean;
}

// Validation result
export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}
