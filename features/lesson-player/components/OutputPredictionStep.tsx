import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StepProps } from '../types';
import { validateStepAnswer } from '@/lib/applications/services/StepValidator';

const MAX_ATTEMPTS = 3;

export function OutputPredictionStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const code = (step.content.code as string) ?? '';
  const expectedOutput = (step.solution.output as string) ?? '';

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
      const newHintCount = Math.min(newAttempts, step.hints.length);
      setRevealedHints(newHintCount);

      if (newAttempts >= MAX_ATTEMPTS) {
        setShowAnswer(true);
        setFeedback({
          message: `Kesempatan habis. Output yang benar: ${expectedOutput}`,
          isCorrect: false,
        });
        onAnswer(true);
      } else {
        setFeedback({
          message: `Prediksi salah. ${MAX_ATTEMPTS - newAttempts} kesempatan tersisa.`,
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

  // Pre-completed with no interaction yet
  const isPreCompleted = isCompleted && !feedback;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-4">{step.instruction}</p>

        {/* Code block */}
        <pre className="bg-gray-100 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] p-4 mb-4 overflow-x-auto">
          <code className="text-sm font-mono whitespace-pre">{code}</code>
        </pre>

        {isPreCompleted ? (
          /* Pre-completed state (passed isCompleted=true from outside) */
          <div className="p-3 rounded-[var(--radius-common)] border-2 bg-green-50 border-green-500 text-green-700">
            <p className="font-medium mb-1">Output yang benar:</p>
            <pre className="bg-white rounded p-2 font-mono text-sm">{expectedOutput}</pre>
          </div>
        ) : feedback?.isCorrect ? (
          /* Correct answer feedback */
          <div className="p-3 rounded-[var(--radius-common)] border-2 bg-green-50 border-green-500 text-green-700">
            <p className="font-medium">{feedback.message}</p>
            <pre className="bg-white rounded p-2 mt-1 font-mono text-sm text-green-800">{expectedOutput}</pre>
          </div>
        ) : showAnswer ? (
          /* Max attempts reached */
          <div className="p-3 rounded-[var(--radius-common)] border-2 bg-red-50 border-red-500 text-red-700">
            <p className="font-medium">{feedback?.message}</p>
          </div>
        ) : (
          <>
            {/* Input field */}
            <div className="flex gap-2 mb-4">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik output yang diprediksi..."
                disabled={isDone || disabled}
                className="flex-1"
              />
              <Button onClick={handleSubmit} disabled={!answer.trim() || disabled}>
                Periksa
              </Button>
            </div>

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
      </CardContent>
    </Card>
  );
}
