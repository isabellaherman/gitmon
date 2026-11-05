# Edge protection checklist (Cloudflare / Vercel)

The app now sends short `Cache-Control` headers on the hot public APIs and the middleware
denies unknown API routes by default. The things below need to be switched on in the
dashboards — they can't be done from code. **No secrets are stored in this repo.**

## Cloudflare (if `gitmon.xyz` is proxied through Cloudflare)

1. **Security → Bots → Bot Fight Mode**: ON.
2. **Security → WAF → Rate limiting rules** (one rule is enough to start):
   - If URI path starts with `/api/`
   - Rate: 60 requests / 1 minute per IP
   - Action: Block (or Managed Challenge) for 1 minute
   - Optional second, stricter rule for `/api/leaderboard` and `/api/total-trainers`
     (e.g. 30 req/min/IP) — these are cached at the edge now, so legit users rarely hit origin.
3. **Caching → Cache Rules**: "Respect origin" for `/api/leaderboard*`, `/api/total-trainers`,
   `/api/event-*` so the `s-maxage` headers are honored.

## Vercel

- Make sure `CRON_SECRET` is set for **Production** (and Preview if you want crons/tests there).
  Without it, every cron/sync endpoint now returns 401 (fails closed).
- Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET` to `/api/cron/*`.
- Optional: Vercel Firewall → add the same `/api/*` rate limit if Cloudflare isn't in front.

## Follow-ups (not done in code yet)

- The home auto-sync (`/api/force-sync` on page load) stays **disabled** until a rate limit exists.
- Event sync endpoints still borrow the first stored user OAuth token
  (`prisma.account.findFirst`). They should use a dedicated `GITHUB_TOKEN` instead.
