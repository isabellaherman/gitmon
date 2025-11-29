import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface LinkData {
  title: string;
  url: string;
  order: number;
}

function validateLink(link: unknown): link is LinkData {
  if (link === null || typeof link !== 'object') return false;

  const obj = link as Record<string, unknown>;

  return (
    typeof obj.title === 'string' &&
    obj.title.length >= 3 &&
    obj.title.length <= 50 &&
    typeof obj.url === 'string' &&
    isValidUrl(obj.url) &&
    typeof obj.order === 'number' &&
    obj.order >= 1 &&
    obj.order <= 3
  );
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function validateLinksArray(links: unknown[]): links is LinkData[] {
  return Array.isArray(links) && links.length <= 3 && links.every(validateLink);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userLinks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      links: user.userLinks,
    });
  } catch (error) {
    console.error('Error fetching user links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!validateLinksArray(body)) {
      return NextResponse.json(
        { error: 'Invalid data format or validation failed' },
        { status: 400 },
      );
    }

    const validatedData = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for duplicate URLs within the new links
    const urls = validatedData.map(link => link.url);
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      return NextResponse.json({ error: 'Duplicate URLs are not allowed' }, { status: 400 });
    }

    // Delete existing links for this user
    await prisma.userLink.deleteMany({
      where: { userId: user.id },
    });

    // Create new links
    await prisma.userLink.createMany({
      data: validatedData.map(link => ({
        userId: user.id,
        title: link.title,
        url: link.url,
        order: link.order,
      })),
    });

    // Fetch the created links to return them
    const createdLinks = await prisma.userLink.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      links: createdLinks,
      message: 'Links updated successfully',
    });
  } catch (error) {
    console.error('Error updating user links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
