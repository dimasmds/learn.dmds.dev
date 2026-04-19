"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-black bg-secondary-background">
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground md:text-xl"
        >
          learn<span className="text-main">.dmds</span>.dev
        </Link>

        {/* Auth Button */}
        <button
          type="button"
          className="rounded-[var(--radius-common)] border-2 border-black bg-main px-4 py-1.5 text-sm font-semibold text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] active:translate-x-[var(--shadow-x)] active:translate-y-[var(--shadow-y)] active:shadow-none md:px-5 md:py-2 md:text-base"
        >
          Masuk
        </button>
      </div>
    </header>
  );
}
