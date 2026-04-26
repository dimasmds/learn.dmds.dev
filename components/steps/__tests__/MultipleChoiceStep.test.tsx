/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleChoiceStep } from '@/components/steps/MultipleChoiceStep';
import { StepData } from '@/components/steps/types';

function createMCStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'multiple-choice',
    order: 1,
    instruction: 'Pilih jawaban yang benar',
    content: { options: ['Option A', 'Option B', 'Option C'] },
    solution: { correctAnswer: 'Option B' },
    hints: ['Hint: think carefully'],
    xpReward: 10,
    ...overrides,
  };
}

describe('MultipleChoiceStep', () => {
  it('renders instruction and all options', () => {
    const step = createMCStep();
    render(
      <MultipleChoiceStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Pilih jawaban yang benar')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('highlights selected option on click', async () => {
    const user = userEvent.setup();
    const step = createMCStep();
    render(
      <MultipleChoiceStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    await user.click(screen.getByText('Option A'));

    const optionA = screen.getByText('Option A').closest('button');
    expect(optionA?.className).toContain('bg-main');
  });

  it('shows correct feedback and calls onAnswer for right answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createMCStep();

    render(
      <MultipleChoiceStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.click(screen.getByText('Option B'));
    await user.click(screen.getByText('Periksa Jawaban'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Jawaban benar!')).toBeInTheDocument();
  });

  it('shows wrong feedback with hint for wrong answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createMCStep();

    render(
      <MultipleChoiceStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.click(screen.getByText('Option A'));
    await user.click(screen.getByText('Periksa Jawaban'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText(/Jawaban salah/)).toBeInTheDocument();
    expect(screen.getByText(/Hint: think carefully/)).toBeInTheDocument();
  });

  it('disables interaction when completed', async () => {
    const step = createMCStep();
    render(
      <MultipleChoiceStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.queryByText('Periksa Jawaban')).not.toBeInTheDocument();
  });
});
