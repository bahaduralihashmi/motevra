import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const getConfiguredAdminEmails = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );

export async function getAdminUser() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;
  if (!getConfiguredAdminEmails().has(email)) return null;

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}
