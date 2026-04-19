import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
      {/* Hero */}
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
        Belajar Coding{" "}
        <span className="text-main">dari Nol</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-foreground/70 md:mt-6 md:text-xl">
        Platform belajar pemrograman dalam Bahasa Indonesia. Mulai dari HTML,
        CSS, JavaScript, hingga teknologi web modern — gratis dan interaktif.
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row md:mt-10">
        <Link
          href="/dashboard"
          className="rounded-[var(--radius-common)] border-2 border-black bg-main px-8 py-3 text-lg font-bold text-main-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] active:translate-x-[var(--shadow-x)] active:translate-y-[var(--shadow-y)] active:shadow-none"
        >
          Mulai Belajar
        </Link>
        <Link
          href="/learn"
          className="rounded-[var(--radius-common)] border-2 border-black bg-secondary-background px-8 py-3 text-lg font-bold text-foreground shadow-[var(--shadow-x)_var(--shadow-y)_0_0_var(--color-shadow)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-shadow)] active:translate-x-[var(--shadow-x)] active:translate-y-[var(--shadow-y)] active:shadow-none"
        >
          Lihat Kursus
        </Link>
      </div>
    </div>
  );
}
