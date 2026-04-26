'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepProps } from './types';
import { validateStepAnswer } from '@/lib/presentations/services/step-validator';

export function MultipleChoiceStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const options = (step.content.options as string[]) ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected || submitted) return;

    const result = validateStepAnswer(step, selected);
    setFeedback({ message: result.feedback, isCorrect: result.isCorrect });
    setSubmitted(true);

    if (result.isCorrect) {
      onAnswer(true);
    }
  };

  const handleSelect = (option: string) => {
    if (submitted || disabled || isCompleted) return;
    setSelected(option);
  };

  const correctAnswer = step.solution.correctAnswer as string;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-4">{step.instruction}</p>

        <div className="flex flex-col gap-3 mb-4">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrectOption = submitted && option === correctAnswer;
            const isWrongSelection = submitted && isSelected && !feedback?.isCorrect;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={submitted || disabled || isCompleted}
                className={[
                  'w-full text-left p-4 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] transition-all duration-150',
                  'shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]',
                  'hover:translate-x-[1px] hover:translate-y-[1px]',
                  isSelected && !submitted
                    ? 'bg-main text-main-foreground'
                    : 'bg-secondary-background text-foreground',
                  isCorrectOption ? 'bg-green-100 border-green-600 text-green-800' : '',
                  isWrongSelection ? 'bg-red-100 border-red-600 text-red-800' : '',
                  submitted || disabled || isCompleted ? 'cursor-default' : 'cursor-pointer',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {option}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-[var(--radius-common)] border-2 mb-4 ${
              feedback.isCorrect
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}
          >
            <p className="font-medium">{feedback.message}</p>
            {!feedback.isCorrect && step.hints.length > 0 && (
              <p className="text-sm mt-1 opacity-80">💡 {step.hints[0]}</p>
            )}
          </div>
        )}

        {!submitted && !isCompleted && (
          <Button onClick={handleSubmit} disabled={!selected || disabled}>
            Periksa Jawaban
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
