import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

import type { RegisterUserUseCase } from '@/lib/applications/usecases/auth/RegisterUserUseCase';
import type { LoginUserUseCase } from '@/lib/applications/usecases/auth/LoginUserUseCase';
import type { LogoutUserUseCase } from '@/lib/applications/usecases/auth/LogoutUserUseCase';
import type { RefreshTokenUseCase } from '@/lib/applications/usecases/auth/RefreshTokenUseCase';
import type { GetCurrentUserUseCase } from '@/lib/applications/usecases/auth/GetCurrentUserUseCase';
import { container } from '@/lib/infrastructures/container';

// Mock container.getInstance to return mock use cases
const mockRegisterUseCase = { execute: vi.fn() };
const mockLoginUseCase = { execute: vi.fn() };
const mockLogoutUseCase = { execute: vi.fn() };
const mockRefreshUseCase = { execute: vi.fn() };
const mockGetCurrentUserUseCase = { execute: vi.fn() };

vi.spyOn(container, 'getInstance').mockImplementation((key: string) => {
  switch (key) {
    case 'RegisterUserUseCase': return mockRegisterUseCase as any;
    case 'LoginUserUseCase': return mockLoginUseCase as any;
    case 'LogoutUserUseCase': return mockLogoutUseCase as any;
    case 'RefreshTokenUseCase': return mockRefreshUseCase as any;
    case 'GetCurrentUserUseCase': return mockGetCurrentUserUseCase as any;
    default: throw new Error(`Unknown key: ${key}`);
  }
});

// Import controller AFTER mock setup
import { AuthController } from '../AuthController';

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return 201', async () => {
      const { NextRequest } = await import('next/server');
      mockRegisterUseCase.execute.mockResolvedValue({
        id: 'user-1',
        username: 'newuser',
        email: 'new@example.com',
        displayName: 'newuser',
        createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });

      const response = await AuthController.register(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('newuser');
      expect(container.getInstance).toHaveBeenCalledWith('RegisterUserUseCase');
    });

    it('should return 400 when validation fails', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockRegisterUseCase.execute.mockRejectedValue(new InvariantError('REGISTER_USER.NO_USERNAME'));

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123!', confirmPassword: 'Password123!' }),
      });

      const response = await AuthController.register(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when passwords do not match', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockRegisterUseCase.execute.mockRejectedValue(new InvariantError('REGISTER_USER.PASSWORD_NOT_MATCH'));

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', email: 'test@example.com', password: 'Password123!', confirmPassword: 'Different!' }),
      });

      const response = await AuthController.register(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when email already exists', async () => {
      const { NextRequest } = await import('next/server');
      const { InvariantError } = await import('@kopiketuk/framework');
      mockRegisterUseCase.execute.mockRejectedValue(new InvariantError('REGISTER_USER.EMAIL_ALREADY_EXISTS'));

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', email: 'dup@example.com', password: 'Password123!', confirmPassword: 'Password123!' }),
      });

      const response = await AuthController.register(request);
      expect(response.status).toBe(400);
    });
  });

  describe('login', () => {
    it('should login and return 200 with access token', async () => {
      const { NextRequest } = await import('next/server');
      mockLoginUseCase.execute.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: { id: 'user-1', username: 'loginuser', email: 'login@example.com', displayName: 'loginuser' },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'login@example.com', password: 'Password123!' }),
      });

      const response = await AuthController.login(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.accessToken).toBe('access-token-123');
      expect(body.data.user.username).toBe('loginuser');
      expect(container.getInstance).toHaveBeenCalledWith('LoginUserUseCase');
    });

    it('should return 401 with wrong credentials', async () => {
      const { NextRequest } = await import('next/server');
      const { AuthenticationError } = await import('@kopiketuk/framework');
      mockLoginUseCase.execute.mockRejectedValue(new AuthenticationError('LOGIN_USER.INVALID_CREDENTIALS'));

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'login@example.com', password: 'Wrong!' }),
      });

      const response = await AuthController.login(request);
      expect(response.status).toBe(401);
    });
  });

  describe('me', () => {
    it('should return 401 when no access token provided', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/me');

      const response = await AuthController.me(request);
      expect(response.status).toBe(401);
    });

    it('should return user data with valid access token', async () => {
      const { NextRequest } = await import('next/server');
      mockGetCurrentUserUseCase.execute.mockResolvedValue({
        id: 'user-1', username: 'meuser', email: 'me@example.com',
        displayName: 'meuser', createdAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        headers: { Authorization: 'Bearer access-token-123' },
      });

      const response = await AuthController.me(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('meuser');
      expect(container.getInstance).toHaveBeenCalledWith('GetCurrentUserUseCase');
    });
  });

  describe('logout', () => {
    it('should clear refresh_token cookie on success', async () => {
      const { NextRequest } = await import('next/server');
      mockLogoutUseCase.execute.mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        headers: { Cookie: 'refresh_token=some-token' },
      });

      const response = await AuthController.logout(request);
      expect(response.status).toBe(200);
    });
  });

  describe('refresh', () => {
    it('should return 401 when no refresh token cookie', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/refresh');

      const response = await AuthController.refresh(request);
      expect(response.status).toBe(401);
    });

    it('should return new tokens with valid refresh token', async () => {
      const { NextRequest } = await import('next/server');
      mockRefreshUseCase.execute.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const request = new NextRequest('http://localhost:3000/api/auth/refresh', {
        headers: { Cookie: 'refresh_token=some-token' },
      });

      const response = await AuthController.refresh(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.accessToken).toBe('new-access-token');
      expect(container.getInstance).toHaveBeenCalledWith('RefreshTokenUseCase');
    });
  });
});
