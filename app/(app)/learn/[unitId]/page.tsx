'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLearningStore } from '@/lib/presentations/stores/learning-store';
import { useProgressStore } from '@/lib/presentations/stores/progress-store';
import { Button } from '@/components/ui/button';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;

  const {
    unitDetail,
    isLoading,
    error,
    fetchUnitDetail,
    clearError,
  } = useLearningStore();

  const { progress } = useProgressStore();

  useEffect(() => {
    if (unitId) {
      fetchUnitDetail(unitId);
    }
  }, [unitId, fetchUnitDetail]);

  const handleRetry = useCallback(() => {
    clearError();
    if (unitId) fetchUnitDetail(unitId);
  }, [clearError, fetchUnitDetail, unitId]);

  const getLessonStatus = (lessonId: string): 'completed' | 'in-progress' | 'not-started' => {
    const lessonProgress = progress.filter((p) => p.lessonId === lessonId);
    if (lessonProgress.some((p) => p.status === 'completed')) return 'completed';
    if (lessonProgress.some((p) => p.status === 'in-progress' || p.status === 'attempted')) return 'in-progress';
    return 'not-started';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔵';
      default:
        return '⚪';
    }
  };

  // Loading state
  if (isLoading && !unitDetail) {
    return (
      <div>
        <button
          onClick={() => router.push('/learn')}
          className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
        >
          ← Kembali ke Kursus
        </button>
        <div className="mt-4 animate-pulse space-y-4">
          <div className="h-8 bg-foreground/10 rounded w-1/2" />
          <div className="h-4 bg-foreground/10 rounded w-3/4" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]"
            >
              <div className="animate-pulse space-y-2">
                <div className="h-5 bg-foreground/10 rounded w-2/3" />
                <div className="h-4 bg-foreground/10 rounded w-full" />
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
        <button
          onClick={() => router.push('/learn')}
          className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
        >
          ← Kembali ke Kursus
        </button>
        <div className="mt-8 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] p-6 text-center">
          <p className="text-lg font-medium mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-foreground/60 mb-4">{error}</p>
          <Button onClick={handleRetry} variant="default" size="md">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!unitDetail) return null;

  const { unit, lessons } = unitDetail;
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div>
      <button
        onClick={() => router.push('/learn')}
        className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
      >
        ← Kembali ke Kursus
      </button>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-foreground">{unit.title}</h1>
        <p className="mt-2 text-foreground/70">{unit.description}</p>
      </div>

      <div className="mt-8 space-y-4">
        {sortedLessons.map((lesson) => {
          const status = getLessonStatus(lesson.id);
          return (
            <Link
              key={lesson.id}
              href={`/learn/${unitId}/${lesson.id}`}
              className="block rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{lesson.title}</h2>
                    <span className="text-sm">{getStatusIcon(status)}</span>
                  </div>
                  {lesson.description && (
                    <p className="mt-1 text-sm text-foreground/60">{lesson.description}</p>
                  )}
                </div>
                <span className="text-sm text-foreground/40 font-medium">
                  #{lesson.order}
                </span>
              </div>
            </Link>
          );
        })}

        {sortedLessons.length === 0 && (
          <div className="rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background p-8 text-center shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-lg font-medium">Belum ada pelajaran</p>
            <p className="text-sm text-foreground/60 mt-1">
              Pelajaran baru akan segera hadir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
