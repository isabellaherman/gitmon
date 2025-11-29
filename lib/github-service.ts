import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

export interface GitHubUserStats {
  username: string;
  name: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  createdAt: Date;
  totalCommits: number;
  totalPRs: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalIssues: number;
  languages: string[];
  recentActivity: GitHubActivity[];
  avgCommitsPerWeek: number;
}

export interface GitHubActivity {
  type:
    | 'commit'
    | 'pr_opened'
    | 'pr_merged'
    | 'star_received'
    | 'fork_received'
    | 'issue_created'
    | 'review';
  repo: string;
  date: Date;
  details: Record<string, unknown>;
}

export class GitHubService {
  private octokit: Octokit;
  private graphqlWithAuth: typeof graphql;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'GitMon/1.0',
    });

    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: accessToken ? `token ${accessToken}` : undefined,
      },
    });
  }

  async getUserStats(username: string): Promise<GitHubUserStats> {
    try {
      const contributionData = await this.getAccurateContributionData(username);

      const { data: user } = await this.octokit.rest.users.getByUsername({
        username,
      });

      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        sort: 'updated',
      });

      const totalRepos = user.public_repos;
      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

      const languages = new Set<string>();
      for (const repo of repos.slice(0, 20)) {
        if (repo.language) {
          languages.add(repo.language);
        }
      }

      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      const recentActivity = this.parseEvents(events);

      const totalCommits = contributionData.totalCommits;
      const totalPRs = contributionData.totalPRs;
      const totalIssues = contributionData.totalIssues;

      const avgCommitsPerWeek = this.calculateAvgCommitsPerWeek(events);

      return {
        username,
        name: user.name || username,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        twitterUsername: user.twitter_username || null,
        followers: user.followers,
        following: user.following,
        createdAt: new Date(user.created_at),
        totalCommits,
        totalPRs,
        totalStars,
        totalForks,
        totalRepos,
        totalIssues,
        languages: Array.from(languages),
        recentActivity,
        avgCommitsPerWeek,
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      throw new Error('Failed to fetch GitHub statistics');
    }
  }

  async getAccurateContributionData(username: string): Promise<{
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalReviews: number;
  }> {
    try {
      console.log(`[GitHub GraphQL] Getting accurate contribution data for ${username}`);

      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
            contributionsCollection2021: contributionsCollection(from: "2021-01-01T00:00:00Z", to: "2021-12-31T23:59:59Z") {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
            contributionsCollection2022: contributionsCollection(from: "2022-01-01T00:00:00Z", to: "2022-12-31T23:59:59Z") {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
            contributionsCollection2023: contributionsCollection(from: "2023-01-01T00:00:00Z", to: "2023-12-31T23:59:59Z") {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
            contributionsCollection2024: contributionsCollection(from: "2024-01-01T00:00:00Z", to: "2024-12-31T23:59:59Z") {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
          }
        }
      `;

      const response: Record<string, unknown> = await this.graphqlWithAuth(query, { username });
      const user = response.user;

      if (!user) {
        throw new Error(`User ${username} not found`);
      }

      const years = ['', '2021', '2022', '2023', '2024'];
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;
      let totalReviews = 0;

      years.forEach(year => {
        const key = year ? `contributionsCollection${year}` : 'contributionsCollection';
        const collection = (user as Record<string, unknown>)[key];
        if (collection && typeof collection === 'object') {
          const col = collection as Record<string, number>;
          totalCommits += col.totalCommitContributions || 0;
          totalPRs += col.totalPullRequestContributions || 0;
          totalIssues += col.totalIssueContributions || 0;
          totalReviews += col.totalPullRequestReviewContributions || 0;
        }
      });

      console.log(`[GitHub GraphQL] Found accurate data for ${username}:`);
      console.log(`  Total Commits: ${totalCommits}`);
      console.log(`  Total PRs: ${totalPRs}`);
      console.log(`  Total Issues: ${totalIssues}`);
      console.log(`  Total Reviews: ${totalReviews}`);

      return {
        totalCommits,
        totalPRs,
        totalIssues,
        totalReviews,
      };
    } catch (error) {
      console.error('Error fetching GraphQL contribution data:', error);

      console.log(`[GitHub GraphQL] Falling back to events-based estimation for ${username}`);
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      return {
        totalCommits: this.countCommitsFromEvents(events),
        totalPRs: this.countPRsFromEvents(events),
        totalIssues: this.countIssuesFromEvents(events),
        totalReviews: 0,
      };
    }
  }

  private parseEvents(events: Record<string, unknown>[]): GitHubActivity[] {
    const activities: GitHubActivity[] = [];

    for (const event of events) {
      const activity = this.parseEvent(event);
      if (activity) {
        activities.push(activity);
      }
    }

    return activities;
  }

  private parseEvent(event: Record<string, unknown>): GitHubActivity | null {
    const date = new Date(event.created_at as string);
    const repo = (event.repo as { name?: string })?.name || 'unknown';

    switch (event.type) {
      case 'PushEvent':
        return {
          type: 'commit',
          repo,
          date,
          details: {
            commits: (event.payload as { commits?: unknown[] })?.commits?.length || 1,
            size: (event.payload as { size?: number })?.size || 0,
          },
        };

      case 'PullRequestEvent':
        const action = (event.payload as { action?: string })?.action;
        if (action === 'opened') {
          return {
            type: 'pr_opened',
            repo,
            date,
            details: {
              title: (
                (event.payload as Record<string, unknown>)?.pull_request as { title?: string }
              )?.title,
              number: (
                (event.payload as Record<string, unknown>)?.pull_request as { number?: number }
              )?.number,
            },
          };
        } else if (
          action === 'closed' &&
          ((event.payload as Record<string, unknown>)?.pull_request as { merged?: boolean })?.merged
        ) {
          return {
            type: 'pr_merged',
            repo,
            date,
            details: {
              title: (
                (event.payload as Record<string, unknown>)?.pull_request as { title?: string }
              )?.title,
              number: (
                (event.payload as Record<string, unknown>)?.pull_request as { number?: number }
              )?.number,
            },
          };
        }
        break;

      case 'WatchEvent':
        return {
          type: 'star_received',
          repo,
          date,
          details: {
            action: (event.payload as Record<string, unknown>)?.action,
          },
        };

      case 'ForkEvent':
        return {
          type: 'fork_received',
          repo,
          date,
          details: {
            forkee: ((event.payload as Record<string, unknown>)?.forkee as { full_name?: string })
              ?.full_name,
          },
        };

      case 'IssuesEvent':
        if ((event.payload as Record<string, unknown>)?.action === 'opened') {
          return {
            type: 'issue_created',
            repo,
            date,
            details: {
              title: ((event.payload as Record<string, unknown>)?.issue as { title?: string })
                ?.title,
              number: ((event.payload as Record<string, unknown>)?.issue as { number?: number })
                ?.number,
            },
          };
        }
        break;

      case 'PullRequestReviewEvent':
        return {
          type: 'review',
          repo,
          date,
          details: {
            action: (event.payload as Record<string, unknown>)?.action,
            review_id: ((event.payload as Record<string, unknown>)?.review as { id?: number })?.id,
          },
        };
    }

    return null;
  }

  private countCommitsFromEvents(events: Record<string, unknown>[]): number {
    return events
      .filter(event => event.type === 'PushEvent')
      .reduce(
        (sum, event) => sum + ((event.payload as { commits?: unknown[] })?.commits?.length || 1),
        0,
      );
  }

  private countPRsFromEvents(events: Record<string, unknown>[]): number {
    return events.filter(
      event =>
        event.type === 'PullRequestEvent' &&
        (event.payload as Record<string, unknown>)?.action === 'opened',
    ).length;
  }

  private countIssuesFromEvents(events: Record<string, unknown>[]): number {
    return events.filter(
      event =>
        event.type === 'IssuesEvent' &&
        (event.payload as Record<string, unknown>)?.action === 'opened',
    ).length;
  }

  async getRepositoryInfo(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        isOwner: false,
      };
    } catch (error) {
      console.error('Error fetching repository info:', error);
      return null;
    }
  }

  private calculateAvgCommitsPerWeek(events: Record<string, unknown>[]): number {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    const recentCommitEvents = events.filter(event => {
      if (event.type !== 'PushEvent') return false;
      const eventDate = new Date(event.created_at as string);
      return eventDate >= twelveWeeksAgo;
    });

    const totalCommits = recentCommitEvents.reduce((sum, event) => {
      return sum + ((event.payload as { commits?: unknown[] })?.commits?.length || 1);
    }, 0);

    return Math.round((totalCommits / 12) * 10) / 10;
  }

  private getStartOfWeek(useLastSevenDays: boolean = false): Date {
    const now = new Date();

    if (useLastSevenDays) {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo;
    }

    const dayOfWeek = now.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  private getCalendarWeekRange(): { from: string; to: string } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=domingo, 1=segunda
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Segunda 00:00:00

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Domingo 23:59:59

    return {
      from: startOfWeek.toISOString(),
      to: endOfWeek.toISOString(),
    };
  }

  private filterCurrentWeekEvents(
    events: Record<string, unknown>[],
    useLastSevenDays: boolean = false,
  ): Record<string, unknown>[] {
    const startOfWeek = this.getStartOfWeek(useLastSevenDays);
    return events.filter(event => {
      const eventDate = new Date(event.created_at as string);
      return eventDate >= startOfWeek;
    });
  }

  async getWeeklyXp(username: string, useLastSevenDays: boolean = false): Promise<number> {
    try {
      console.log(`[GitHub Service] Getting weekly XP for ${username} using GraphQL`);

      // Use calendar week (Monday-Sunday) instead of 7 rolling days
      const { from: fromDate, to: toDate } = this.getCalendarWeekRange();

      const query = `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
          }
        }
      `;

      const response: Record<string, unknown> = await this.graphqlWithAuth(query, {
        username,
        from: fromDate,
        to: toDate,
      });

      const collection = (response.user as Record<string, unknown>)?.contributionsCollection;

      if (!collection) {
        throw new Error('No contribution data found');
      }

      const commits = Number((collection as Record<string, unknown>).totalCommitContributions) || 0;
      const prs =
        Number((collection as Record<string, unknown>).totalPullRequestContributions) || 0;
      const issues = Number((collection as Record<string, unknown>).totalIssueContributions) || 0;
      const reviews =
        Number((collection as Record<string, unknown>).totalPullRequestReviewContributions) || 0;

      const weeklyXp = commits * 5 + prs * 40 + issues * 10 + reviews * 15;

      console.log(`[GitHub Service] Weekly GraphQL data for ${username}:`);
      console.log(`  Commits: ${commits} × 5 = ${commits * 5} XP`);
      console.log(`  PRs: ${prs} × 40 = ${prs * 40} XP`);
      console.log(`  Issues: ${issues} × 10 = ${issues * 10} XP`);
      console.log(`  Reviews: ${reviews} × 15 = ${reviews * 15} XP`);
      console.log(`  TOTAL WEEKLY XP: ${weeklyXp}`);

      return weeklyXp;
    } catch (error) {
      console.error('Error calculating weekly XP with GraphQL:', error);
      console.log('Falling back to events-based calculation...');

      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      const weekEvents = this.filterCurrentWeekEvents(events, true);
      let weeklyXp = 0;

      for (const event of weekEvents) {
        if (event.type === 'PushEvent') {
          const commits = (event.payload as { commits?: unknown[] })?.commits?.length || 1;
          weeklyXp += Math.min(10, Math.max(2, Math.floor(commits * 2.5)));
        }
        if (event.type === 'PullRequestEvent') {
          const action = (event.payload as { action?: string })?.action;
          if (action === 'opened') weeklyXp += 15;
          if (
            action === 'closed' &&
            ((event.payload as Record<string, unknown>)?.pull_request as { merged?: boolean })
              ?.merged
          )
            weeklyXp += 25;
        }
        if (event.type === 'WatchEvent') weeklyXp += 10;
        if (event.type === 'ForkEvent') weeklyXp += 5;
        if (
          event.type === 'IssuesEvent' &&
          (event.payload as Record<string, unknown>)?.action === 'opened'
        )
          weeklyXp += 10;
        if (event.type === 'PullRequestReviewEvent') weeklyXp += 15;
      }

      console.log(`[GitHub Service] Fallback weekly XP: ${weeklyXp}`);
      return weeklyXp;
    }
  }

  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data.rate;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return null;
    }
  }

  async getPublicEventsForUser(username: string, perPage: number = 30) {
    try {
      const { data } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: perPage,
      });
      return data;
    } catch (error) {
      console.error(`Error getting events for ${username}:`, error);
      return [];
    }
  }

  async getCommitsViaSearch(
    username: string,
    daysBack: number = 7,
  ): Promise<
    Array<{
      sha: string;
      message: string;
      repoName: string;
      timestamp: Date;
      url: string;
    }>
  > {
    try {
      const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
      const sinceDateStr = sinceDate.toISOString().split('T')[0]; // YYYY-MM-DD

      console.log(`[GitHub Search] Looking for commits from ${username} since ${sinceDateStr}`);

      // Search for commits by this author in the specified time range
      const { data } = await this.octokit.rest.search.commits({
        q: `author:${username} committer-date:>${sinceDateStr}`,
        sort: 'committer-date',
        order: 'desc',
        per_page: 100,
      });

      console.log(`[GitHub Search] Found ${data.items.length} commits for ${username}`);

      return data.items.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0], // First line only
        repoName: commit.repository?.full_name || 'unknown',
        timestamp: new Date(commit.commit.committer?.date || commit.commit.author.date),
        url: commit.html_url,
      }));
    } catch (error) {
      console.error(`[GitHub Search] Error searching commits for ${username}:`, error);

      // If search fails, fall back to empty array
      return [];
    }
  }
}

export default GitHubService;
