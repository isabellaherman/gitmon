import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already joined this event
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { success: false, error: "Already joined this event" },
        { status: 400 }
      );
    }

    // Create event participation record
    const participation = await prisma.eventParticipant.create({
      data: {
        userId: user.id,
        eventId: eventId,
        githubUsername: user.githubUsername || user.email?.split('@')[0],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: participation.id,
        eventId: participation.eventId,
        joinedAt: participation.joinedAt,
      },
    });

  } catch (error) {
    console.error("Error joining event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}