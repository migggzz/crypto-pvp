FROM node:20-bullseye
WORKDIR /app
COPY . .
RUN corepack enable
RUN pnpm install
WORKDIR /app/apps/api
RUN pnpm prisma:generate
RUN pnpm build
EXPOSE 8000
CMD ["pnpm", "start"]
