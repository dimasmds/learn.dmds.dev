import { describe, it, expect } from 'vitest';
import { AuthSession } from '../AuthSession';

describe('AuthSession Entity', () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  it('should create a valid auth session', () => {
    const session = AuthSession.create({
      userId: crypto.randomUUID(),
      refreshTokenHash: 'hashed_token_123',
      expiresAt: futureDate,
    });

    expect(session.id).toBeDefined();
    expect(session.userId).toBeDefined();
    expect(session.refreshTokenHash).toBe('hashed_token_123');
    expect(session.expiresAt).toBe(futureDate);
    expect(session.createdAt).toBeInstanceOf(Date);
    expect(session.isExpired).toBe(false);
  });

  it('should throw on empty userId', () => {
    expect(() =>
      AuthSession.create({
        userId: '',
        refreshTokenHash: 'hashed_token',
        expiresAt: futureDate,
      })
    ).toThrow();
  });

  it('should throw on empty refreshTokenHash', () => {
    expect(() =>
      AuthSession.create({
        userId: crypto.randomUUID(),
        refreshTokenHash: '',
        expiresAt: futureDate,
      })
    ).toThrow();
  });

  it('should throw on past expiresAt', () => {
    expect(() =>
      AuthSession.create({
        userId: crypto.randomUUID(),
        refreshTokenHash: 'hashed_token',
        expiresAt: new Date(Date.now() - 1000),
      })
    ).toThrow();
  });

  it('should detect expired session', () => {
    const session = AuthSession.reconstitute('session-id', {
      userId: crypto.randomUUID(),
      refreshTokenHash: 'hashed_token',
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(Date.now() - 10000),
    });

    expect(session.isExpired).toBe(true);
  });

  it('should reconstitute from persistence', () => {
    const id = crypto.randomUUID();
    const props = {
      userId: crypto.randomUUID(),
      refreshTokenHash: 'hashed_token',
      expiresAt: futureDate,
      createdAt: new Date(),
    };

    const session = AuthSession.reconstitute(id, props);
    expect(session.id).toBe(id);
    expect(session.userId).toBe(props.userId);
  });
});
