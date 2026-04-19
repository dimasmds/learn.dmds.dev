import { InvariantError } from '@kopiketuk/framework';

export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalized || !emailRegex.test(normalized)) {
      throw new InvariantError('EMAIL.INVALID_FORMAT');
    }

    this._value = normalized;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
