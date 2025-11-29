import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GITMON_REPO_OWNER = 'isabellaherman';
const GITMON_REPO_NAME = 'gitmon';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const githubUsername = searchParams.get('username');

    if (!githubUsername) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Check if user has contributions to the GitMon repository
    const hasContributions = await checkGitMonContributions(githubUsername);

    // Update user's contributor status if they have contributions
    if (hasContributions) {
      await prisma.user.updateMany({
        where: { githubUsername: githubUsername },
        data: { isGitMonContributor: true },
      });
    }

    return NextResponse.json({
      hasContributions,
      message: hasContributions ? 'Contributor status verified!' : 'No contributions found',
    });
  } catch (error) {
    console.error('Error checking contributions:', error);
    return NextResponse.json({ error: 'Failed to check contributions' }, { status: 500 });
  }
}

async function checkGitMonContributions(githubUsername: string): Promise<boolean> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN not configured - using public API with rate limits');
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitMon-Badge-System',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Check repository contributors
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${GITMON_REPO_OWNER}/${GITMON_REPO_NAME}/contributors`,
      { headers },
    );

    if (!contributorsResponse.ok) {
      console.error('Failed to fetch contributors:', contributorsResponse.status);
      return false;
    }

    const contributors = await contributorsResponse.json();

    // Check if the user is in the contributors list
    const isContributor = contributors.some(
      (contributor: { login: string }) =>
        contributor.login.toLowerCase() === githubUsername.toLowerCase(),
    );

    return isContributor;
  } catch (error) {
    console.error('Error checking GitHub contributions:', error);
    return false;
  }
}
