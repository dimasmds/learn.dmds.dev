'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepProps } from './types';

function executeCode(code: string): { output: string; error: string | null } {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
  };
  try {
    const fn = new Function('console', code);
    fn(mockConsole);
    return { output: logs.join('\n'), error: null };
  } catch (err) {
    return {
      output: logs.join('\n'),
      error: err instanceof Error ? err.message : 'Error',
    };
  }
}

export function LiveCodeStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const initialCode = (step.content.initialCode as string) ?? '';
  const expectedOutput = ((step.solution.expectedOutput as string) ?? '').trim();

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);

  const handleRun = () => {
    const result = executeCode(code);
    setOutput(result.output);
    setError(result.error);
    setHasRun(true);
  };

  const handleSubmit = () => {
    if (!hasRun || isCompleted || disabled) return;

    const trimmedOutput = output.trim();
    if (trimmedOutput === expectedOutput) {
      setFeedback({ message: 'Output benar!', isCorrect: true });
      onAnswer(true);
    } else {
      setFeedback({ message: 'Output tidak sesuai. Coba lagi!', isCorrect: false });
    }
  };

  const isDone = isCompleted || (feedback?.isCorrect ?? false);

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-2">{step.instruction}</p>

        {/* Code editor */}
        <textarea
          className="w-full min-h-[160px] font-mono text-sm p-3 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background focus:outline-none focus:ring-2 focus:ring-[var(--color-border)] resize-y"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isDone || disabled}
          placeholder="Tulis kode di sini..."
          data-testid="code-editor"
        />

        {/* Run button */}
        <div className="flex gap-2 mt-3 mb-3">
          <Button
            onClick={handleRun}
            disabled={isDone || disabled}
            variant="outline"
          >
            Jalankan
          </Button>
          {!isDone && (
            <Button
              onClick={handleSubmit}
              disabled={!hasRun || disabled}
            >
              Periksa
            </Button>
          )}
        </div>

        {/* Output panel */}
        {hasRun && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Output:</p>
            <div className="bg-[#1e1e1e] text-green-400 font-mono text-sm p-3 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] whitespace-pre-wrap min-h-[40px]">
              {output || '(tidak ada output)'}
            </div>
            {error && (
              <div className="mt-2 p-2 rounded-[var(--radius-common)] bg-red-50 border-2 border-red-500 text-red-700 font-mono text-sm">
                Error: {error}
              </div>
            )}
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

        {/* Hints on wrong answer */}
        {feedback && !feedback.isCorrect && step.hints.length > 0 && (
          <div className="mt-3 space-y-1">
            {step.hints.map((hint, i) => (
              <p key={i} className="text-sm text-foreground/70">
                💡 {hint}
              </p>
            ))}
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
