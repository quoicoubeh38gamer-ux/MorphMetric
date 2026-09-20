import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12">
        <DashboardNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
