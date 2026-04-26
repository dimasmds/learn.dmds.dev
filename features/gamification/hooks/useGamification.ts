'use client';

import { useMemo } from 'react';
import { useGetData } from '@/hooks/useGetData';
import type {
  UserStats,
  BadgeData,
  UserBadgeData,
  BadgeWithStatus,
  BadgesResponse,
} from '../types';

export function useUserStats(userId: string) {
  return useGetData<UserStats>(
    ['gamification', 'stats', userId],
    () =>
      fetch(`/api/gamification/stats?userId=${userId}`)
        .then((r) => r.json())
        .then((d) => d.data)
  );
}

export function useBadges(userId?: string) {
  const query = userId ? `?userId=${userId}` : '';
  return useGetData<BadgesResponse>(
    ['gamification', 'badges', userId ?? 'all'],
    () =>
      fetch(`/api/gamification/badges${query}`)
        .then((r) => r.json())
        .then((d) => d.data)
  );
}

export function useBadgesWithStatus(userId?: string) {
  const { data, ...rest } = useBadges(userId);

  const badgesWithStatus: BadgeWithStatus[] = useMemo(() => {
    if (!data) return [];

    const earnedMap = new Map<string, string>();
    for (const ub of data.userBadges) {
      earnedMap.set(ub.badgeId, ub.earnedAt);
    }

    return data.allBadges.map((badge: BadgeData) => {
      const earnedAt = earnedMap.get(badge.id);
      return {
        ...badge,
        isEarned: !!earnedAt,
        earnedAt,
      };
    });
  }, [data]);

  return { data: badgesWithStatus, ...rest };
}
