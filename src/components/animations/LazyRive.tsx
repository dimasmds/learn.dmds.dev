'use client';

import dynamic from 'next/dynamic';

// SSR-safe lazy loaders for Rive animations

export const LazyStreakFire = dynamic(
  () => import('./StreakFire'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center animate-pulse bg-orange-100 rounded-full"
        style={{ width: 80, height: 80 }}>
        🔥
      </div>
    ),
  }
);

export const LazyXPStar = dynamic(
  () => import('./XPStar'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center animate-pulse bg-yellow-100 rounded-full"
        style={{ width: 60, height: 60 }}>
        ⭐
      </div>
    ),
  }
);

export const LazyRiveAnimation = dynamic(
  () => import('./RiveAnimation'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 rounded-[var(--radius-common)]"
        style={{ width: 120, height: 120 }} />
    ),
  }
);
