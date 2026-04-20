import { describe, it, expect } from 'vitest';
import { StepType } from '../StepType';

describe('StepType', () => {
  it('should create valid step type', () => {
    const type = StepType.create('theory');
    expect(type.value).toBe('theory');
  });

  it('should create all 9 types', () => {
    const types = ['theory', 'fill-blank', 'multiple-choice', 'reorder', 'spot-bug', 'live-code', 'live-preview', 'output-prediction', 'matching'];
    types.forEach(t => {
      expect(StepType.create(t).value).toBe(t);
    });
  });

  it('should throw InvariantError for invalid type', () => {
    expect(() => StepType.create('invalid')).toThrow();
  });

  it('should throw for empty string', () => {
    expect(() => StepType.create('')).toThrow();
  });
});
