'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepProps } from './types';
import { validateStepAnswer } from '@/lib/presentations/services/step-validator';

const MAX_ATTEMPTS = 2;

export function MatchingStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const leftItems = (step.content.leftItems as string[]) ?? [];
  const rightItems = (step.content.rightItems as string[]) ?? [];

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [wrongPairs, setWrongPairs] = useState<Set<string>>(new Set());
  const [revealedHints, setRevealedHints] = useState(0);

  const handleSelect = (leftItem: string, rightItem: string) => {
    if (isCompleted || disabled || feedback?.isCorrect) return;
    setMatches((prev) => ({ ...prev, [leftItem]: rightItem }));
    // Clear wrong pair highlight for this item
    setWrongPairs((prev) => {
      const next = new Set(prev);
      next.delete(leftItem);
      return next;
    });
  };

  const handleSubmit = () => {
    if (Object.keys(matches).length < leftItems.length || isCompleted || disabled) return;

    const result = validateStepAnswer(step, matches);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (result.isCorrect) {
      setFeedback({ message: result.feedback, isCorrect: true });
      onAnswer(true);
    } else {
      // Highlight wrong pairs
      const expectedPairs = step.solution.pairs as Record<string, string>;
      const wrong = new Set<string>();
      for (const key of Object.keys(expectedPairs)) {
        if (matches[key] !== expectedPairs[key]) {
          wrong.add(key);
        }
      }
      setWrongPairs(wrong);

      const newHintCount = Math.min(newAttempts, step.hints.length);
      setRevealedHints(newHintCount);

      if (newAttempts >= MAX_ATTEMPTS) {
        setFeedback({
          message: 'Kesempatan habis. Pasangan yang benar telah ditampilkan.',
          isCorrect: false,
        });
        // Set correct pairs
        setMatches(expectedPairs);
        onAnswer(true);
      } else {
        setFeedback({
          message: `Ada pasangan yang salah. ${MAX_ATTEMPTS - newAttempts} kesempatan tersisa.`,
          isCorrect: false,
        });
      }
    }
  };

  const isDone = isCompleted || (feedback?.isCorrect ?? false) || (attempts >= MAX_ATTEMPTS && feedback?.isCorrect === false);
  const isMaxAttemptsReached = attempts >= MAX_ATTEMPTS && feedback?.isCorrect === false;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-4">{step.instruction}</p>

        {/* Matching columns */}
        <div className="space-y-3 mb-4">
          {leftItems.map((leftItem) => {
            const isWrong = wrongPairs.has(leftItem);
            const selectedValue = matches[leftItem] ?? '';

            return (
              <div
                key={leftItem}
                className={[
                  'flex items-center gap-4 p-3 rounded-[var(--radius-common)] border-2 transition-colors',
                  isWrong
                    ? 'bg-red-50 border-red-500'
                    : isDone && selectedValue
                      ? 'bg-green-50 border-green-500'
                      : 'border-[var(--color-border)] bg-secondary-background',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Left item */}
                <span className="font-medium min-w-[120px]">{leftItem}</span>

                {/* Arrow */}
                <span className="text-foreground/40">→</span>

                {/* Right item dropdown */}
                <select
                  value={selectedValue}
                  onChange={(e) => handleSelect(leftItem, e.target.value)}
                  disabled={isDone || disabled}
                  className={[
                    'flex-1 h-10 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-white px-3 py-2 text-sm',
                    'shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]',
                    'focus:outline-none transition-all duration-150',
                    isDone || disabled ? 'cursor-default opacity-70' : 'cursor-pointer',
                  ]
                      .filter(Boolean)
                      .join(' ')}
                >
                  <option value="">Pilih...</option>
                  {rightItems.map((rightItem) => (
                    <option key={rightItem} value={rightItem}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {!isDone && (
          <>
            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(matches).length < leftItems.length || disabled}
              className="mb-4"
            >
              Periksa Pasangan
            </Button>

            {/* Attempts indicator */}
            {attempts > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  Percobaan {attempts}/{MAX_ATTEMPTS}
                </Badge>
              </div>
            )}
          </>
        )}

        {/* Hints */}
        {revealedHints > 0 && !isDone && (
          <div className="mb-3 space-y-1">
            {step.hints.slice(0, revealedHints).map((hint, i) => (
              <p key={i} className="text-sm text-foreground/70">
                💡 {hint}
              </p>
            ))}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-[var(--radius-common)] border-2 ${
              feedback.isCorrect
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}
          >
            <p className="font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Completed indicator */}
        {isCompleted && !feedback && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Sudah dijawab</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
