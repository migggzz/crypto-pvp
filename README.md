# kalshi-solana-pvp

PvP binary outcome challenges backed by a Solana escrow program, with Kalshi markets as the oracle signal. Users authenticate with Sign-In With Solana (SIWS) and escrow SOL into a program-controlled vault. An admin “oracle authority” finalizes outcomes and triggers payouts for the MVP.

## Stack
- pnpm workspaces
- Frontend: Next.js 14 (App Router, TypeScript), Solana wallet adapter, SIWS
- API: Fastify (TypeScript), Postgres (Prisma), Redis worker for Kalshi polling + resolution queue
- On-chain: Anchor program controlling escrow vaults (SOL)
- Local dev: docker-compose (postgres, redis), solana-test-validator, anchor deploy

## Quickstart
```bash
pnpm install
cp .env.example .env
docker compose up -d --build
pnpm anchor:local    # spins up local validator + deploys program
pnpm dev             # runs web (3000) + api (8000)
```

## Environment
Set the variables in `.env.example` before running. Do not commit real secrets. In production, store the oracle authority keypair in KMS/HSM; never on disk in plaintext.

### Domains (current)
- Web: `https://idareyou.ainanosolutions.com`
- API: `http://apiidareyou.ainanosolutions.com`
- The app is currently HTTP end-to-end for tunneling; TLS will be offloaded by Traefik/Coolify or Cloudflare later. Adjust `WEB_ORIGIN`, `API_ORIGIN`, and `NEXT_PUBLIC_API_BASE` in `.env` if the domains change.

## Docker services
- Postgres: 5432
- Redis: 6379
- API: 8000
- Web: 3000

## Testing
- `pnpm -C programs/escrow test` runs Anchor tests for challenge lifecycle.
- `pnpm -C apps/api test` placeholder (add tests as APIs stabilize).

## Notes
- Kalshi market fetching is stubbed with static data until official endpoints are confirmed (see docs/TODO.md).
- MVP uses SOL-only escrow; SPL token support is a TODO.
