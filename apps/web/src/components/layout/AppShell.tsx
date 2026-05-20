import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopStatusBar } from "./TopStatusBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopStatusBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
