import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
  adapter: PrismaAdapter(getPrisma()),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    authorized({ auth, request }) {
      const protectedPaths = ["/account", "/orders", "/admin"];
      const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));
      return !isProtected || Boolean(auth?.user);
    },
  },
}));
