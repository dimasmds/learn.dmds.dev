import { Badge } from '../entities/Badge';
import { UserBadge } from '../entities/UserBadge';
import { XPTransaction } from '../entities/XPTransaction';
import { Streak } from '../entities/Streak';

export interface GamificationRepositoryInterface {
  // Badges
  getAllBadges(): Promise<Badge[]>;
  getBadgeById(id: string): Promise<Badge | null>;
  getBadgesByCategory(category: string): Promise<Badge[]>;

  // User Badges
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  hasBadge(userId: string, badgeId: string): Promise<boolean>;

  // XP
  getTotalXP(userId: string): Promise<number>;
  getXPTransactions(userId: string, limit?: number): Promise<XPTransaction[]>;
  addXPTransaction(transaction: XPTransaction): Promise<XPTransaction>;

  // Streak
  getStreak(userId: string): Promise<Streak | null>;
  upsertStreak(streak: Streak): Promise<Streak>;
}
