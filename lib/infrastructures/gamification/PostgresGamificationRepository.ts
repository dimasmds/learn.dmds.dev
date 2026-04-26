import { Pool } from 'pg';
import type { GamificationRepositoryInterface } from '../../domains/gamification/repositories/GamificationRepositoryInterface';
import { XPTransaction } from '../../domains/gamification/entities/XPTransaction';
import { Badge } from '../../domains/gamification/entities/Badge';
import { UserBadge } from '../../domains/gamification/entities/UserBadge';
import { Streak } from '../../domains/gamification/entities/Streak';

export class PostgresGamificationRepository implements GamificationRepositoryInterface {
  constructor(private pool: Pool) {}

  // ── Badges ──

  async getAllBadges(): Promise<Badge[]> {
    const result = await this.pool.query('SELECT * FROM badges ORDER BY created_at ASC');
    return result.rows.map((row) => this.mapRowToBadge(row));
  }

  async getBadgeById(id: string): Promise<Badge | null> {
    const result = await this.pool.query('SELECT * FROM badges WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToBadge(result.rows[0]);
  }

  async getBadgesByCategory(category: string): Promise<Badge[]> {
    const result = await this.pool.query('SELECT * FROM badges WHERE category = $1 ORDER BY created_at ASC', [category]);
    return result.rows.map((row) => this.mapRowToBadge(row));
  }

  // ── User Badges ──

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const result = await this.pool.query('SELECT * FROM user_badges WHERE user_id = $1 ORDER BY earned_at DESC', [userId]);
    return result.rows.map((row) => this.mapRowToUserBadge(row));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const id = crypto.randomUUID();
    const now = new Date();
    await this.pool.query(
      'INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES ($1, $2, $3, $4)',
      [id, userId, badgeId, now],
    );
    return UserBadge.reconstitute(id, { userId, badgeId, earnedAt: now });
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await this.pool.query('SELECT 1 FROM user_badges WHERE user_id = $1 AND badge_id = $2', [userId, badgeId]);
    return result.rows.length > 0;
  }

  // ── XP ──

  async getTotalXP(userId: string): Promise<number> {
    const result = await this.pool.query('SELECT COALESCE(SUM(amount), 0)::int as total FROM xp_transactions WHERE user_id = $1', [userId]);
    return result.rows[0].total;
  }

  async getXPTransactions(userId: string, limit = 10): Promise<XPTransaction[]> {
    const result = await this.pool.query('SELECT * FROM xp_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [userId, limit]);
    return result.rows.map((row) => this.mapRowToXPTransaction(row));
  }

  async addXPTransaction(transaction: XPTransaction): Promise<XPTransaction> {
    const p = transaction.props;
    await this.pool.query(
      'INSERT INTO xp_transactions (id, user_id, amount, source, source_id, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [transaction.id, p.userId, p.amount, p.source, p.sourceId, p.description, p.createdAt],
    );
    return transaction;
  }

  // ── Streak ──

  async getStreak(userId: string): Promise<Streak | null> {
    const result = await this.pool.query('SELECT * FROM streaks WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) return null;
    return this.mapRowToStreak(result.rows[0]);
  }

  async upsertStreak(streak: Streak): Promise<Streak> {
    const p = streak.props;
    await this.pool.query(
      `INSERT INTO streaks (id, user_id, current_count, longest_count, last_activity_date, freeze_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         current_count = EXCLUDED.current_count,
         longest_count = EXCLUDED.longest_count,
         last_activity_date = EXCLUDED.last_activity_date,
         freeze_count = EXCLUDED.freeze_count,
         updated_at = EXCLUDED.updated_at`,
      [streak.id, p.userId, p.currentCount, p.longestCount, p.lastActivityDate, p.freezeCount, p.createdAt, p.updatedAt],
    );
    return streak;
  }

  // ── Mappers ──

  private mapRowToXPTransaction(row: Record<string, unknown>): XPTransaction {
    return XPTransaction.reconstitute(row.id as string, {
      userId: row.user_id as string,
      amount: row.amount as number,
      source: row.source as string,
      sourceId: row.source_id as string | null,
      description: row.description as string,
      createdAt: new Date(row.created_at as string),
    });
  }

  private mapRowToBadge(row: Record<string, unknown>): Badge {
    const criteria = typeof row.criteria === 'string' ? JSON.parse(row.criteria) : row.criteria;
    return Badge.reconstitute(row.id as string, {
      name: row.name as string,
      description: row.description as string,
      icon: row.icon as string,
      type: row.type as string,
      category: row.category as string,
      criteria: criteria as Record<string, unknown>,
      xpReward: row.xp_reward as number,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }

  private mapRowToUserBadge(row: Record<string, unknown>): UserBadge {
    return UserBadge.reconstitute(row.id as string, {
      userId: row.user_id as string,
      badgeId: row.badge_id as string,
      earnedAt: new Date(row.earned_at as string),
    });
  }

  private mapRowToStreak(row: Record<string, unknown>): Streak {
    return Streak.reconstitute(row.id as string, {
      userId: row.user_id as string,
      currentCount: row.current_count as number,
      longestCount: row.longest_count as number,
      lastActivityDate: row.last_activity_date as string | null,
      freezeCount: row.freeze_count as number,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
