# Boss Battle Gamification Module

## Overview

The Boss Battle module adds a gamification layer to GitMon events, converting participant commits into damage against a boss character. This system uses the existing events and leaderboard infrastructure to create a collaborative and engaging experience.

## How It Works

### 1. Damage System

- **Commits = Damage**: Each commit made during an event is converted to damage points
- **Damage Formula**: Based on existing XP system (5 XP per commit)
  ```
  Damage per Commit = 5 damage points
  Damage per PR = 40 damage points
  ```

### 2. Boss Health System

- **Boss HP**: Dynamically calculated based on number of participants
  ```
  Total HP = (Number of Participants × 1000) + Boss Base HP
  ```
- **Regeneration**: Boss can have natural regeneration over time
- **Phases**: Boss can have multiple phases as HP decreases

### 3. Collaborative Participation

- **All event participants** contribute to defeating the boss
- **Damage Ranking**: Specific leaderboard showing who dealt the most damage
- **Special Badges**: Rewards for different types of participation

## Module Structure

```
modules/boss-battle/
├── README.md                 # This documentation
├── types/
│   ├── boss.ts              # TypeScript types for boss
│   ├── damage.ts            # Types for damage system
│   └── battle.ts            # Types for battle
├── components/
│   ├── BossHealthBar.tsx    # Boss health bar
│   ├── DamageLeaderboard.tsx # Damage ranking
│   ├── BossDisplay.tsx      # Boss visual
│   └── BattleStats.tsx      # Battle statistics
├── lib/
│   ├── damage-calculator.ts # Damage calculation based on commits
│   ├── boss-health.ts       # Boss HP management
│   └── battle-state.ts      # Battle state
├── hooks/
│   ├── useBossHealth.ts     # Hook for boss HP
│   ├── useDamageStats.ts    # Hook for damage statistics
│   └── useBattleState.ts    # Hook for battle state
└── api/
    ├── boss-health.ts       # API for boss HP
    ├── damage-stats.ts      # API for damage statistics
    └── battle-events.ts     # API for battle events
```

## Database Schema

### New Table: BossEvent

```prisma
model BossEvent {
  id              String   @id @default(cuid())
  eventId         String   @unique
  bossName        String
  bossImage       String
  baseHp          Int      @default(10000)
  currentHp       Int
  maxHp           Int
  damagePerCommit Int      @default(5)
  damagePerPr     Int      @default(40)
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  isActive        Boolean  @default(true)

  // Boss phases
  phases          Json?    // Array of phases with HP thresholds

  @@map("boss_events")
}
```

### New Table: DamageDealt

```prisma
model DamageDealt {
  id            String   @id @default(cuid())
  userId        String
  eventId       String
  totalDamage   Int      @default(0)
  commitsCount  Int      @default(0)
  prsCount      Int      @default(0)
  lastDamageAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@map("damage_dealt")
}
```

## API Endpoints

### 1. Boss Health API

```typescript
// GET /api/boss-battle/health?eventId=first-community-event
{
  "success": true,
  "boss": {
    "name": "Mad Monkey",
    "currentHp": 8500,
    "maxHp": 15000,
    "image": "/events/MadMonkey.png",
    "phase": 1,
    "isDefeated": false
  }
}
```

### 2. Damage Leaderboard API

```typescript
// GET /api/boss-battle/damage?eventId=first-community-event&limit=10
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "githubUsername": "user1",
      "totalDamage": 2500,
      "commitsCount": 500,
      "prsCount": 0,
      "lastDamageAt": "2025-01-01T12:00:00Z"
    }
  ],
  "totalDamageDealt": 8500
}
```

### 3. Calculate Damage API

```typescript
// POST /api/boss-battle/calculate-damage
{
  "eventId": "first-community-event",
  "userId": "user123",
  "commits": 10,
  "prs": 2
}
// Response:
{
  "success": true,
  "damageDealt": 130, // (10 * 5) + (2 * 40)
  "newTotal": 1350
}
```

## Componentes UI

### 1. BossHealthBar

Barra de vida visual do boss que aparece na página do evento:

```tsx
<BossHealthBar
  currentHp={boss.currentHp}
  maxHp={boss.maxHp}
  bossName={boss.name}
  phase={boss.phase}
/>
```

### 2. DamageLeaderboard

Ranking dos participantes por dano causado:

```tsx
<DamageLeaderboard eventId="first-community-event" limit={10} currentUserId={session?.user?.id} />
```

### 3. BossDisplay

Visual do boss com animações baseadas no HP:

```tsx
<BossDisplay boss={boss} isUnderAttack={recentDamage > 0} showDamageNumbers={true} />
```

## Integration with Existing System

### 1. XP Activities

- Uses existing `XpActivity` table to track commits and PRs
- Damage system calculated in real-time based on XP activities
- Maintains compatibility with current ranking system

### 2. Event Participants

- Uses existing `EventParticipant` table
- Adds damage system as extra layer
- Does not interfere with current participation system

### 3. Leaderboard Integration

- Damage system runs parallel to XP leaderboard
- Possibility to show both: XP ranking and damage ranking
- Keeps existing functionality intact

## Implementation Phases

### Phase 1: Base Infrastructure

1. Create database schema
2. Implement basic APIs
3. Create health bar component
4. Integrate into event page

### Phase 2: Damage System

1. Implement damage calculation
2. Create real-time tracking system
3. Add damage leaderboard
4. Animations and visual feedback

### Phase 3: Advanced Features

1. Boss phases system
2. Special effects and animations
3. Special badges and rewards
4. Boss regeneration system

### Phase 4: Polish & Enhancement

1. Performance optimizations
2. Advanced animations
3. Notification system
4. Metrics and analytics

## Event Configuration

To activate boss battle in an event:

```typescript
const bossConfig = {
  eventId: 'first-community-event',
  bossName: 'Mad Monkey',
  bossImage: '/events/MadMonkey.png',
  baseHp: 10000, // HP base + (participantes × 1000)
  damagePerCommit: 5,
  damagePerPr: 40,
  phases: [
    { threshold: 0.75, name: 'Enraged', effects: ['increased_defense'] },
    { threshold: 0.25, name: 'Desperate', effects: ['regeneration'] },
  ],
};
```

## Monitoring and Analytics

- **Damage per minute**: Damage speed
- **Participation rate**: % of active participants
- **Boss health over time**: HP chart over time
- **Top damage dealers**: Rankings and statistics
- **Event duration**: Time to defeat the boss

## Technical Considerations

### Performance

- Boss HP cache to reduce queries
- Batch updates for mass damage
- Leaderboard query optimization

### Scalability

- System must support thousands of participants
- Optimized damage calculations
- Smart caching to reduce database load

### Real-time Updates

- WebSockets or polling for real-time updates
- Synchronization between multiple clients
- Instant feedback for user actions

## For later I think it would be very cool if each monster have a unique effect on battle such as support, heal, etc.
