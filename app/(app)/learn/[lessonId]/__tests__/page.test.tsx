/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Suspense } from 'react';

// Mock next/navigation first (LessonPlayer uses useRouter)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
  useParams: () => ({}),
}));

// Mock React Query hooks (LessonPlayer uses them)
vi.mock('@/features/lesson-player/hooks/useLesson', () => ({
  useLessonDetail: vi.fn().mockReturnValue({
    data: null,
    isLoading: true,
    error: null,
    refetch: vi.fn(),
  }),
  useUserProgress: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  }),
  useUpdateStepProgress: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

// Mock useStepNavigation
vi.mock('@/features/lesson-player/hooks/useStepNavigation', () => ({
  useStepNavigation: vi.fn().mockReturnValue({
    lessonId: null,
    steps: [],
    currentStepIndex: 0,
    startLesson: vi.fn(),
    goToStep: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    currentStep: null,
    completedCount: 0,
    progressPercent: 0,
    isLessonComplete: false,
  }),
}));

// Mock StepRenderer
vi.mock('@/features/lesson-player/components/StepRenderer', () => ({
  StepRenderer: () => <div data-testid="step-renderer">StepRenderer</div>,
}));

// Mock LessonPlayer as a simple wrapper to verify props
vi.mock('@/features/lesson-player/components/LessonPlayer', () => ({
  LessonPlayer: ({ lessonId }: { lessonId: string }) => (
    <div data-testid="lesson-player" data-lesson-id={lessonId}>
      LessonPlayer for {lessonId}
    </div>
  ),
}));

import LessonPage from '@/app/(app)/learn/[lessonId]/page';

describe('LessonPage', () => {
  it('renders LessonPlayer with lessonId from params', async () => {
    const params = Promise.resolve({ lessonId: 'lesson-abc123' });

    // Pre-resolve so use() can read synchronously
    await params;

    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <LessonPage params={params} />
        </Suspense>
      );
    });

    const player = screen.getByTestId('lesson-player');
    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute('data-lesson-id', 'lesson-abc123');
  });
});
