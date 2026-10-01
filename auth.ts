import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...(hasDatabase ? { adapter: PrismaAdapter(getPrisma()) } : {}),
  // Use JWT sessions for the storefront. Database sessions were causing
  // refresh-time Auth.js Configuration errors when the Supabase connection
  // was unavailable/intermittent. User/role data remains authoritative in Prisma.
  session: { strategy: "jwt" },
  providers: hasGoogle
    ? [Google({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! })]
    : [],
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await getPrisma().user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
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
      return !isProtected || Boolean(auth?.user);
    },
  },
}));
