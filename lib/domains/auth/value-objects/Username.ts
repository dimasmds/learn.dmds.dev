import { InvariantError } from '@kopiketuk/framework';

export class Username {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;

    if (!trimmed) {
      throw new InvariantError('USERNAME.EMPTY');
    }

    if (!usernameRegex.test(trimmed)) {
      throw new InvariantError('USERNAME.INVALID_FORMAT');
    }

    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Username): boolean {
    return this._value === other._value;
  }
}
