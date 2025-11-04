# 🎮 GitMon XP System Design
## Economics Design Document v1.0

### 🎯 **Core Design Philosophy**
- **Reward meaningful contributions** over quantity
- **Prevent easy exploitation** while keeping system simple
- **Encourage exploration** of different coding activities
- **Create satisfying progression** that keeps users engaged

---

## 🔧 **XP Levers & Point Values**

### **📝 Commits (Low Tier - Easy to Game)**
- **Small commit** (<10 lines): `2 XP`
- **Medium commit** (10-100 lines): `5 XP`
- **Large commit** (100+ lines): `8 XP`
- **Mega commit** (500+ lines): `10 XP` (capped to discourage huge commits)

**Anti-cheat:**
- Max 50 XP/day from commits
- Empty commits = 0 XP
- Reverted commits lose XP

### **🔀 Pull Requests (Medium-High Tier)**
- **PR opened**: `15 XP`
- **PR merged**: `25 XP` (total 40 XP)
- **PR to popular repo** (1k+ stars): `+50% bonus`
- **PR to mega repo** (10k+ stars): `+100% bonus`

**Anti-cheat:**
- Own repos = 50% XP
- Closed without merge = only 5 XP

### **⭐ Stars Received (High Tier - Hardest to Game)**
- **First star on repo**: `50 XP`
- **Each additional star**: `10 XP`
- **Star from verified developer**: `+20% bonus`
- **Star on repo with 100+ stars**: `+50% bonus`

### **🍴 Forks & Clones (Medium Tier)**
- **First fork received**: `30 XP`
- **Each additional fork**: `5 XP`
- **Fork from verified developer**: `+25% bonus`

### **🐛 Issues (Medium Tier)**
- **Issue created** (with good description): `10 XP`
- **Issue resolved** (by author): `20 XP`
- **Issue resolved** (by community): `30 XP`
- **Bug report leading to fix**: `40 XP`

### **👁️ Code Reviews (High Tier)**
- **Review submitted**: `15 XP`
- **Review leads to changes**: `25 XP`
- **Review on popular repo**: `+30% bonus`

### **🚀 Releases & Tags (High Tier)**
- **First release**: `100 XP`
- **Major version** (v1.0, v2.0): `75 XP`
- **Minor version** (v1.1): `50 XP`
- **Patch version** (v1.1.1): `25 XP`

### **🔥 Streaks & Consistency (Bonus Multipliers)**
- **7-day streak**: `+10% XP bonus`
- **30-day streak**: `+25% XP bonus`
- **100-day streak**: `+50% XP bonus`
- **365-day streak**: `+100% XP bonus` (GitHub's own metric)

### **🌍 Language Diversity (Exploration Bonus)**
- **First repo in new language**: `50 XP`
- **10+ languages used**: `+15% global XP bonus`
- **Rare language used** (Rust, Go, etc.): `+25% XP for that repo`

### **🏆 Special Achievements (One-time Bonuses)**
- **First contribution to open source**: `200 XP`
- **Contribute to trending repo**: `300 XP`
- **Package published to npm/pypi**: `500 XP`
- **Repo featured on GitHub**: `1000 XP`
- **GitHub badge earned**: `100-500 XP` (varies by badge)

---

## 📈 **Level Progression System**
### Inspired by Pokémon's Fast/Medium Fast Growth Rate

| Level | Total XP Required | XP for Next Level | Real-World Equivalent |
|-------|------------------|-------------------|----------------------|
| 1     | 0                | 100               | First week coding    |
| 2     | 100              | 150               | Basic Git workflow   |
| 3     | 250              | 200               | First PR            |
| 4     | 450              | 250               | Regular contributor  |
| 5     | 700              | 350               | Open source dabbler  |
| 6     | 1,050            | 450               | Solid contributor    |
| 7     | 1,500            | 600               | Community member     |
| 8     | 2,100            | 750               | Active developer     |
| 9     | 2,850            | 950               | Experienced coder    |
| 10    | 3,800            | 1,200             | Senior contributor   |
| 15    | 9,800            | 2,000             | Expert developer     |
| 20    | 22,500           | 3,500             | GitHub power user    |
| 25    | 45,000           | 5,000             | Open source maintainer |
| 30    | 85,000           | 7,500             | Community leader     |
| 40    | 200,000          | 12,500            | GitHub legend        |
| 50    | 400,000          | 20,000            | Coding deity         |

**Level Formula:** `XP = Level³ × 4 - 15 × Level² + 100 × Level - 140`

---

## ⚖️ **Balance Considerations**

### **Daily/Weekly Caps**
- **Max XP per day**: `1,000 XP` (prevents no-life grinding)
- **Max from commits/day**: `50 XP` (forces diverse activities)
- **Weekly bonus pool**: `+500 XP` for completing all activity types

### **Repository Quality Multipliers**
- **Own private repos**: `0.5x multiplier`
- **Own public repos**: `1x multiplier`
- **External repos**: `1.5x multiplier`
- **Popular repos** (100+ stars): `2x multiplier`
- **Trending repos**: `3x multiplier`

### **Anti-Abuse Mechanisms**
1. **Commit analysis**: Check file changes, not just commit count
2. **Velocity checking**: Sudden spikes trigger review
3. **Community validation**: Popular repos = trusted XP
4. **Time-based cooldowns**: Can't spam same action
5. **Account age bonus**: Older accounts get small bonus

---

## 🎭 **Gamification Elements**

### **GitMon Evolution System**
- **Levels 1-10**: Basic GitMon
- **Levels 11-25**: Evolved GitMon (new sprite)
- **Levels 26-40**: Final Evolution (ultimate sprite)
- **Level 50+**: Legendary GitMon (rare cosmetics)

### **Seasonal Events**
- **Hacktoberfest**: `+100% XP` in October
- **GitHub Universe**: Special achievement badges
- **New Year**: Fresh start bonus for first activities

### **Social Features**
- **Team battles**: Companies can create teams
- **Guild system**: Join coding communities
- **Mentorship**: Senior devs can "train" juniors for bonus XP

---

## 📊 **Economic Balance Target Metrics**

### **Progression Pacing**
- **Casual user** (1 hour/day): ~1 level/week for first 10 levels
- **Active user** (3 hours/day): ~2-3 levels/week early game
- **Power user** (6+ hours/day): Hits daily caps, steady progression

### **Retention Targets**
- **Level 5 by Week 2**: 80% retention target
- **Level 10 by Month 1**: 60% retention target
- **Level 20 by Month 6**: 40% retention target

### **Engagement Loops**
1. **Daily**: Check streak, do small commits
2. **Weekly**: Major PR or release
3. **Monthly**: Try new language or contribute to trending repo
4. **Quarterly**: Major project or open source contribution

---

## 🔬 **A/B Testing Plan**

### **Phase 1**: Basic XP (commits, PRs, stars)
### **Phase 2**: Add streaks and language diversity
### **Phase 3**: Social features and team battles
### **Phase 4**: Advanced achievements and seasonal events

**Success Metrics:**
- Daily Active Users (DAU)
- Average session time
- GitHub activity increase
- User progression distribution

---

*Want to understand how this works in practice? Check out [How XP Works →](/how-xp-works)*