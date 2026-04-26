/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the stores
vi.mock('@/lib/presentations/stores/learning-store', () => ({
  useLearningStore: vi.fn(),
}));

vi.mock('@/lib/presentations/stores/progress-store', () => ({
  useProgressStore: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
  useParams: () => ({}),
}));

// Mock StepRenderer to avoid complex step rendering
vi.mock('@/components/steps/StepRenderer', () => ({
  StepRenderer: ({ step, onAnswer, isCompleted }: { step: { id: string; instruction: string }; onAnswer: (correct: boolean) => void; isCompleted: boolean }) => (
    <div data-testid="step-renderer">
      <span data-testid="step-instruction">{step.instruction}</span>
      <span data-testid="step-completed">{isCompleted ? 'yes' : 'no'}</span>
      <button data-testid="answer-correct" onClick={() => onAnswer(true)}>Answer Correct</button>
      <button data-testid="answer-wrong" onClick={() => onAnswer(false)}>Answer Wrong</button>
    </div>
  ),
}));

import { useLearningStore } from '@/lib/presentations/stores/learning-store';
import { useProgressStore } from '@/lib/presentations/stores/progress-store';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';

const mockFetchLessonDetail = vi.fn();
const mockClearError = vi.fn();
const mockUpdateStepProgress = vi.fn();
const mockFetchProgress = vi.fn();

const mockLessonDetail = {
  lesson: {
    id: 'lesson-1',
    unitId: 'unit-1',
    title: 'Pengenalan HTML',
    slug: 'pengenalan-html',
    description: 'Belajar dasar HTML',
    order: 1,
  },
  steps: [
    { id: 'step-1', type: 'theory', order: 1, instruction: 'Apa itu HTML?', content: { markdown: '# HTML' }, xpReward: 10 },
    { id: 'step-2', type: 'multiple-choice', order: 2, instruction: 'Pilih jawaban benar', content: {}, xpReward: 15 },
    { id: 'step-3', type: 'fill-blank', order: 3, instruction: 'Isi titik-titik', content: {}, xpReward: 10 },
  ],
};

function setupLearningStore(overrides = {}) {
  (useLearningStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    lessonDetail: null,
    isLoading: false,
    error: null,
    fetchLessonDetail: mockFetchLessonDetail,
    clearError: mockClearError,
    ...overrides,
  });
}

function setupProgressStore(overrides = {}) {
  (useProgressStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    progress: [],
    isLoading: false,
    error: null,
    fetchProgress: mockFetchProgress,
    updateStepProgress: mockUpdateStepProgress,
    clearError: vi.fn(),
    ...overrides,
  });
  // Also mock getState for the direct call
  (useProgressStore as unknown as { getState: () => Record<string, unknown> }).getState = () => ({
    fetchProgress: mockFetchProgress,
    progress: [],
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupLearningStore();
  setupProgressStore();
});

describe('LessonPlayer', () => {
  it('renders loading state initially when fetching', () => {
    setupLearningStore({ isLoading: true, lessonDetail: null });

    render(<LessonPlayer lessonId="lesson-1" />);

    // The skeleton has animate-pulse class — no text content, just visual loading
    const container = document.querySelector('.animate-pulse');
    expect(container).toBeInTheDocument();
  });

  it('renders lesson title and steps after fetch', () => {
    setupLearningStore({ lessonDetail: mockLessonDetail, isLoading: false });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(screen.getByText('Pengenalan HTML')).toBeInTheDocument();
    expect(screen.getByText('Langkah 1/3')).toBeInTheDocument();
    expect(screen.getByTestId('step-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('step-instruction')).toHaveTextContent('Apa itu HTML?');
  });

  it('navigates between steps with next and prev buttons', async () => {
    const user = userEvent.setup();
    setupLearningStore({ lessonDetail: mockLessonDetail, isLoading: false });

    render(<LessonPlayer lessonId="lesson-1" />);

    // Initially on step 1
    expect(screen.getByText('Langkah 1/3')).toBeInTheDocument();

    // Prev button should be disabled
    const prevButton = screen.getByText('← Sebelumnya');
    expect(prevButton).toBeDisabled();

    // Click next
    const nextButton = screen.getByText('Berikutnya →');
    await user.click(nextButton);

    expect(screen.getByText('Langkah 2/3')).toBeInTheDocument();
    expect(screen.getByTestId('step-instruction')).toHaveTextContent('Pilih jawaban benar');

    // Click prev
    await user.click(prevButton);

    expect(screen.getByText('Langkah 1/3')).toBeInTheDocument();
    expect(screen.getByTestId('step-instruction')).toHaveTextContent('Apa itu HTML?');
  });

  it('updates progress bar on step completion', async () => {
    const user = userEvent.setup();
    setupLearningStore({ lessonDetail: mockLessonDetail, isLoading: false });
    setupProgressStore({ progress: [{ id: 'p1', stepId: 'step-1', lessonId: 'lesson-1', status: 'completed', attempts: 1, completedAt: '2025-01-01' }] });

    render(<LessonPlayer lessonId="lesson-1" userId="user-1" />);

    // Progress should reflect the completed step
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows completion message when all steps are done', () => {
    setupLearningStore({ lessonDetail: mockLessonDetail, isLoading: false });
    setupProgressStore({
      progress: [
        { id: 'p1', stepId: 'step-1', lessonId: 'lesson-1', status: 'completed', attempts: 1, completedAt: '2025-01-01' },
        { id: 'p2', stepId: 'step-2', lessonId: 'lesson-1', status: 'completed', attempts: 1, completedAt: '2025-01-01' },
        { id: 'p3', stepId: 'step-3', lessonId: 'lesson-1', status: 'completed', attempts: 1, completedAt: '2025-01-01' },
      ],
    });

    render(<LessonPlayer lessonId="lesson-1" userId="user-1" />);

    expect(screen.getByText('Pelajaran Selesai!')).toBeInTheDocument();
    expect(screen.getByText(/⭐ \+35 XP/)).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    setupLearningStore({ error: 'Gagal memuat', lessonDetail: null, isLoading: false });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Gagal memuat')).toBeInTheDocument();

    const retryButton = screen.getByText('Coba Lagi');
    expect(retryButton).toBeInTheDocument();
  });

  it('calls fetchLessonDetail on mount', () => {
    setupLearningStore({ isLoading: true, lessonDetail: null });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(mockFetchLessonDetail).toHaveBeenCalledWith('lesson-1');
  });
});
