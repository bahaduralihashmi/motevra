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

  const prisma = getPrisma();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, name: true, email: true },
  });

  // ADMIN_EMAILS is the explicit server-side allowlist. If the allowlisted
  // Google account already exists as a customer, promote that same account
  // instead of making the owner manually repair the role in Supabase.
  // If the Auth.js adapter did not create the row yet, create it as ADMIN.
  const user =
    existingUser?.role === "ADMIN"
      ? existingUser
      : await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: session.user?.name ?? email,
            image: session.user?.image ?? null,
            role: "ADMIN",
          },
          update: {
            role: "ADMIN",
          },
          select: { id: true, role: true, name: true, email: true },
        });

  console.info("[MOTEVRA admin] authorization check", {
    email,
    emailAllowed: true,
    databaseRole: user.role,
    databaseUserFound: Boolean(user),
  });

  if (user.role !== "ADMIN") {
    console.warn("[MOTEVRA admin] denied: database role is not ADMIN");
    return null;
  }

  return user;
}
