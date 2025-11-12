# Battle Log System - Documento de Planejamento

## Visão Geral
Implementar um sistema de log de batalha em tempo real na página `/event` que funciona como um chat visual mostrando as ações dos jogadores durante o evento Mad Monkey.

## Estados da Página Event (Atual)

### 1. Usuário Deslogado
- **Status**: Sem autenticação
- **UI Atual**: Login via GitHub + contador de participantes
- **Comportamento**: Solicita login para participar

### 2. Usuário Logado - Não Participando
- **Status**: Autenticado mas não inscrito no evento
- **UI Atual**: Botão "JOIN" + contador de participantes
- **Comportamento**: Permite inscrição no evento

### 3. Usuário Logado - Participando
- **Status**: Autenticado e inscrito no evento
- **UI Atual**: "JOINED SUCCESSFULLY!" + contador de participantes
- **Comportamento**: Confirmação de participação

## Proposta: Sistema Battle Log Automático

### Características Principais
- **Visual**: Interface tipo chat em tempo real
- **Visibilidade**: Presente em todos os 3 estados da página
- **Conteúdo**: Log automático de commits dos 87 participantes cadastrados
- **Atualização**: Polling a cada 30-60s (devido aos rate limits do GitHub)
- **Período**: Sistema ativo apenas durante janela do evento definida
- **Fonte**: GitHub API monitorando atividade dos participantes

### Tipos de Mensagens no Log

#### 1. Ações de Commit (Automáticas)
```
⚔️ @username commitou "fix: authentication bug" - 1 ataque!
🔥 @username commitou "feat: new user dashboard" - DANO CRÍTICO!
💻 @username fez 3 commits em sequência - COMBO ATTACK!
🚀 @username deployou "v2.1.0" - ATAQUE ESPECIAL!
🛠️ @username refatorou código legacy - BUFF DE DEFESA!
```

#### 2. Eventos Automáticos do Sistema
```
🚨 10 commits nos últimos 5 minutos - Mad Monkey está ENFURECENDO!
⚡ Combo de 5 devs commitando simultaneamente - ATAQUE COORDENADO!
🎯 @user1, @user2, @user3 commitaram no mesmo repo - TEAM STRIKE!
📊 50 commits registrados hoje - Mad Monkey perdeu 25% HP!
🌙 Atividade noturna detectada - BONUS DAMAGE!
```

#### 3. Marcos Temporais do Evento
```
🕐 Evento iniciado! Que comece a batalha!
📊 24h de evento - 150 commits registrados!
💪 Mad Monkey: 60% de HP restante
🔥 Dia de maior atividade: 89 commits!
🏆 Evento finalizado! Mad Monkey DERROTADO!
```

## Layout e Posicionamento

### Desktop
```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│   CONTEÚDO ATUAL    │    BATTLE LOG       │
│   DA PÁGINA EVENT   │                     │
│                     │  ┌───────────────┐  │
│  - Header/Warning   │  │ @user1 joined │  │
│  - Mad Monkey img   │  │ @user2 attack │  │
│  - Status/Buttons   │  │ Critical hit! │  │
│  - Event Details    │  │ @user3 defend │  │
│                     │  │      ...      │  │
│                     │  └───────────────┘  │
└─────────────────────┴─────────────────────┘
```

### Mobile
```
┌─────────────────────────────┐
│       CONTEÚDO ATUAL        │
│       DA PÁGINA EVENT       │
│                             │
│    - Header/Warning         │
│    - Mad Monkey img         │
│    - Status/Buttons         │
│    - Event Details          │
│                             │
├─────────────────────────────┤
│        BATTLE LOG           │
│  ┌─────────────────────────┐ │
│  │ @user1 joined battle    │ │
│  │ @user2 attacked MM      │ │
│  │ Critical damage!        │ │
│  │ @user3 defended         │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

## Componente BattleLog Universal

### Estrutura
```tsx
interface BattleLog {
  id: string;
  event_id: string;
  username: string;
  action_type: 'commit' | 'combo' | 'milestone' | 'event_start' | 'event_end';
  message: string;
  timestamp: Temporal.ZonedDateTime;
  damage_dealt: number;
  commit_sha?: string;
  repo_name?: string;
  metadata: {
    additions?: number;
    deletions?: number;
    files_changed?: number;
    combo_count?: number;
    is_critical?: boolean;
  };
}

interface BattleLogProps {
  // Não precisa mais de userState!
  // Todos veem o mesmo chat, apenas com highlights diferentes
  currentUsername?: string; // Para highlight das próprias ações
  isParticipant?: boolean;   // Para mostrar badge
}

// API endpoint universal
app.get('/api/battle-logs', async (req, res) => {
  const logs = await db.battle_logs.findMany({
    where: { event_id: 'mad-monkey-2024' },
    orderBy: { timestamp: 'desc' },
    take: 50
  });

  return res.json(logs);
  // ↑ Mesma response para TODOS os usuários
});
```

### Funcionalidades por Estado (Server-Side = Universal)

#### 1. Usuário Deslogado
- **Visibilidade**: ✅ **Chat completo em tempo real** (dados do servidor)
- **Mensagens**: Todos os logs do evento via `/api/battle-logs`
- **Interação**: Somente visualização
- **Call-to-action**: "Login para participar e aparecer no chat!"
- **Update**: A cada 10s busca novos logs no DB

#### 2. Usuário Logado - Não Participando
- **Visibilidade**: ✅ **Chat completo em tempo real** (dados do servidor)
- **Mensagens**: Todos os logs + preview de como seria aparecer
- **Interação**: Somente visualização
- **Call-to-action**: "Junte-se para seus commits aparecerem aqui!"
- **Update**: A cada 10s busca novos logs no DB

#### 3. Usuário Logado - Participando
- **Visibilidade**: ✅ **Chat completo em tempo real** (dados do servidor)
- **Mensagens**: Todos os logs + **highlight** das próprias ações
- **Interação**: Visualização + notificações quando mencionado
- **Features**: Auto-scroll, destaque de menções, badge "PARTICIPANDO"
- **Update**: A cada 10s busca novos logs no DB

### Benefícios da Arquitetura Server-Side

```typescript
// TODOS os usuários fazem a mesma request simples:
const battleLogs = await fetch('/api/battle-logs?limit=50');

// Não importa se está logado, participando ou não
// = Mesma experiência de tempo real para todos
// = Funciona até para visitantes anônimos
// = Chat sempre atualizado e sincronizado
```

**Resultado**: Chat tipo "livestream" que todos podem acompanhar! 🔴⚡

## Sistema de Tempo com Temporal API

### Configuração do Evento
```typescript
import { Temporal } from '@js-temporal/polyfill';

interface EventTimeConfig {
  id: string;
  name: string;
  startDateTime: Temporal.ZonedDateTime;
  endDateTime: Temporal.ZonedDateTime;
  timezone: string; // 'America/Sao_Paulo'
}

const madMonkeyEvent: EventTimeConfig = {
  id: 'mad-monkey-2024',
  name: 'Mad Monkey Battle',
  startDateTime: Temporal.ZonedDateTime.from('2024-12-01T00:00:00[America/Sao_Paulo]'),
  endDateTime: Temporal.ZonedDateTime.from('2024-12-07T23:59:59[America/Sao_Paulo]'),
  timezone: 'America/Sao_Paulo'
};

// Verificar se evento está ativo
function isEventActive(config: EventTimeConfig): boolean {
  const now = Temporal.Now.zonedDateTimeISO(config.timezone);
  return now.since(config.startDateTime).sign >= 0 &&
         config.endDateTime.since(now).sign > 0;
}

// Filtrar commits pelo período do evento
function isCommitInEventPeriod(commitDate: string, config: EventTimeConfig): boolean {
  const commit = Temporal.Instant.from(commitDate).toZonedDateTimeISO(config.timezone);
  return commit.since(config.startDateTime).sign >= 0 &&
         config.endDateTime.since(commit).sign > 0;
}
```

## Sistema de Monitoramento Automático

### GitHub Polling Service
```typescript
interface CommitActivity {
  username: string;
  repoName: string;
  commitSha: string;
  commitMessage: string;
  timestamp: Temporal.ZonedDateTime;
  filesChanged: number;
  additions: number;
  deletions: number;
}

class BattleLogMonitor {
  private participants: string[]; // 87 usernames dos event_participants
  private eventConfig: EventTimeConfig;
  private lastCheck: Temporal.ZonedDateTime;

  async pollParticipantActivity(): Promise<CommitActivity[]> {
    const activities: CommitActivity[] = [];
    const batchSize = 10; // Rate limit considerations

    for (let i = 0; i < this.participants.length; i += batchSize) {
      const batch = this.participants.slice(i, i + batchSize);
      const batchActivities = await this.checkBatchActivity(batch);
      activities.push(...batchActivities);

      // Rate limit delay: 60req/min = 1req/s
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return activities.filter(activity =>
      isCommitInEventPeriod(activity.timestamp.toString(), this.eventConfig)
    );
  }
}
```

## Database Schema Otimizado

### Tables
```sql
-- Configuração do evento
events (
  id: varchar PRIMARY KEY,
  name: varchar NOT NULL,
  start_datetime: timestamptz NOT NULL,
  end_datetime: timestamptz NOT NULL,
  timezone: varchar NOT NULL DEFAULT 'America/Sao_Paulo',
  boss_max_hp: integer DEFAULT 10000,
  boss_current_hp: integer DEFAULT 10000,
  status: varchar DEFAULT 'active', -- active, ended, paused
  created_at: timestamptz DEFAULT now()
);

-- Log de atividades automáticas
battle_logs (
  id: uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id: varchar REFERENCES events(id),
  username: varchar NOT NULL,
  action_type: varchar NOT NULL, -- commit, combo, milestone, event_start, event_end
  message: text NOT NULL,
  commit_sha: varchar,
  repo_name: varchar,
  damage_dealt: integer DEFAULT 0,
  timestamp: timestamptz NOT NULL,
  metadata: jsonb -- { additions, deletions, files_changed, combo_count, etc }
);

-- Cache de última atividade por usuário
participant_activity_cache (
  event_id: varchar,
  username: varchar,
  last_commit_sha: varchar,
  last_activity: timestamptz,
  total_commits: integer DEFAULT 0,
  total_damage: integer DEFAULT 0,
  PRIMARY KEY (event_id, username)
);

-- Rate limiting para API calls
api_rate_limits (
  service: varchar PRIMARY KEY, -- github_rest, github_graphql
  requests_made: integer DEFAULT 0,
  window_start: timestamptz DEFAULT now(),
  last_request: timestamptz
);
```

## Sistema de Damage/HP

### Algoritmo de Dano
```typescript
function calculateCommitDamage(commit: CommitActivity): number {
  let damage = 10; // Base damage

  // Bonus por tipo de commit
  if (commit.commitMessage.includes('feat:')) damage += 20;
  if (commit.commitMessage.includes('fix:')) damage += 15;
  if (commit.commitMessage.includes('refactor:')) damage += 25;
  if (commit.commitMessage.includes('test:')) damage += 10;

  // Bonus por tamanho
  const totalChanges = commit.additions + commit.deletions;
  if (totalChanges > 100) damage += 30; // CRITICAL HIT
  if (totalChanges > 50) damage += 15;

  // Penalty por commits muito pequenos
  if (totalChanges < 5) damage = Math.max(5, damage - 10);

  return Math.min(100, damage); // Max 100 damage per commit
}

function detectComboAttacks(recentCommits: CommitActivity[]): ComboAttack[] {
  const combos: ComboAttack[] = [];

  // Detect simultaneous commits (within 5 minutes)
  const timeWindow = Temporal.Duration.from({ minutes: 5 });
  // ... combo detection logic

  return combos;
}
```

## Rate Limits e Performance

### GitHub API Constraints
```typescript
// Rate limits atuais
const GITHUB_LIMITS = {
  REST_AUTHENTICATED: 5000, // requests/hour
  GRAPHQL_AUTHENTICATED: 5000, // points/hour
  EVENTS_API: 300 // requests/hour (mais limitado)
};

// Com 87 participantes
const POLLING_STRATEGY = {
  batchSize: 10, // usuários por batch
  delayBetweenBatches: 2000, // 2s entre batches
  fullCycleTime: 87 / 10 * 2, // ~18s para checar todos
  pollingInterval: 60000, // 1 minuto entre ciclos completos
  requestsPerHour: 87 * 60, // 5220 requests/hour (próximo do limite!)
};
```

### Otimizações Necessárias
```typescript
// 1. Cache inteligente
interface ParticipantCache {
  username: string;
  lastCommitSha: string;
  lastChecked: Temporal.ZonedDateTime;
  commitCount: number;
}

// 2. Polling adaptativo
class AdaptivePoller {
  adjustPollingFrequency(recentActivity: number) {
    // Mais atividade = polling mais frequente
    // Menos atividade = polling mais espaçado
    if (recentActivity > 20) return 30000; // 30s
    if (recentActivity > 10) return 60000; // 1min
    return 120000; // 2min
  }
}

// 3. Priority queue para usuários ativos
prioritizeActiveUsers(participants: string[], activityScore: Map<string, number>) {
  return participants.sort((a, b) => activityScore.get(b)! - activityScore.get(a)!);
}
```

## Implementação Realista em Fases

### Fase 1: Core System (Semana 1)
- [x] Análise da estrutura atual
- [ ] Setup Temporal API polyfill
- [ ] Database schema para eventos e battle_logs
- [ ] API endpoint básico para buscar logs
- [ ] Componente BattleLog com dados mock

### Fase 2: GitHub Integration (Semana 2)
- [ ] GitHub polling service com rate limiting
- [ ] Sistema de cache de participantes
- [ ] Algoritmo de damage calculation
- [ ] Background job para monitoring contínuo

### Fase 3: Real-time UI (Semana 3)
- [ ] Polling frontend (a cada 30s)
- [ ] Sistema de notificações no chat
- [ ] Boss HP tracking visual
- [ ] Responsive design para mobile

### Fase 4: Gamification (Semana 4)
- [ ] Sistema de combos e streaks
- [ ] Leaderboard de dano
- [ ] Marcos automáticos (milestones)
- [ ] Finalização do evento

## Considerações de Implementação

### Rate Limiting Strategy

#### Opção 1: Server-Side Loading (Recomendado)
```typescript
// Background job que roda no servidor a cada 2-5 minutos
// Armazena resultados no DB, cliente só faz queries locais

const SERVER_SIDE_POLLING = {
  backgroundJobInterval: 180000, // 3 minutos
  usersPerBatch: 15,
  requestsPerCycle: 87 / 15, // ~6 requests por cycle
  requestsPerHour: (87 / 15) * (60 / 3), // 116 requests/hora (2.3% do limite!)

  // Cliente faz apenas queries SQL locais
  clientPolling: 10000, // 10s para buscar no DB local
  serverLoad: 'LOW', // Muito baixo impacto
  scalability: 'EXCELLENT' // Pode suportar milhares de usuários
};

// Durante page load, dados vêm do cache do DB
async function getEventPage() {
  const logs = await db.battle_logs.findMany({
    where: { event_id: 'mad-monkey-2024' },
    orderBy: { timestamp: 'desc' },
    take: 50 // Últimos 50 logs
  });

  return { logs, bossHp, participants: 87 };
}
```

#### Opção 2: Client-Side Polling (Backup)
```typescript
// Se por algum motivo precisar fazer client-side
const CLIENT_SAFE_POLLING = {
  usersPerMinute: 15, // Bem abaixo do limite
  cycleTime: 87 / 15, // ~6 minutos para cycle completo
  requestsPerHour: 15 * 60, // 900 requests/hora (18% do limite)
  safetyMargin: 0.8 // 80% do limite máximo
};
```

### Event Time Management
```typescript
// Usando Temporal para timezone-aware events
const eventSchedule = {
  timezone: 'America/Sao_Paulo',
  startDate: '2024-12-01T00:00:00',
  endDate: '2024-12-07T23:59:59',

  // Períodos especiais
  rushHours: [
    { start: '09:00', end: '12:00' }, // Manhã
    { start: '14:00', end: '18:00' }  // Tarde
  ],

  // Eventos automáticos
  dailyMilestones: ['12:00', '20:00'], // Meio-dia e noite
  weekendBonus: true // Sábado e domingo = 2x damage
};
```

## Próximos Passos

### Decisões Técnicas Necessárias
1. **Data do evento**: Quando começar/terminar?
2. **Temporal API**: Instalar polyfill ou aguardar suporte nativo?
3. **Background jobs**: Usar cron, queue workers ou serverless?
4. **Frontend polling**: 30s, 60s ou adaptativo?

### Implementação Recomendada (Server-Side First)

1. **Fase 1 MVP** (Esta semana):
   - Database schema para eventos e battle_logs
   - Background job básico (cron/queue) para GitHub polling
   - UI do chat de batalha com dados do DB
   - API endpoints para buscar logs localmente

2. **Fase 2 Real-Time** (Próxima semana):
   - GitHub polling otimizado (3min interval, 2.3% rate limit)
   - Sistema de cache inteligente por participante
   - Algoritmo de damage e detection de combos
   - Frontend polling do DB local (10s interval)

3. **Fase 3 Polish** (Semana seguinte):
   - Eventos especiais automáticos (milestones)
   - Animações e feedback visual em tempo real
   - Sistema de leaderboard e estatísticas

### Questões para Decidir
- **Período do evento**: 7 dias? 2 semanas?
- **Boss HP**: 10.000? 100.000? Baseado em participantes?
- **Timezone**: Sempre São Paulo ou detectar do usuário?
- **Repositórios**: Monitorar todos os repos públicos ou filtrar?

**Ready para começar a implementação? 🚀**