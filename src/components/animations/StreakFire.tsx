'use client';

import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';
import { useEffect } from 'react';

interface StreakFireProps {
  streak: number;
  size?: number;
  className?: string;
}

export default function StreakFire({ streak, size = 80, className = '' }: StreakFireProps) {
  const { rive, RiveComponent } = useRive({
    src: '/animations/rocket.riv',
    autoplay: true,
  });

  // Try to control intensity if the state machine supports it
  const intensityInput = rive
    ? useStateMachineInput(rive, 'State Machine', 'intensity')
    : null;

  useEffect(() => {
    if (intensityInput && streak > 0) {
      // Scale intensity from 0-1 based on streak (max at 30)
      intensityInput.value = Math.min(streak / 30, 1);
    }
  }, [intensityInput, streak]);

  if (streak === 0) {
    return (
      <div
        className={`flex items-center justify-center text-4xl ${className}`}
        style={{ width: size, height: size }}
      >
        💨
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <RiveComponent />
    </div>
  );
}
