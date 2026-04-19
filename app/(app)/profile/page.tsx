export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Profil</h1>
      <p className="mt-2 text-foreground/70">
        Halaman profil pengguna.
      </p>

      <div className="mt-8 rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-background text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold">Belum Login</h2>
            <p className="text-sm text-foreground/60">
              Masuk untuk melihat profil kamu.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="rounded-[var(--radius-common)] border-2 border-black bg-main px-6 py-2 font-semibold text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] active:translate-x-[var(--shadow-x)] active:translate-y-[var(--shadow-y)] active:shadow-none"
          >
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
