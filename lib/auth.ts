import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // @ts-expect-error - Adding custom properties to session
        session.user.id = user.id;
        // @ts-expect-error - Adding custom properties to session
        session.user.onboardingCompleted = user.onboardingCompleted;
        // @ts-expect-error - Adding custom properties to session
        session.user.selectedMonsterId = user.selectedMonsterId;
        // @ts-expect-error - Adding custom properties to session
        session.user.gitmonSelectedAt = user.gitmonSelectedAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
};