import { InvariantError } from '@kopiketuk/framework';

const VALID_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
export type CompletionStatusValue = typeof VALID_STATUSES[number];

export class CompletionStatus {
  private constructor(private readonly _value: CompletionStatusValue) {}

  static create(value: string): CompletionStatus {
    if (!VALID_STATUSES.includes(value as CompletionStatusValue)) {
      throw new InvariantError('COMPLETION_STATUS.INVALID');
    }
    return new CompletionStatus(value as CompletionStatusValue);
  }

  get value(): CompletionStatusValue {
    return this._value;
  }

  isCompleted(): boolean {
    return this._value === 'COMPLETED';
  }
}
