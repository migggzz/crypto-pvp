# Crypto PvP App Overview

## Domains and URLs
- Web app: `https://idareyou.ainanosolutions.com`
- API: `https://api.idareyou.ainanosolutions.com`
- Environment knobs:
  - `.env/.env.example` `WEB_ORIGIN`, `API_ORIGIN`, `NEXT_PUBLIC_API_BASE` control the public web/API domains.
  - API service reads `WEB_ORIGIN` for CORS and `API_JWT_SECRET`, DB/Redis URLs, Solana + Kalshi config.
  - Web uses `NEXT_PUBLIC_API_BASE` for all API calls and `NEXT_PUBLIC_SOLANA_NETWORK`, `NEXT_PUBLIC_PROGRAM_ID` for chain settings.
  - `docker-compose.yml` passes the `NEXT_PUBLIC_API_BASE` env into the web container; change that to switch environments.

## API surface (Fastify)
- `POST /auth/nonce` → returns `{ nonce }` for SIWS.
- `POST /auth/verify` → body `{ publicKey, signature, message }`, returns `{ token }` (JWT). Token must be sent as `Authorization: Bearer <token>`.
- `GET /markets` → returns cached/persisted Kalshi markets (auto-syncs if empty).
- `POST /markets/refresh` → authenticated; refreshes Kalshi markets.
- `GET /challenges` → authenticated; list challenges.
- `GET /challenges/:id` → authenticated; challenge detail.
- `POST /challenges` → authenticated; create challenge `{ ticker, creatorSide, stakeLamports }`.
- `POST /challenges/:id/join` → authenticated; join `{ opponentSide }`.
- `POST /challenges/:id/deposit` → authenticated; deposit `{ lamports }`.
- `POST /resolution/:id` → authenticated (admin/oracle) resolve `{ side }`.
- `GET /health` → basic health check.

## Frontend flow (Next.js 14)
- SIWS login at `/login`: fetch nonce → sign message → verify → JWT stored in `siws_token` cookie.
- API wrapper (`apps/web/src/lib/api.ts`) reads `NEXT_PUBLIC_API_BASE` and adds `Authorization` header when `siws_token` exists.
- Protected pages wrap in `RequireAuth` to gate on SIWS token/wallet presence.
- Markets/challenges UI consume `/markets`, `/challenges`, challenge create/join/deposit, and admin resolve endpoints.

## Data & background services
- Prisma/Postgres for markets/challenges; `prisma:push` seeds schema.
- Redis/BullMQ scaffolded worker (resolution jobs).
- Kalshi markets pulled from `https://api.elections.kalshi.com/trade-api/v2/markets?limit=200` with optional `KALSHI_API_KEY`.
- Solana program config via `PROGRAM_ID`, `ORACLE_AUTHORITY_KEYPAIR`, `TREASURY_PUBKEY`, `SOLANA_RPC_URL`; on-chain TX wiring still TODO.

## Running
- Set `.env` with production domains and credentials.
- `docker compose up --build` (ports: web 3000, api 8000) or deploy images with the same env vars in your platform.
