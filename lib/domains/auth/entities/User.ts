import { Entity, InvariantError } from '@kopiketuk/framework';

export interface UserProps {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreatePayload {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
}

export class User extends Entity<string> {
  private props: UserProps;

  private constructor(id: string, props: UserProps) {
    super(id);
    this.props = props;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(payload: UserCreatePayload): User {
    const id = crypto.randomUUID();

    // Validate invariants
    if (!payload.username || payload.username.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.USERNAME_EMPTY');
    }

    if (!payload.email || payload.email.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.EMAIL_EMPTY');
    }

    // Normalize email before validation
    const normalizedEmail = payload.email.trim().toLowerCase();

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new InvariantError('REGISTER_USER.EMAIL_INVALID_FORMAT');
    }

    if (!payload.passwordHash || payload.passwordHash.trim().length === 0) {
      throw new InvariantError('REGISTER_USER.PASSWORD_HASH_EMPTY');
    }

    if (!payload.displayName || payload.displayName.trim().length < 1) {
      throw new InvariantError('REGISTER_USER.DISPLAY_NAME_MIN_1_CHAR');
    }

    const now = new Date();

    return new User(id, {
      username: payload.username.trim(),
      email: payload.email.trim().toLowerCase(),
      passwordHash: payload.passwordHash,
      displayName: payload.displayName.trim(),
      createdAt: now,
      updatedAt: now,
    });
  }

  updateProfile(data: { displayName?: string }): User {
    const newProps: UserProps = {
      ...this.props,
      updatedAt: new Date(),
    };

    if (data.displayName !== undefined) {
      if (data.displayName.trim().length < 1) {
        throw new InvariantError('UPDATE_PROFILE.DISPLAY_NAME_MIN_1_CHAR');
      }
      newProps.displayName = data.displayName.trim();
    }

    return new User(this.id, newProps);
  }
}
