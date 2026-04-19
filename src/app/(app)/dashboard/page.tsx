import { LazyStreakFire, LazyXPStar } from '@/components/animations/LazyRive';

export default function DashboardPage() {
  const streak = 0;
  const level = 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-foreground/70">
        Selamat datang! Ini adalah halaman dashboard kamu.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Progress Card */}
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h2 className="text-lg font-semibold">Progress Belajar</h2>
          <div className="mt-3 flex items-center gap-3">
            <LazyXPStar level={level} size={50} />
            <div>
              <p className="text-3xl font-bold text-main">0%</p>
              <p className="text-sm text-foreground/60">Belum dimulai</p>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h2 className="text-lg font-semibold">Streak</h2>
          <div className="mt-3 flex items-center gap-3">
            <LazyStreakFire streak={streak} size={60} />
            <div>
              <p className="text-3xl font-bold text-main">{streak}</p>
              <p className="text-sm text-foreground/60">
                {streak === 0 ? 'Mulai belajar hari ini!' : `${streak} hari berturut-turut 🔥`}
              </p>
            </div>
          </div>
        </div>

        {/* Courses Card */}
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h2 className="text-lg font-semibold">Kursus Tersedia</h2>
          <p className="mt-1 text-3xl font-bold text-main">3</p>
          <p className="mt-1 text-sm text-foreground/60">HTML, CSS, JavaScript</p>
        </div>
      </div>
    </div>
  );
}
