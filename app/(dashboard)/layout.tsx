import { ReactNode } from "react";
import { PageShell } from "@/components/page-shell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
