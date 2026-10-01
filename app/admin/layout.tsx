import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account?admin=denied");
  }

  return children;
}
