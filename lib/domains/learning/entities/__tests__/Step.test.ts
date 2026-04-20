import { describe, it, expect } from 'vitest';
import { Step } from '../Step';

describe('Step', () => {
  const validProps = {
    lessonId: 'lesson-1',
    type: 'theory' as const,
    order: 1,
    instruction: 'Belajar tentang heading HTML',
    content: { body: 'konten teori' },
    solution: {},
    hints: [],
    xpReward: 10,
  };

  it('should create step with valid props', () => {
    const step = Step.create(validProps);
    expect(step.id).toBeDefined();
    expect(step.props.lessonId).toBe('lesson-1');
    expect(step.props.type).toBe('theory');
    expect(step.props.instruction).toBe('Belajar tentang heading HTML');
  });

  it('should create step with id', () => {
    const step = Step.create(validProps, 'step-1');
    expect(step.id).toBe('step-1');
  });

  it('should throw if instruction empty', () => {
    expect(() => Step.create({ ...validProps, instruction: '' })).toThrow();
  });

  it('should throw if lessonId empty', () => {
    expect(() => Step.create({ ...validProps, lessonId: '' })).toThrow();
  });

  it('should throw if type invalid', () => {
    expect(() => Step.create({ ...validProps, type: 'invalid' as any })).toThrow();
  });

  it('should throw if order negative', () => {
    expect(() => Step.create({ ...validProps, order: -1 })).toThrow();
  });

  it('should default content/solution/hints when not provided', () => {
    const minimal = {
      lessonId: 'lesson-1',
      type: 'theory' as const,
      order: 1,
      instruction: 'Test instruction',
    };
    const step = Step.create(minimal);
    expect(step.props.content).toEqual({});
    expect(step.props.solution).toEqual({});
    expect(step.props.hints).toEqual([]);
    expect(step.props.xpReward).toBe(10);
  });
});
