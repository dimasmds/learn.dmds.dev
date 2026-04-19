import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createContainer, InjectionMode, asFunction, asValue, type AwilixContainer } from 'awilix';

import { JwtService } from '@/lib/infrastructures/auth/JwtService';
import { BcryptPasswordService } from '@/lib/infrastructures/auth/BcryptPasswordService';
import { PostgresAuthRepository } from '@/lib/infrastructures/auth/PostgresAuthRepository';
import { RegisterUserUseCase } from '@/lib/applications/usecases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '@/lib/applications/usecases/auth/LoginUserUseCase';
import { LogoutUserUseCase } from '@/lib/applications/usecases/auth/LogoutUserUseCase';
import { RefreshTokenUseCase } from '@/lib/applications/usecases/auth/RefreshTokenUseCase';
import { GetCurrentUserUseCase } from '@/lib/applications/usecases/auth/GetCurrentUserUseCase';
import { serverlessDeps } from '@/lib/infrastructures/serverless-deps';
import { AuthController } from '../AuthController';
import { createDatabaseTestContext } from '@/lib/tests/helpers/database';

describe.sequential('AuthController', () => {
  const db = createDatabaseTestContext();
  let container: AwilixContainer;
  let controller: AuthController;

  beforeAll(async () => {
    await db.setup();

    const testPool = db.pool;
    const jwtService = new JwtService();
    const passwordService = new BcryptPasswordService();
    const authRepository = new PostgresAuthRepository(testPool);

    container = createContainer({ injectionMode: InjectionMode.CLASSIC });

    container.register({
      jwtService: asValue(jwtService),
      passwordService: asValue(passwordService),
      authRepository: asValue(authRepository),

      registerUserUseCase: asFunction(() => new RegisterUserUseCase(
        { applicationEvent: serverlessDeps.applicationEvent, logger: serverlessDeps.logger },
        authRepository,
        passwordService,
      )),

      loginUserUseCase: asFunction(() => new LoginUserUseCase(
        { applicationEvent: serverlessDeps.applicationEvent, logger: serverlessDeps.logger },
        authRepository,
        passwordService,
        jwtService,
      )),

      logoutUserUseCase: asFunction(() => new LogoutUserUseCase(
        { applicationEvent: serverlessDeps.applicationEvent, logger: serverlessDeps.logger },
        authRepository,
        jwtService,
      )),

      refreshTokenUseCase: asFunction(() => new RefreshTokenUseCase(
        { applicationEvent: serverlessDeps.applicationEvent, logger: serverlessDeps.logger },
        authRepository,
        jwtService,
      )),

      getCurrentUserUseCase: asFunction(() => new GetCurrentUserUseCase(
        { applicationEvent: serverlessDeps.applicationEvent, logger: serverlessDeps.logger },
        authRepository,
        jwtService,
      )),
    });

    controller = new AuthController(container);
  });

  afterAll(async () => {
    await db.teardown();
  });

  beforeEach(async () => {
    await db.query('DELETE FROM auth_sessions');
    await db.query('DELETE FROM users');
  });

  describe('register', () => {
    it('should register a new user and return 201', async () => {
      const { NextRequest } = await import('next/server');
      const nextReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });

      const response = await controller.register(nextReq);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('newuser');
      expect(body.data.user.email).toBe('new@example.com');
      expect(body.data.user.id).toBeDefined();
    });

    it('should return 400 when username is missing', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });

      const response = await controller.register(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when passwords do not match', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
        }),
      });

      const response = await controller.register(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when email already exists', async () => {
      const { NextRequest } = await import('next/server');

      const req1 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'firstuser',
          email: 'dup@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });
      await controller.register(req1);

      const req2 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'seconduser',
          email: 'dup@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });

      const response = await controller.register(req2);
      expect(response.status).toBe(400);
    });
  });

  describe('login', () => {
    const testPassword = 'Password123!';

    beforeEach(async () => {
      const { NextRequest } = await import('next/server');
      const registerReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'loginuser',
          email: 'login@example.com',
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
      await controller.register(registerReq);
    });

    it('should login and return 200 with access token', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'login@example.com',
          password: testPassword,
        }),
      });

      const response = await controller.login(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.user.username).toBe('loginuser');

      const cookie = response.cookies.get('refresh_token');
      expect(cookie).toBeDefined();
    });

    it('should return 401 with wrong password', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'WrongPassword!',
        }),
      });

      const response = await controller.login(request);
      expect(response.status).toBe(401);
    });

    it('should return 401 with non-existent email', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'noone@example.com',
          password: testPassword,
        }),
      });

      const response = await controller.login(request);
      expect(response.status).toBe(401);
    });
  });

  describe('me', () => {
    it('should return 401 when no access token provided', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/me');

      const response = await controller.me(request);
      expect(response.status).toBe(401);
    });

    it('should return user data with valid access token', async () => {
      const { NextRequest } = await import('next/server');

      // Register
      const registerReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'meuser',
          email: 'me@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });
      await controller.register(registerReq);

      // Login
      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'me@example.com',
          password: 'Password123!',
        }),
      });
      const loginResponse = await controller.login(loginReq);
      const loginBody = await loginResponse.json();
      const accessToken = loginBody.data.accessToken;

      // Get me
      const meReq = new NextRequest('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await controller.me(meReq);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('success');
      expect(body.data.user.username).toBe('meuser');
    });
  });

  describe('logout', () => {
    it('should clear refresh_token cookie', async () => {
      const { NextRequest } = await import('next/server');

      // Register + login
      const registerReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });
      await controller.register(registerReq);

      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'logout@example.com',
          password: 'Password123!',
        }),
      });
      const loginResponse = await controller.login(loginReq);
      const refreshToken = loginResponse.cookies.get('refresh_token')?.value;

      // Logout — pass refresh token in cookie
      const logoutReq = new NextRequest('http://localhost:3000/api/auth/logout', {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      const response = await controller.logout(logoutReq);
      expect(response.status).toBe(200);

      const cookie = response.cookies.get('refresh_token');
      expect(cookie?.value).toBe('');
    });
  });

  describe('refresh', () => {
    it('should return 401 when no refresh token cookie', async () => {
      const { NextRequest } = await import('next/server');
      const request = new NextRequest('http://localhost:3000/api/auth/refresh');

      const response = await controller.refresh(request);
      expect(response.status).toBe(401);
    });

    it('should rotate tokens with valid refresh token', async () => {
      const { NextRequest } = await import('next/server');

      // Register + login
      const registerReq = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'refreshuser',
          email: 'refresh@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });
      await controller.register(registerReq);

      const loginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'refresh@example.com',
          password: 'Password123!',
        }),
      });
      const loginResponse = await controller.login(loginReq);
      const refreshToken = loginResponse.cookies.get('refresh_token')?.value;

      // Refresh
      const refreshReq = new NextRequest('http://localhost:3000/api/auth/refresh', {
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
      });

      const response = await controller.refresh(refreshReq);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.accessToken).toBeDefined();

      const newCookie = response.cookies.get('refresh_token');
      expect(newCookie).toBeDefined();
    });
  });
});
