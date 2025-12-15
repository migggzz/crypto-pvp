FROM node:20-bullseye
WORKDIR /app
COPY . .
RUN corepack enable
RUN pnpm install
WORKDIR /app/apps/web
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
