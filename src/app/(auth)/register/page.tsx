'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(username, email, password, confirmPassword);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-8 shadow-[var(--radius-common)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h1 className="text-3xl font-bold">Daftar</h1>
          <p className="mt-2 text-foreground/60">
            Mulai perjalanan belajar coding-mu! 100% gratis.
          </p>

          {error && (
            <div className="mt-4 rounded border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z][a-zA-Z0-9_-]*"
                className="mt-1 w-full rounded-[var(--radius-common)] border-2 border-black bg-background px-4 py-2.5 text-sm shadow-[2px_2px_0_0_var(--color-shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_0_var(--color-shadow)] focus:outline-none"
                placeholder="namakamu"
              />
              <p className="mt-1 text-xs text-foreground/50">
                3-20 karakter, huruf, angka, _ dan -
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-[var(--radius-common)] border-2 border-black bg-background px-4 py-2.5 text-sm shadow-[2px_2px_0_0_var(--color-shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_0_var(--color-shadow)] focus:outline-none"
                placeholder="kamu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 w-full rounded-[var(--radius-common)] border-2 border-black bg-background px-4 py-2.5 text-sm shadow-[2px_2px_0_0_var(--color-shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_0_var(--color-shadow)] focus:outline-none"
                placeholder="Min. 8 karakter"
              />
              <p className="mt-1 text-xs text-foreground/50">
                Min. 8 karakter, ada huruf besar, huruf kecil, dan angka
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-[var(--radius-common)] border-2 border-black bg-background px-4 py-2.5 text-sm shadow-[2px_2px_0_0_var(--color-shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_0_var(--color-shadow)] focus:outline-none"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[var(--radius-common)] border-2 border-black bg-main px-4 py-2.5 text-sm font-bold text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Daftar Gratis'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-main underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
