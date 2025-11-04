import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({
        logged_in: false,
        message: "No session found"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        accounts: {
          where: { provider: 'github' }
        }
      }
    });

    const githubAccount = user?.accounts.find(acc => acc.provider === 'github');

    return NextResponse.json({
      logged_in: true,
      session: {
        email: session.user?.email,
        name: session.user?.name
      },
      user: user ? {
        id: user.id,
        email: user.email,
        githubUsername: user.githubUsername,
        xp: user.xp,
        weeklyXp: user.weeklyXp,
        onboardingCompleted: user.onboardingCompleted,
        selectedMonsterId: user.selectedMonsterId
      } : null,
      github_account: githubAccount ? {
        provider: githubAccount.provider,
        providerAccountId: githubAccount.providerAccountId,
        has_access_token: !!githubAccount.access_token
      } : null
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: "Debug error", details: error }, { status: 500 });
  }
}