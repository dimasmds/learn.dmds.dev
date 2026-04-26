/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the store
vi.mock('@/lib/presentations/stores/learning-store', () => ({
  useLearningStore: vi.fn(),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { useLearningStore } from '@/lib/presentations/stores/learning-store';

// Import dynamically to ensure mock is set up
import LearnPage from '@/app/(app)/learn/page';

const mockFetchUnits = vi.fn();
const mockClearError = vi.fn();

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

function setupStore(overrides = {}) {
  (useLearningStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    units: [],
    isLoading: false,
    error: null,
    fetchUnits: mockFetchUnits,
    clearError: mockClearError,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupStore();
});

describe('LearnPage', () => {
  it('renders loading state while fetching', () => {
    setupStore({ isLoading: true, units: [] });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    // Should have skeleton loading elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders unit cards after fetch', () => {
    setupStore({ units: mockUnits, isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    expect(screen.getByText('HTML Dasar')).toBeInTheDocument();
    expect(screen.getByText('CSS Styling')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText('Belajar dasar HTML')).toBeInTheDocument();
    expect(screen.getByText('Belajar CSS')).toBeInTheDocument();

    // Check lesson counts
    expect(screen.getByText('2 Pelajaran')).toBeInTheDocument();
    expect(screen.getByText('1 Pelajaran')).toBeInTheDocument();

    // Check links
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/learn/unit-1');
    expect(links[1]).toHaveAttribute('href', '/learn/unit-2');
    expect(links[2]).toHaveAttribute('href', '/learn/unit-3');

    // Check emojis
    expect(screen.getByText('🌐')).toBeInTheDocument(); // HTML
    expect(screen.getByText('🎨')).toBeInTheDocument(); // CSS
    expect(screen.getByText('⚡')).toBeInTheDocument(); // JavaScript
  });

  it('shows empty state when no units', () => {
    setupStore({ units: [], isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Belajar')).toBeInTheDocument();
    expect(screen.getByText('Belum ada kursus')).toBeInTheDocument();
    expect(screen.getByText(/Kursus baru akan segera hadir/)).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    const user = userEvent.setup();
    setupStore({ error: 'Gagal memuat unit', isLoading: false });

    render(<LearnPage />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Gagal memuat unit')).toBeInTheDocument();

    const retryButton = screen.getByText('Coba Lagi');
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(mockClearError).toHaveBeenCalled();
    expect(mockFetchUnits).toHaveBeenCalled();
  });

  it('calls fetchUnits on mount', () => {
    setupStore();
    render(<LearnPage />);

    expect(mockFetchUnits).toHaveBeenCalledTimes(1);
  });
});
