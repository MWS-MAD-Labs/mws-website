# MWS Website

Website dan CMS untuk Millennia World School.

## Stack

- Client: React, TypeScript, Vite, Tailwind, Bun.
- Server: Bun, Hono, Prisma, PostgreSQL, Zod.
- Storage: MinIO/S3-compatible storage for gallery and news media.
- Auth: Google OAuth plus Central identity lookup for CMS access.

## Local Development

Start local services:

```bash
docker compose up -d db minio
```

Run the server:

```bash
cd server
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate:dev
bun run dev
```

Run the client:

```bash
cd client
bun install
bun run dev
```

Default URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:4004`
- Health check: `http://localhost:4004/health`

## CMS

CMS routes live under `/admin`. CMS login uses Google OAuth, then the server resolves the signed-in account against Central. Local CMS access is controlled by `CmsUser` and `CmsRole`.

Roles:

- `SUPER_ADMIN`: explicit MAD Labs CMS administrator, configured through bootstrap allowlist or existing CMS user records.
- `ADMIN`: invited/approved CMS editor.

Implemented CMS areas include News, Gallery Library, Home Hero, Admissions, Our School, Community Stories, Contact Page, Academic level pages, and CMS User Management.

## Environment

Use `server/.env.example` as the source of required server variables. Production must provide real values for JWT, Google OAuth, Central API, database, and MinIO settings.

`docker-compose.yml` is local-only. Its default database and MinIO credentials are not production credentials.

## Verification

```bash
cd server && bun run db:validate
cd server && bun run typecheck
cd server && bun test
cd client && bun run typecheck
cd client && bun run lint
cd client && bun run build
```
