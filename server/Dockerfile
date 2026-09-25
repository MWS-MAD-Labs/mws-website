FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN bun run db:generate

USER bun
EXPOSE 4004

CMD ["bun", "run", "start"]
