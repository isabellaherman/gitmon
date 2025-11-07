import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count total users in the database
    const totalTrainers = await prisma.user.count();

    return NextResponse.json({
      success: true,
      count: totalTrainers,
    });

  } catch (error) {
    console.error("Error counting total trainers:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}