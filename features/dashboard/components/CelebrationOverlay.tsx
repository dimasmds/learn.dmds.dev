'use client';

import { useEffect } from 'react';

interface CelebrationOverlayProps {
  active: boolean;
  xpAmount: number;
  badgeName?: string;
  onDone: () => void;
}

export function CelebrationOverlay({
  active,
  xpAmount,
  badgeName,
  onDone,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Confetti particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti-particle absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              backgroundColor: [
                '#FFD700',
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96E6A1',
                '#DDA0DD',
              ][i % 6],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1.5 + Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Celebration content */}
      <div className="relative z-10 animate-scale-in rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-8 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
        <div className="text-center">
          <p className="text-4xl font-bold text-main">+{xpAmount} XP!</p>
          {badgeName && (
            <p className="mt-2 text-lg font-semibold">{badgeName}</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .confetti-particle {
          animation: confetti-fall linear forwards;
          border-radius: 2px;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
