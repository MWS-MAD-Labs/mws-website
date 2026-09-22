# Backend Review: Public News & News Detail

Tanggal review: 21 September 2026

## Kesimpulan

Backend News **belum siap langsung diintegrasikan** ke halaman user `News` dan `News Detail`.

Fondasi database dan CRUD admin News yang baru sudah cukup baik, tetapi masih ada beberapa blocker:

1. Belum ada API News publik di bawah `/api`.
2. API yang ada hanya `/admin/news/...`, dilindungi session admin dan permission `content:manage`.
3. Detail post hanya bisa dicari dengan UUID, sedangkan URL halaman user seharusnya memakai slug.
4. Query yang ada belum menjamin hanya artikel yang benar-benar sudah tayang yang bisa dibaca user.
5. Backend saat ini gagal `npm run typecheck` karena modul News lama masih memakai field database yang sudah dihapus.
6. Migrasi News terbaru tidak aman jika tabel `NewsPost` sudah berisi data.
7. Format `content` belum mempunyai kontrak yang cukup tegas untuk desain News Detail saat ini.
8. Belum ada test khusus untuk API dan aturan publikasi News.

Dengan kondisi sekarang, frontend publik jangan memakai endpoint admin sebagai jalan pintas. Endpoint publik perlu disiapkan dan masalah kompatibilitas backend perlu dibereskan lebih dulu.

## Scope yang diperiksa

- Prisma schema dan migration News.
- Model/validation Zod.
- Repository News.
- Service News.
- Controller dan route admin News.
- Mounting route publik `/api` dan middleware autentikasi.
- Format response JSON dan error.
- Modul lama yang masih memakai `NewsPost`.
- Form News admin yang menghasilkan data untuk halaman publik.
- Kebutuhan data UI saat ini di:
  - `client/src/pages/news/school-news.tsx`
  - `client/src/pages/news/news-detail.tsx`
  - `client/src/app/App.tsx`

## Hasil review per layer

### 1. Database dan Prisma schema

Bagian yang sudah tersedia:

- `NewsPost` sudah memiliki title, slug unik, excerpt, cover image, content JSON, author/byline, category, status, featured flag, tanggal publikasi, SEO, read time, dan view count.
- Relasi category, tags, author, dan media sudah tersedia.
- Slug diberi unique constraint, sehingga cocok dijadikan identifier URL publik.
- `authorId` memakai foreign key ke `CmsUser`, sementara `authorName` dapat menjadi snapshot/byline yang tetap tampil jika akun author sudah tidak ada.
- Relasi category memakai `ON DELETE SET NULL`, sehingga penghapusan kategori tidak ikut menghapus artikel.

Masalah yang perlu diselesaikan:

#### Blocker: migration penambahan News tidak aman untuk data lama

File `server/prisma/migrations/20260921024708_add_news_models/migration.sql` langsung:

- menghapus `imagePath`, `imageAlt`, dan `galleryId`;
- menambahkan `content JSONB NOT NULL` tanpa default/backfill;
- memperkecil `title` dan `slug` dari 500 menjadi 255 karakter.

Jika `NewsPost` sudah berisi row, penambahan `content NOT NULL` tanpa nilai awal dapat membuat migration gagal. Jika migration berhasil pada tabel kosong, field gambar/gallery lama tetap hilang. Untuk database yang sudah berisi data, migration perlu strategi bertahap:

1. Tambahkan field baru sebagai nullable atau dengan default sementara.
2. Salin `imagePath` ke `coverImage` dan `imageAlt` ke `coverImageAlt`.
3. Tentukan migrasi untuk `galleryId`—misalnya pilih gambar pertama sebagai cover atau simpan relasi sampai migrasi data selesai.
4. Isi `content` untuk record lama.
5. Validasi panjang title/slug sebelum mengubah tipe.
6. Baru jadikan `content` wajib dan hapus field lama.

Status migration pada database lokal belum bisa dikonfirmasi. `npx prisma migrate status` berhenti dengan `Schema engine error` saat mengakses PostgreSQL lokal. Jadi review ini memverifikasi file schema/migration, bukan memastikan keadaan database yang sedang berjalan.

#### Dua sumber status publikasi

`NewsPost` menyimpan `status` sekaligus `isPublished`. Service baru sudah memperlakukan `status` sebagai sumber utama dan menurunkan nilai `isPublished`, tetapi kode lama masih menulis `isPublished` secara langsung. Akibatnya dua nilai ini masih bisa berbeda jika data ditulis lewat jalur lama, script, atau query langsung.

Sebelum membuat API publik, tetapkan satu sumber kebenaran. Rekomendasi: gunakan `status` sebagai sumber utama, lalu pertahankan `isPublished` hanya jika memang dibutuhkan sebagai nilai turunan/kompatibilitas. Query publik sementara sebaiknya defensif dan meminta keduanya konsisten.

#### Index untuk query publik belum disiapkan

Belum terlihat index khusus untuk pola query feed publik. Setelah endpoint publik ditentukan, pertimbangkan index untuk:

- status publikasi + `publishedAt`;
- `categoryId` + `publishedAt`;
- `isFeatured` + status publikasi;
- sisi `tagId` pada tabel penghubung `NewsPostTag`.

Ini bukan blocker untuk data sedikit, tetapi akan berpengaruh saat artikel dan filter bertambah.

### 2. Repository

`server/src/repositories/news-repository.ts` sudah rapi untuk kebutuhan admin:

- list mempunyai pagination, search, category, tag, featured, dan status;
- detail, create, update, dan delete sudah tersedia;
- relasi category, author, media, dan tags ikut dimuat;
- update tags dilakukan dalam transaction;
- delete post membersihkan tags dan media dalam transaction.

Namun repository tersebut belum menyediakan operasi khusus publik:

- belum ada `find published post by slug`;
- belum ada predicate wajib untuk artikel publik;
- belum memblokir `publishedAt` yang masih di masa depan;
- belum ada query public categories beserta jumlah artikel publik;
- belum ada query related/more news untuk sidebar News Detail;
- belum ada operasi atomic untuk menaikkan `viewCount`, jika fitur tersebut memang akan dipakai.

`listPosts()` saat ini menerima filter status opsional. Jika dipakai langsung untuk publik tanpa wrapper khusus, request tanpa status akan mengembalikan Draft, Published, dan Archived sekaligus. Karena itu repository publik sebaiknya mempunyai method atau base predicate tersendiri, bukan mengandalkan frontend mengirim `status=PUBLISHED`.

Predicate artikel publik yang disarankan:

```text
status = PUBLISHED
isPublished = true
publishedAt IS NOT NULL
publishedAt <= waktu server saat request
```

Untuk kategori publik, tampilkan hanya `isActive = true`, dan count-nya harus menghitung artikel publik saja. Count kategori saat ini menghitung semua post, termasuk draft/archived.

### 3. Service dan validation

Bagian yang sudah baik di `server/src/services/news-service.ts`:

- validasi UUID dan payload tersedia;
- pagination dibatasi maksimal 100 item;
- error Prisma umum dipetakan ke 400/404/409;
- tag ID diperiksa sebelum create/update;
- PATCH tidak menimpa field default yang tidak dikirim;
- author ID create diambil dari session, bukan dari body;
- tags diratakan dari `postTags` menjadi `tags` pada response;
- logika publikasi admin terpusat di `derivePublication()`.

Bagian yang masih kurang untuk halaman user:

- `getPost()` hanya menerima UUID dan tidak memeriksa status publikasi.
- `listPosts()` adalah fungsi admin dan dapat mengembalikan seluruh status.
- belum ada service publik yang mengontrol field mana yang boleh terekspos.
- belum ada fallback author display, excerpt, cover, atau category untuk data nullable.
- belum ada aturan untuk scheduled publishing (`publishedAt` di masa depan).
- `viewCount` dapat diterima oleh schema create/update walaupun semestinya server yang mengelola nilai tersebut.

#### Kontrak `content` belum tegas

Schema memakai `z.any()`, sehingga hampir semua bentuk JSON diterima. Frontend admin saat ini selalu menyimpan:

```json
{
  "format": "plain_text",
  "text": "Isi artikel..."
}
```

Ini cukup untuk paragraf plain text, tetapi desain `News Detail` saat ini mempunyai blockquote, attribution quote, inline image, caption, dan beberapa jenis blok. `NewsPostMedia` memang tersedia di database, tetapi:

- form admin belum mengelola media artikel;
- tidak ada hubungan posisi media terhadap blok content;
- tidak ada schema blok yang divalidasi;
- tidak ada versi format content.

Sebelum integrasi frontend, perlu dipilih salah satu:

1. **Versi sederhana:** resmikan `{ format: "plain_text", text: string }`, render newline sebagai paragraf, dan terima bahwa quote/inline image belum dinamis.
2. **Versi rich content:** definisikan schema versioned, misalnya `{ version: 1, blocks: [...] }`, dengan tipe paragraph, heading, quote, image, dan lainnya. Admin editor serta renderer publik harus memakai kontrak yang sama.

Untuk kebutuhan desain halaman yang ada sekarang, opsi rich content lebih lengkap. Jika target saat ini hanya menayangkan artikel secepatnya, opsi plain text lebih aman dan kecil scope-nya.

### 4. Controller, route, dan autentikasi

Seluruh route News baru saat ini berada di:

```text
/admin/news/categories
/admin/news/tags
/admin/news/posts
/admin/news/posts/:id
/admin/news/posts/:id/media
```

Route tersebut dipasang di `server/src/routes/admin/index.ts` dan seluruh `/admin/*` melewati:

- `sessionAuthMiddleware`;
- `adminAuthMiddleware`;
- permission `content:manage` untuk News.

Artinya halaman user tidak bisa dan tidak boleh menggunakan route tersebut.

Di `server/src/routes/api/index.ts` saat ini hanya ada route publik untuk pages, hero slides, dan gallery media. Belum ada route `/api/news` sama sekali.

Minimal endpoint publik yang direkomendasikan:

```text
GET /api/news
GET /api/news/categories
GET /api/news/:slug
```

Filter list yang dibutuhkan:

```text
page
pageSize
search
category        # rekomendasi memakai slug pada URL publik
tag             # opsional, jika tags ditampilkan sebagai filter
featured        # opsional
```

Untuk sidebar `More News`, backend bisa memilih salah satu kontrak:

- memasukkan `relatedNews` pada response detail; atau
- menyediakan `GET /api/news/:slug/related?limit=...`; atau
- memakai kembali `GET /api/news` dengan category dan mengecualikan post aktif.

Pilihan pertama paling praktis untuk frontend detail karena cukup satu request, selama payload related dibuat ringkas.

### 5. Response JSON

Format global saat ini konsisten untuk sukses dan error:

```json
{ "data": {} }
```

```json
{ "errors": "Pesan error" }
```

`toJsonSafe()` juga memastikan `Date` menjadi ISO string. Format envelope ini bisa dipakai untuk API News publik.

Response admin saat ini terlalu besar untuk langsung dijadikan response publik. Ia menyertakan field internal dan object author berisi `id` serta `isActive`. Halaman publik tidak membutuhkan identitas CMS tersebut.

Kontrak list publik yang disarankan:

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "slug": "steam-exhibition-2026",
        "title": "STEAM Exhibition 2026",
        "excerpt": "Ringkasan artikel",
        "coverImage": "/api/gallery-images/.../file",
        "coverImageAlt": "Deskripsi gambar",
        "publishedAt": "2026-10-16T02:00:00.000Z",
        "readTime": 5,
        "authorName": "MWS Editorial Team",
        "category": {
          "name": "Student Life",
          "slug": "student-life"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

Kontrak detail publik yang disarankan:

```json
{
  "data": {
    "id": "uuid",
    "slug": "steam-exhibition-2026",
    "title": "STEAM Exhibition 2026",
    "excerpt": "Ringkasan artikel",
    "coverImage": "/api/gallery-images/.../file",
    "coverImageAlt": "Deskripsi gambar",
    "content": {
      "format": "plain_text",
      "text": "Isi artikel"
    },
    "publishedAt": "2026-10-16T02:00:00.000Z",
    "readTime": 5,
    "authorName": "MWS Editorial Team",
    "category": {
      "name": "Student Life",
      "slug": "student-life"
    },
    "tags": [
      { "name": "STEAM", "slug": "steam" }
    ],
    "media": [],
    "seo": {
      "title": "STEAM Exhibition 2026",
      "description": "Ringkasan untuk search engine"
    },
    "relatedNews": []
  }
}
```

Catatan response:

- Jangan expose `authorId`, author CMS object, `isActive`, atau field admin lain.
- `authorName` sebaiknya sudah berupa display value final: gunakan byline, fallback ke nama akun author, lalu fallback seperti `MWS Editorial Team`.
- Tetapkan fallback cover image/category atau pastikan field tersebut wajib sebelum publish.
- Detail draft, archived, scheduled, dan slug yang tidak ada harus sama-sama menghasilkan 404 agar status internal artikel tidak bocor.
- Gunakan slug untuk URL: `/news/:slug`, bukan route statis `/news/detail`.

### 6. Konflik dengan implementasi News lama

Ini merupakan blocker build saat ini.

Schema baru sudah menghapus relasi/field lama berikut dari `NewsPost`:

- `gallery` / `galleryId`;
- `imagePath`;
- `imageAlt`.

Tetapi modul berikut masih menggunakannya:

- `server/src/repositories/page-data-repository.ts`;
- `server/src/services/page-data-service.ts`;
- `server/src/services/admin-page-editor-service.ts`;
- `server/src/repositories/gallery-repository.ts`;
- konfigurasi generic CRUD News pada `server/src/models/admin-crud-model.ts` juga masih memakai bentuk model News lama seperti `heroMedia`, `featured`, dan bentuk author yang berbeda.

Dampaknya:

- `npm run typecheck` gagal dengan 7 error.
- Community Stories masih bergantung pada query News lama.
- create/update News lama dapat gagal runtime karena mengirim field yang sudah tidak ada dan tidak mengisi `content` yang sekarang wajib.
- reference check saat menghapus Gallery masih mencoba query `NewsPost.galleryId` yang sudah tidak ada.
- generic `/admin/news-posts`, `/admin/news-categories`, dan `/admin/news-tags` masih hidup bersamaan dengan API News khusus `/admin/news/...`, sehingga ada dua jalur pengelolaan yang kontraknya berbeda.

Sebelum API publik dibuat, tentukan satu implementasi News sebagai sumber utama. Rekomendasi: pertahankan modul khusus `news-repository` + `news-service` + `/admin/news`, lalu migrasikan atau hapus pemakaian implementasi lama yang sudah tidak kompatibel. Community Stories dapat mengambil card News dari service/repository News yang baru.

### 7. Kebutuhan frontend News saat ini

Halaman `school-news.tsx` saat ini membutuhkan:

- feed artikel;
- cover image dan alt text;
- category badge;
- tanggal publish;
- author display name;
- title, excerpt, read time, dan slug;
- search;
- daftar kategori beserta count;
- recent updates;
- pagination atau load-more ketika data bertambah.

`Schedule Highlights` bukan bagian dari model News. Widget tersebut perlu tetap statis atau mengambil data dari backend Calendar/Event yang terpisah; jangan dipaksakan masuk ke response News.

Halaman `news-detail.tsx` membutuhkan:

- lookup berdasarkan slug;
- title/hero cover/alt;
- breadcrumb;
- category, published date, dan author;
- excerpt/intro;
- article content;
- quote dan inline image jika desain saat ini dipertahankan;
- related/more news;
- SEO title dan description.

Routing frontend saat ini masih statis:

```text
/news/detail
```

Integrasi final perlu mengubahnya menjadi parameter slug:

```text
/news/:slug
```

Perubahan frontend tersebut belum dilakukan dalam review ini.

## Temuan kualitas dan keamanan tambahan

- `coverImage` dan URL media menerima string bebas. Jika nantinya dirender sebagai URL dari sumber eksternal, tentukan kebijakan protocol/domain yang diperbolehkan.
- `content` tidak boleh dirender lewat raw HTML tanpa sanitization. Payload admin saat ini plain text, jadi renderer frontend sebaiknya tetap memperlakukannya sebagai text.
- Search memakai `contains` case-insensitive pada title, slug, dan excerpt; cukup untuk awal, tetapi belum full-text search.
- `readTime` diisi manual. Ini valid sebagai keputusan produk, tetapi bisa dihitung otomatis dari content agar konsisten.
- `viewCount` tersedia di schema, tetapi belum ada mekanisme publik yang aman/atomic untuk menambahnya.
- Tidak ditemukan seed khusus category/tag News. Database baru bisa menampilkan pilihan kosong sampai category/tag dibuat lewat admin/generic CRUD.

## Hasil verifikasi

Perintah yang dijalankan selama review:

- `npx prisma validate`: **lulus**, Prisma schema valid.
- `npm run typecheck`: **gagal**, 7 error akibat referensi field News lama.
- `bun test`: **lulus**, 86 test berhasil.
- `npx prisma migrate status`: **tidak dapat dikonfirmasi**, berhenti dengan `Schema engine error` saat mengakses PostgreSQL lokal.

Kelulusan test belum menutup gap News karena tidak ditemukan test khusus untuk:

- route/service/repository News baru;
- filter artikel publik;
- lookup detail berdasarkan slug;
- scheduled publishing;
- keamanan akses draft/archived;
- response shape list/detail publik;
- migrasi data News lama.

## Prioritas perbaikan sebelum frontend diintegrasikan

### P0 — wajib sebelum integrasi

1. Bereskan semua referensi model News lama sampai backend lulus typecheck.
2. Pastikan migration News aman untuk database yang mungkin sudah berisi data.
3. Pilih satu jalur CRUD News dan hilangkan/selaraskan jalur legacy yang duplikat.
4. Tambahkan repository/service/controller/route News publik.
5. Terapkan filter publikasi di server dan detail berdasarkan slug.
6. Tetapkan kontrak `content` yang akan dirender frontend.

### P1 — dibutuhkan agar kedua halaman lengkap

1. Tambahkan categories publik dengan count artikel publik.
2. Tambahkan related/recent news.
3. Definisikan DTO publik yang tidak membocorkan field CMS.
4. Tambahkan fallback/aturan wajib untuk author, excerpt, category, dan cover.
5. Tambahkan test integrasi public list/detail dan aturan publikasi.

### P2 — penguatan dan optimasi

1. Tambahkan index sesuai pola query publik.
2. Putuskan mekanisme view count.
3. Otomatiskan read time jika dibutuhkan.
4. Tambahkan cache header/ETag untuk feed dan detail jika traffic meningkat.
5. Pertimbangkan full-text search jika jumlah artikel sudah besar.

## Keputusan akhir review

Status: **NOT READY untuk integrasi frontend publik**.

Database model barunya sudah mencakup sebagian besar data inti, dan CRUD admin khusus News mempunyai fondasi yang baik. Namun endpoint publik, slug lookup, publication guard, kontrak content, kompatibilitas modul lama, keamanan migration, serta test publik masih perlu disiapkan lebih dulu. Setelah P0 selesai, halaman News dan News Detail dapat diintegrasikan tanpa bergantung pada API admin atau berisiko menampilkan draft/scheduled content.
