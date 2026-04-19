import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pb-20 md:ml-60 md:pb-0">
          <div className="mx-auto max-w-5xl p-4 md:p-8">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
