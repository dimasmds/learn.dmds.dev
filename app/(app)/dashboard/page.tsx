'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/presentations/stores/auth-store';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { XPCounter } from '@/features/dashboard/components/XPCounter';
import { StreakDisplay } from '@/features/dashboard/components/StreakDisplay';
import { BadgeShowcase } from '@/features/dashboard/components/BadgeShowcase';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import { CelebrationOverlay } from '@/features/dashboard/components/CelebrationOverlay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? '';
  const { stats, badges, units, isLoading, error, refetch } = useDashboard(userId);
  const [celebration, setCelebration] = useState<{
    active: boolean;
    xpAmount: number;
    badgeName?: string;
  }>({ active: false, xpAmount: 0 });

  if (!userId) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-foreground/70">
          Silakan login untuk melihat dashboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Gagal memuat dashboard. Silakan coba lagi.
            </p>
            <Button className="mt-4" onClick={() => refetch()}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const streak = stats?.streak;
  const streakProps = streak
    ? {
        currentCount: streak.currentCount,
        longestCount: streak.longestCount,
        lastActivityDate: streak.lastActivityDate,
        freezeCount: streak.freezeCount,
      }
    : {
        currentCount: 0,
        longestCount: 0,
        lastActivityDate: null as string | null,
        freezeCount: 0,
      };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-foreground/70">
        Selamat datang{user?.displayName ? `, ${user.displayName}` : ''}! Ini adalah halaman dashboard kamu.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <XPCounter totalXP={stats?.totalXP ?? 0} />
        <StreakDisplay {...streakProps} />

        {/* Courses Card */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Kursus Tersedia</h2>
            <p className="mt-1 text-3xl font-bold text-main">
              {units.length}
            </p>
            <p className="mt-1 text-sm text-foreground/60">
              {units.map((u) => u.title).join(', ') || 'Belum ada kursus'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <BadgeShowcase badges={badges} />
      </div>

      <div className="mt-8">
        <RecentActivity transactions={stats?.recentTransactions ?? []} />
      </div>

      <CelebrationOverlay
        active={celebration.active}
        xpAmount={celebration.xpAmount}
        badgeName={celebration.badgeName}
        onDone={() => setCelebration({ active: false, xpAmount: 0 })}
      />
    </div>
  );
}
