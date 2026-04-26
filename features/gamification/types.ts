export interface StreakData {
  currentCount: number;
  longestCount: number;
  lastActivityDate: string | null;
  freezeCount: number;
}

export interface XPTransactionData {
  id: string;
  amount: number;
  source: string;
  sourceId: string | null;
  description: string;
  createdAt: string;
}

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  category: string;
  criteria: Record<string, unknown>;
  xpReward: number;
  createdAt: string;
}

export interface UserBadgeData {
  id: string;
  badgeId: string;
  earnedAt: string;
}

export interface UserStats {
  totalXP: number;
  streak: StreakData | null;
  badgeCount: number;
  recentTransactions: XPTransactionData[];
}

export interface BadgeWithStatus extends BadgeData {
  isEarned: boolean;
  earnedAt?: string;
}

export interface BadgesResponse {
  allBadges: BadgeData[];
  userBadges: UserBadgeData[];
}
