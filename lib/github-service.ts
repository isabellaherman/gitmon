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
  type: 'commit' | 'pr_opened' | 'pr_merged' | 'star_received' | 'fork_received' | 'issue_created' | 'review';
  repo: string;
  date: Date;
  details: Record<string, any>;
}

export class GitHubService {
  private octokit: Octokit;
  private graphqlWithAuth: any;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'GitMon/1.0'
    });

    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: accessToken ? `token ${accessToken}` : undefined,
      },
    });
  }

  async getUserStats(username: string): Promise<GitHubUserStats> {
    try {
      // Get comprehensive data using GraphQL
      const contributionData = await this.getAccurateContributionData(username);

      // Get user basic info (still using REST for profile data)
      const { data: user } = await this.octokit.rest.users.getByUsername({
        username
      });

      // Get user's repositories
      const { data: repos } = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        sort: 'updated'
      });

      // Calculate stats
      const totalRepos = user.public_repos;
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

      // Get languages (from repos)
      const languages = new Set<string>();
      for (const repo of repos.slice(0, 20)) { // Limit to avoid rate limits
        if (repo.language) {
          languages.add(repo.language);
        }
      }

      // Get recent activity (events) for recent activity feed
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      const recentActivity = this.parseEvents(events);

      // Use accurate contribution data from GraphQL
      const totalCommits = contributionData.totalCommits;
      const totalPRs = contributionData.totalPRs;
      const totalIssues = contributionData.totalIssues;

      // Calculate average commits per week (last 12 weeks from events)
      const avgCommitsPerWeek = this.calculateAvgCommitsPerWeek(events);

      return {
        username,
        name: user.name || username,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
        twitterUsername: user.twitter_username,
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
        avgCommitsPerWeek
      };

    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      throw new Error('Failed to fetch GitHub statistics');
    }
  }

  // Get accurate contribution data using GraphQL
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
            # Get contributions from all years
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

      const response: any = await this.graphqlWithAuth(query, { username });
      const user = response.user;

      if (!user) {
        throw new Error(`User ${username} not found`);
      }

      // Sum up contributions from all available years
      const years = ['', '2021', '2022', '2023', '2024'];
      let totalCommits = 0;
      let totalPRs = 0;
      let totalIssues = 0;
      let totalReviews = 0;

      years.forEach(year => {
        const key = year ? `contributionsCollection${year}` : 'contributionsCollection';
        const collection = user[key];
        if (collection) {
          totalCommits += collection.totalCommitContributions || 0;
          totalPRs += collection.totalPullRequestContributions || 0;
          totalIssues += collection.totalIssueContributions || 0;
          totalReviews += collection.totalPullRequestReviewContributions || 0;
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
        totalReviews
      };

    } catch (error) {
      console.error('Error fetching GraphQL contribution data:', error);

      // Fallback to old method if GraphQL fails
      console.log(`[GitHub GraphQL] Falling back to events-based estimation for ${username}`);
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      return {
        totalCommits: this.countCommitsFromEvents(events),
        totalPRs: this.countPRsFromEvents(events),
        totalIssues: this.countIssuesFromEvents(events),
        totalReviews: 0
      };
    }
  }

  private parseEvents(events: any[]): GitHubActivity[] {
    const activities: GitHubActivity[] = [];

    for (const event of events) {
      const activity = this.parseEvent(event);
      if (activity) {
        activities.push(activity);
      }
    }

    return activities;
  }

  private parseEvent(event: any): GitHubActivity | null {
    const date = new Date(event.created_at);
    const repo = event.repo?.name || 'unknown';

    switch (event.type) {
      case 'PushEvent':
        return {
          type: 'commit',
          repo,
          date,
          details: {
            commits: event.payload?.commits?.length || 1,
            size: event.payload?.size || 0
          }
        };

      case 'PullRequestEvent':
        const action = event.payload?.action;
        if (action === 'opened') {
          return {
            type: 'pr_opened',
            repo,
            date,
            details: {
              title: event.payload?.pull_request?.title,
              number: event.payload?.pull_request?.number
            }
          };
        } else if (action === 'closed' && event.payload?.pull_request?.merged) {
          return {
            type: 'pr_merged',
            repo,
            date,
            details: {
              title: event.payload?.pull_request?.title,
              number: event.payload?.pull_request?.number
            }
          };
        }
        break;

      case 'WatchEvent':
        return {
          type: 'star_received',
          repo,
          date,
          details: {
            action: event.payload?.action
          }
        };

      case 'ForkEvent':
        return {
          type: 'fork_received',
          repo,
          date,
          details: {
            forkee: event.payload?.forkee?.full_name
          }
        };

      case 'IssuesEvent':
        if (event.payload?.action === 'opened') {
          return {
            type: 'issue_created',
            repo,
            date,
            details: {
              title: event.payload?.issue?.title,
              number: event.payload?.issue?.number
            }
          };
        }
        break;

      case 'PullRequestReviewEvent':
        return {
          type: 'review',
          repo,
          date,
          details: {
            action: event.payload?.action,
            review_id: event.payload?.review?.id
          }
        };
    }

    return null;
  }

  private countCommitsFromEvents(events: any[]): number {
    return events
      .filter(event => event.type === 'PushEvent')
      .reduce((sum, event) => sum + (event.payload?.commits?.length || 1), 0);
  }

  private countPRsFromEvents(events: any[]): number {
    return events
      .filter(event => event.type === 'PullRequestEvent' && event.payload?.action === 'opened')
      .length;
  }

  private countIssuesFromEvents(events: any[]): number {
    return events
      .filter(event => event.type === 'IssuesEvent' && event.payload?.action === 'opened')
      .length;
  }

  async getRepositoryInfo(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      return {
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        isOwner: false // This would need to be determined based on the user
      };
    } catch (error) {
      console.error('Error fetching repository info:', error);
      return null;
    }
  }

  // Calculate average commits per week from recent events
  private calculateAvgCommitsPerWeek(events: any[]): number {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000));

    const recentCommitEvents = events.filter(event => {
      if (event.type !== 'PushEvent') return false;
      const eventDate = new Date(event.created_at);
      return eventDate >= twelveWeeksAgo;
    });

    const totalCommits = recentCommitEvents.reduce((sum, event) => {
      return sum + (event.payload?.commits?.length || 1);
    }, 0);

    return Math.round((totalCommits / 12) * 10) / 10; // Round to 1 decimal
  }

  // Get start of current week (Monday) or last 7 days for first sync
  private getStartOfWeek(useLastSevenDays: boolean = false): Date {
    const now = new Date();

    if (useLastSevenDays) {
      // Use last 7 days instead of week boundary
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return sevenDaysAgo;
    }

    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  // Filter events for current week
  private filterCurrentWeekEvents(events: any[], useLastSevenDays: boolean = false): any[] {
    const startOfWeek = this.getStartOfWeek(useLastSevenDays);
    return events.filter(event => {
      const eventDate = new Date(event.created_at);
      return eventDate >= startOfWeek;
    });
  }

  // Calculate XP for current week's activity using GraphQL
  async getWeeklyXp(username: string, useLastSevenDays: boolean = false): Promise<number> {
    try {
      console.log(`[GitHub Service] Getting weekly XP for ${username} using GraphQL`);

      // Get the start and end dates for the period
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Last 7 days

      const fromDate = startDate.toISOString();
      const toDate = now.toISOString();

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

      const response: any = await this.graphqlWithAuth(query, {
        username,
        from: fromDate,
        to: toDate
      });

      const collection = response.user?.contributionsCollection;

      if (!collection) {
        throw new Error('No contribution data found');
      }

      // Calculate weekly XP using the same formula as all-time
      const commits = collection.totalCommitContributions || 0;
      const prs = collection.totalPullRequestContributions || 0;
      const issues = collection.totalIssueContributions || 0;
      const reviews = collection.totalPullRequestReviewContributions || 0;

      const weeklyXp = (commits * 5) + (prs * 40) + (issues * 10) + (reviews * 15);

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

      // Fallback to old events method
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      const weekEvents = this.filterCurrentWeekEvents(events, true);
      let weeklyXp = 0;

      for (const event of weekEvents) {
        if (event.type === 'PushEvent') {
          const commits = event.payload?.commits?.length || 1;
          weeklyXp += Math.min(10, Math.max(2, Math.floor(commits * 2.5)));
        }
        if (event.type === 'PullRequestEvent') {
          const action = event.payload?.action;
          if (action === 'opened') weeklyXp += 15;
          if (action === 'closed' && event.payload?.pull_request?.merged) weeklyXp += 25;
        }
        if (event.type === 'WatchEvent') weeklyXp += 10;
        if (event.type === 'ForkEvent') weeklyXp += 5;
        if (event.type === 'IssuesEvent' && event.payload?.action === 'opened') weeklyXp += 10;
        if (event.type === 'PullRequestReviewEvent') weeklyXp += 15;
      }

      console.log(`[GitHub Service] Fallback weekly XP: ${weeklyXp}`);
      return weeklyXp;
    }
  }

  // Get rate limit status
  async getRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data.rate;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return null;
    }
  }
}

export default GitHubService;