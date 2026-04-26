import { Card, CardContent } from '@/components/ui/card';
import type { XPTransactionData } from '@/features/gamification/types';

interface RecentActivityProps {
  transactions: XPTransactionData[];
}

const SOURCE_ICONS: Record<string, string> = {
  step_complete: '✅',
  badge_earn: '🏅',
  streak_bonus: '🔥',
  lesson_complete: '📖',
};

function getSourceIcon(source: string): string {
  return SOURCE_ICONS[source] ?? '✨';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Aktivitas Terbaru</h2>
        <p className="text-sm text-foreground/60">Belum ada aktivitas.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Aktivitas Terbaru</h2>
      <Card>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSourceIcon(tx.source)}</span>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-foreground/50">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-600">
                  +{tx.amount} XP
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
