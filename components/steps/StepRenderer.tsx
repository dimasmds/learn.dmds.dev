'use client';

import dynamic from 'next/dynamic';
import { StepData, StepProps } from './types';
import { TheoryStep } from './TheoryStep';
import { MultipleChoiceStep } from './MultipleChoiceStep';
import { FillBlankStep } from './FillBlankStep';
import { Card, CardContent } from '@/components/ui/card';

interface StepRendererProps {
  step: StepData;
  onAnswer: (isCorrect: boolean) => void;
  isCompleted: boolean;
  disabled?: boolean;
}

// Lazy-load heavy components (DnD, sandbox, iframe)
const ReorderStep = dynamic(() => import('./ReorderStep').then((m) => ({ default: m.ReorderStep })), { ssr: false });
const SpotBugStep = dynamic(() => import('./SpotBugStep').then((m) => ({ default: m.SpotBugStep })), { ssr: false });
const LiveCodeStep = dynamic(() => import('./LiveCodeStep').then((m) => ({ default: m.LiveCodeStep })), { ssr: false });
const LivePreviewStep = dynamic(() => import('./LivePreviewStep').then((m) => ({ default: m.LivePreviewStep })), { ssr: false });
const OutputPredictionStep = dynamic(() => import('./OutputPredictionStep').then((m) => ({ default: m.OutputPredictionStep })), { ssr: false });
const MatchingStep = dynamic(() => import('./MatchingStep').then((m) => ({ default: m.MatchingStep })), { ssr: false });

function ComingSoon({ type }: { type: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <p className="text-lg font-medium mb-2">🚧 Coming Soon</p>
          <p className="text-sm text-foreground/60">
            Step type &ldquo;{type}&rdquo; belum tersedia.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StepRenderer({ step, onAnswer, isCompleted, disabled }: StepRendererProps) {
  const stepProps: StepProps = { step, onAnswer, isCompleted, disabled };

  switch (step.type) {
    case 'theory':
      return <TheoryStep {...stepProps} />;
    case 'multiple-choice':
      return <MultipleChoiceStep {...stepProps} />;
    case 'fill-blank':
      return <FillBlankStep {...stepProps} />;
    case 'reorder':
      return ReorderStep ? <ReorderStep {...stepProps} /> : <ComingSoon type={step.type} />;
    case 'spot-bug':
      return SpotBugStep ? <SpotBugStep {...stepProps} /> : <ComingSoon type={step.type} />;
    case 'live-code':
      return LiveCodeStep ? <LiveCodeStep {...stepProps} /> : <ComingSoon type={step.type} />;
    case 'live-preview':
      return LivePreviewStep ? <LivePreviewStep {...stepProps} /> : <ComingSoon type={step.type} />;
    case 'output-prediction':
      return OutputPredictionStep ? <OutputPredictionStep {...stepProps} /> : <ComingSoon type={step.type} />;
    case 'matching':
      return MatchingStep ? <MatchingStep {...stepProps} /> : <ComingSoon type={step.type} />;
    default:
      return <ComingSoon type={step.type} />;
  }
}
