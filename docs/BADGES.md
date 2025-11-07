# 🏆 GitMon Badge System

The GitMon Badge System rewards users for various achievements and milestones within the platform. Badges are displayed on user profiles and serve as a way to showcase accomplishments and community involvement.

## 🎯 Badge Types

### Event Participation
- **Community Pioneer** 🎯 - Participated in GitMon's first community event
- More event badges will be added as new events are created

### XP Milestones
- **Rising Coder** ⚡ - Earned 1,000 XP (Common)
- **Code Master** 💎 - Earned 10,000 XP (Rare)
- Higher milestones coming soon!

### Streaks & Consistency
- **Dedicated Developer** 🔥 - Maintained a 30-day coding streak (Rare)
- More streak badges planned

## 🎨 Badge Rarities

Badges come in four rarity levels, each with distinct visual styling:

- **Common** (Gray) - Basic achievements, easy to earn
- **Rare** (Blue) - Moderate achievements, some effort required
- **Epic** (Purple) - Significant achievements, notable effort
- **Legendary** (Gold) - Exceptional achievements, very rare

## 📊 Current Implementation

### Database Integration
The badge system integrates with existing GitMon data:

- **Event Participation**: Uses `event_participants` table
- **XP Milestones**: Uses user `xp` field
- **Streaks**: Uses user `currentStreak` and `longestStreak` fields

### Badge Storage
Currently, badges are calculated dynamically based on user data. Future versions may include:
- Dedicated badge table for persistent storage
- Badge earning timestamps
- Custom badge metadata

## 🛠 Adding New Badges

To add a new badge, edit `/lib/badges.ts`:

```typescript
{
  id: "unique-badge-id",
  name: "Badge Name",
  description: "What this badge represents",
  emoji: "🎯",
  criteria: {
    type: 'event_participation', // or 'xp_milestone', 'streak', 'custom'
    value: 'event-id' // or number for milestones
  },
  rarity: 'rare' // common | rare | epic | legendary
}
```

## 📱 Component Usage

The badge system is implemented through the `BadgeSystem` component:

```typescript
import BadgeSystem from "@/components/BadgeSystem";

<BadgeSystem
  userBadges={earnedBadges}
  allBadges={availableBadges} // optional
  showAllBadges={false} // optional: show unearned badges
/>
```

## 🔮 Future Enhancements

### Planned Features
- **Badge Sharing**: Share earned badges on social media
- **Badge Collections**: Group related badges into collections
- **Badge Points**: Assign point values based on rarity
- **Badge Leaderboard**: Showcase top badge collectors
- **Custom Badges**: Allow community-created badges
- **Badge Notifications**: Notify users when they earn badges

### Advanced Badge Types
- **Contribution Badges**: For open source contributions
- **Social Badges**: For community engagement
- **Seasonal Badges**: Limited-time event badges
- **Achievement Chains**: Multi-step badge progressions
- **Collaboration Badges**: For working with other users

### Technical Improvements
- **Badge Caching**: Improve performance with Redis
- **Badge Analytics**: Track badge earning patterns
- **Badge API**: REST endpoints for badge management
- **Badge Webhooks**: Integrate with external services

## 🎮 User Experience

### Profile Display
Badges are prominently displayed on user profiles in a dedicated section alongside GitMon information. The two-column layout ensures badges get proper visibility.

### Visual Design
- Clean, card-based layout
- Rarity-based color coding
- Lock icons for unearned badges
- Hover effects and smooth transitions
- Mobile-responsive grid system

### Accessibility
- Semantic HTML structure
- Proper color contrast ratios
- Screen reader friendly descriptions
- Keyboard navigation support

---

*The badge system is designed to grow with the GitMon community, encouraging engagement and celebrating achievements at every level.*