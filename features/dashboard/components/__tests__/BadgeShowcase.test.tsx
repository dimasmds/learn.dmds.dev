/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BadgeShowcase } from '@/features/dashboard/components/BadgeShowcase';
import type { BadgeWithStatus } from '@/features/gamification/types';

const mockBadges: BadgeWithStatus[] = [
  {
    id: 'badge-1',
    name: 'First Step',
    description: 'Complete your first step',
    icon: '🚀',
    type: 'bronze',
    category: 'learning',
    criteria: { stepsCompleted: 1 },
    xpReward: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    isEarned: true,
    earnedAt: '2026-04-20T00:00:00.000Z',
  },
  {
    id: 'badge-2',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    type: 'gold',
    category: 'streak',
    criteria: { streakDays: 7 },
    xpReward: 50,
    createdAt: '2026-01-01T00:00:00.000Z',
    isEarned: false,
  },
];

describe('BadgeShowcase', () => {
  it('renders all badge names', () => {
    render(<BadgeShowcase badges={mockBadges} />);
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Streak Master')).toBeInTheDocument();
  });

  it('shows earned indicator for earned badges', () => {
    render(<BadgeShowcase badges={mockBadges} />);
    expect(screen.getByText('✓ Diperoleh')).toBeInTheDocument();
  });

  it('shows lock icon for locked badges', () => {
    render(<BadgeShowcase badges={mockBadges} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('expands description on click and collapses on second click', async () => {
    const user = userEvent.setup();
    render(<BadgeShowcase badges={mockBadges} />);

    // Description not visible initially
    expect(screen.queryByText('Complete your first step')).not.toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText('First Step'));
    expect(screen.getByText('Complete your first step')).toBeInTheDocument();

    // Click again to collapse
    await user.click(screen.getByText('First Step'));
    expect(screen.queryByText('Complete your first step')).not.toBeInTheDocument();
  });

  it('renders empty state when no badges', () => {
    render(<BadgeShowcase badges={[]} />);
    expect(screen.getByText('Belum ada badge.')).toBeInTheDocument();
  });
});
