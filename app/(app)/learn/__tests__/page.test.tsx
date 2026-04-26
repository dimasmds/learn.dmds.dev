/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the React Query hooks
vi.mock('@/features/lesson-player/hooks/useLesson', () => ({
  useUnits: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useUnits } from '@/features/lesson-player/hooks/useLesson';

// Import dynamically to ensure mock is set up
import LearnPage from '@/app/(app)/learn/page';

const mockRefetch = vi.fn();

const mockUnits = [
  {
    id: 'unit-1',
    title: 'HTML Dasar',
    description: 'Belajar dasar HTML',
    slug: 'html-dasar',
    order: 1,
    lessonIds: ['lesson-1', 'lesson-2'],
  },
  {
    id: 'unit-2',
    title: 'CSS Styling',
    description: 'Belajar CSS',
    slug: 'css-styling',
    order: 2,
    lessonIds: ['lesson-3'],
  },
  {
    id: 'unit-3',
    title: 'JavaScript',
    description: 'Belajar JavaScript',
    slug: 'javascript',
    order: 3,
    lessonIds: [],
  },
];

function setupHook(overrides = {}) {
  (useUnits as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupHook();
});

describe('LearnPage', () => {
  it('renders loading state while fetching', () => {
    setupHook({ isLoading: true, data: [] });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders unit cards after fetch', () => {
    setupHook({ data: mockUnits, isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    expect(screen.getByText('HTML Dasar')).toBeInTheDocument();
    expect(screen.getByText('CSS Styling')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    expect(screen.getByText('Belajar dasar HTML')).toBeInTheDocument();
    expect(screen.getByText('Belajar CSS')).toBeInTheDocument();

    expect(screen.getByText('2 Pelajaran')).toBeInTheDocument();
    expect(screen.getByText('1 Pelajaran')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/learn/unit-1');
    expect(links[1]).toHaveAttribute('href', '/learn/unit-2');
    expect(links[2]).toHaveAttribute('href', '/learn/unit-3');

    expect(screen.getByText('🌐')).toBeInTheDocument(); // HTML
    expect(screen.getByText('🎨')).toBeInTheDocument(); // CSS
    expect(screen.getByText('⚡')).toBeInTheDocument(); // JavaScript
  });

  it('shows empty state when no units', () => {
    setupHook({ data: [], isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    expect(screen.getByText('Belum ada kursus')).toBeInTheDocument();
    expect(screen.getByText(/Kursus baru akan segera hadir/)).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    const user = userEvent.setup();
    setupHook({ error: new Error('Gagal memuat unit'), isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Gagal memuat unit')).toBeInTheDocument();

    const retryButton = screen.getByText('Coba Lagi');
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('calls useUnits on mount', () => {
    setupHook();
    render(<LearnPage />);

    expect(useUnits).toHaveBeenCalledTimes(1);
  });
});
