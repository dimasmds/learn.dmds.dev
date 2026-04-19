'use client';

import { useEffect, useState } from 'react';
import { LazyRiveAnimation } from '@/components/animations/LazyRive';

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Belajar</h1>
      <p className="mt-2 text-foreground/70">
        Pilih kursus yang ingin kamu pelajari.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* HTML */}
        <div className="group rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)]">
          <div className="flex items-start justify-between">
            <div className="text-4xl">🌐</div>
            {mounted && (
              <LazyRiveAnimation
                src="/animations/skills.riv"
                width={40}
                height={40}
              />
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold">HTML</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Dasar-dasar HTML untuk membangun struktur halaman web.
          </p>
          <div className="mt-4 rounded border-2 border-black bg-main px-3 py-1.5 text-center text-sm font-semibold text-main-foreground">
            Segera Hadir
          </div>
        </div>

        {/* CSS */}
        <div className="group rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)]">
          <div className="text-4xl">🎨</div>
          <h2 className="mt-3 text-xl font-bold">CSS</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Styling dan layout untuk membuat tampilan web yang menarik.
          </p>
          <div className="mt-4 rounded border-2 border-black bg-main px-3 py-1.5 text-center text-sm font-semibold text-main-foreground">
            Segera Hadir
          </div>
        </div>

        {/* JavaScript */}
        <div className="group rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)]">
          <div className="text-4xl">⚡</div>
          <h2 className="mt-3 text-xl font-bold">JavaScript</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Interaktivitas dan logika untuk membuat web yang dinamis.
          </p>
          <div className="mt-4 rounded border-2 border-black bg-main px-3 py-1.5 text-center text-sm font-semibold text-main-foreground">
            Segera Hadir
          </div>
        </div>
      </div>
    </div>
  );
}
