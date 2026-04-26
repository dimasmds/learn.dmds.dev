import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepProps } from '../types';

export function TheoryStep({ step, onAnswer, isCompleted }: StepProps) {
  const markdown = (step.content.markdown as string) ?? step.instruction;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none mb-6">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>

        {isCompleted ? (
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
            <span>Sudah dibaca</span>
          </div>
        ) : (
          <Button onClick={() => onAnswer(true)}>Lanjutkan</Button>
        )}
      </CardContent>
    </Card>
  );
}
