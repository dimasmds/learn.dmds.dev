/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LivePreviewStep } from '@/features/lesson-player/components/LivePreviewStep';
import { StepData } from '@/features/lesson-player/types';

function createLivePreviewStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-lp-1',
    type: 'live-preview',
    order: 1,
    instruction: 'Buat heading h1 dengan teks Hello',
    content: { initialHtml: '<h1>Hello</h1>', initialCss: '' },
    solution: { expectedHtml: '<h1>Hello</h1>' },
    hints: ['Gunakan tag <h1>', 'Tulis Hello di dalam tag'],
    xpReward: 15,
    ...overrides,
  };
}

describe('LivePreviewStep', () => {
  it('renders instruction and split view with editor and preview', () => {
    const step = createLivePreviewStep();
    render(
      <LivePreviewStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    expect(screen.getByText('Buat heading h1 dengan teks Hello')).toBeInTheDocument();
    expect(screen.getByTestId('html-editor')).toBeInTheDocument();
    expect(screen.getByTestId('preview-iframe')).toBeInTheDocument();
    expect(screen.getByText('Periksa')).toBeInTheDocument();
  });

  it('switches between HTML and CSS tabs', async () => {
    const user = userEvent.setup();
    const step = createLivePreviewStep();

    render(
      <LivePreviewStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    // Starts on HTML tab
    expect(screen.getByTestId('html-editor')).toBeInTheDocument();

    // Switch to CSS tab
    await user.click(screen.getByTestId('tab-css'));
    expect(screen.getByTestId('css-editor')).toBeInTheDocument();

    // Switch back to HTML tab
    await user.click(screen.getByTestId('tab-html'));
    expect(screen.getByTestId('html-editor')).toBeInTheDocument();
  });

  it('submits correct HTML and triggers onAnswer(true)', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createLivePreviewStep();

    render(
      <LivePreviewStep step={step} onAnswer={onAnswer} isCompleted={false} />
    );

    // Initial HTML already matches expectedHtml
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('HTML benar!')).toBeInTheDocument();
  });

  it('shows feedback for wrong HTML', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createLivePreviewStep({
      content: { initialHtml: '<p>Wrong</p>', initialCss: '' },
      solution: { expectedHtml: '<h1>Hello</h1>' },
    });

    render(
      <LivePreviewStep step={step} onAnswer={onAnswer} isCompleted={false} />
    );

    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText('HTML tidak sesuai. Coba lagi!')).toBeInTheDocument();
  });

  it('shows hints when answer is wrong and hints exist', async () => {
    const user = userEvent.setup();
    const step = createLivePreviewStep({
      content: { initialHtml: '<p>Wrong</p>', initialCss: '' },
      solution: { expectedHtml: '<h1>Hello</h1>' },
    });

    render(
      <LivePreviewStep step={step} onAnswer={vi.fn()} isCompleted={false} />
    );

    await user.click(screen.getByText('Periksa'));

    expect(screen.getByText(/💡 Gunakan tag <h1>/)).toBeInTheDocument();
  });

  it('shows completed indicator when isCompleted is true', () => {
    const step = createLivePreviewStep();
    render(
      <LivePreviewStep step={step} onAnswer={vi.fn()} isCompleted={true} />
    );

    expect(screen.getByText('Sudah dijawab')).toBeInTheDocument();
  });
});
