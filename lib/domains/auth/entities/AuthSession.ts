import { Entity, InvariantError } from '@kopiketuk/framework';

export interface AuthSessionProps {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export class AuthSession extends Entity<string> {
  private props: AuthSessionProps;

  private constructor(id: string, props: AuthSessionProps) {
    super(id);
    this.props = props;
  }

  get userId(): string {
    return this.props.userId;
  }

  get refreshTokenHash(): string {
    return this.props.refreshTokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  static create(props: Omit<AuthSessionProps, 'createdAt'>): AuthSession {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvariantError('AUTH_SESSION.USER_ID_EMPTY');
    }

    if (!props.refreshTokenHash || props.refreshTokenHash.trim().length === 0) {
      throw new InvariantError('AUTH_SESSION.REFRESH_TOKEN_HASH_EMPTY');
    }

    if (props.expiresAt <= new Date()) {
      throw new InvariantError('AUTH_SESSION.EXPIRES_AT_MUST_BE_FUTURE');
    }

    return new AuthSession(crypto.randomUUID(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static reconstitute(id: string, props: AuthSessionProps): AuthSession {
    return new AuthSession(id, props);
  }
}
