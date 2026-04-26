import { Entity, InvariantError } from '@kopiketuk/framework';
import { CompletionStatus } from '../value-objects/CompletionStatus';
import type { CompletionStatusValue } from '../value-objects/CompletionStatus';

export interface UserProgressProps {
  userId: string;
  stepId: string;
  lessonId: string;
  status: CompletionStatusValue;
  attempts: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProgress extends Entity<string> {
  private _props: UserProgressProps;

  private constructor(props: UserProgressProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): UserProgressProps {
    return this._props;
  }

  static create(
    props: Omit<UserProgressProps, 'completedAt' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ): UserProgress {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvariantError('USER_PROGRESS.EMPTY_USER_ID');
    }
    if (!props.stepId || props.stepId.trim().length === 0) {
      throw new InvariantError('USER_PROGRESS.EMPTY_STEP_ID');
    }
    if (!props.lessonId || props.lessonId.trim().length === 0) {
      throw new InvariantError('USER_PROGRESS.EMPTY_LESSON_ID');
    }

    const status = CompletionStatus.create(props.status);

    const completedAt = status.isCompleted() ? new Date() : null;

    return new UserProgress(
      {
        userId: props.userId,
        stepId: props.stepId,
        lessonId: props.lessonId,
        status: status.value,
        attempts: props.attempts ?? 0,
        completedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: UserProgressProps): UserProgress {
    return new UserProgress(props, id);
  }

  markCompleted(): void {
    this._props = {
      ...this._props,
      status: 'COMPLETED',
      completedAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
