export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
}

export interface JwtServiceInterface {
  generateTokenPair(payload: TokenPayload): TokenPair;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
  hashRefreshToken(token: string): string;
}

export interface PasswordServiceInterface {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
