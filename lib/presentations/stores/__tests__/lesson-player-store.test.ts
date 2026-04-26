import { describe, it, expect, beforeEach } from 'vitest';
import { useLessonPlayerStore, Step } from '../lesson-player-store';

const mockSteps: Step[] = [
  {
    id: 'step-1',
    type: 'theory',
    order: 1,
    instruction: 'Learn about HTML',
    content: {},
    solution: {},
    hints: [],
    xpReward: 5,
  },
  {
    id: 'step-2',
    type: 'fill-blank',
    order: 2,
    instruction: 'Fill in the blank',
    content: { template: '<___>Hello</h1>' },
    solution: { answer: 'h1' },
    hints: [],
    xpReward: 10,
  },
];

describe('LessonPlayerStore', () => {
  beforeEach(() => {
    useLessonPlayerStore.getState().resetLesson();
  });

  it('should start a lesson correctly', () => {
    const { startLesson } = useLessonPlayerStore.getState();
    startLesson('lesson-1', mockSteps);

    const state = useLessonPlayerStore.getState();
    expect(state.lessonId).toBe('lesson-1');
    expect(state.currentStepIndex).toBe(0);
    expect(state.lessonStartTime).toBeDefined();
    expect(state.lessonStartTime).not.toBeNull();
    expect(state.steps).toEqual(mockSteps);
    expect(state.answers.size).toBe(0);
    expect(state.attempts.size).toBe(0);
    expect(state.stepStatus.size).toBe(0);
  });

  it('should track answer submissions and attempts', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.submitAnswer('step-1', '<h1>');

    const state = useLessonPlayerStore.getState();
    expect(state.answers.get('step-1')).toBe('<h1>');
    expect(state.attempts.get('step-1')).toBe(1);
  });

  it('should increment attempts on multiple submissions', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.submitAnswer('step-1', 'wrong');
    store.submitAnswer('step-1', '<h1>');

    const state = useLessonPlayerStore.getState();
    expect(state.answers.get('step-1')).toBe('<h1>');
    expect(state.attempts.get('step-1')).toBe(2);
  });

  it('should advance to next step on goToStep', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.goToStep(1);

    expect(useLessonPlayerStore.getState().currentStepIndex).toBe(1);
  });

  it('should mark step as correct', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.markCorrect('step-1');

    const state = useLessonPlayerStore.getState();
    expect(state.stepStatus.get('step-1')).toBe('CORRECT');
  });

  it('should mark step as wrong', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.markWrong('step-1');

    const state = useLessonPlayerStore.getState();
    expect(state.stepStatus.get('step-1')).toBe('WRONG');
  });

  it('should reset lesson state', () => {
    const store = useLessonPlayerStore.getState();
    store.startLesson('lesson-1', mockSteps);
    store.submitAnswer('step-1', 'answer');
    store.markCorrect('step-1');
    store.goToStep(1);

    store.resetLesson();

    const state = useLessonPlayerStore.getState();
    expect(state.lessonId).toBeNull();
    expect(state.steps).toEqual([]);
    expect(state.currentStepIndex).toBe(0);
    expect(state.answers.size).toBe(0);
    expect(state.attempts.size).toBe(0);
    expect(state.stepStatus.size).toBe(0);
    expect(state.lessonStartTime).toBeNull();
  });
});
