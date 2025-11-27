import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the link belongs to the current user
    const link = await prisma.userLink.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the link
    await prisma.userLink.delete({
      where: { id: id }
    });

    // Reorder remaining links to fill gaps
    const remainingLinks = await prisma.userLink.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' }
    });

    // Update order numbers to be consecutive starting from 1
    for (let i = 0; i < remainingLinks.length; i++) {
      await prisma.userLink.update({
        where: { id: remainingLinks[i].id },
        data: { order: i + 1 }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Link deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}