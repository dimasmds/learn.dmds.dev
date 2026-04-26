import { describe, it, expect } from 'vitest';
import { XPAmount } from '../XPAmount';

describe('XPAmount', () => {
  it('should create valid XP amount', () => {
    const xp = XPAmount.create(100);
    expect(xp.value).toBe(100);
  });

  it('should create zero XP amount', () => {
    const xp = XPAmount.create(0);
    expect(xp.value).toBe(0);
  });

  it('should throw for negative XP amount', () => {
    expect(() => XPAmount.create(-1)).toThrow('XP_AMOUNT.NEGATIVE');
  });

  it('should throw for non-integer XP amount', () => {
    expect(() => XPAmount.create(10.5)).toThrow('XP_AMOUNT.NOT_INTEGER');
  });

  it('should throw for NaN', () => {
    expect(() => XPAmount.create(NaN)).toThrow();
  });
});
