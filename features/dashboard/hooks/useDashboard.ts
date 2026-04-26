'use client';

import { useUserStats, useBadgesWithStatus } from '@/features/gamification/hooks/useGamification';
import { useUnits } from '@/features/lesson-player/hooks/useLesson';

export function useDashboard(userId: string) {
  const statsQuery = useUserStats(userId);
  const badgesQuery = useBadgesWithStatus(userId);
  const unitsQuery = useUnits();

  const isLoading = statsQuery.isLoading || badgesQuery.isLoading || unitsQuery.isLoading;
  const error = statsQuery.error || badgesQuery.error || unitsQuery.error;

  const refetch = () => {
    statsQuery.refetch();
    badgesQuery.refetch();
    unitsQuery.refetch();
  };

  return {
    stats: statsQuery.data ?? null,
    badges: badgesQuery.data ?? [],
    units: unitsQuery.data ?? [],
    isLoading,
    error,
    refetch,
  };
}
