# Project TODO (source of truth)

- [x] Replace Kalshi endpoints with authenticated/public feeds and persist markets (falls back to stub on failure).
- [x] Add `/markets/refresh` endpoint and worker refresh before resolution.
- [x] UI refresh: navigation, WalletMultiButton, glass styling on home/dashboard/markets/challenges/admin.
- [ ] Wire frontend challenge creation/join/deposit flows to real on-chain transactions (wallet-signed) and persist PDAs/tx signatures in Postgres.
- [ ] Implement queue-driven resolution pipeline (worker consuming Kalshi resolutions, enqueue resolve jobs with side + tx data).
- [ ] Secure SIWS JWT (rotating secret/refresh), add `/auth/me` guard and web middleware; gate admin routes with role.
- [ ] Role-based access control so only oracle authority can hit `/resolution` routes; audit logging for admin actions.
- [ ] API integration tests: SIWS, markets cache/refresh, challenge CRUD, deposits, resolution.
- [ ] Add schema changes for treasury fee percentages and SPL-token support; extend program for SPL vaults and configurable fees.
- [ ] Add cancel/refund flows in UI calling on-chain `cancel`; surface deposit/resolve tx signatures in UI.
- [ ] Harden program: vault PDA sizing, unit tests for account sizes, SPL support stubs.
- [ ] Improve UX polish: toasts, optimistic updates, loading states, better error surfaces.
- [ ] Production hardening: Dockerfiles/CI (lint, typecheck, anchor test, API test), env validation, logging/metrics.
- [ ] Oracle authority key management: document KMS/HSM use, rotation across environments.
