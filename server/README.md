# MWS Website Backend

Backend Bun + Hono untuk project MWS Website. Struktur ini disiapkan mengikuti
pola backend MWS Hub/Central agar bisa langsung jalan dengan `bun run dev`.

## Setup

Install dependencies:

```bash
bun install
```

Buat file `.env` lokal dari contoh:

```bash
cp .env.example .env
```

Isi `DATABASE_URL` sesuai database lokal saat mulai mengerjakan model/migration.

## Development

```bash
bun run dev
```

Default server:

```txt
http://localhost:4004
```

Health check:

```txt
http://localhost:4004/health
```

## Database Commands

Schema Prisma sudah disiapkan di `prisma/schema.prisma`, tapi model dan
migration sengaja belum dibuat.

```bash
bun run db:validate
bun run db:generate
bun run db:migrate:dev
bun run db:migrate
bun run db:studio
```

## Scripts

- `bun run dev` - menjalankan server dengan hot reload.
- `bun run start` - menjalankan server tanpa hot reload.
- `bun run typecheck` - mengecek TypeScript.
- `bun run test` - menjalankan test Bun.
- `bun run db:*` - helper Prisma untuk validasi, generate, migration, dan studio.

## Admin CRUD API

Endpoint CRUD CMS tersedia di bawah `/admin` dan membutuhkan cookie session
CMS. Semua response memakai JSON dengan envelope konsisten:

```json
{ "data": {} }
```

Error dikembalikan sebagai:

```json
{ "errors": "Pesan error." }
```

Resource yang tersedia:

```txt
/admin/hero-slides
/admin/media-assets
/admin/campuses
/admin/academic-programs
/admin/news-categories
/admin/news-tags
/admin/news-posts
/admin/testimonials
/admin/faq-items
/admin/inquiries
/admin/applications
/admin/application-documents
/admin/tuition-fees
/admin/events
/admin/cms-pages
/admin/settings
```

Contoh cURL:

```bash
curl -X POST http://localhost:4004/admin/campuses \
  -H "Content-Type: application/json" \
  -H "Cookie: mws_cms_session=<token>" \
  -d '{"name":"Main Campus","slug":"main-campus","email":"info@millennia21.id"}'

curl http://localhost:4004/admin/campuses?page=1&pageSize=20 \
  -H "Cookie: mws_cms_session=<token>"

curl http://localhost:4004/admin/campuses/<uuid> \
  -H "Cookie: mws_cms_session=<token>"

curl -X PATCH http://localhost:4004/admin/campuses/<uuid> \
  -H "Content-Type: application/json" \
  -H "Cookie: mws_cms_session=<token>" \
  -d '{"phone":"+62 21-7463-3333"}'

curl -X DELETE http://localhost:4004/admin/campuses/<uuid> \
  -H "Cookie: mws_cms_session=<token>"
```
