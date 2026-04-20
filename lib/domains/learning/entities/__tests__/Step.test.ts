import { describe, it, expect } from 'vitest';
import { Step } from '../Step';

describe('Step', () => {
  const validProps = {
    lessonId: 'lesson-1',
    type: 'theory' as const,
    title: 'Pengenalan HTML',
    order: 1,
    content: '<p>Ini konten</p>',
  };

  it('should create step with valid props', () => {
    const step = Step.create(validProps);
    expect(step.id).toBeDefined();
    expect(step.props.lessonId).toBe('lesson-1');
    expect(step.props.type).toBe('theory');
    expect(step.props.title).toBe('Pengenalan HTML');
  });

  it('should create step with id', () => {
    const step = Step.create(validProps, 'step-1');
    expect(step.id).toBe('step-1');
  });

  it('should throw if title empty', () => {
    expect(() => Step.create({ ...validProps, title: '' })).toThrow();
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
});
