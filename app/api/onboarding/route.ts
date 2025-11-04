import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Onboarding - Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("Onboarding - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { selectedMonsterId } = await request.json();

    if (typeof selectedMonsterId !== "number" || selectedMonsterId < 0 || selectedMonsterId > 8) {
      return NextResponse.json({ error: "Invalid monster ID" }, { status: 400 });
    }

    // Update user's onboarding status and selected monster
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        selectedMonsterId,
        gitmonSelectedAt: new Date(),
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}