"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learn", label: "Belajar", icon: BookOpen },
  { href: "/profile", label: "Profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-60 flex-col border-r-2 border-black bg-secondary-background md:flex md:top-16 md:h-[calc(100vh-4rem)]">
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[var(--radius-common)] border-2 border-black px-4 py-3 text-sm font-semibold transition-transform ${
                isActive
                  ? "bg-main text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)]"
                  : "bg-secondary-background text-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)]"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
