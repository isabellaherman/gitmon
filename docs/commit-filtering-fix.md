# Commit Filtering Fix - GitHub Search API Approach

## Problem Analysis

The current event-based commit filtering system (`getRecentCommitsFromEvents`) was failing because:

- **GitHub public events API limitations**: Only returns ~30 recent events
- **Missing commits**: Excludes private repository activity and can miss commits entirely
- **Event delays**: Events can be delayed or filtered out by GitHub
- **Incomplete data**: Events API doesn't guarantee all commits are captured

## Solution: GitHub Search API

### Why GitHub Search API is Better

- ✅ Finds ALL public commits (not just recent events)
- ✅ Reliable date filtering using `committer-date:>YYYY-MM-DD`
- ✅ Returns actual commit data with SHA, message, and repository
- ✅ Works across all repositories the user has committed to
- ✅ Higher rate limits than events API (5,000/hour vs 1,000/hour)
- ✅ More precise and comprehensive results

### Technical Implementation

#### 1. New Search-Based Method

```typescript
private async getCommitsViaSearch(username: string): Promise<BattleCommit[]> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sinceDate = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

    // Search for commits by this author in the last 7 days
    const { data } = await this.octokit.rest.search.commits({
      q: `author:${username} committer-date:>${sinceDate}`,
      sort: 'committer-date',
      order: 'desc',
      per_page: 100
    });

    return data.items.map(commit => ({
      username,
      commitSha: commit.sha,
      message: commit.commit.message.split('\n')[0], // First line only
      repoName: commit.repository?.full_name || 'unknown',
      timestamp: new Date(commit.commit.committer?.date || commit.commit.author.date),
      damage: this.calculateDamage()
    }));

  } catch (error) {
    console.error(`Search API error for ${username}:`, error);
    return [];
  }
}
```

#### 2. Simple Drop-in Replacement

Replace in `refreshBattleLogs()`:

```typescript
// OLD:
const recentCommits = await this.getRecentCommitsFromEvents(username);

// NEW:
const recentCommits = await this.getCommitsViaSearch(username);
```

### Alternative Approaches Considered

#### Repository-Specific Monitoring

```typescript
async getRepoCommits(owner: string, repo: string, author: string, since: string) {
  const { data } = await this.octokit.rest.repos.listCommits({
    owner, repo, author, since, per_page: 100
  });
  return data;
}
```

#### User Repository Enumeration

```typescript
async getUserRecentCommits(username: string, since: string) {
  const { data: repos } = await this.octokit.rest.repos.listForUser({
    username, type: 'all', per_page: 100
  });

  const commits = [];
  for (const repo of repos) {
    const repoCommits = await this.getRepoCommits(
      repo.owner.login, repo.name, username, since
    );
    commits.push(...repoCommits);
  }
  return commits;
}
```

### Implementation Benefits

- **Reliability**: Actual GitHub commit data instead of event approximations
- **Completeness**: Captures all public commits, not just recent events
- **Accuracy**: Real commit SHAs, messages, and timestamps
- **Maintainability**: Simpler logic with better error handling
- **Performance**: Better rate limits and more efficient queries

### Migration Steps

1. Add `getCommitsViaSearch` method to `github-service.ts`
2. Update `battle-service.ts` to use new method
3. Test with event participants
4. Remove old event-based methods once confirmed working
