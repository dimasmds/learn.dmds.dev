'use client';

import { useAuthStore } from '@/lib/presentations/stores/auth-store';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Profil</h1>
      <p className="mt-2 text-foreground/70">
        Informasi akun kamu.
      </p>

      <div className="mt-8 rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-6 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-background text-2xl">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.displayName || user.username}</h2>
                <p className="text-sm text-foreground/60">
                  @{user.username}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground/50">Email</p>
                <p className="text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/50">Username</p>
                <p className="text-foreground">@{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/50">Nama Tampilan</p>
                <p className="text-foreground">{user.displayName || 'Belum diatur'}</p>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
