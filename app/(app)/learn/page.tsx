'use client';

import Link from 'next/link';
import { useUnits } from '@/features/lesson-player/hooks/useLesson';
import { Button } from '@/components/ui/button';

function getUnitEmoji(title: string, order: number): string {
  const lower = title.toLowerCase();
  if (lower.includes('html')) return '🌐';
  if (lower.includes('css')) return '🎨';
  if (lower.includes('javascript') || lower.includes('js')) return '⚡';
  // Fallback based on order
  const emojis = ['🌐', '🎨', '⚡', '📚', '🧩', '🚀'];
  return emojis[(order - 1) % emojis.length] || '📚';
}

export default function LearnPage() {
  const { data: units = [], isLoading, error, refetch } = useUnits();

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading && units.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Belajar</h1>
        <p className="mt-2 text-foreground/70">Pilih kursus yang ingin kamu pelajari.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-6"
            >
              <div className="animate-pulse space-y-3">
                <div className="text-4xl">📚</div>
                <div className="h-6 bg-foreground/10 rounded w-2/3" />
                <div className="h-4 bg-foreground/10 rounded w-full" />
                <div className="h-4 bg-foreground/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Belajar</h1>
        <div className="mt-8 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-6 text-center">
          <p className="text-lg font-medium mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-foreground/60 mb-4">{error.message}</p>
          <Button onClick={handleRetry} variant="default" size="md">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && units.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground">Belajar</h1>
        <p className="mt-2 text-foreground/70">Pilih kursus yang ingin kamu pelajari.</p>
        <div className="mt-8 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg font-medium">Belum ada kursus</p>
          <p className="text-sm text-foreground/60 mt-1">
            Kursus baru akan segera hadir. Nantikan ya!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Belajar</h1>
      <p className="mt-2 text-foreground/70">Pilih kursus yang ingin kamu pelajari.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <Link
            key={unit.id}
            href={`/learn/${unit.id}`}
            className="group rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)]"
          >
            <div className="text-4xl">{getUnitEmoji(unit.title, unit.order)}</div>
            <h2 className="mt-3 text-xl font-bold">{unit.title}</h2>
            <p className="mt-1 text-sm text-foreground/60">{unit.description}</p>
            <div className="mt-4 rounded border-2 border-[var(--color-border)] bg-main px-3 py-1.5 text-center text-sm font-semibold text-main-foreground">
              {unit.lessonIds?.length ?? 0} Pelajaran
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
