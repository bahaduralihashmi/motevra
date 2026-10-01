import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import { AdminShell } from "@/components/admin-shell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/signin?callbackUrl=%2Fadmin");
  }

  return <AdminShell>{children}</AdminShell>;
}
