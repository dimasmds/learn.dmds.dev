/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the React Query hooks
vi.mock('../../hooks/useLesson', () => ({
  useLessonDetail: vi.fn(),
  useUserProgress: vi.fn(),
  useUpdateStepProgress: vi.fn(),
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
vi.mock('../StepRenderer', () => ({
  StepRenderer: ({ step, onAnswer, isCompleted }: { step: { id: string; instruction: string }; onAnswer: (correct: boolean) => void; isCompleted: boolean }) => (
    <div data-testid="step-renderer">
      <span data-testid="step-instruction">{step.instruction}</span>
      <span data-testid="step-completed">{isCompleted ? 'yes' : 'no'}</span>
      <button data-testid="answer-correct" onClick={() => onAnswer(true)}>Answer Correct</button>
      <button data-testid="answer-wrong" onClick={() => onAnswer(false)}>Answer Wrong</button>
    </div>
  ),
}));

// Mock the step navigation hook
vi.mock('../../hooks/useStepNavigation', () => ({
  useStepNavigation: vi.fn(),
}));

import { useLessonDetail, useUserProgress, useUpdateStepProgress } from '../../hooks/useLesson';
import { useStepNavigation } from '../../hooks/useStepNavigation';
import { LessonPlayer } from '../LessonPlayer';

const mockRefetchLesson = vi.fn();
const mockMutate = vi.fn();

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
    { id: 'step-1', type: 'theory', order: 1, instruction: 'Apa itu HTML?', content: { markdown: '# HTML' }, solution: {}, hints: [], xpReward: 10 },
    { id: 'step-2', type: 'multiple-choice', order: 2, instruction: 'Pilih jawaban benar', content: {}, solution: {}, hints: [], xpReward: 15 },
    { id: 'step-3', type: 'fill-blank', order: 3, instruction: 'Isi titik-titik', content: {}, solution: {}, hints: [], xpReward: 10 },
  ],
};

const defaultNavigation = {
  lessonId: null,
  steps: [],
  currentStepIndex: 0,
  answers: new Map(),
  attempts: new Map(),
  stepStatus: new Map(),
  lessonStartTime: null,
  startLesson: vi.fn(),
  goToStep: vi.fn(),
  submitAnswer: vi.fn(),
  markCorrect: vi.fn(),
  markWrong: vi.fn(),
  resetLesson: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  isLastStep: false,
  currentStep: null,
  completedCount: 0,
  progressPercent: 0,
  isLessonComplete: false,
};

function setupHooks(overrides: { lesson?: Record<string, unknown>; navigation?: Record<string, unknown> } = {}) {
  (useLessonDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: mockRefetchLesson,
    ...overrides.lesson,
  });

  (useUserProgress as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
  });

  (useUpdateStepProgress as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  });

  (useStepNavigation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    ...defaultNavigation,
    ...overrides.navigation,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupHooks();
});

describe('LessonPlayer', () => {
  it('renders loading state initially when fetching', () => {
    setupHooks({ lesson: { isLoading: true, data: null } });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(screen.getByText('Memuat pelajaran...')).toBeInTheDocument();
  });

  it('renders step renderer and navigation after fetch', async () => {
    setupHooks({
      lesson: { data: mockLessonDetail, isLoading: false },
      navigation: {
        lessonId: 'lesson-1',
        steps: mockLessonDetail.steps,
        currentStepIndex: 0,
        currentStep: mockLessonDetail.steps[0],
        completedCount: 0,
        progressPercent: 0,
        isLessonComplete: false,
        isLastStep: false,
        stepStatus: new Map(),
      },
    });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(screen.getByTestId('step-renderer')).toBeInTheDocument();
    expect(screen.getByTestId('step-instruction')).toHaveTextContent('Apa itu HTML?');
  });

  it('renders error state when fetch fails', () => {
    setupHooks({ lesson: { error: new Error('Gagal memuat'), data: null, isLoading: false } });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(screen.getByText('Gagal memuat pelajaran')).toBeInTheDocument();
    expect(screen.getByText('Error: Gagal memuat')).toBeInTheDocument();
  });

  it('shows completion message when lesson is complete', () => {
    setupHooks({
      lesson: { data: mockLessonDetail, isLoading: false },
      navigation: {
        lessonId: 'lesson-1',
        steps: mockLessonDetail.steps,
        currentStepIndex: 2,
        currentStep: mockLessonDetail.steps[2],
        completedCount: 3,
        progressPercent: 100,
        isLessonComplete: true,
        isLastStep: true,
        stepStatus: new Map([
          ['step-1', 'CORRECT'],
          ['step-2', 'CORRECT'],
          ['step-3', 'CORRECT'],
        ]),
      },
    });

    render(<LessonPlayer lessonId="lesson-1" userId="user-1" />);

    expect(screen.getByText('Pelajaran Selesai!')).toBeInTheDocument();
    expect(screen.getByText(/35 XP/)).toBeInTheDocument();
  });

  it('calls useLessonDetail on mount', () => {
    setupHooks({ lesson: { isLoading: true, data: null } });

    render(<LessonPlayer lessonId="lesson-1" />);

    expect(useLessonDetail).toHaveBeenCalledWith('lesson-1');
  });
});
