/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the lesson player store
const mockStore = {
  lessonId: null as string | null,
  steps: [] as unknown[],
  currentStepIndex: 0,
  answers: new Map<string, string>(),
  attempts: new Map<string, number>(),
  stepStatus: new Map<string, string>(),
  lessonStartTime: null as number | null,
  startLesson: vi.fn(),
  goToStep: vi.fn(),
  submitAnswer: vi.fn(),
  markCorrect: vi.fn(),
  markWrong: vi.fn(),
  resetLesson: vi.fn(),
};

vi.mock('@/lib/presentations/stores/lesson-player-store', () => ({
  useLessonPlayerStore: () => mockStore,
}));

vi.mock('@/lib/applications/services/StepValidator', () => ({
  validateStepAnswer: vi.fn((step: unknown, answer: unknown) => ({
    isCorrect: true,
    feedback: 'Correct!',
  })),
}));

import { validateStepAnswer } from '@/lib/applications/services/StepValidator';
import { useStepNavigation } from '../useStepNavigation';
import type { StepData } from '../../types';

function createMockStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'fill-blank',
    order: 1,
    instruction: 'Test instruction',
    content: {},
    solution: { answer: 'test' },
    hints: [],
    xpReward: 10,
    ...overrides,
  };
}

describe('useStepNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.lessonId = null;
    mockStore.steps = [];
    mockStore.currentStepIndex = 0;
    mockStore.answers = new Map();
    mockStore.attempts = new Map();
    mockStore.stepStatus = new Map();
    mockStore.lessonStartTime = null;
  });

  it('returns store properties', () => {
    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.lessonId).toBeNull();
    expect(result.current.steps).toEqual([]);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('startLesson delegates to store.startLesson', () => {
    const steps = [createMockStep()];
    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.startLesson('lesson-1', steps);
    });
    expect(mockStore.startLesson).toHaveBeenCalledWith('lesson-1', steps);
  });

  it('submitAnswer validates and marks correct', () => {
    const step = createMockStep({ id: 'step-1' });
    mockStore.steps = [step];

    vi.mocked(validateStepAnswer).mockReturnValue({
      isCorrect: true,
      feedback: 'Correct!',
    });

    const { result } = renderHook(() => useStepNavigation());
    let validationResult: ReturnType<typeof result.current.submitAnswer>;
    act(() => {
      validationResult = result.current.submitAnswer('step-1', 'test');
    });

    expect(mockStore.submitAnswer).toHaveBeenCalledWith('step-1', 'test');
    expect(mockStore.markCorrect).toHaveBeenCalledWith('step-1');
    expect(validationResult!.isCorrect).toBe(true);
  });

  it('submitAnswer validates and marks wrong', () => {
    const step = createMockStep({ id: 'step-1' });
    mockStore.steps = [step];

    vi.mocked(validateStepAnswer).mockReturnValue({
      isCorrect: false,
      feedback: 'Wrong!',
    });

    const { result } = renderHook(() => useStepNavigation());
    let validationResult: ReturnType<typeof result.current.submitAnswer>;
    act(() => {
      validationResult = result.current.submitAnswer('step-1', 'wrong');
    });

    expect(mockStore.submitAnswer).toHaveBeenCalledWith('step-1', 'wrong');
    expect(mockStore.markWrong).toHaveBeenCalledWith('step-1');
    expect(validationResult!.isCorrect).toBe(false);
  });

  it('submitAnswer returns undefined for unknown step', () => {
    mockStore.steps = [];
    const { result } = renderHook(() => useStepNavigation());
    let validationResult: ReturnType<typeof result.current.submitAnswer>;
    act(() => {
      validationResult = result.current.submitAnswer('nonexistent', 'test');
    });
    expect(validationResult).toBeUndefined();
  });

  it('goToStep delegates to store.goToStep', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.goToStep(2);
    });
    expect(mockStore.goToStep).toHaveBeenCalledWith(2);
  });

  it('nextStep advances when not at last step', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.currentStepIndex = 0;

    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.nextStep();
    });
    expect(mockStore.goToStep).toHaveBeenCalledWith(1);
  });

  it('nextStep does not advance at last step', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.currentStepIndex = 1;

    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.nextStep();
    });
    expect(mockStore.goToStep).not.toHaveBeenCalled();
  });

  it('prevStep goes back when not at first step', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.currentStepIndex = 1;

    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.prevStep();
    });
    expect(mockStore.goToStep).toHaveBeenCalledWith(0);
  });

  it('prevStep does not go back at first step', () => {
    mockStore.steps = [createMockStep({ id: 's1' })];
    mockStore.currentStepIndex = 0;

    const { result } = renderHook(() => useStepNavigation());
    act(() => {
      result.current.prevStep();
    });
    expect(mockStore.goToStep).not.toHaveBeenCalled();
  });

  it('computes isLastStep correctly', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.currentStepIndex = 0;
    const { result: r1 } = renderHook(() => useStepNavigation());
    expect(r1.current.isLastStep).toBe(false);

    mockStore.currentStepIndex = 1;
    const { result: r2 } = renderHook(() => useStepNavigation());
    expect(r2.current.isLastStep).toBe(true);
  });

  it('computes currentStep correctly', () => {
    const step = createMockStep({ id: 's1' });
    mockStore.steps = [step];
    mockStore.currentStepIndex = 0;

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.currentStep).toEqual(step);
  });

  it('computes completedCount from stepStatus', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.stepStatus = new Map([['s1', 'CORRECT'], ['s2', 'WRONG']]);

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.completedCount).toBe(1);
  });

  it('computes progressPercent', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.stepStatus = new Map([['s1', 'CORRECT']]);

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.progressPercent).toBe(50);
  });

  it('computes isLessonComplete when all correct', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.stepStatus = new Map([['s1', 'CORRECT'], ['s2', 'CORRECT']]);

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.isLessonComplete).toBe(true);
  });

  it('computes isLessonComplete as false when not all correct', () => {
    mockStore.steps = [createMockStep({ id: 's1' }), createMockStep({ id: 's2' })];
    mockStore.stepStatus = new Map([['s1', 'CORRECT']]);

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.isLessonComplete).toBe(false);
  });

  it('returns null currentStep when steps is empty', () => {
    mockStore.steps = [];
    mockStore.currentStepIndex = 0;

    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.currentStep).toBeNull();
  });
});
