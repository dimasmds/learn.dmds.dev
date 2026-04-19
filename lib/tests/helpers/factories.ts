import { vi } from 'vitest';

/**
 * Creates a mock repository with common CRUD methods stubbed as vi.fn().
 * Override any method by passing a partial object.
 */
export function createMockRepository<T extends Record<string, unknown>>(
  overrides: Partial<T> = {} as Partial<T>,
): T {
  const defaults: Record<string, unknown> = {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(true),
    count: vi.fn().mockResolvedValue(0),
    exists: vi.fn().mockResolvedValue(false),
  };

  return { ...defaults, ...overrides } as T;
}

/**
 * Creates a mock logger with standard log-level methods stubbed as vi.fn().
 */
export function createMockLogger(): Record<string, ReturnType<typeof vi.fn>> {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn().mockReturnValue(
      createMockLogger(),
    ),
  };
}
