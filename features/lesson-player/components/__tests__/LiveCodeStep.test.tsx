/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LiveCodeStep } from '@/features/lesson-player/components/LiveCodeStep';
import { StepData } from '@/features/lesson-player/types';

function createLiveCodeStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-lc-1',
    type: 'live-code',
    order: 1,
    instruction: 'Tulis kode untuk mencetak Hello World',
    content: { initialCode: 'console.log("Hello");', language: 'javascript' },
    solution: { expectedOutput: 'Hello' },
    hints: ['Gunakan console.log()', 'Pastikan output persis sama'],
    xpReward: 15,
    ...overrides,
  };
}

describe('LiveCodeStep', () => {
  it('renders instruction and code editor', () => {
    const step = createLiveCodeStep();
    render(
      <LiveCodeStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    expect(screen.getByText('Tulis kode untuk mencetak Hello World')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByText('Jalankan')).toBeInTheDocument();
  });

  it('runs code and shows output when Jalankan is clicked', async () => {
    const user = userEvent.setup();
    const step = createLiveCodeStep();

    render(
      <LiveCodeStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    const editor = screen.getByTestId('code-editor');
    await user.clear(editor);
    await user.type(editor, 'console.log("Hello World");');
    await user.click(screen.getByText('Jalankan'));

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('submits correct output and triggers onAnswer(true)', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createLiveCodeStep();

    render(
      <LiveCodeStep step={step} onAnswer={onAnswer} isCompleted={false} />
    );

    // Code already has initialCode that produces "Hello" which matches expectedOutput
    await user.click(screen.getByText('Jalankan'));
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Output benar!')).toBeInTheDocument();
  });

  it('shows feedback for wrong output', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createLiveCodeStep({
      content: { initialCode: 'console.log("Wrong");', language: 'javascript' },
      solution: { expectedOutput: 'Hello' },
    });

    render(
      <LiveCodeStep step={step} onAnswer={onAnswer} isCompleted={false} />
    );

    await user.click(screen.getByText('Jalankan'));
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText('Output tidak sesuai. Coba lagi!')).toBeInTheDocument();
  });

  it('shows error when code throws', async () => {
    const user = userEvent.setup();
    const step = createLiveCodeStep({
      content: { initialCode: 'throw new Error("myerr");', language: 'javascript' },
      solution: { expectedOutput: 'Hello' },
    });

    render(
      <LiveCodeStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    await user.click(screen.getByText('Jalankan'));

    expect(screen.getByText(/Error: myerr/)).toBeInTheDocument();
  });

  it('shows completed indicator when isCompleted is true', () => {
    const step = createLiveCodeStep();
    render(
      <LiveCodeStep step={step} onAnswer={vi.fn()} isCompleted={true} />
    );

    expect(screen.getByText('Sudah dijawab')).toBeInTheDocument();
  });
});
