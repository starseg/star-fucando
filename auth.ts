import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/infrastructure/db/prisma";
import { authConfig } from "@/auth.config";
import { UserRole, UserStatus } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      }

      const email = token.email?.toLowerCase();
      if (!email) return token;

      const adminEmails = (process.env.ADMIN_EMAILS || "starsegti@starseg.com")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const isAdminEmail = adminEmails.includes(email);

      if (isAdminEmail && ((token.role as UserRole) !== UserRole.ADMIN || (token.status as UserStatus) !== UserStatus.APPROVED)) {
        token.role = UserRole.ADMIN;
        token.status = UserStatus.APPROVED;

        try {
          await prisma.user.update({
            where: { email },
            data: {
              role: UserRole.ADMIN,
              status: UserStatus.APPROVED,
              approvedAt: new Date(),
            },
          });
        } catch (e) {
          console.error("Erro ao atualizar bootstrap de admin:", e);
        }
      }

      if ((token.status as UserStatus) !== UserStatus.APPROVED || !token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, status: true },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.status = dbUser.status;
          }
        } catch (e) {
          console.error("Erro ao sincronizar status do usuário no banco:", e);
        }
      }

      return token;
    },
  },
});
