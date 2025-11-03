import { Octokit } from '@octokit/rest';

export interface GitHubUserStats {
  username: string;
  totalCommits: number;
  totalPRs: number;
  totalStars: number;
  totalForks: number;
  totalRepos: number;
  totalIssues: number;
  languages: string[];
  recentActivity: GitHubActivity[];
}

export interface GitHubActivity {
  type: 'commit' | 'pr_opened' | 'pr_merged' | 'star_received' | 'fork_received' | 'issue_created' | 'review';
  repo: string;
  date: Date;
  details: Record<string, any>;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken?: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'GitMon/1.0'
    });
  }

  async getUserStats(username: string): Promise<GitHubUserStats> {
    try {
      // Get user basic info
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

      // Get recent activity (events)
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      const recentActivity = this.parseEvents(events);
      const totalCommits = this.countCommitsFromEvents(events);
      const totalPRs = this.countPRsFromEvents(events);
      const totalIssues = this.countIssuesFromEvents(events);

      return {
        username,
        totalCommits,
        totalPRs,
        totalStars,
        totalForks,
        totalRepos,
        totalIssues,
        languages: Array.from(languages),
        recentActivity
      };

    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      throw new Error('Failed to fetch GitHub statistics');
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