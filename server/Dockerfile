FROM oven/bun:1

WORKDIR /app

COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

RUN bun run db:generate

USER bun
EXPOSE 4004

CMD ["bun", "run", "src/index.ts"]
