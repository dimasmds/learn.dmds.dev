// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReorderStep } from '../ReorderStep';
import type { StepData } from '../types';

function createReorderStep(overrides?: Partial<StepData>): StepData {
  return {
    id: 'step-1',
    type: 'reorder',
    order: 1,
    instruction: 'Urutkan langkah-langkah berikut:',
    content: {
      items: ['Langkah C', 'Langkah A', 'Langkah B'],
    },
    solution: {
      correctOrder: ['Langkah A', 'Langkah B', 'Langkah C'],
    },
    hints: ['Perhatikan urutan dari awal hingga akhir'],
    xpReward: 10,
    ...overrides,
  };
}

describe('ReorderStep', () => {
  it('renders all items from step.content.items', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    expect(screen.getByText('Langkah A')).toBeInTheDocument();
    expect(screen.getByText('Langkah B')).toBeInTheDocument();
    expect(screen.getByText('Langkah C')).toBeInTheDocument();
  });

  it('renders the instruction text', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    expect(screen.getByText('Urutkan langkah-langkah berikut:')).toBeInTheDocument();
  });

  it('calls onAnswer(true) when submitted with correct order', () => {
    // Create step where items are already in correct order
    const step = createReorderStep({
      content: {
        items: ['Langkah A', 'Langkah B', 'Langkah C'],
      },
    });
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    const submitButton = screen.getByRole('button', { name: /periksa jawaban/i });
    fireEvent.click(submitButton);

    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(screen.getByText('Urutan benar!')).toBeInTheDocument();
  });

  it('shows feedback when submitted with wrong order', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    const submitButton = screen.getByRole('button', { name: /periksa jawaban/i });
    fireEvent.click(submitButton);

    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByText('Urutan salah. Coba lagi!')).toBeInTheDocument();
  });

  it('shows hint on wrong answer', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    const submitButton = screen.getByRole('button', { name: /periksa jawaban/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Perhatikan urutan dari awal hingga akhir/)).toBeInTheDocument();
  });

  it('shows attempt counter on wrong answer', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    const submitButton = screen.getByRole('button', { name: /periksa jawaban/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Percobaan 1/3')).toBeInTheDocument();
  });

  it('does not render submit button when completed', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={true} />);

    expect(screen.queryByRole('button', { name: /periksa jawaban/i })).not.toBeInTheDocument();
  });

  it('renders drag handles for each item', () => {
    const step = createReorderStep();
    const onAnswer = vi.fn();

    render(<ReorderStep step={step} onAnswer={onAnswer} isCompleted={false} />);

    const dragHandles = screen.getAllByText('⠿');
    expect(dragHandles).toHaveLength(3);
  });
});
