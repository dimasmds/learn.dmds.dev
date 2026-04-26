/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OutputPredictionStep } from '@/features/lesson-player/components/OutputPredictionStep';
import { StepData } from '@/features/lesson-player/types';

function createOPStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'output-prediction',
    order: 1,
    instruction: 'Prediksi output dari kode berikut',
    content: { code: 'console.log("Hello, World!")' },
    solution: { output: 'Hello, World!' },
    hints: ['Hint 1: it prints a greeting', 'Hint 2: exact string'],
    xpReward: 10,
    ...overrides,
  };
}

describe('OutputPredictionStep', () => {
  it('renders instruction and code block', () => {
    const step = createOPStep();
    render(
      <OutputPredictionStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Prediksi output dari kode berikut')).toBeInTheDocument();
    expect(screen.getByText('console.log("Hello, World!")')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ketik output yang diprediksi...')).toBeInTheDocument();
  });

  it('shows correct feedback for right answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createOPStep();

    render(
      <OutputPredictionStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Ketik output yang diprediksi...'), 'Hello, World!');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Prediksi benar!')).toBeInTheDocument();
  });

  it('shows wrong feedback with hint on wrong answer', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createOPStep();

    render(
      <OutputPredictionStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    await user.type(screen.getByPlaceholderText('Ketik output yang diprediksi...'), 'Wrong output');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText(/Prediksi salah/)).toBeInTheDocument();
    expect(screen.getByText(/Hint 1: it prints a greeting/)).toBeInTheDocument();
  });

  it('shows completed state with correct output when isCompleted', () => {
    const step = createOPStep();
    render(
      <OutputPredictionStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.getByText('Output yang benar:')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.queryByText('Periksa')).not.toBeInTheDocument();
  });

  it('reveals answer after max attempts', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createOPStep();

    render(
      <OutputPredictionStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    const input = screen.getByPlaceholderText('Ketik output yang diprediksi...');

    for (let i = 0; i < 3; i++) {
      await user.clear(input);
      await user.type(input, `Wrong${i}`);
      const buttons = screen.getAllByText('Periksa');
      await user.click(buttons[buttons.length - 1]);
    }

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText(/Kesempatan habis/)).toBeInTheDocument();
    // The expected output appears in the feedback message
    expect(screen.getByText(/Output yang benar: Hello, World!/)).toBeInTheDocument();
  });
});
