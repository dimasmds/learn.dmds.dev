'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/presentations/stores/auth-store';

const protectedRoutes = ['/dashboard', '/profile', '/learn'];
const authRoutes = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshAuth, isAuthenticated, user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    refreshAuth().finally(() => setInitialized(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized) return;

    const isProtected = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );
    const isAuthRoute = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );

    if (isProtected && !isAuthenticated) {
      router.replace('/login');
    } else if (isAuthRoute && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [initialized, isAuthenticated, pathname, router]);

  // Don't render protected content until auth state is known
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-foreground/60">Memuat...</div>
      </div>
    );
  }

  return <>{children}</>;
}
