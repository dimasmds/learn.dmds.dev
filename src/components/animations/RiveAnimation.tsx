'use client';

import { useRive } from '@rive-app/react-webgl2';

interface RiveAnimationProps {
  src: string;
  stateMachines?: string;
  autoplay?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function RiveAnimation({
  src,
  stateMachines,
  autoplay = true,
  width = 120,
  height = 120,
  className = '',
}: RiveAnimationProps) {
  const { RiveComponent } = useRive({
    src,
    stateMachines,
    autoplay,
  });

  return (
    <div className={className} style={{ width, height }}>
      <RiveComponent />
    </div>
  );
}
