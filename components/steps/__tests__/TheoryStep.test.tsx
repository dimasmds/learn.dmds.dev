/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TheoryStep } from '@/components/steps/TheoryStep';
import { StepData } from '@/components/steps/types';

function createTheoryStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'theory',
    order: 1,
    instruction: 'Read the theory',
    content: { markdown: '# Hello\n\nThis is **theory** content.' },
    solution: {},
    hints: [],
    xpReward: 10,
    ...overrides,
  };
}

describe('TheoryStep', () => {
  it('renders markdown content', () => {
    const step = createTheoryStep();
    render(
      <TheoryStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('theory')).toBeInTheDocument();
  });

  it('renders instruction as fallback when no markdown', () => {
    const step = createTheoryStep({ content: {}, instruction: 'Fallback instruction' });
    render(
      <TheoryStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Fallback instruction')).toBeInTheDocument();
  });

  it('calls onAnswer(true) when Lanjutkan button is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createTheoryStep();

    render(
      <TheoryStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const button = screen.getByText('Lanjutkan');
    await user.click(button);

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('shows completed state when isCompleted is true', () => {
    const step = createTheoryStep();
    render(
      <TheoryStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.getByText('Sudah dibaca')).toBeInTheDocument();
    expect(screen.queryByText('Lanjutkan')).not.toBeInTheDocument();
  });
});
