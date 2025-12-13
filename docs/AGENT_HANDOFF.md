# Architecture Overview
- Monorepo via pnpm workspaces: `apps/web` (Next.js 14, SIWS, Solana wallet adapter), `apps/api` (Fastify + Prisma + Redis/BullMQ worker), `programs/escrow` (Anchor program managing challenge PDAs and vault PDAs), `packages/shared` (types/constants).
- Escrow program: PDAs `["challenge", creator, challenge_id]` and `["vault", challenge_pda]`; instructions `initialize_challenge`, `join_challenge`, `deposit`, `resolve`, `cancel`. Vault is program-owned system account to hold SOL.
- API: SIWS endpoints (`/auth/nonce`, `/auth/verify` -> JWT). Markets cached via stub `services/kalshi`. Challenges stored in Postgres; deposit/resolution endpoints update DB and attempt on-chain calls via Anchor client (requires IDL + oracle keypair). Worker polls for resolved markets and enqueues resolution jobs.
- Web: Pages for login (SIWS), dashboard, markets, challenges list/detail, admin resolve. Uses wallet adapter + SIWS token stored in cookie.

# Environment Variables
- See `.env.example`: `DATABASE_URL`, `REDIS_URL`, `API_JWT_SECRET`, `WEB_ORIGIN`, `API_ORIGIN`, `KALSHI_BASE_URL`, `SOLANA_RPC_URL`, `PROGRAM_ID`, `ORACLE_AUTHORITY_KEYPAIR`, `TREASURY_PUBKEY`, `ADMIN_PUBLIC_KEY`, `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_SOLANA_NETWORK`, `NEXT_PUBLIC_PROGRAM_ID`.

# How to Run Locally
1) `pnpm install`
2) `cp .env.example .env` and fill values.
3) `pnpm -C apps/api prisma:generate && pnpm -C apps/api prisma:push`
4) `docker compose up -d --build` (brings postgres, redis, api, web)
5) `pnpm anchor:local` to run local validator + deploy program (requires Anchor CLI)
6) `pnpm dev` to run web (3000) + api (8000) locally.
7) Anchor tests: `pnpm -C programs/escrow test`

# Current Known TODOs
- Kalshi market fetch is stubbed; replace with real endpoints and auth.
- Frontend deposit/join/create flows do not yet craft/sign Solana transactions; API assumes chain actions handled separately.
- API resolution auth is loose (env-based); RBAC and audit logging needed.
- Worker queue is skeletal; no reliable scheduling/backoff implemented.
- Oracle authority key management is not production hardened; ensure KMS/HSM use.

# Next 3 Tasks
1) Implement real Kalshi market ingestion and replace stubbed data; add refresh endpoint + cron/worker job.
2) Wire frontend actions to on-chain transactions (initialize/join/deposit) and persist tx signatures in Postgres.
3) Harden resolution pipeline with RBAC, better job processing, and production-ready docker/CI workflows (lint/test/anchor test).
