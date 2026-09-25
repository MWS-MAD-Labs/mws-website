# MWS Website Backend

Bun + Hono backend for the MWS public site and CMS.

## Setup

```bash
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate:dev
bun run dev
```

Default server: `http://localhost:4004`

Health check: `GET /health`

## Required Environment

See `.env.example` for:

- `DATABASE_URL`, `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `CENTRAL_API_BASE_URL`, `CENTRAL_API_TOKEN`
- Google OAuth variables
- `CMS_BOOTSTRAP_SUPER_ADMIN_EMAILS` or `CMS_BOOTSTRAP_SUPER_ADMIN_CENTRAL_IDS`
- MinIO settings

Do not use placeholder or local docker-compose credentials in production.

## Auth and CMS Access

CMS authentication uses Google OAuth for sign-in and Central for identity verification. Every CMS request validates the local session and refreshes Central identity with a short cache for content routes. User-management routes require a fresh Central lookup.

CMS roles are:

- `SUPER_ADMIN`: can manage CMS users.
- `ADMIN`: can manage content.

New admins must be invited or explicitly bootstrapped. MAD Labs membership alone does not create SUPER_ADMIN access.

## Main APIs

Public:

- `GET /api/pages/home`
- `GET /api/pages/admissions`
- `GET /api/pages/academic`
- `GET /api/pages/academic/:levelKey`
- `GET /api/pages/our-school`
- `GET /api/pages/community-stories`
- `GET /api/pages/contact`
- `POST /api/contact/inquiries`
- `GET /api/news`
- `GET /api/news/:slug`
- `GET /api/gallery-images/:id/file`

CMS:

- `/admin/news`
- `/admin/galleries`
- `/admin/hero-slides`
- `/admin/admissions`
- `/admin/academic-levels`
- `/admin/community-stories`
- `/admin/our-school`
- `/admin/contact-page`
- `/admin/users`

The legacy generic CRUD resource list is intentionally not exposed.

## Scripts

- `bun run dev`
- `bun run start`
- `bun run typecheck`
- `bun run test`
- `bun run db:validate`
- `bun run db:generate`
- `bun run db:migrate:dev`
- `bun run db:migrate`
- `bun run db:studio`
