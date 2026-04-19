import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvariantError, AuthenticationError } from '@kopiketuk/framework';
import { AuthController } from '../AuthController';
import type { Cradle } from '../../../../infrastructures/container';
import type { AwilixContainer } from 'awilix';
import { NextRequest } from 'next/server';

function createMockContainer(overrides: Partial<Cradle> = {}): AwilixContainer<Cradle> {
  const defaultCradle: Cradle = {
    registerUserUseCase: {
      execute: vi.fn().mockResolvedValue({
        id: 'user-id',
        username: 'johndoe',
        email: 'john@example.com',
        displayName: 'johndoe',
        createdAt: new Date('2026-01-01'),
      }),
    } as any,
    loginUserUseCase: {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        user: { id: 'user-id', username: 'johndoe', email: 'john@example.com', displayName: 'johndoe' },
      }),
    } as any,
    logoutUserUseCase: {
      execute: vi.fn().mockResolvedValue({ success: true }),
    } as any,
    refreshTokenUseCase: {
      execute: vi.fn().mockResolvedValue({
        accessToken: 'new-access.token',
        refreshToken: 'new-refresh.token',
      }),
    } as any,
    getCurrentUserUseCase: {
      execute: vi.fn().mockResolvedValue({
        id: 'user-id',
        username: 'johndoe',
        email: 'john@example.com',
        displayName: 'johndoe',
        createdAt: new Date('2026-01-01'),
      }),
    } as any,
    jwtService: {} as any,
    passwordService: {} as any,
    authRepository: {} as any,
    ...overrides,
  };

  return {
    cradle: defaultCradle,
  } as unknown as AwilixContainer<Cradle>;
}

describe('AuthController', () => {
  let mockContainer: AwilixContainer<Cradle>;
  let controller: AuthController;

  beforeEach(() => {
    mockContainer = createMockContainer();
    controller = new AuthController(mockContainer);
  });

  describe('register', () => {
    it('should return 201 with user data on success', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.register(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('johndoe');
      expect(body.data.user.email).toBe('john@example.com');
    });

    it('should call registerUserUseCase with correct payload', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      await controller.register(request);

      expect(mockContainer.cradle.registerUserUseCase.execute).toHaveBeenCalledWith({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    });

    it('should return 400 when InvariantError is thrown', async () => {
      mockContainer = createMockContainer({
        registerUserUseCase: {
          execute: vi.fn().mockRejectedValue(new InvariantError('REGISTER_USER.EMAIL_ALREADY_EXISTS')),
        } as any,
      });
      controller = new AuthController(mockContainer);

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'test', email: 'test@test.com', password: 'p', confirmPassword: 'p' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.register(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.status).toBe('fail');
      expect(body.message).toBe('REGISTER_USER.EMAIL_ALREADY_EXISTS');
    });

    it('should return 500 on unexpected error', async () => {
      mockContainer = createMockContainer({
        registerUserUseCase: {
          execute: vi.fn().mockRejectedValue(new Error('DB connection failed')),
        } as any,
      });
      controller = new AuthController(mockContainer);

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'test', email: 'e@e.com', password: 'p', confirmPassword: 'p' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.register(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.status).toBe('error');
      expect(body.message).toBe('Internal server error');
    });
  });

  describe('login', () => {
    it('should return 200 with tokens and user data on success', async () => {
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'john@example.com', password: 'Password123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.login(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.accessToken).toBe('access.token');
      expect(body.data.user.username).toBe('johndoe');
    });

    it('should set refresh_token httpOnly cookie', async () => {
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'john@example.com', password: 'Password123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.login(request);
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toContain('refresh_token=refresh.token');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('Path=/api/auth');
    });

    it('should return 401 on AuthenticationError', async () => {
      mockContainer = createMockContainer({
        loginUserUseCase: {
          execute: vi.fn().mockRejectedValue(new AuthenticationError('LOGIN_USER.INVALID_CREDENTIALS')),
        } as any,
      });
      controller = new AuthController(mockContainer);

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'john@example.com', password: 'wrong' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await controller.login(request);
      expect(response.status).toBe(401);
    });
  });

  describe('logout', () => {
    it('should return 200 and clear refresh_token cookie', async () => {
      const request = new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          cookie: 'refresh_token=some.token.here',
        },
      });

      const response = await controller.logout(request);
      const body = await response.json();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(setCookieHeader).toContain('Max-Age=0');
    });

    it('should pass refresh token from cookie to use case', async () => {
      const request = new NextRequest('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: {
          cookie: 'refresh_token=my-refresh-token',
        },
      });

      await controller.logout(request);

      expect(mockContainer.cradle.logoutUserUseCase.execute).toHaveBeenCalledWith({
        refreshToken: 'my-refresh-token',
      });
    });
  });

  describe('refresh', () => {
    it('should return new access token and rotate refresh token cookie', async () => {
      const request = new NextRequest('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: {
          cookie: 'refresh_token=old-refresh-token',
        },
      });

      const response = await controller.refresh(request);
      const body = await response.json();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(response.status).toBe(200);
      expect(body.data.accessToken).toBe('new-access.token');
      expect(setCookieHeader).toContain('new-refresh.token');
    });

    it('should return 401 when no refresh token cookie', async () => {
      const request = new NextRequest('http://localhost/api/auth/refresh', {
        method: 'POST',
      });

      const response = await controller.refresh(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.message).toBe('No refresh token');
    });

    it('should clear cookie on AuthenticationError', async () => {
      mockContainer = createMockContainer({
        refreshTokenUseCase: {
          execute: vi.fn().mockRejectedValue(new AuthenticationError('REFRESH_TOKEN.SESSION_NOT_FOUND')),
        } as any,
      });
      controller = new AuthController(mockContainer);

      const request = new NextRequest('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { cookie: 'refresh_token=bad-token' },
      });

      const response = await controller.refresh(request);
      const setCookieHeader = response.headers.get('set-cookie');

      expect(response.status).toBe(401);
      expect(setCookieHeader).toContain('Max-Age=0');
    });
  });

  describe('me', () => {
    it('should return user data with valid access token', async () => {
      const request = new NextRequest('http://localhost/api/auth/me', {
        method: 'GET',
        headers: { authorization: 'Bearer valid-access-token' },
      });

      const response = await controller.me(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('johndoe');
    });

    it('should return 401 when no authorization header', async () => {
      const request = new NextRequest('http://localhost/api/auth/me', {
        method: 'GET',
      });

      const response = await controller.me(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.message).toBe('No access token');
    });

    it('should return 401 on AuthenticationError', async () => {
      mockContainer = createMockContainer({
        getCurrentUserUseCase: {
          execute: vi.fn().mockRejectedValue(new AuthenticationError('GET_CURRENT_USER.USER_NOT_FOUND')),
        } as any,
      });
      controller = new AuthController(mockContainer);

      const request = new NextRequest('http://localhost/api/auth/me', {
        method: 'GET',
        headers: { authorization: 'Bearer invalid-token' },
      });

      const response = await controller.me(request);
      expect(response.status).toBe(401);
    });

    it('should strip Bearer prefix from authorization header', async () => {
      const request = new NextRequest('http://localhost/api/auth/me', {
        method: 'GET',
        headers: { authorization: 'Bearer my-token-123' },
      });

      await controller.me(request);

      expect(mockContainer.cradle.getCurrentUserUseCase.execute).toHaveBeenCalledWith({
        accessToken: 'my-token-123',
      });
    });
  });
});
