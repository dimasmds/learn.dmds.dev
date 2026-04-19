'use client';

import dynamic from 'next/dynamic';

// These are fully client-only — they will NOT render during SSR at all.
// The server sends nothing for these, and the client fills them in after mount.

export const LazyStreakFire = dynamic(
  () => import('./StreakFire'),
  { ssr: false }
);

export const LazyXPStar = dynamic(
  () => import('./XPStar'),
  { ssr: false }
);

export const LazyRiveAnimation = dynamic(
  () => import('./RiveAnimation'),
  { ssr: false }
);
