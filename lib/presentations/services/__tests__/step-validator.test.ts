import { describe, it, expect } from 'vitest';
import { validateStepAnswer } from '@/lib/presentations/services/step-validator';
import { StepData } from '@/components/steps/types';

function createStep(overrides: Partial<StepData> & Pick<StepData, 'type' | 'solution'>): StepData {
  return {
    id: 'step-1',
    order: 1,
    instruction: 'Test instruction',
    content: {},
    hints: [],
    xpReward: 10,
    ...overrides,
  };
}

describe('validateStepAnswer', () => {
  describe('theory', () => {
    it('always returns correct', () => {
      const step = createStep({ type: 'theory', solution: {} });
      const result = validateStepAnswer(step, null);
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('Materi sudah dibaca!');
    });
  });

  describe('multiple-choice', () => {
    const step = createStep({
      type: 'multiple-choice',
      content: { options: ['A', 'B', 'C'] },
      solution: { correctAnswer: 'B' },
    });

    it('returns correct for right answer', () => {
      const result = validateStepAnswer(step, 'B');
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('Jawaban benar!');
    });

    it('returns wrong for incorrect answer', () => {
      const result = validateStepAnswer(step, 'A');
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Jawaban salah');
    });
  });

  describe('fill-blank', () => {
    const step = createStep({
      type: 'fill-blank',
      content: { template: 'Hello ___' },
      solution: { answer: 'World' },
    });

    it('returns correct for exact match', () => {
      const result = validateStepAnswer(step, 'World');
      expect(result.isCorrect).toBe(true);
    });

    it('is case-insensitive', () => {
      const result = validateStepAnswer(step, 'world');
      expect(result.isCorrect).toBe(true);
    });

    it('trims whitespace', () => {
      const result = validateStepAnswer(step, '  World  ');
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for incorrect answer', () => {
      const result = validateStepAnswer(step, 'Wrong');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('output-prediction', () => {
    const step = createStep({
      type: 'output-prediction',
      solution: { output: 'Hello World' },
    });

    it('returns correct for matching output', () => {
      const result = validateStepAnswer(step, 'Hello World');
      expect(result.isCorrect).toBe(true);
    });

    it('trims whitespace before comparing', () => {
      const result = validateStepAnswer(step, '  Hello World  ');
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for non-matching output', () => {
      const result = validateStepAnswer(step, 'Wrong output');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('reorder', () => {
    const step = createStep({
      type: 'reorder',
      solution: { correctOrder: ['a', 'b', 'c'] },
    });

    it('returns correct for matching order', () => {
      const result = validateStepAnswer(step, ['a', 'b', 'c']);
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for wrong order', () => {
      const result = validateStepAnswer(step, ['a', 'c', 'b']);
      expect(result.isCorrect).toBe(false);
    });

    it('returns wrong for incomplete order', () => {
      const result = validateStepAnswer(step, ['a', 'b']);
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('spot-bug', () => {
    const step = createStep({
      type: 'spot-bug',
      solution: { bugLine: 3, fix: 'console.log(x)' },
    });

    it('returns correct for right line and fix', () => {
      const result = validateStepAnswer(step, { line: 3, fix: 'console.log(x)' });
      expect(result.isCorrect).toBe(true);
    });

    it('is case-insensitive for fix', () => {
      const result = validateStepAnswer(step, { line: 3, fix: 'Console.Log(x)' });
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for wrong line', () => {
      const result = validateStepAnswer(step, { line: 5, fix: 'console.log(x)' });
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Line salah');
    });

    it('returns wrong for wrong fix', () => {
      const result = validateStepAnswer(step, { line: 3, fix: 'wrong fix' });
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Fix belum tepat');
    });
  });

  describe('live-code', () => {
    const step = createStep({
      type: 'live-code',
      solution: { expectedOutput: '42' },
    });

    it('returns correct for matching output', () => {
      const result = validateStepAnswer(step, '42');
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for non-matching output', () => {
      const result = validateStepAnswer(step, '0');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('live-preview', () => {
    const step = createStep({
      type: 'live-preview',
      solution: { expectedHtml: '<div>Hello</div>' },
    });

    it('returns correct for matching HTML', () => {
      const result = validateStepAnswer(step, '<div>Hello</div>');
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for non-matching HTML', () => {
      const result = validateStepAnswer(step, '<span>Hello</span>');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('matching', () => {
    const step = createStep({
      type: 'matching',
      solution: { pairs: { a: '1', b: '2', c: '3' } },
    });

    it('returns correct for all matching pairs', () => {
      const result = validateStepAnswer(step, { a: '1', b: '2', c: '3' });
      expect(result.isCorrect).toBe(true);
    });

    it('returns wrong for incorrect pair', () => {
      const result = validateStepAnswer(step, { a: '1', b: '3', c: '3' });
      expect(result.isCorrect).toBe(false);
    });

    it('returns wrong for missing pairs', () => {
      const result = validateStepAnswer(step, { a: '1', b: '2' });
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('unknown type', () => {
    it('returns wrong for unrecognized type', () => {
      const step = createStep({
        type: 'unknown-type' as any,
        solution: {},
      });
      const result = validateStepAnswer(step, 'anything');
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBe('Tipe step tidak dikenali');
    });
  });
});
