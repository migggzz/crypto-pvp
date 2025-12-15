FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable
# Install all deps (dev + prod) for build
RUN pnpm install --frozen-lockfile=false
WORKDIR /app/apps/api
RUN pnpm prisma:generate
RUN pnpm build
# Prune to production deps to shrink runtime image
WORKDIR /app
RUN pnpm prune --prod

FROM node:20-bullseye-slim AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
RUN corepack enable
# Ensure prisma native engine has OpenSSL available
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Copy only what we need to run
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/api /app/apps/api
EXPOSE 8000
CMD ["node", "dist/index.js"]
