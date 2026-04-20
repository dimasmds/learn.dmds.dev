import { InvariantError } from '@kopiketuk/framework';

const VALID_STEP_TYPES = [
  'theory', 'fill-blank', 'multiple-choice', 'reorder',
  'spot-bug', 'live-code', 'live-preview',
  'output-prediction', 'matching',
] as const;

export type StepTypeValue = typeof VALID_STEP_TYPES[number];

export class StepType {
  private constructor(private readonly _value: StepTypeValue) {}

  static create(value: string): StepType {
    if (!VALID_STEP_TYPES.includes(value as StepTypeValue)) {
      throw new InvariantError('STEP_TYPE.INVALID_TYPE');
    }
    return new StepType(value as StepTypeValue);
  }

  get value(): StepTypeValue {
    return this._value;
  }
}
