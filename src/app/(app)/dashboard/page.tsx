export default function DashboardPage() {
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
          <p className="mt-1 text-3xl font-bold text-main">0%</p>
          <p className="mt-1 text-sm text-foreground/60">Belum dimulai</p>
        </div>

        {/* Streak Card */}
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h2 className="text-lg font-semibold">Streak</h2>
          <p className="mt-1 text-3xl font-bold text-main">0 🔥</p>
          <p className="mt-1 text-sm text-foreground/60">Mulai belajar hari ini!</p>
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
