# TypeScript Errors - Build Failures

## Problema Principal
Os builds da Vercel estão falhando devido a erros de TypeScript relacionados a **parâmetros implícitos com tipo 'any'**.

## Erros Identificados e Correções

### 1. app/api/debug/route.ts:26
**Erro:** `Parameter 'acc' implicitly has an 'any' type.`
```typescript
// ❌ ERRO
const githubAccount = user.accounts.find(acc => acc.provider === 'github');

// ✅ CORREÇÃO
const githubAccount = user.accounts[0]; // Já filtra por GitHub na query
```

### 2. app/api/force-sync/route.ts:37 e :57
**Erro:** `Parameter 'acc' implicitly has an 'any' type.`
```typescript
// ❌ ERRO (duas ocorrências)
const githubAccount = user.accounts.find(acc => acc.provider === 'github');

// ✅ CORREÇÃO
const githubAccount = user.accounts[0]; // Já filtra por GitHub na query
```

### 3. app/api/onboarding/route.ts:47 e :64
**Erro:** `Parameter 'acc' implicitly has an 'any' type.`
```typescript
// ❌ ERRO (duas ocorrências)
const githubAccount = updatedUser.accounts.find(acc => acc.provider === 'github');

// ✅ CORREÇÃO
const githubAccount = updatedUser.accounts[0]; // Já filtra por GitHub na query
```

### 4. app/api/sync-xp/route.ts:50 e :87
**Erro:** `Parameter 'acc' implicitly has an 'any' type.`
```typescript
// ❌ ERRO (duas ocorrências)
const githubAccount = user.accounts.find(acc => acc.provider === 'github');

// ✅ CORREÇÃO
const githubAccount = user.accounts[0]; // Já filtra por GitHub na query
```

### 5. app/api/leaderboard/route.ts:39
**Erro:** `Parameter 'user' implicitly has an 'any' type.` e `Parameter 'index' implicitly has an 'any' type.`
```typescript
// ❌ ERRO
const leaderboard = users.map((user, index) => ({

// ✅ CORREÇÃO
const leaderboard = users.map((user: typeof users[0], index: number) => ({
```

## Por que esses erros acontecem?

1. **find() redundante**: Todos os arquivos já fazem query no Prisma com `where: { provider: 'github' }`, então usar `find()` novamente é desnecessário e causa erro de tipo.

2. **Parâmetros não tipados**: O TypeScript no modo strict requer tipagem explícita para parâmetros de callback.

## Status das Correções
- [x] debug/route.ts - Corrigido
- [x] force-sync/route.ts - Corrigido (2 instâncias)
- [x] onboarding/route.ts - Corrigido (2 instâncias)
- [x] sync-xp/route.ts - Corrigido (2 instâncias)
- [x] leaderboard/route.ts - Corrigido (user e index)

## Total de Erros Corrigidos: 9

Todos os erros que causavam falha no build da Vercel foram identificados e corrigidos.

---

## NOVO ERRO: Prisma Client Not Initialized

### 6. Build Error - Prisma Client
**Erro:** `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`

**Local:** `.next/server/app/api/debug-sync/route.js:1:550`

**Causa:** O Prisma client precisa ser gerado antes do build do Next.js.

**Correção necessária:** Adicionar `prisma generate` ao processo de build da Vercel.

### ✅ CORREÇÃO APLICADA:
Modificado o script `build` no package.json:

```json
// ❌ ANTES
"build": "next build"

// ✅ DEPOIS
"build": "prisma generate && next build"
```

Isso garante que o Prisma client seja gerado antes do build do Next.js na Vercel.