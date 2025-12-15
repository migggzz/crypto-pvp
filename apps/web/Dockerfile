FROM node:20-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable
# Install all deps (dev + prod) for build
RUN pnpm install --frozen-lockfile=false
WORKDIR /app/apps/web
RUN pnpm build
# Prune to production deps to shrink runtime image
WORKDIR /app
RUN pnpm prune --prod

FROM node:20-slim AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/web /app/apps/web
EXPOSE 3000
CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
