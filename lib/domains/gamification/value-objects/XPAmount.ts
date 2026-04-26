import { InvariantError } from '@kopiketuk/framework';

export class XPAmount {
  private constructor(private readonly _value: number) {}

  static create(value: number): XPAmount {
    if (!Number.isInteger(value)) {
      throw new InvariantError('XP_AMOUNT.NOT_INTEGER');
    }
    if (value < 0) {
      throw new InvariantError('XP_AMOUNT.NEGATIVE');
    }
    return new XPAmount(value);
  }

  get value(): number {
    return this._value;
  }
}
