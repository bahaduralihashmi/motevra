import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { DEMO_USERS } from "@/lib/mock-data";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        if (!process.env.DATABASE_URL) {
          const user = DEMO_USERS.find(
            (candidate) =>
              candidate.email.toLowerCase() === email &&
              candidate.password === password,
          );

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        const user = await db.user.findUnique({ where: { email } });

        if (!user?.passwordHash || !user.isActive || !(await compare(password, user.passwordHash))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? null;
        session.user.role = token.role ?? "CUSTOMER";
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
