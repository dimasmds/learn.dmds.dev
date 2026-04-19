import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { JwtServiceInterface, TokenPair, TokenPayload } from '../../domains/auth/services/AuthServiceInterface';
import { env } from '../../commons/env';

export class JwtService implements JwtServiceInterface {
  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      env.JWT_SECRET,
      { expiresIn: 900 }, // 15 minutes
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, username: payload.username },
      env.JWT_SECRET,
      { expiresIn: 604800 }, // 7 days
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as unknown as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as unknown as TokenPayload;
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
