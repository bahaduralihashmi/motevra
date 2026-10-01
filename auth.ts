import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasGoogle = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...(hasDatabase ? { adapter: PrismaAdapter(getPrisma()) } : {}),
  // JWT sessions avoid refresh-time database-session failures. The database
  // remains authoritative for the user's current role.
  session: { strategy: "jwt" },
  providers: hasGoogle
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : [],
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.trim().toLowerCase();

      if (email) {
        try {
          const dbUser = await getPrisma().user.findUnique({
            where: { email },
            select: { id: true, role: true },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          // Keep a valid JWT during a transient database read failure.
          // Admin authorization performs its own authoritative DB check.
          console.error("[MOTEVRA auth] role lookup failed", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },

    authorized({ auth, request }) {
      const protectedPaths = ["/account", "/orders", "/admin"];
      const isProtected = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
      );

      // Authentication is enforced here. The admin role/email check is
      // intentionally performed server-side by getAdminUser(), so changing
      // a customer session or client-side state can never grant admin access.
      return !isProtected || Boolean(auth?.user);
    },
  },
}));
