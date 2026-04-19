import { InvariantError } from '@kopiketuk/framework';

export class Password {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.length < 8) {
      throw new InvariantError('PASSWORD.MIN_8_CHARS');
    }

    if (!/[A-Z]/.test(value)) {
      throw new InvariantError('PASSWORD.NEED_UPPERCASE');
    }

    if (!/[a-z]/.test(value)) {
      throw new InvariantError('PASSWORD.NEED_LOWERCASE');
    }

    if (!/[0-9]/.test(value)) {
      throw new InvariantError('PASSWORD.NEED_NUMBER');
    }

    this._value = value;
  }

  get value(): string {
    return this._value;
  }
}
