# MWS Website

Website untuk Millennia World School (MWS). Project ini disiapkan sebagai
implementasi frontend dan backend awal untuk landing page sekolah, dengan arah
visual dan struktur konten mengikuti mockup berikut:

**Base mockup:** https://asroralva.github.io/mockup/mockup3/client/index.html

## Gambaran Project

Mockup MWS menampilkan konsep landing page sekolah dengan beberapa area utama:

- Hero section dengan headline utama dan visual aktivitas siswa.
- Shortcut informasi seperti admissions, campuses, academic, dan news.
- Program pembelajaran untuk Kindergarten, Elementary, dan High School.
- Section campus life, learning spaces, partner global, dan testimoni komunitas.
- Widget sederhana bertema `Ask MWS AI`.

README ini dipakai sebagai acuan awal agar pengembangan tetap mengikuti arah
mockup tersebut.

## Tech Stack

### Client

- React
- TypeScript
- Vite
- ESLint
- Bun lockfile tersedia untuk dependency management

### Server

- Bun
- TypeScript
- Hono
- Prisma
- PostgreSQL adapter
- Zod

> Catatan: server saat ini masih berupa bootstrap awal dan belum berisi endpoint
> API lengkap.

## Struktur Folder

```txt
.
├── client/             # Aplikasi frontend React + Vite
│   ├── public/         # Static assets publik
│   └── src/            # Source code frontend
├── server/             # Backend Bun/TypeScript
│   ├── prisma/         # Schema dan migration Prisma
│   └── src/            # Source code backend
└── README.md           # Dokumentasi project
```

## Menjalankan Project

Pastikan Bun sudah terpasang di komputer.

### 1. Jalankan Frontend

```bash
cd client
bun install
bun run dev
```

Vite biasanya akan berjalan di:

```txt
http://localhost:5173
```

### 2. Build Frontend

```bash
cd client
bun run build
```

### 3. Lint Frontend

```bash
cd client
bun run lint
```

### 4. Jalankan Server

```bash
cd server
bun install
cp .env.example .env
bun run dev
```

Backend default berjalan di:

```txt
http://localhost:4002
```

## Arah Implementasi dari Mockup

Saat mengembangkan UI, gunakan mockup sebagai referensi untuk:

- Layout landing page MWS.
- Urutan section halaman.
- Gaya visual yang hangat, modern, dan edukatif.
- Konten utama seputar admissions, campus, academic program, school life, dan
  community stories.
- Komponen interaktif seperti carousel/card navigation dan widget AI.

Konten placeholder dari mockup boleh diganti dengan copy final MWS saat tersedia.

## Catatan Development

- Frontend saat ini masih membawa beberapa asset/template bawaan Vite.
- Backend belum terhubung ke flow frontend.
- Jika nanti ada database, tambahkan konfigurasi environment seperti
  `DATABASE_URL` di file `.env` lokal.
- Jangan commit file environment, cache, atau hasil build seperti `dist/` dan
  `node_modules/`.
