# 🎮 How XP Works in GitMon

## What is XP?

XP (Experience Points) is how GitMon measures your coding activity and progress. Think of it like levels in a video game: the more you code, the more XP you earn, and the higher your level becomes.

## Two Types of XP

### 🏆 **All-Time XP**
**What it is**: Your total lifetime coding achievements from your entire GitHub history.

**What counts**:
- Your followers: 1 XP each
- Stars received on all repos: 10 XP each
- Forks received on all repos: 5 XP each
- Public repositories: 50 XP each
- Total commits (estimated): 5 XP each
- Total pull requests (estimated): 40 XP each

**When it's calculated**: Only once, when you first sync your GitHub account.

**Example**: If you have 100 followers, 5 repos with 50 total stars, you'd get:
- 100 followers × 1 = 100 XP
- 50 stars × 10 = 500 XP
- 5 repos × 50 = 250 XP
- **Total: 850 XP** (plus commits and PRs)

⚠️ **All-Time XP Limitations**: One-time only (calculated only on first sync)

---

### 📅 **Weekly XP**
**What it is**: Your coding activity from the last 7 days only.

**What counts**:
- Commits this week: 2-10 XP each (based on size)
- Pull requests opened: 15 XP each
- Pull requests merged: 25 XP each
- Stars received this week: 10 XP each
- Forks received this week: 5 XP each
- Issues created: 10 XP each
- Code reviews: 15 XP each

**When it updates**: Every time you sync your GitHub data.

**Example**: If this week you made 3 commits and opened 1 PR:
- 3 commits × 5 XP = 15 XP
- 1 PR opened = 15 XP
- **Weekly Total: 30 XP**

⚠️ **Weekly XP Limitations**: Public repositories only (private activity doesn't count)

---

## 🏅 Levels & Rankings

Your **All-Time XP** determines your overall level and rank title:

- **Level 1-5**: Newbie Trainer
- **Level 6-15**: Code Cadet
- **Level 16-25**: Bug Hunter
- **Level 26-35**: Senior Dev
- **Level 36-45**: Code Master
- **Level 46+**: Git Legend

**Level Formula**: Uses Pokemon-style progression where each level requires more XP than the last.

---

## 📊 Leaderboards

**"This Week" Leaderboard**: Shows who earned the most Weekly XP in the last 7 days.

**"All Time" Leaderboard**: Shows who has the highest total All-Time XP ever.

---

## 🎯 Why This System?

- **All-Time XP**: Recognizes your complete coding journey and gives new users immediate value
- **Weekly XP**: Encourages consistent activity and creates fair weekly competitions
- **Combined**: Balances long-term achievements with recent activity

---

*Want to see the full technical details and economics design? Check out our [XP System Design Document →](/docs?doc=system-design)*