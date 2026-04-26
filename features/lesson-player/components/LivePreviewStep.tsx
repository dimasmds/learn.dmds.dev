import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepProps } from '../types';

export function LivePreviewStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const initialHtml = (step.content.initialHtml as string) ?? '';
  const initialCss = (step.content.initialCss as string) ?? '';
  const expectedHtml = ((step.solution.expectedHtml as string) ?? '').trim();

  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [previewHtml, setPreviewHtml] = useState('');
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePreview = useCallback((h: string, c: string) => {
    const preview = `<html><head><style>${c}</style></head><body>${h}</body></html>`;
    setPreviewHtml(preview);
  }, []);

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updatePreview(html, css);
    }, 500);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [html, css, updatePreview]);

  // Initial preview
  useEffect(() => {
    updatePreview(initialHtml, initialCss);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (isCompleted || disabled) return;

    const trimmedHtml = html.trim();
    if (trimmedHtml === expectedHtml) {
      setFeedback({ message: 'HTML benar!', isCorrect: true });
      onAnswer(true);
    } else {
      setFeedback({ message: 'HTML tidak sesuai. Coba lagi!', isCorrect: false });
    }
  };

  const isDone = isCompleted || (feedback?.isCorrect ?? false);

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-2">{step.instruction}</p>

        {/* Split view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Left: Code editor */}
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex border-b-2 border-[var(--color-border)] mb-2">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'html'
                    ? 'border-b-2 border-foreground text-foreground'
                    : 'text-foreground/50 hover:text-foreground/70'
                }`}
                onClick={() => setActiveTab('html')}
                data-testid="tab-html"
              >
                HTML
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'css'
                    ? 'border-b-2 border-foreground text-foreground'
                    : 'text-foreground/50 hover:text-foreground/70'
                }`}
                onClick={() => setActiveTab('css')}
                data-testid="tab-css"
              >
                CSS
              </button>
            </div>

            {/* HTML editor */}
            {activeTab === 'html' && (
              <textarea
                className="w-full min-h-[200px] font-mono text-sm p-3 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background focus:outline-none focus:ring-2 focus:ring-[var(--color-border)] resize-y"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                disabled={isDone || disabled}
                placeholder="Tulis HTML di sini..."
                data-testid="html-editor"
              />
            )}

            {/* CSS editor */}
            {activeTab === 'css' && (
              <textarea
                className="w-full min-h-[200px] font-mono text-sm p-3 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background focus:outline-none focus:ring-2 focus:ring-[var(--color-border)] resize-y"
                value={css}
                onChange={(e) => setCss(e.target.value)}
                disabled={isDone || disabled}
                placeholder="Tulis CSS di sini..."
                data-testid="css-editor"
              />
            )}
          </div>

          {/* Right: Live preview */}
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <iframe
              sandbox="allow-scripts"
              srcDoc={previewHtml}
              className="w-full min-h-[240px] rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-white"
              title="Live Preview"
              data-testid="preview-iframe"
            />
          </div>
        </div>

        {/* Submit button */}
        {!isDone && (
          <div className="mb-3">
            <Button onClick={handleSubmit} disabled={disabled}>
              Periksa
            </Button>
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
