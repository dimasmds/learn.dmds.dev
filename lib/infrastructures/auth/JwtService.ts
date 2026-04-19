import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { JwtServiceInterface, TokenPair, TokenPayload } from '../../domains/auth/services/AuthServiceInterface';
import { env } from '../../commons/env.js';

export class JwtService implements JwtServiceInterface {
  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN || '15m' },
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return decoded;
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
