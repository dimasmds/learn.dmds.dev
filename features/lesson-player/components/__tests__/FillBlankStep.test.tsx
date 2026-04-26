/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FillBlankStep } from '@/features/lesson-player/components/FillBlankStep';
import { StepData } from '@/features/lesson-player/types';

function createFBStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'fill-blank',
    order: 1,
    instruction: 'Isi bagian yang kosong',
    content: { template: 'Hello ___' },
    solution: { answer: 'World' },
    hints: ['Hint 1: starts with W', 'Hint 2: 5 letters'],
    xpReward: 10,
    ...overrides,
  };
}

describe('FillBlankStep', () => {
  it('renders instruction and input field', () => {
    const step = createFBStep();
    render(
      <FillBlankStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Isi bagian yang kosong')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ketik jawaban...')).toBeInTheDocument();
  });

  it('shows correct feedback for right answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createFBStep();

    render(
      <FillBlankStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Ketik jawaban...'), 'World');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Jawaban benar!')).toBeInTheDocument();
  });

  it('shows wrong feedback and reveals hint on first wrong attempt', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createFBStep();

    render(
      <FillBlankStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Ketik jawaban...'), 'Wrong');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText(/Jawaban salah/)).toBeInTheDocument();
    expect(screen.getByText(/Hint 1: starts with W/)).toBeInTheDocument();
  });

  it('reveals second hint on second wrong attempt', async () => {
    const user = userEvent.setup();
    const step = createFBStep();

    render(
      <FillBlankStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    const input = screen.getByPlaceholderText('Ketik jawaban...');

    // First wrong attempt
    await user.type(input, 'Wrong');
    await user.click(screen.getByText('Periksa'));

    // Second wrong attempt
    await user.clear(input);
    await user.type(input, 'Wrong2');
    await user.click(screen.getByText('Periksa'));

    expect(screen.getByText(/Hint 1: starts with W/)).toBeInTheDocument();
    expect(screen.getByText(/Hint 2: 5 letters/)).toBeInTheDocument();
  });

  it('shows answer and marks complete after 3 wrong attempts', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createFBStep();

    render(
      <FillBlankStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const input = screen.getByPlaceholderText('Ketik jawaban...');

    for (let i = 0; i < 3; i++) {
      await user.clear(input);
      await user.type(input, `Wrong${i}`);
      const buttons = screen.getAllByText('Periksa');
      await user.click(buttons[buttons.length - 1]);
    }

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Jawaban yang benar: World/)).toBeInTheDocument();
  });

  it('submits on Enter key', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createFBStep();

    render(
      <FillBlankStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Ketik jawaban...'), 'World{Enter}');

    expect(onAnswer).toHaveBeenCalledWith(true);
  });
});
