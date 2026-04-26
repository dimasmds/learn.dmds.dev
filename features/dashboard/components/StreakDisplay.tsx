import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StreakDisplayProps {
  currentCount: number;
  longestCount: number;
  lastActivityDate: string | null;
  freezeCount: number;
}

export function StreakDisplay({
  currentCount,
  longestCount,
  lastActivityDate,
  freezeCount,
}: StreakDisplayProps) {
  const emoji = currentCount === 0 ? '💨' : '🔥';
  const subtitle =
    currentCount === 0
      ? 'Mulai belajar hari ini!'
      : `${currentCount} hari berturut-turut 🔥`;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Streak</h2>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex items-center justify-center text-3xl"
            style={{ width: 60, height: 60 }}
          >
            {emoji}
          </div>
          <div>
            <p className="text-3xl font-bold text-main">{currentCount}</p>
            <p className="text-sm text-foreground/60">{subtitle}</p>
          </div>
        </div>
        {freezeCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-foreground/60">Freezes:</span>
            {Array.from({ length: freezeCount }).map((_, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                ❄️
              </Badge>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-foreground/50">
          Terpanjang: {longestCount} hari
        </p>
      </CardContent>
    </Card>
  );
}
