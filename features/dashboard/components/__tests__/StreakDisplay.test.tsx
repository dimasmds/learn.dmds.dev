/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from '@/features/dashboard/components/StreakDisplay';

describe('StreakDisplay', () => {
  it('renders wind emoji when streak is zero', () => {
    render(
      <StreakDisplay
        currentCount={0}
        longestCount={5}
        lastActivityDate={null}
        freezeCount={0}
      />
    );
    expect(screen.getByText('💨')).toBeInTheDocument();
    expect(screen.getByText('Mulai belajar hari ini!')).toBeInTheDocument();
  });

  it('renders fire emoji when streak is active', () => {
    render(
      <StreakDisplay
        currentCount={7}
        longestCount={10}
        lastActivityDate="2026-04-25"
        freezeCount={0}
      />
    );
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('7 hari berturut-turut 🔥')).toBeInTheDocument();
  });

  it('renders freeze badges when freezeCount > 0', () => {
    render(
      <StreakDisplay
        currentCount={3}
        longestCount={5}
        lastActivityDate="2026-04-26"
        freezeCount={2}
      />
    );
    const snowflakes = screen.getAllByText('❄️');
    expect(snowflakes).toHaveLength(2);
  });

  it('renders longest streak subtitle', () => {
    render(
      <StreakDisplay
        currentCount={3}
        longestCount={15}
        lastActivityDate="2026-04-26"
        freezeCount={0}
      />
    );
    expect(screen.getByText('Terpanjang: 15 hari')).toBeInTheDocument();
  });

  it('does not render freeze section when freezeCount is 0', () => {
    render(
      <StreakDisplay
        currentCount={1}
        longestCount={1}
        lastActivityDate="2026-04-26"
        freezeCount={0}
      />
    );
    expect(screen.queryByText('Freezes:')).not.toBeInTheDocument();
  });
});
