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
http://localhost:4002
```

Health check:

```txt
http://localhost:4002/health
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
