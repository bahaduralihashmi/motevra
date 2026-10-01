import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const normalizeEmail = (value: string | null | undefined) =>
  value?.trim().toLowerCase().replace(/^["']|["']$/g, "") ?? "";

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export async function getAdminUser() {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);

  if (!email) {
    console.warn("[MOTEVRA admin] denied: Auth.js session has no email");
    return null;
  }

  const allowedEmails = getAllowedAdminEmails();
  const emailAllowed = allowedEmails.includes(email);

  if (!emailAllowed) {
    console.warn("[MOTEVRA admin] denied: Auth.js email is not in ADMIN_EMAILS", {
      email,
      allowedEmails,
    });
    return null;
  }

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  console.info("[MOTEVRA admin] authorization check", {
    email,
    emailAllowed,
    databaseRole: user?.role ?? null,
    databaseUserFound: Boolean(user),
  });

  if (!user || user.role !== "ADMIN") {
    console.warn(
      "[MOTEVRA admin] denied: database user is missing or role is not ADMIN",
    );
    return null;
  }

  return user;
}
