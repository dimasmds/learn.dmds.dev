import { StepData, ValidationResult } from '@/features/lesson-player/types';

export type Step = StepData;
export type UserAnswer = unknown;

export interface IStepValidator {
  validate(step: Step, userAnswer: UserAnswer): ValidationResult;
}

export class StepValidator implements IStepValidator {
  validate(step: Step, userAnswer: UserAnswer): ValidationResult {
    return validateStepAnswer(step, userAnswer);
  }
}

export function validateStepAnswer(step: StepData, answer: unknown): ValidationResult {
  switch (step.type) {
    case 'theory':
      return { isCorrect: true, feedback: 'Materi sudah dibaca!' };
    case 'multiple-choice':
      return validateMultipleChoice(step, answer as string);
    case 'fill-blank':
      return validateFillBlank(step, answer as string);
    case 'output-prediction':
      return validateOutputPrediction(step, answer as string);
    case 'reorder':
      return validateReorder(step, answer as string[]);
    case 'spot-bug':
      return validateSpotBug(step, answer as { line: number; fix: string });
    case 'live-code':
      return validateLiveCode(step, answer as string);
    case 'live-preview':
      return validateLivePreview(step, answer as string);
    case 'matching':
      return validateMatching(step, answer as Record<string, string>);
    default:
      return { isCorrect: false, feedback: 'Tipe step tidak dikenali' };
  }
}

function validateMultipleChoice(step: StepData, answer: string): ValidationResult {
  const correctAnswer = step.solution.correctAnswer as string;
  if (answer === correctAnswer) {
    return { isCorrect: true, feedback: 'Jawaban benar!' };
  }
  return { isCorrect: false, feedback: `Jawaban salah. Jawaban yang benar: ${correctAnswer}` };
}

function validateFillBlank(step: StepData, answer: string): ValidationResult {
  const correctAnswer = (step.solution.answer as string).trim().toLowerCase();
  const userAnswer = answer.trim().toLowerCase();
  if (userAnswer === correctAnswer) {
    return { isCorrect: true, feedback: 'Jawaban benar!' };
  }
  return { isCorrect: false, feedback: 'Jawaban salah. Coba lagi!' };
}

function validateOutputPrediction(step: StepData, answer: string): ValidationResult {
  const expectedOutput = (step.solution.output as string).trim();
  const userAnswer = answer.trim();
  if (userAnswer === expectedOutput) {
    return { isCorrect: true, feedback: 'Prediksi benar!' };
  }
  return { isCorrect: false, feedback: 'Prediksi salah. Coba lagi!' };
}

function validateReorder(step: StepData, answer: string[]): ValidationResult {
  const correctOrder = step.solution.correctOrder as string[];
  if (
    answer.length === correctOrder.length &&
    answer.every((item, index) => item === correctOrder[index])
  ) {
    return { isCorrect: true, feedback: 'Urutan benar!' };
  }
  return { isCorrect: false, feedback: 'Urutan salah. Coba lagi!' };
}

function validateSpotBug(step: StepData, answer: { line: number; fix: string }): ValidationResult {
  const bugLine = step.solution.bugLine as number;
  const expectedFix = (step.solution.fix as string).trim().toLowerCase();
  if (
    answer.line === bugLine &&
    answer.fix.trim().toLowerCase() === expectedFix
  ) {
    return { isCorrect: true, feedback: 'Bug ditemukan!' };
  }
  if (answer.line !== bugLine) {
    return { isCorrect: false, feedback: 'Line salah. Coba temukan bug yang tepat!' };
  }
  return { isCorrect: false, feedback: 'Fix belum tepat. Coba lagi!' };
}

function validateLiveCode(step: StepData, answer: string): ValidationResult {
  const expectedOutput = (step.solution.expectedOutput as string).trim();
  const userOutput = answer.trim();
  if (userOutput === expectedOutput) {
    return { isCorrect: true, feedback: 'Output benar!' };
  }
  return { isCorrect: false, feedback: 'Output tidak sesuai. Coba lagi!' };
}

function validateLivePreview(step: StepData, answer: string): ValidationResult {
  const expectedHtml = (step.solution.expectedHtml as string).trim();
  const userHtml = answer.trim();
  if (userHtml === expectedHtml) {
    return { isCorrect: true, feedback: 'HTML benar!' };
  }
  return { isCorrect: false, feedback: 'HTML tidak sesuai. Coba lagi!' };
}

function validateMatching(
  step: StepData,
  answer: Record<string, string>,
): ValidationResult {
  const expectedPairs = step.solution.pairs as Record<string, string>;
  const expectedKeys = Object.keys(expectedPairs);
  const answerKeys = Object.keys(answer);

  if (expectedKeys.length !== answerKeys.length) {
    return { isCorrect: false, feedback: 'Jumlah pasangan tidak sesuai.' };
  }

  for (const key of expectedKeys) {
    if (answer[key] !== expectedPairs[key]) {
      return { isCorrect: false, feedback: 'Pasangan salah. Coba lagi!' };
    }
  }

  return { isCorrect: true, feedback: 'Semua pasangan benar!' };
}
