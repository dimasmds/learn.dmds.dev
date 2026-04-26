import { Entity, InvariantError } from '@kopiketuk/framework';
import { XPAmount } from '../value-objects/XPAmount';

export interface XPTransactionProps {
  userId: string;
  amount: number;
  source: string;
  sourceId: string | null;
  description: string;
  createdAt: Date;
}

const VALID_SOURCES = [
  'step_complete',
  'badge_earn',
  'streak_bonus',
  'lesson_complete',
] as const;

export type XPSourceValue = typeof VALID_SOURCES[number];

export class XPTransaction extends Entity<string> {
  private _props: XPTransactionProps;

  private constructor(props: XPTransactionProps, id?: string) {
    super(id ?? crypto.randomUUID());
    this._props = props;
  }

  get props(): XPTransactionProps {
    return this._props;
  }

  static create(
    props: Omit<XPTransactionProps, 'createdAt'>,
    id?: string,
  ): XPTransaction {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new InvariantError('XP_TRANSACTION.EMPTY_USER_ID');
    }
    if (!VALID_SOURCES.includes(props.source as XPSourceValue)) {
      throw new InvariantError('XP_TRANSACTION.INVALID_SOURCE');
    }
    if (!props.description || props.description.trim().length === 0) {
      throw new InvariantError('XP_TRANSACTION.EMPTY_DESCRIPTION');
    }
    // Validate amount via XPAmount value object
    XPAmount.create(props.amount);
    return new XPTransaction(
      {
        ...props,
        sourceId: props.sourceId ?? null,
        createdAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(id: string, props: XPTransactionProps): XPTransaction {
    return new XPTransaction(props, id);
  }
}
