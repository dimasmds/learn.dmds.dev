'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/presentations/stores/auth-store';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background p-8 shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]">
          <h1 className="text-3xl font-bold">Masuk</h1>
          <p className="mt-2 text-foreground/60">
            Lanjutkan perjalanan belajarmu!
          </p>

          {error && (
            <div className="mt-4 rounded border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="mt-1 w-full rounded-[var(--radius-common)] border-2 border-black bg-background px-4 py-2.5 text-sm shadow-[2px_2px_0_0_var(--color-shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0_0_var(--color-shadow)] focus:outline-none"
                placeholder="Password kamu"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[var(--radius-common)] border-2 border-black bg-main px-4 py-2.5 text-sm font-bold text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-main underline">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
