import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function getAdminUser() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  const isConfiguredAdmin = configured.includes(email);

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user && !isConfiguredAdmin) return null;
  if (isConfiguredAdmin) return { id: user?.id ?? null, role: "ADMIN" as const, name: user?.name ?? null, email };
  if (user?.role !== "ADMIN" && user?.role !== "STAFF") return null;
  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("ADMIN_FORBIDDEN");
  return user;
}
