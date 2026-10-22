# Completely Free Tech Stack

## Decision

Use a **local-first, no-credit-card-required** stack. Cloud deployment is optional. The final Ring demo must not depend on a paid service or a fragile hosted database.

## Core stack

- **Language:** TypeScript
- **Runtime:** Node.js 22 LTS
- **Frontend:** React + Vite
- **Backend:** Fastify, or a minimal Node HTTP server if Fastify is unnecessary
- **Validation:** Zod
- **Persistence:** SQLite locally via `better-sqlite3`; keep retention minimal
- **Tests:** Vitest
- **Browser tests:** Playwright
- **Accessibility tests:** axe-core with Playwright
- **Formatting/linting:** Prettier + ESLint
- **Source control/CI:** GitHub + GitHub Actions free tier
- **Ring integration:** Official Ring developer API, SDK, simulator, or device path available to the participant
- **Development agent:** Google Antigravity public-preview/free individual access, subject to its current terms and limits

## Free providers instead of Supabase

### Option A — Recommended for judging

Run the backend and SQLite locally. This is the most reliable and fully free path. It avoids hosted secrets, vendor outages, and deployment configuration during the demo.

### Option B — Optional web preview

- **Frontend hosting:** Cloudflare Pages free plan
- **Backend:** Cloudflare Workers free plan
- **Small event store:** Cloudflare D1 free allocation, if needed
- **Repository/CI:** GitHub free plan

Use Cloudflare only for a shareable preview or backup. Keep a local run command in the README because free-tier quotas and account requirements can change.

## Explicitly excluded

- Supabase.
- Paid AI APIs.
- Paid database plans.
- Stripe or other payment services.
- Production claims based on free-tier quota assumptions.
- AWS Bedrock in the base build. Bedrock may be useful for the AWS Builder mini challenge, but it is not guaranteed to be completely free. Do not add it unless the participant has confirmed credits and accepts that it changes the cost model.

## Why this stack supports winning

It maximizes demo reliability, keeps the security boundary simple, makes the core behavior testable offline, and lets judges inspect ordinary source code without hidden hosted dependencies. Cloudflare and GitHub provide optional free deployment and collaboration without making them prerequisites.
