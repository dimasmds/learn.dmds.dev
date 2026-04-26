/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XPCounter } from '@/features/dashboard/components/XPCounter';

describe('XPCounter', () => {
  it('renders the total XP value', () => {
    render(<XPCounter totalXP={420} />);
    expect(screen.getByText('420')).toBeInTheDocument();
  });

  it('renders the star icon and label', () => {
    render(<XPCounter totalXP={0} />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
    expect(screen.getByText('Experience Points')).toBeInTheDocument();
  });

  it('renders zero XP correctly', () => {
    render(<XPCounter totalXP={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
