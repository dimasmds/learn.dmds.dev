'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { BadgeWithStatus } from '@/features/gamification/types';

interface BadgeShowcaseProps {
  badges: BadgeWithStatus[];
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Badges</h2>
      {badges.length === 0 ? (
        <p className="text-sm text-foreground/60">Belum ada badge.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => {
            const isExpanded = expandedId === badge.id;
            return (
              <Card
                key={badge.id}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setExpandedId(isExpanded ? null : badge.id)}
              >
                <CardContent className="flex flex-col items-center gap-2 pt-4 pb-4 text-center">
                  <span
                    className="text-3xl"
                    style={{
                      filter: badge.isEarned ? 'none' : 'grayscale(1)',
                      opacity: badge.isEarned ? 1 : 0.4,
                    }}
                  >
                    {badge.icon}
                  </span>
                  <p className="text-sm font-medium">{badge.name}</p>
                  {!badge.isEarned && (
                    <span className="text-xs text-foreground/50">🔒</span>
                  )}
                  {badge.isEarned && badge.earnedAt && (
                    <span className="text-xs text-green-600">
                      ✓ Diperoleh
                    </span>
                  )}
                  {isExpanded && (
                    <p className="mt-1 text-xs text-foreground/70">
                      {badge.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
