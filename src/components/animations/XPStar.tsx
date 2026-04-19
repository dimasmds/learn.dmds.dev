'use client';

import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';
import { useEffect } from 'react';

interface XPStarProps {
  level: number;
  size?: number;
  className?: string;
}

export default function XPStar({ level, size = 60, className = '' }: XPStarProps) {
  const { rive, RiveComponent } = useRive({
    src: '/animations/rating.riv',
    autoplay: true,
  });

  const ratingInput = rive
    ? useStateMachineInput(rive, 'State Machine', 'rating')
    : null;

  useEffect(() => {
    if (ratingInput && level > 0) {
      // Scale from 0-5 based on level
      ratingInput.value = Math.min(level, 5);
    }
  }, [ratingInput, level]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <RiveComponent />
    </div>
  );
}
