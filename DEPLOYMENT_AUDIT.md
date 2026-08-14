# Traderstape Deployment Audit

**Date:** 2026-08-08  
**Auditor:** Kilo  
**Scope:** Deployment process, configuration management, CI/CD setup

---

## Executive Summary

The project has a functional but fragile deployment pipeline. The most critical issue is **configuration drift between `wrangler.jsonc` and the Cloudflare dashboard**, which directly caused the `MAINTENANCE_MODE` revert incident today. There is no CI/CD gate, no automated testing before deploy, and the build script lacks a cache-cleaning step that is required for reliable OpenNext deploys on Windows.

| Issue | Severity | Fix Effort |
|-------|----------|------------|
| `MAINTENANCE_MODE` drift between wrangler.jsonc and dashboard | **High** | Quick |
| No clean step in deploy script — stale `.open-next` cache causes failed/skipped deploys | **High** | Quick |
| No CI/CD — manual deploys with no build/test gate | **High** | Medium |
| Missing `.dev.vars.example` template | Medium | Quick |
| Duplicate AI secrets in Cloudflare dashboard (`CF_WORKERS_AI_*` vs `WORKERS_AI_*`) | Medium | Quick |
| `TURSO_AUTH_TOKEN` secret exists in dashboard but unused in code | Low | Quick |
| No documented rollback procedure | Medium | Quick |
| No documented secret rotation process | Medium | Quick |
| Windows-specific OpenNext warning unverified | Low | Medium |

---

## 1. Configuration Source of Truth

### wrangler.jsonc Inventory

| Setting | Type | Value | Version-Controlled? |
|---------|------|-------|---------------------|
| `name` | Worker name | `traderstape1new` | ✅ |
| `main` | Entry point | `.open-next/worker.js` | ✅ |
| `compatibility_date` | Date | `2026-07-23` | ✅ |
| `compatibility_flags` | Array | `nodejs_compat`, `global_fetch_strictly_public` | ✅ |
| `rules` | Build rules | Wasm globs | ✅ |
| `assets.directory` | Static assets | `.open-next/assets` | ✅ |
| `assets.binding` | Asset binding | `ASSETS` | ✅ |
| `services[0].binding` | Self-reference | `WORKER_SELF_REFERENCE` | ✅ |
| `services[0].service` | Service name | `traderstape1new` | ✅ |
| `images.binding` | Image optimization | `IMAGES` | ✅ |
| `d1_databases[0].binding` | D1 binding name | `traderstape` | ✅ |
| `d1_databases[0].database_name` | D1 name | `traderstape` | ✅ |
| `d1_databases[0].database_id` | D1 ID | `4ae004b2-f472-4663-94ba-1968a2c644cc` | ✅ |
| `d1_databases[0].remote` | Remote flag | `true` | ✅ |
| `vars.MAINTENANCE_MODE` | Env var | `"false"` | ✅ |
| `triggers.crons` | Cron schedule | `0 * * * *` | ✅ |
| `kv_namespaces[0].binding` | KV binding name | `RATE_LIMIT` | ✅ |
| `kv_namespaces[0].id` | KV ID | `baeaa4d539a84c639ebf43b356c6e44f` | ✅ |
| `kv_namespaces[0].remote` | Remote flag | `true` | ✅ |

### Cloudflare Dashboard Drift

Confirmed via `npx wrangler deployments list`:

| Variable | In wrangler.jsonc? | In Dashboard? | Drift? |
|----------|-------------------|---------------|--------|
| `MAINTENANCE_MODE` | ✅ `"false"` | ❌ **Deleted** on 2026-08-07T08:49:04.739Z | **YES — dashboard wins on deploy** |
| `AUTH_SECRET` | ❌ | ✅ | Dashboard-only (correct) |
| `AUTH_URL` | ❌ | ✅ | Dashboard-only (correct) |
| `CF_WORKERS_AI_ACCOUNT_ID` | ❌ | ✅ | Dashboard-only |
| `CF_WORKERS_AI_API_TOKEN` | ❌ | ✅ | Dashboard-only |
| `COINGECKO_API_KEY` | ❌ | ✅ | Dashboard-only |
| `TURSO_AUTH_TOKEN` | ❌ | ✅ | Dashboard-only (unused in code) |
| `WORKERS_AI_ACCOUNT_ID` | ❌ | ✅ | Dashboard-only |
| `WORKERS_AI_API_TOKEN` | ❌ | ✅ | Dashboard-only |

**Critical finding:** `MAINTENANCE_MODE` exists in `wrangler.jsonc` as a `var`, but was **deleted from the Cloudflare dashboard** on 2026-08-07. When `opennextjs-cloudflare deploy` runs, it pushes `wrangler.jsonc` vars to the dashboard. If the dashboard has a conflicting state, the deploy message shows `"Deleted variable: MAINTENANCE_MODE"` — meaning the deploy **overwrites** the dashboard state with wrangler.jsonc, or vice versa depending on tool behavior. This is exactly the revert behavior observed today.

### Recommendations

| Setting | Location | Rationale |
|---------|----------|-----------|
| `MAINTENANCE_MODE` | **Move to `wrangler.jsonc` `vars` only** — remove from dashboard | Version-controlled, reproducible. Current drift is the root cause of today's incident. |
| `AUTH_SECRET`, `AUTH_URL` | **Dashboard secrets** (`wrangler secret put`) | Auth credentials must not be in git. |
| `WORKERS_AI_ACCOUNT_ID`, `WORKERS_AI_API_TOKEN` | **Dashboard secrets** | Cloudflare AI credentials. |
| `COINGECKO_API_KEY` | **Either** — but if in `wrangler.jsonc`, it must be a placeholder, not a real key | Currently in both `.dev.vars` and dashboard. Pick one source of truth. |
| `CF_WORKERS_AI_ACCOUNT_ID`, `CF_WORKERS_AI_API_TOKEN` | **Delete from dashboard** — duplicates of `WORKERS_AI_*` | Redundant; code uses `WORKERS_AI_*` only. |
| `TURSO_AUTH_TOKEN` | **Delete from dashboard** or document usage | Secret exists but no code references it. Dead secret. |
| `CRON_SECRET` | **Dashboard secret** | Used in cron route; currently only checked via `process.env.CRON_SECRET`. |
| `NEXTJS_ENV` | `.dev.vars` only | Dev-only; not needed in production. |

---

## 2. Secrets Management

### Secrets Inventory

| Secret | Source | Used In Code | Notes |
|--------|--------|--------------|-------|
| `AUTH_SECRET` | Cloudflare secret | `next-auth` (via `auth.ts`) | Required for JWT signing |
| `AUTH_URL` | Cloudflare secret | `next-auth` | Required for callback URLs |
| `WORKERS_AI_ACCOUNT_ID` | Cloudflare secret | `src/lib/ai/cloudflare.ts:22`, `src/lib/ai/provider.ts:85` | Cloudflare AI |
| `WORKERS_AI_API_TOKEN` | Cloudflare secret | `src/lib/ai/cloudflare.ts:23`, `src/lib/ai/provider.ts:86` | Cloudflare AI |
| `COINGECKO_API_KEY` | `.dev.vars` + Cloudflare secret | `src/lib/market/providers/coingecko.ts:76` | Dual source — pick one |
| `CRON_SECRET` | `.dev.vars` only (⚠️) | `src/app/api/cron/news-roundup/route.ts:15` | **Not in Cloudflare secrets** — will be `undefined` in production |
| `CURRENCY_API_KEY` | `.dev.vars` only | `src/lib/market/providers/currency-api.ts:83` | Not in Cloudflare secrets |
| `TURSO_AUTH_TOKEN` | Cloudflare secret only | **Not referenced in code** | Dead secret |
| `CF_WORKERS_AI_ACCOUNT_ID` | Cloudflare secret | **Not referenced in code** | Duplicate/dead |
| `CF_WORKERS_AI_API_TOKEN` | Cloudflare secret | **Not referenced in code** | Duplicate/dead |

### Critical Gap: `CRON_SECRET` Not in Production

The cron route at `src/app/api/cron/news-roundup/route.ts:15` checks:
```typescript
if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
```

In production (Cloudflare Workers), `process.env.CRON_SECRET` is **not set** because:
- It is not in `wrangler.jsonc` `vars`
- It is not a Cloudflare secret

The `&&` short-circuit means the check is **always skipped in production**. Anyone who knows the endpoint URL can trigger the cron. **This is a security vulnerability.**

### .gitignore Status

```
.env*
.dev.vars*
!.dev.vars.example
```

`.dev.vars` is correctly excluded. However, `.dev.vars.example` is referenced in `.gitignore` but **does not exist in the repo**. New developers have no template for required local secrets.

### Hardcoded Secrets

**None found.** No API keys, tokens, or passwords are hardcoded in source files.

### Secret Rotation Procedure

**Not documented anywhere in the repo.** Current implied process:
1. Update `.dev.vars` locally
2. Run `npx wrangler secret put SECRET_NAME` for each Cloudflare secret
3. Redeploy with `npm run deploy`

**Recommended documented procedure:**
```markdown
## Rotating a Secret

1. Update the value in `.dev.vars` (local development)
2. Run `npx wrangler secret put SECRET_NAME` and enter the new value
3. If the secret is referenced in `wrangler.jsonc` vars, update it there too
4. Run `npm run deploy` to push changes
5. Verify the secret is set: `npx wrangler secret list`
```

---

## 3. Build Process Reliability

### Current Deploy Script

```json
"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
```

### The Stale Cache Problem

On Windows, the OpenNext build output is written to `.open-next/`. If this directory is not cleaned before building, the deploy tool may:
- Detect no changed asset files and skip re-uploading worker code
- Upload stale worker code even when source has changed
- Fail with "Could not find compiled Open Next config" if the cache is corrupted

**Today's incident:** Stale `.open-next` cache required manual deletion before a successful deploy. This is not a bug in OpenNext — it is expected caching behavior, but the deploy script does not account for it.

### Why `npx wrangler deploy` Fails

The project uses `opennextjs-cloudflare deploy` (not raw `wrangler deploy`). The `opennextjs-cloudflare` wrapper:
1. Reads `.open-next/worker.js` as the entry point
2. Uploads `.open-next/assets/` as static assets
3. Creates/updates the Worker binding to the assets

If `.open-next/` is stale or missing, step 1 fails with "Could not find compiled Open Next config". The fix is always `rimraf .open-next && npm run deploy`.

### Proposed Deploy Script

```json
{
  "scripts": {
    "clean": "rimraf .open-next",
    "build": "next build",
    "predeploy": "npm run clean && npm run build",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "deploy:clean": "npm run clean && npm run deploy"
  }
}
```

**Recommendation:** Replace `"deploy"` with `"deploy:clean"` or make `predeploy` the default. The clean step adds ~5-10 seconds but eliminates the stale-cache failure mode entirely.

---

## 4. Environment Parity

### Local vs Production Drift

| Component | Local | Production | Drift? |
|-----------|-------|------------|--------|
| **D1 Database** | Local SQLite via Prisma | Remote D1 (`4ae004b2-f472-4663-94ba-1968a2c644cc`) | Schema drift exists (migrations out of sync) |
| **KV Namespace** | None | `RATE_LIMIT` (`baeaa4d539a84c639ebf43b356c6e44f`) | Rate limiting disabled locally |
| **Assets Binding** | Next.js dev server | Cloudflare `ASSETS` | Different static file serving |
| **Image Optimization** | Next.js default | Cloudflare `IMAGES` | Different implementation |
| **MAINTENANCE_MODE** | `.dev.vars`: `false` | Dashboard: **deleted** | **YES — root cause of today's incident** |
| **COINGECKO_API_KEY** | `.dev.vars`: real key | Cloudflare secret: real key | Dual source — inconsistent |
| **Workers AI** | Not available locally | Cloudflare AI | Feature unavailable in dev |
| **Cron Secret** | `.dev.vars`: set | Not set anywhere | Cron auth bypassed in production |

### Windows-Specific OpenNext Warning

The build output shows:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

This is a Next.js 16 deprecation warning, **not** a Windows-specific OpenNext issue. It is noise but should be addressed by migrating `src/middleware.ts` to `src/proxy.ts` per Next.js 16 conventions.

No evidence of Windows-specific deploy failures was found in deployment history. All recent deployments succeeded.

---

## 5. Rollback Strategy

### Deployment History

```
2026-08-07T08:12:49  af313709  Unknown (deployment)
2026-08-07T08:15:13  322cc9fa  Unknown (deployment)  [Updated MAINTENANCE_MODE]
2026-08-07T08:46:55  45999da3  Unknown (deployment)
2026-08-07T08:49:07  4340553d  Unknown (deployment)  [Deleted MAINTENANCE_MODE]
2026-08-07T08:54:26  9b597805  Unknown (deployment)
2026-08-07T09:01:41  c28f82ed  Unknown (deployment)
2026-08-07T09:29:32  9b405d14  Unknown (deployment)
2026-08-07T09:37:53  8695f823  Unknown (deployment)
2026-08-07T10:32:47  b1d43825  Unknown (deployment)
2026-08-07T10:39:08  249c4bf5  Unknown (deployment)
```

All sources show `"Unknown (deployment)"` — meaning all deploys were done via the Cloudflare dashboard or CLI, not CI/CD. There is no commit SHA or tag associated with any version.

### Current Rollback Options

1. **`npx wrangler rollback`** — Roll back to the previous deployment version. Available but undocumented.
2. **Redeploy previous git commit** — `git checkout <hash> && npm run deploy`
3. **Dashboard rollback** — Cloudflare dashboard shows deployment history with rollback button

**No tested rollback procedure exists.**

### Pre-Deploy Checklist (Recommended)

```markdown
## Pre-Deploy Checklist

- [ ] Run `npm run build` locally — confirm TypeScript passes
- [ ] Run `npm run lint` — confirm no new lint errors
- [ ] Check `MAINTENANCE_MODE` state — ensure it matches desired production state
- [ ] Verify `wrangler.jsonc` vars match dashboard (run `npx wrangler secret list`)
- [ ] Check for new D1 migrations in `migrations/` — apply if needed
- [ ] Confirm `.open-next/` will be regenerated (run `npm run clean` first)
- [ ] Verify no hardcoded secrets in diff (`git diff`)
```

---

## 6. CI/CD Gap Analysis

### Current State

- **Deploy method:** Manual PowerShell terminal on Windows
- **Build verification:** None before deploy
- **Automated tests:** None
- **Type checking:** Only done locally if remembered
- **Linting:** Only done locally if remembered

### Risks

| Risk | Impact | Likelihood |
|------|--------|------------|
| Deploy with TypeScript errors | Runtime crashes | Medium |
| Deploy with broken migration | Data loss / query failures | Medium |
| Deploy with wrong MAINTENANCE_MODE | Site goes dark or leaks content | High (happened today) |
| Deploy with stale cache | Old code runs in production | Medium |
| Deploy from wrong branch | Wrong code in production | Low-Medium |

### Proposed GitHub Actions Workflow

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      
      - name: Check for uncommitted migrations
        run: |
          if git diff --name-only HEAD~1 | grep -q '^migrations/'; then
            echo "::warning::Migrations detected — verify they are applied to remote D1"
          fi
      
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

**Feasibility:** High. The project already uses `wrangler` and `opennextjs-cloudflare`. The main blocker is the Windows-specific build cache issue — the workflow should run on `ubuntu-latest` which avoids that problem.

---

## Top 3 Highest-Priority Fixes

### 1. Fix MAINTENANCE_MODE Drift (Quick)

**Problem:** `MAINTENANCE_MODE` exists in `wrangler.jsonc` but was deleted from the Cloudflare dashboard. Deploys overwrite or conflict with dashboard state, causing the site to unexpectedly enter/exit maintenance mode.

**Fix:**
- Remove `MAINTENANCE_MODE` from any dashboard overrides
- Keep it only in `wrangler.jsonc` `vars` (version-controlled)
- Document that `MAINTENANCE_MODE` is controlled exclusively via code changes + deploys
- For emergency toggling without deploy, use `wrangler secret put MAINTENANCE_MODE` or dashboard, but understand it will be overwritten on next deploy

### 2. Add Clean Step to Deploy Script (Quick)

**Problem:** Stale `.open-next/` cache causes deploys to fail or skip uploading changed code.

**Fix:** Update `package.json`:
```json
{
  "scripts": {
    "clean": "rimraf .open-next",
    "predeploy": "npm run clean && npm run build",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  }
}
```

Add `rimraf` as a devDependency if not present: `npm install -D rimraf`

### 3. Set CRON_SECRET in Production (Quick)

**Problem:** `CRON_SECRET` is only in `.dev.vars`. In production, `process.env.CRON_SECRET` is `undefined`, so the cron auth check is **always skipped**. Anyone can hit `/api/cron/news-roundup` and trigger AI-generated content creation.

**Fix — manual CLI step (cannot be automated in code):**
```bash
npx wrangler secret put CRON_SECRET --name=traderstape1new
```

After setting, redeploy. The route now uses fail-closed logic:
```typescript
if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
  return new NextResponse("Unauthorized", { status: 401 });
}
```

**Invocation mode note:** The cron route is HTTP-only. `wrangler.jsonc` declares `triggers.crons: ["0 * * * *"]`, but OpenNext on Cloudflare generates a Worker with only a `fetch()` handler — there is no `scheduled()` export in this codebase. Cloudflare's native cron triggers invoke `scheduled()`, not `fetch()`, so the configured trigger is effectively dead. To actually run on a schedule, use an external cron service (e.g., cron-job.org) hitting the route with the `x-cron-secret` header, or add a separate Worker with a `scheduled()` handler that `fetch()`es this endpoint.

---

## Appendix: Configuration Drift Details

### Deploy History with MAINTENANCE_MODE Events

| Timestamp | Version | Event |
|-----------|---------|-------|
| 2026-08-07T08:12:49 | `af313709` | Deploy |
| 2026-08-07T08:15:13 | `322cc9fa` | **Updated variable: MAINTENANCE_MODE** |
| 2026-08-07T08:49:07 | `4340553d` | **Deleted variable: MAINTENANCE_MODE** |
| 2026-08-07T09:01:41 | `c28f82ed` | Deploy |
| ... | ... | ... |

The `MAINTENANCE_MODE` variable was explicitly set and then deleted via the Cloudflare dashboard or CLI between deploys, bypassing `wrangler.jsonc`. This is the mechanism that caused the revert.

### Live D1 Schema Confirmed

`PRAGMA table_info(NewsPost)` on the remote D1 confirms all 4 publishing-flag columns exist:
- `isBreaking` — BOOLEAN NOT NULL DEFAULT false
- `isFeatured` — BOOLEAN NOT NULL DEFAULT false
- `isTrending` — BOOLEAN NOT NULL DEFAULT false
- `isEditorPick` — BOOLEAN NOT NULL DEFAULT false

Migration `0005_add_newspost_publishing_flags.sql` has been added to document this in migration history.