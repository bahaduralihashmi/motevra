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

  if (!email) return null;

  const allowedEmails = getAllowedAdminEmails();
  if (!allowedEmails.includes(email)) {
    console.warn("[MOTEVRA admin] denied: email is not in ADMIN_EMAILS", { email });
    return null;
  }

  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    console.warn("[MOTEVRA admin] denied: database user is missing or not ADMIN");
    return null;
  }

  return user;
}
