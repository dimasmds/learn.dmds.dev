'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StepProps } from './types';
import { validateStepAnswer } from '@/lib/presentations/services/step-validator';

const MAX_ATTEMPTS = 3;

export function FillBlankStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const [answer, setAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);

  const handleSubmit = () => {
    if (!answer.trim() || isCompleted || disabled) return;

    const result = validateStepAnswer(step, answer);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (result.isCorrect) {
      setFeedback({ message: result.feedback, isCorrect: true });
      onAnswer(true);
    } else {
      // Reveal hints progressively
      const newHintCount = Math.min(newAttempts, step.hints.length);
      setRevealedHints(newHintCount);

      if (newAttempts >= MAX_ATTEMPTS) {
        const correctAnswer = step.solution.answer as string;
        setShowAnswer(true);
        setFeedback({
          message: `Kesempatan habis. Jawaban yang benar: ${correctAnswer}`,
          isCorrect: false,
        });
        onAnswer(true); // Mark as completed even though wrong
      } else {
        setFeedback({
          message: `Jawaban salah. ${MAX_ATTEMPTS - newAttempts} kesempatan tersisa.`,
          isCorrect: false,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isDone = isCompleted || showAnswer || (feedback?.isCorrect ?? false);

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-2">{step.instruction}</p>

        {/* Blank indicator */}
        <div className="inline-block bg-secondary-background border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-common)] px-4 py-2 mb-4 font-mono">
          ___
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik jawaban..."
            disabled={isDone || disabled}
            className="flex-1"
          />
          {!isDone && (
            <Button onClick={handleSubmit} disabled={!answer.trim() || disabled}>
              Periksa
            </Button>
          )}
        </div>

        {/* Attempts indicator */}
        {!isDone && attempts > 0 && (
          <p className="text-sm text-foreground/60 mb-2">
            Percobaan {attempts}/{MAX_ATTEMPTS}
          </p>
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
