/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CelebrationOverlay } from '@/features/dashboard/components/CelebrationOverlay';

describe('CelebrationOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders when active is true', () => {
    const onDone = vi.fn();
    render(
      <CelebrationOverlay active={true} xpAmount={100} onDone={onDone} />
    );
    expect(screen.getByText('+100 XP!')).toBeInTheDocument();
  });

  it('does not render when active is false', () => {
    const onDone = vi.fn();
    render(
      <CelebrationOverlay active={false} xpAmount={100} onDone={onDone} />
    );
    expect(screen.queryByText('+100 XP!')).not.toBeInTheDocument();
  });

  it('calls onDone after 3 seconds', () => {
    const onDone = vi.fn();
    render(
      <CelebrationOverlay active={true} xpAmount={50} onDone={onDone} />
    );

    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('renders badge name when provided', () => {
    const onDone = vi.fn();
    render(
      <CelebrationOverlay
        active={true}
        xpAmount={25}
        badgeName="Streak Master"
        onDone={onDone}
      />
    );
    expect(screen.getByText('Streak Master')).toBeInTheDocument();
  });

  it('does not render badge name section when not provided', () => {
    const onDone = vi.fn();
    render(
      <CelebrationOverlay active={true} xpAmount={25} onDone={onDone} />
    );
    // Only the XP text should be present, no badge name
    expect(screen.getByText('+25 XP!')).toBeInTheDocument();
  });
});
