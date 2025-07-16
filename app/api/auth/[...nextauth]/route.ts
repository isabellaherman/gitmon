import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
  async session({ session }) {
    return session
  }
},
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }