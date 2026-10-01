import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const normalizeEmail = (value: string | null | undefined) =>
  value?.trim().toLowerCase().replace(/^["']|["']$/g, "") ?? "";

export async function getAdminUser() {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);

  if (!email) {
    console.warn("[MOTEVRA admin] denied: no authenticated session email");
    return null;
  }

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user) {
    console.warn("[MOTEVRA admin] denied: no matching database user");
    return null;
  }

  // The database ADMIN role is the authoritative store-management permission.
  // This avoids locking the owner out because an environment allow-list is stale.
  if (user.role !== "ADMIN") {
    console.warn("[MOTEVRA admin] denied: database role is not ADMIN", {
      role: user.role,
    });
    return null;
  }

  return user;
}
