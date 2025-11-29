import { prisma } from '@/lib/prisma';

const GITMON_REPO_OWNER = 'isabellaherman';
const GITMON_REPO_NAME = 'gitmon';

export async function checkAndUpdateContributorStatus(githubUsername: string) {
  try {
    // Skip if we've already verified this user recently
    const user = await prisma.user.findFirst({
      where: { githubUsername },
      select: {
        isGitMonContributor: true,
        lastXpUpdate: true, // Using this as a proxy for last check
      },
    });

    if (!user) return false;

    // If already marked as contributor, no need to check again
    if (user.isGitMonContributor) return true;

    // Check GitHub API for contributions
    const hasContributions = await checkGitMonContributions(githubUsername);

    // Update user status if they are a contributor
    if (hasContributions) {
      await prisma.user.updateMany({
        where: { githubUsername },
        data: { isGitMonContributor: true },
      });
      console.log(`Updated contributor status for ${githubUsername}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking contributor status:', error);
    return false;
  }
}

async function checkGitMonContributions(githubUsername: string): Promise<boolean> {
  try {
    const token = process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitMon-Badge-System',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    // Check 1: Repository contributors
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${GITMON_REPO_OWNER}/${GITMON_REPO_NAME}/contributors`,
      { headers },
    );

    if (contributorsResponse.ok) {
      const contributors = await contributorsResponse.json();
      const isInContributors = contributors.some(
        (contributor: { login: string }) =>
          contributor.login.toLowerCase() === githubUsername.toLowerCase(),
      );
      if (isInContributors) {
        console.log(`${githubUsername} found in contributors list`);
        return true;
      }
    }

    // Check 2: Merged pull requests (more comprehensive)
    const prsResponse = await fetch(
      `https://api.github.com/repos/${GITMON_REPO_OWNER}/${GITMON_REPO_NAME}/pulls?state=closed&per_page=100`,
      { headers },
    );

    if (prsResponse.ok) {
      const pullRequests = await prsResponse.json();
      const hasMergedPR = pullRequests.some(
        (pr: { user: { login: string }; merged_at: string | null }) =>
          pr.user.login.toLowerCase() === githubUsername.toLowerCase() && pr.merged_at,
      );
      if (hasMergedPR) {
        console.log(`${githubUsername} found in merged PRs`);
        return true;
      }
    }

    // Check 3: Recent commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${GITMON_REPO_OWNER}/${GITMON_REPO_NAME}/commits?per_page=100`,
      { headers },
    );

    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      const hasCommits = commits.some(
        (commit: { author?: { login?: string } | null; committer?: { login?: string } | null }) =>
          commit.author?.login?.toLowerCase() === githubUsername.toLowerCase() ||
          commit.committer?.login?.toLowerCase() === githubUsername.toLowerCase(),
      );
      if (hasCommits) {
        console.log(`${githubUsername} found in commits`);
        return true;
      }
    }

    console.log(`${githubUsername} not found in any contribution checks`);
    return false;
  } catch (error) {
    console.error('Error checking GitHub contributions:', error);
    return false;
  }
}
