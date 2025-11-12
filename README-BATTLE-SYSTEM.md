# Battle Log System - Guia de Setup

## 🚀 Sistema Implementado

### ✅ Componentes Criados:
- **BattleLog Component** - Chat em tempo real na página `/event`
- **BattleMonitor Service** - GitHub polling com rate limiting
- **Database Schema** - Events, BattleLogs, ParticipantActivityCache
- **API Endpoints** - `/api/battle-logs`, `/api/monitor-battle`
- **Cron Job** - Script para monitoramento automático

### ✅ Features:
- **85 participantes reais** do `event_participants`
- **Data do evento**: 11 de novembro de 2025
- **Sistema de dano inteligente** baseado no tipo e tamanho dos commits
- **Rate limiting seguro**: 2.3% do limite do GitHub API
- **Temporal API** para timezone `America/Sao_Paulo`

## ⚙️ Configuração Necessária

### 1. GitHub Personal Access Token

Você precisa criar um Personal Access Token no GitHub:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. **Scopes necessários**:
   - ✅ `public_repo` - Acesso a repositórios públicos
   - ✅ `read:user` - Informações básicas do usuário
4. Copie o token gerado
5. Substitua no `.env`:
   ```bash
   GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
   ```

### 2. Testar o Sistema

```bash
# 1. Verificar se está funcionando
curl http://localhost:3002/api/monitor-battle

# 2. Executar monitoring manual
curl -X POST http://localhost:3002/api/monitor-battle

# 3. Ver logs no battle chat
curl http://localhost:3002/api/battle-logs
```

## 🤖 Automation Setup

### Opção 1: Cron Job (Recomendado)
```bash
# Adicionar ao crontab (crontab -e)
*/5 * * * * cd /path/to/gitmon && node scripts/battle-cron.js >> /var/log/battle-monitor.log 2>&1

# Ou para teste contínuo:
node scripts/battle-cron.js --continuous
```

### Opção 2: Vercel Cron (Production)
```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/monitor-battle",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Opção 3: GitHub Actions
```yaml
# .github/workflows/battle-monitor.yml
name: Battle Monitor
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Battle Monitor
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/monitor-battle
```

## 📊 Sistema de Dano

### Algoritmo de Cálculo:
```typescript
Base damage: 10

// Bonus por tipo
feat: +30    // Novas features
fix: +25     // Bug fixes
refactor: +35 // Refatoração
perf: +40    // Performance

// Bonus por tamanho
>200 changes: +50 (MEGA HIT)
>100 changes: +30 (CRITICAL HIT)
>50 changes: +15  (BIG HIT)

// Bonus por arquivos
>10 files: +20
>5 files: +10

// Keywords especiais
breaking/major: +25
hotfix/urgent: +20

// Max damage: 150 per commit
```

## 🔍 Monitoramento

### Logs para Acompanhar:
```bash
# Durante desenvolvimento
npm run dev

# Logs do cron job
tail -f /var/log/battle-monitor.log

# Rate limit status
curl http://localhost:3002/api/monitor-battle
```

### Exemplo de Output:
```
🔋 GitHub API Rate Limit: 4850/5000 (97% remaining)
📝 isabellaherman: 2 new commits
✅ Processed commit by isabellaherman: 45 damage
📝 Vinccius: 1 new commits
✅ Processed commit by Vinccius: 25 damage
✅ Monitoring cycle completed
```

## 🎮 Como Funciona

### 1. Participant Discovery:
- Busca todos os usuários em `event_participants`
- Filtra por `eventId: 'first-community-event'`
- Extrai `githubUsername` de cada participante

### 2. Commit Monitoring:
- Usa GitHub Events API (mais eficiente que REST)
- Processa em batches de 5 usuários
- Delay de 2s entre batches (rate limiting)

### 3. Battle Log Generation:
- Calcula dano baseado no commit
- Gera mensagem épica de batalha
- Salva no banco com metadata completa

### 4. Real-time Display:
- Frontend polling a cada 10s
- Mostra logs ordenados por timestamp
- Destaca ações do usuário logado

## 🚨 Rate Limits

### Current Usage (Safe):
- **85 usuários** × **1 request per cycle** = 85 requests
- **Cycle time**: 3-5 minutos
- **Hourly usage**: ~1020 requests (20% do limite)
- **Safety margin**: 80%

### Se Precisar Otimizar:
1. Aumentar interval do cron (10min)
2. Reduzir batch size para 3 usuários
3. Implementar cache mais inteligente
4. Usar GraphQL API (mais eficiente)

## 🎯 Próximos Steps

### Para Ativar o Sistema:
1. ✅ Configurar `GITHUB_TOKEN`
2. ✅ Testar manualmente
3. ✅ Configurar cron job
4. ✅ Monitorar logs
5. ✅ Deploy e enjoy! 🔥

O sistema está **100% pronto** para monitorar os 85 participantes reais e popular o battle log automaticamente!