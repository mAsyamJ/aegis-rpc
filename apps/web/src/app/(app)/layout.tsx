import { cookies } from "next/headers";

import { AppStatusProvider } from "@/components/layout/AppStatusProvider";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AppStatusProvider>
      <DashboardShell defaultOpen={defaultOpen}>{children}</DashboardShell>
    </AppStatusProvider>
  );
}
