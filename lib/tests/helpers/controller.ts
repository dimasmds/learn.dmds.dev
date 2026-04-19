import { NextRequest } from 'next/server';
import { vi } from 'vitest';

import { JwtService } from '@/lib/infrastructures/auth/JwtService';

import type { DatabaseTestContext } from './database';

/**
 * Controller test context that manages database and JWT service
 * Provides reusable setup for controller integration tests
 * Following Bijakcerdas pattern
 */
export class ControllerTestContext {
  private _jwtService: JwtService;

  constructor(private readonly db: DatabaseTestContext) {
    this._jwtService = new JwtService();
  }

  get jwtService(): JwtService {
    return this._jwtService;
  }

  get database(): DatabaseTestContext {
    return this.db;
  }

  /**
   * Create a test user directly in the database
   * Bypasses use case validation — raw SQL insert
   */
  async createTestUser(overrides: Partial<{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }> = {}): Promise<{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    displayName: string;
  }> {
    const id = overrides.id ?? crypto.randomUUID();
    const username = overrides.username ?? `testuser_${Date.now()}`;
    const email = overrides.email ?? `${username}@test.com`;
    const passwordHash = overrides.passwordHash ?? '$2a$10$testhashedpassword';
    const displayName = overrides.displayName ?? 'Test User';

    await this.db.query(
      `INSERT INTO users (id, username, email, password_hash, display_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, username, email, passwordHash, displayName],
    );

    return { id, username, email, passwordHash, displayName };
  }

  /**
   * Create an authenticated NextRequest with a real JWT token
   */
  async createAuthenticatedRequest(
    user: { id: string; username: string; email: string },
    body?: Record<string, unknown>,
    requestOptions?: Partial<{ method: string; url: string }>,
  ): Promise<NextRequest> {
    const { accessToken } = this._jwtService.generateTokenPair({
      userId: user.id,
      username: user.username,
    });

    const defaultMethod = body ? 'POST' : 'GET';
    const url = requestOptions?.url ?? 'http://localhost:3000/api/test';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const request = new NextRequest(url, {
      method: requestOptions?.method ?? defaultMethod,
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });

    return request;
  }

  /**
   * Create an unauthenticated NextRequest (no auth header)
   */
  createUnauthenticatedRequest(
    body?: Record<string, unknown>,
    url = 'http://localhost:3000/api/test',
  ): NextRequest {
    const request = new NextRequest(url, {
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json' },
    });

    return request;
  }
}

export function createControllerTestContext(db: DatabaseTestContext): ControllerTestContext {
  return new ControllerTestContext(db);
}
