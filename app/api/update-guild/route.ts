import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { guilds } from "@/data/guilds";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Update Guild - Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("Update Guild - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await request.json();

    // Validate guild ID
    if (guildId && !guilds.find(guild => guild.id === guildId)) {
      return NextResponse.json({ error: "Invalid guild ID" }, { status: 400 });
    }

    // Update user's guild
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        guildId: guildId || null,
      },
    });

    console.log(`[Update Guild] User ${updatedUser.email} updated guild to: ${guildId || 'none'}`);

    return NextResponse.json({
      success: true,
      guildId: updatedUser.guildId,
    });

  } catch (error) {
    console.error("Update Guild error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}