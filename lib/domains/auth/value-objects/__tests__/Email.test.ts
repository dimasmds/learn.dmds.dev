import { describe, it, expect } from 'vitest';
import { Email } from '../Email';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = new Email('Test@Example.COM');
    expect(email.value).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const email = new Email('  user@example.com  ');
    expect(email.value).toBe('user@example.com');
  });

  it('should throw on empty email', () => {
    expect(() => new Email('')).toThrow();
  });

  it('should throw on invalid format - no @', () => {
    expect(() => new Email('userexample.com')).toThrow();
  });

  it('should throw on invalid format - no domain', () => {
    expect(() => new Email('user@')).toThrow();
  });

  it('should throw on invalid format - no TLD', () => {
    expect(() => new Email('user@example')).toThrow();
  });

  it('should throw on whitespace in email', () => {
    expect(() => new Email('user @example.com')).toThrow();
  });

  it('should correctly compare equality', () => {
    const a = new Email('user@example.com');
    const b = new Email('user@example.com');
    const c = new Email('other@example.com');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
