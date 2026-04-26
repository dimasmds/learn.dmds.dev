import { Card, CardContent } from '@/components/ui/card';

interface XPCounterProps {
  totalXP: number;
}

export function XPCounter({ totalXP }: XPCounterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Total XP</h2>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex items-center justify-center text-3xl"
            style={{ width: 50, height: 50 }}
          >
            ⭐
          </div>
          <div>
            <p className="text-3xl font-bold text-main">{totalXP}</p>
            <p className="text-sm text-foreground/60">Experience Points</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
