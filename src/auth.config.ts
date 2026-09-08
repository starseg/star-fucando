import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { UserRole, UserStatus } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "starseg.com")
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as UserRole;
        if (token.status) session.user.status = token.status as UserStatus;
      }
      return session;
    },
  },
};
