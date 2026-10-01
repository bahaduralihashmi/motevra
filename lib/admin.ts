import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const normalizeEmail = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

const getConfiguredAdminEmails = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean),
  );

export async function getAdminUser() {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);

  if (!email) {
    console.warn("[MOTEVRA admin] denied: no authenticated session email");
    return null;
  }

  const configuredAdminEmails = getConfiguredAdminEmails();

  if (!configuredAdminEmails.has(email)) {
    console.warn(
      "[MOTEVRA admin] denied: authenticated email is not in ADMIN_EMAILS",
      { configuredAdminCount: configuredAdminEmails.size },
    );
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

  if (user.role !== "ADMIN") {
    console.warn("[MOTEVRA admin] denied: database role is not ADMIN", {
      role: user.role,
    });
    return null;
  }

  return user;
}
