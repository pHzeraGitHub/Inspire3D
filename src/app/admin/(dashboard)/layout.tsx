import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "@/features/admin/AdminShell";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
