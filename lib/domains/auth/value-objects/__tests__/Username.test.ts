import { describe, it, expect } from 'vitest';
import { Username } from '../Username';

describe('Username Value Object', () => {
  it('should create a valid username', () => {
    const username = new Username('dimasmds');
    expect(username.value).toBe('dimasmds');
  });

  it('should accept underscores and hyphens', () => {
    expect(new Username('user_name').value).toBe('user_name');
    expect(new Username('user-name').value).toBe('user-name');
    expect(new Username('a_b-c').value).toBe('a_b-c');
  });

  it('should accept exactly 3 characters', () => {
    expect(new Username('abc').value).toBe('abc');
  });

  it('should accept exactly 20 characters', () => {
    expect(new Username('a'.repeat(20)).value).toBe('a'.repeat(20));
  });

  it('should throw on empty username', () => {
    expect(() => new Username('')).toThrow();
  });

  it('should throw on too short (2 chars)', () => {
    expect(() => new Username('ab')).toThrow();
  });

  it('should throw on too long (21 chars)', () => {
    expect(() => new Username('a'.repeat(21))).toThrow();
  });

  it('should throw on starting with number', () => {
    expect(() => new Username('1user')).toThrow();
  });

  it('should throw on starting with underscore', () => {
    expect(() => new Username('_user')).toThrow();
  });

  it('should throw on starting with hyphen', () => {
    expect(() => new Username('-user')).toThrow();
  });

  it('should throw on special characters', () => {
    expect(() => new Username('user!')).toThrow();
    expect(() => new Username('user@name')).toThrow();
    expect(() => new Username('user name')).toThrow();
  });

  it('should correctly compare equality', () => {
    const a = new Username('dimasmds');
    const b = new Username('dimasmds');
    const c = new Username('other');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
