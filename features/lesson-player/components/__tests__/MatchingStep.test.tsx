/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchingStep } from '@/features/lesson-player/components/MatchingStep';
import { StepData } from '@/features/lesson-player/types';

function createMStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'matching',
    order: 1,
    instruction: 'Cocokkan item di kiri dengan item di kanan',
    content: {
      leftItems: ['HTML', 'CSS', 'JavaScript'],
      rightItems: ['Styling', 'Structure', 'Interactivity'],
    },
    solution: {
      pairs: { HTML: 'Structure', CSS: 'Styling', JavaScript: 'Interactivity' },
    },
    hints: ['Hint 1: HTML is for structure'],
    xpReward: 10,
    ...overrides,
  };
}

describe('MatchingStep', () => {
  it('renders instruction, left items, and dropdowns', () => {
    const step = createMStep();
    render(
      <MatchingStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Cocokkan item di kiri dengan item di kanan')).toBeInTheDocument();
    expect(screen.getByText('HTML')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    // There should be 3 selects (one per left item)
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);
  });

  it('shows correct feedback when all pairs are correct', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createMStep();

    render(
      <MatchingStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const selects = screen.getAllByRole('combobox');

    await user.selectOptions(selects[0], 'Structure');
    await user.selectOptions(selects[1], 'Styling');
    await user.selectOptions(selects[2], 'Interactivity');
    await user.click(screen.getByText('Periksa Pasangan'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Semua pasangan benar!')).toBeInTheDocument();
  });

  it('shows wrong feedback and highlights wrong pairs', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createMStep();

    render(
      <MatchingStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const selects = screen.getAllByRole('combobox');

    // Select wrong pairs
    await user.selectOptions(selects[0], 'Interactivity');
    await user.selectOptions(selects[1], 'Styling');
    await user.selectOptions(selects[2], 'Structure');
    await user.click(screen.getByText('Periksa Pasangan'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText(/Ada pasangan yang salah/)).toBeInTheDocument();
  });

  it('reveals correct pairs after max attempts', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createMStep();

    render(
      <MatchingStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const selects = screen.getAllByRole('combobox');

    // First wrong attempt
    await user.selectOptions(selects[0], 'Interactivity');
    await user.selectOptions(selects[1], 'Styling');
    await user.selectOptions(selects[2], 'Structure');
    await user.click(screen.getByText('Periksa Pasangan'));

    // Second wrong attempt (max 2)
    await user.selectOptions(selects[0], 'Styling');
    await user.selectOptions(selects[1], 'Structure');
    await user.selectOptions(selects[2], 'Interactivity');
    const buttons = screen.getAllByText('Periksa Pasangan');
    await user.click(buttons[buttons.length - 1]);

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Kesempatan habis/)).toBeInTheDocument();
  });

  it('disables interaction when completed', () => {
    const step = createMStep();
    render(
      <MatchingStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.queryByText('Periksa Pasangan')).not.toBeInTheDocument();
    expect(screen.getByText('Sudah dijawab')).toBeInTheDocument();
  });
});
