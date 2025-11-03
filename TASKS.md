# 🎮 GitMon - MVP Launch Tasks

## 📊 Status Atual
- ✅ Next.js 15 + TypeScript setup
- ✅ GitHub OAuth (NextAuth.js)
- ✅ Design System (Tailwind CSS 4)
- ✅ Componentes UI básicos
- ✅ Página de Login
- ✅ Página de Onboarding

**Flow atual:** Home → Login → Onboarding → ❌ **FALTA DASHBOARD**

---

## 🚀 PRIORIDADE MÁXIMA - MVP Para Lançar

### 1. **🏠 Landing Page Atrativa**
**Objetivo:** Vender a ideia antes do login
- [ ] Substituir home padrão do Next.js
- [ ] Hero section explicando o conceito
- [ ] Preview do dashboard/leaderboard
- [ ] CTA para "Começar agora"
- [ ] Seção de features principais
- [ ] Footer com links sociais

### 2. **📱 Dashboard Principal**
**Objetivo:** Core da aplicação - onde o usuário fica
- [ ] Layout do dashboard
- [ ] Estatísticas básicas do usuário
- [ ] GitMon avatar + level/XP
- [ ] Resumo de atividade recente
- [ ] Preview do leaderboard
- [ ] Navegação entre seções

### 3. **🎯 Sistema de Pontuação**
**Objetivo:** Gamificar atividade no GitHub
- [ ] Integração com GitHub API
- [ ] Cálculo de XP baseado em:
  - Commits (5-10 XP cada)
  - Pull Requests (50-100 XP)
  - Issues fechadas (25 XP)
  - Repos criados (100 XP)
- [ ] Sistema de levels (Level 1 = 0-100 XP, Level 2 = 100-300 XP, etc.)
- [ ] Persistir dados no banco

### 4. **🏆 Leaderboard Funcional**
**Objetivo:** Competição entre usuários
- [ ] Página dedicada ao ranking
- [ ] Top 10 usuários por XP
- [ ] Posição do usuário atual
- [ ] Filtros por período (semana/mês/total)
- [ ] Cards dos usuários com GitMon + stats

### 5. **💾 Banco de Dados**
**Objetivo:** Persistir dados dos usuários
- [ ] Configurar Prisma + PostgreSQL (ou SQLite para MVP)
- [ ] Schema: Users, GitMons, Activities, Scores
- [ ] Migrations básicas
- [ ] Seed data para testes

---

## 🎨 MELHORIAS VISUAIS (Secundário)

### 6. **🐲 GitMons Assets**
- [ ] Criar/encontrar 3-5 sprites de monstros
- [ ] Implementar seleção funcional no onboarding
- [ ] Sistema de evolução visual (opcional)

### 7. **🏅 Sistema de Conquistas**
**Objetivo:** Mais engajamento
- [ ] Badges básicas:
  - "Primeiro Commit"
  - "Maratonista" (10 commits em um dia)
  - "Contribuidor" (primeiro PR)
  - "Veterano" (30 dias consecutivos)
- [ ] Modal de conquista desbloqueada
- [ ] Página de conquistas

---

## ⚡ FEATURES AVANÇADAS (Futuro)

### 8. **📊 Analytics Avançadas**
- [ ] Gráficos de atividade
- [ ] Comparação com outros usuários
- [ ] Métricas de linguagens mais usadas
- [ ] Streaks de commits

### 9. **👥 Features Sociais**
- [ ] Seguir outros usuários
- [ ] Feed de atividades
- [ ] Comentários e reações
- [ ] Times/grupos

### 10. **🎮 Gamificação Avançada**
- [ ] Batalhas entre GitMons
- [ ] Items e equipamentos
- [ ] Loja virtual
- [ ] Eventos especiais

---

## 📋 CRONOGRAMA SUGERIDO (2-3 semanas)

### **Semana 1: Base Funcional**
- Dias 1-2: Landing Page + melhorar home
- Dias 3-4: Dashboard básico + layout
- Dias 5-7: Sistema de pontuação + GitHub API

### **Semana 2: Gamificação**
- Dias 1-3: Banco de dados + persistência
- Dias 4-5: Leaderboard funcional
- Dias 6-7: GitMons assets + seleção

### **Semana 3: Polish & Launch**
- Dias 1-3: Conquistas básicas
- Dias 4-5: Testes + bugs
- Dias 6-7: Deploy + lançamento

---

## 🔧 SETUP TÉCNICO NECESSÁRIO

### **Banco de Dados**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### **GitHub API**
```bash
npm install @octokit/rest
```

### **Variáveis de Ambiente**
```env
GITHUB_CLIENT_ID=your_github_app_id
GITHUB_CLIENT_SECRET=your_github_app_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

---

## 💡 DICAS PARA VENDER A IDEIA

1. **Demo funcional** - Mesmo básico, precisa funcionar
2. **Mockups visuais** - Mostrar visão do futuro
3. **Métricas sociais** - "X desenvolvedores já estão competindo"
4. **Story telling** - "Transforme seus commits em aventura"
5. **Roadmap público** - Mostrar evolução planejada

---

**🎯 META:** Ter um MVP funcional em 2-3 semanas que demonstre o conceito e gere interesse para investimento/parcerias.