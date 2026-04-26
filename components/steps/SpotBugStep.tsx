'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StepProps } from './types';
import { validateStepAnswer } from '@/lib/presentations/services/step-validator';

const MAX_ATTEMPTS = 3;

export function SpotBugStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const code = (step.content.code as string) ?? '';
  const language = (step.content.language as string) ?? 'js';
  const bugLine = (step.solution.bugLine as number) ?? 0;
  const correctFix = (step.solution.fix as string) ?? '';

  const codeLines = code.split('\n');

  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [fix, setFix] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);

  const handleLineClick = (lineNumber: number) => {
    if (isCompleted || disabled || feedback?.isCorrect) return;
    setSelectedLine(lineNumber);
  };

  const handleSubmit = () => {
    if (selectedLine === null || !fix.trim() || isCompleted || disabled) return;

    const result = validateStepAnswer(step, { line: selectedLine, fix });
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (result.isCorrect) {
      setFeedback({ message: result.feedback, isCorrect: true });
      onAnswer(true);
    } else {
      const newHintCount = Math.min(newAttempts, step.hints.length);
      setRevealedHints(newHintCount);

      if (newAttempts >= MAX_ATTEMPTS) {
        setFeedback({
          message: `Kesempatan habis. Bug di baris ${bugLine}, perbaikan: ${correctFix}`,
          isCorrect: false,
        });
        onAnswer(true);
      } else {
        setFeedback({
          message: `${result.feedback} ${MAX_ATTEMPTS - newAttempts} kesempatan tersisa.`,
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

  const isDone = isCompleted || (feedback?.isCorrect ?? false) || (attempts >= MAX_ATTEMPTS && feedback?.isCorrect === false);

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-2">{step.instruction}</p>
        <Badge variant="secondary" className="mb-4">
          {language.toUpperCase()}
        </Badge>

        {/* Code with line numbers */}
        <div className="bg-gray-100 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] p-4 mb-4 overflow-x-auto">
          {codeLines.map((line, index) => {
            const lineNumber = index + 1;
            const isBugLine = isDone && lineNumber === bugLine;
            const isSelected = selectedLine === lineNumber;

            return (
              <div
                key={index}
                onClick={() => handleLineClick(lineNumber)}
                className={[
                  'flex items-start gap-3 py-1 px-2 rounded transition-colors',
                  isBugLine
                    ? 'bg-red-100 border-l-4 border-red-500'
                    : '',
                  isSelected && !isBugLine
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : '',
                  !isDone && !disabled
                    ? 'cursor-pointer hover:bg-gray-200'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="text-xs text-foreground/40 select-none w-6 text-right shrink-0 leading-6">
                  {lineNumber}
                </span>
                <code className="text-sm font-mono whitespace-pre">{line}</code>
              </div>
            );
          })}
        </div>

        {isDone && !feedback?.isCorrect ? (
          /* Max attempts reached - show correct fix */
          <div className="p-3 rounded-[var(--radius-common)] border-2 bg-red-50 border-red-500 text-red-700">
            <p className="font-medium">{feedback?.message}</p>
          </div>
        ) : feedback?.isCorrect ? (
          /* Correct answer */
          <div className="p-3 rounded-[var(--radius-common)] border-2 bg-green-50 border-green-500 text-green-700">
            <p className="font-medium">{feedback.message}</p>
            <pre className="bg-white rounded p-2 mt-1 font-mono text-sm text-green-800">{correctFix}</pre>
          </div>
        ) : (
          <>
            {/* Line selection prompt */}
            <p className="text-sm text-foreground/60 mb-3">
              {selectedLine !== null
                ? `Baris terpilih: ${selectedLine}. Sekarang tulis perbaikannya:`
                : 'Klik pada baris yang memiliki bug:'}
            </p>

            {/* Fix input */}
            {selectedLine !== null && (
              <div className="flex gap-2 mb-4">
                <Input
                  value={fix}
                  onChange={(e) => setFix(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tulis baris yang benar..."
                  disabled={disabled}
                  className="flex-1"
                />
                <Button onClick={handleSubmit} disabled={!fix.trim() || disabled}>
                  Periksa
                </Button>
              </div>
            )}

            {/* Attempts indicator */}
            {attempts > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  Percobaan {attempts}/{MAX_ATTEMPTS}
                </Badge>
              </div>
            )}

            {/* Hints */}
            {revealedHints > 0 && (
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
          </>
        )}

        {/* Completed indicator for pre-completed state */}
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
