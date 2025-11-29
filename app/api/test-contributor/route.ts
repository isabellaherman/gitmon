import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    // Get user data
    const user = await prisma.user.findFirst({
      where: { githubUsername: username },
      select: {
        githubUsername: true,
        isGitMonContributor: true,
      },
    });

    // Check GitHub API comprehensively
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitMon-Test',
    };

    const checks = {
      contributors: false,
      mergedPRs: false,
      commits: false,
    };

    // Check contributors
    const contributorsRes = await fetch(
      'https://api.github.com/repos/isabellaherman/gitmon/contributors',
      { headers },
    );
    if (contributorsRes.ok) {
      const contributors = await contributorsRes.json();
      checks.contributors = contributors.some(
        (c: { login: string }) => c.login.toLowerCase() === username.toLowerCase(),
      );
    }

    // Check merged PRs
    const prsRes = await fetch(
      'https://api.github.com/repos/isabellaherman/gitmon/pulls?state=closed&per_page=100',
      { headers },
    );
    if (prsRes.ok) {
      const prs = await prsRes.json();
      checks.mergedPRs = prs.some(
        (pr: { user: { login: string }; merged_at: string | null }) =>
          pr.user.login.toLowerCase() === username.toLowerCase() && pr.merged_at,
      );
    }

    // Check commits
    const commitsRes = await fetch(
      'https://api.github.com/repos/isabellaherman/gitmon/commits?per_page=100',
      { headers },
    );
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      checks.commits = commits.some(
        (commit: { author?: { login?: string } | null; committer?: { login?: string } | null }) =>
          commit.author?.login?.toLowerCase() === username.toLowerCase() ||
          commit.committer?.login?.toLowerCase() === username.toLowerCase(),
      );
    }

    const isContributor = checks.contributors || checks.mergedPRs || checks.commits;

    return NextResponse.json({
      username,
      userInDb: !!user,
      userContributorStatus: user?.isGitMonContributor || false,
      gitHubChecks: checks,
      isContributor,
      shouldGetBadge: isContributor,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
