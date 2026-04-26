import { Entity, InvariantError } from '@kopiketuk/framework';

export interface StreakProps {
  userId: string;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string | null;
  freezeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Streak extends Entity<string> {
  private _props: StreakProps;

  private constructor(props: StreakProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): StreakProps {
    return this._props;
  }

  static create(
    props: Omit<StreakProps, 'createdAt' | 'updatedAt'>,
    id?: string,
  ): Streak {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvariantError('STREAK.EMPTY_USER_ID');
    }
    if (props.currentCount < 0) {
      throw new InvariantError('STREAK.NEGATIVE_COUNT');
    }
    if (props.longestCount < 0) {
      throw new InvariantError('STREAK.NEGATIVE_COUNT');
    }
    if (props.freezeCount < 0) {
      throw new InvariantError('STREAK.NEGATIVE_COUNT');
    }
    return new Streak(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: StreakProps): Streak {
    return new Streak(props, id);
  }

  increment(today: string): void {
    if (this._props.lastActivityDate === null) {
      // First activity ever
      this._props = {
        ...this._props,
        currentCount: 1,
        longestCount: Math.max(this._props.longestCount, 1),
        lastActivityDate: today,
        updatedAt: new Date(),
      };
      return;
    }

    if (this._props.lastActivityDate === today) {
      // Already recorded activity today, no change
      return;
    }

    const nextDay = this.getNextDay(this._props.lastActivityDate);
    if (today === nextDay) {
      // Consecutive day
      const newCount = this._props.currentCount + 1;
      this._props = {
        ...this._props,
        currentCount: newCount,
        longestCount: Math.max(this._props.longestCount, newCount),
        lastActivityDate: today,
        updatedAt: new Date(),
      };
    }
    // If today is not the next day and not today, streak may be broken
    // but increment does not handle that — caller should check isBroken first
  }

  reset(): void {
    this._props = {
      ...this._props,
      currentCount: 0,
      updatedAt: new Date(),
    };
  }

  useFreeze(): boolean {
    if (this._props.freezeCount <= 0) {
      return false;
    }
    this._props = {
      ...this._props,
      freezeCount: this._props.freezeCount - 1,
      updatedAt: new Date(),
    };
    return true;
  }

  isBroken(today: string): boolean {
    if (this._props.lastActivityDate === null) {
      return false;
    }
    if (this._props.lastActivityDate === today) {
      return false;
    }
    const nextDay = this.getNextDay(this._props.lastActivityDate);
    // If today is the next day, streak is still alive (just needs to be incremented)
    if (today === nextDay) {
      return false;
    }
    // If today is before lastActivityDate, something is wrong but not broken
    if (today < this._props.lastActivityDate) {
      return false;
    }
    // More than 1 day gap
    return true;
  }

  private getNextDay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().split('T')[0];
  }
}
