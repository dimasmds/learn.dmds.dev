import { describe, it, expect } from 'vitest';
import { Password } from '../Password';

describe('Password Value Object', () => {
  it('should create a valid password', () => {
    const password = new Password('Password1');
    expect(password.value).toBe('Password1');
  });

  it('should throw on too short (less than 8 chars)', () => {
    expect(() => new Password('Pass1')).toThrow();
  });

  it('should throw on exactly 7 chars', () => {
    expect(() => new Password('Passwo1')).toThrow();
  });

  it('should accept exactly 8 chars', () => {
    expect(new Password('Password1').value).toBe('Password1');
  });

  it('should throw on missing uppercase', () => {
    expect(() => new Password('password1')).toThrow();
  });

  it('should throw on missing lowercase', () => {
    expect(() => new Password('PASSWORD1')).toThrow();
  });

  it('should throw on missing number', () => {
    expect(() => new Password('Password')).toThrow();
  });

  it('should throw on empty password', () => {
    expect(() => new Password('')).toThrow();
  });
});
