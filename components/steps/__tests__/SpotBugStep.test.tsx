/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpotBugStep } from '@/components/steps/SpotBugStep';
import { StepData } from '@/components/steps/types';

function createSBStep(overrides: Partial<StepData> = {}): StepData {
  return {
    id: 'step-1',
    type: 'spot-bug',
    order: 1,
    instruction: 'Temukan bug dalam kode berikut',
    content: {
      code: 'const x = 5;\nconst y = 10;\nconst z = x + y;\nconsole.log(z);',
      language: 'js',
    },
    solution: { bugLine: 3, fix: 'const z = x * y;' },
    hints: ['Hint 1: check the operator', 'Hint 2: should be multiplication'],
    xpReward: 10,
    ...overrides,
  };
}

describe('SpotBugStep', () => {
  it('renders instruction, code lines with line numbers, and language badge', () => {
    const step = createSBStep();
    render(
      <SpotBugStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    expect(screen.getByText('Temukan bug dalam kode berikut')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
    expect(screen.getByText('Klik pada baris yang memiliki bug:')).toBeInTheDocument();
    // Verify all code lines are rendered
    expect(screen.getByText('const x = 5;')).toBeInTheDocument();
    expect(screen.getByText('const z = x + y;')).toBeInTheDocument();
  });

  it('shows fix input after clicking a line', async () => {
    const user = userEvent.setup();
    const step = createSBStep();

    render(
      <SpotBugStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={false}
      />
    );

    // Click on line 3 (the buggy line)
    await user.click(screen.getByText('const z = x + y;'));

    expect(screen.getByText(/Baris terpilih: 3/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tulis baris yang benar...')).toBeInTheDocument();
  });

  it('shows correct feedback for correct line and fix', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createSBStep();

    render(
      <SpotBugStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    // Click the buggy line
    await user.click(screen.getByText('const z = x + y;'));

    // Type the fix
    await user.type(screen.getByPlaceholderText('Tulis baris yang benar...'), 'const z = x * y;');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Bug ditemukan!')).toBeInTheDocument();
  });

  it('shows wrong feedback with hint for wrong line', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const step = createSBStep();

    render(
      <SpotBugStep
        step={step}
        onAnswer={onAnswer}
        isCompleted={false}
      />
    );

    // Click wrong line
    await user.click(screen.getByText('const x = 5;'));

    await user.type(screen.getByPlaceholderText('Tulis baris yang benar...'), 'const z = x * y;');
    await user.click(screen.getByText('Periksa'));

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText(/Line salah/)).toBeInTheDocument();
    expect(screen.getByText(/Hint 1: check the operator/)).toBeInTheDocument();
  });

  it('shows completed state with correct answer when isCompleted', () => {
    const step = createSBStep();
    render(
      <SpotBugStep
        step={step}
        onAnswer={vi.fn()}
        isCompleted={true}
      />
    );

    expect(screen.getByText('Sudah dijawab')).toBeInTheDocument();
    expect(screen.queryByText('Periksa')).not.toBeInTheDocument();
  });
});
