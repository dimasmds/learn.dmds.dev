/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';
import type { XPTransactionData } from '@/features/gamification/types';

const mockTransactions: XPTransactionData[] = [
  {
    id: 'tx-1',
    amount: 10,
    source: 'step_complete',
    sourceId: 'step-1',
    description: 'Completed a step',
    createdAt: '2026-04-26T10:00:00.000Z',
  },
  {
    id: 'tx-2',
    amount: 50,
    source: 'badge_earn',
    sourceId: 'badge-1',
    description: 'Earned a badge',
    createdAt: '2026-04-25T08:00:00.000Z',
  },
  {
    id: 'tx-3',
    amount: 20,
    source: 'streak_bonus',
    sourceId: null,
    description: 'Streak bonus',
    createdAt: '2026-04-24T12:00:00.000Z',
  },
  {
    id: 'tx-4',
    amount: 30,
    source: 'lesson_complete',
    sourceId: 'lesson-1',
    description: 'Finished a lesson',
    createdAt: '2026-04-23T14:00:00.000Z',
  },
];

describe('RecentActivity', () => {
  it('renders transaction descriptions and XP amounts', () => {
    render(<RecentActivity transactions={mockTransactions} />);
    expect(screen.getByText('Completed a step')).toBeInTheDocument();
    expect(screen.getByText('Earned a badge')).toBeInTheDocument();
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
  });

  it('renders correct source icons for each source type', () => {
    render(<RecentActivity transactions={mockTransactions} />);
    // step_complete = ✅
    expect(screen.getByText('✅')).toBeInTheDocument();
    // badge_earn = 🏅
    expect(screen.getByText('🏅')).toBeInTheDocument();
    // streak_bonus = 🔥
    // There's already a 🔥 in the StreakDisplay test, but here we check for it in activity
    expect(screen.getByText('🔥')).toBeInTheDocument();
    // lesson_complete = 📖
    expect(screen.getByText('📖')).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    render(<RecentActivity transactions={[]} />);
    expect(screen.getByText('Belum ada aktivitas.')).toBeInTheDocument();
  });
});
