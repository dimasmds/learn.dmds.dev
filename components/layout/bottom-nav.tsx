"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/learn", label: "Belajar", emoji: "📚" },
  { href: "/profile", label: "Profil", emoji: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t-2 border-black bg-secondary-background md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-main text-main-foreground"
                : "text-foreground hover:bg-background"
            }`}
          >
            <span className="text-lg">{tab.emoji}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
