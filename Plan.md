# MWS Website — Staging Readiness Implementation Plan

## Objective

Selesaikan seluruh blocker **Critical** terlebih dahulu sebelum mengerjakan feature baru seperti Hero Slides.

Target akhir:

* Backend staging tidak lagi 502.
* MinIO aman dan tidak memakai `latest`.
* Tidak ada test/dummy content yang terbawa ke staging/production.
* Semua application API call frontend menggunakan Axios.
* AOS diterapkan **hanya pada public/end-user website**, bukan CMS.
* Semua lint error critical diperbaiki.
* Debug/user-data logging dibersihkan.
* Semua proses critical bisa diverifikasi dengan log terminal yang jelas.
* Setelah Critical stabil, baru lanjut ke High-priority features.

---

# 🔴 CRITICAL — MUST COMPLETE FIRST

## 1. Fix Backend Staging 502

Investigate dan fix:

* `/api/*`
* `/auth/*`
* backend service/container
* reverse proxy / Cloudflare routing
* environment variables
* database connection
* CORS/cookie configuration

### Verification

Pastikan:

```text
GET /api/pages/home → 200
GET /api/... → expected response
/auth/... → tidak 502
CMS login → berhasil
```

### Terminal logging

Gunakan log yang mudah dibaca:

```text
[STAGING][BACKEND] Checking backend health...
[STAGING][BACKEND] API health: OK
[STAGING][BACKEND] /api/pages/home: 200
[STAGING][BACKEND] Auth endpoint: OK
[STAGING][BACKEND] Result: PASS
```

Jangan log:

* password
* access token
* refresh token
* cookie value
* secret
* user credential

---

## 2. Fix & Stabilize MinIO

MinIO harus menggunakan storage yang benar dan aman.

Rules:

* Jangan hapus volume lama `mws-website_minio_data`.
* Jangan gunakan `docker compose down -v`.
* Jangan menghapus `.minio.sys` dari volume lama.
* Gunakan clean MinIO volume yang sudah dibuat.
* Pin versi image MinIO untuk staging.
* Jangan gunakan:

```yaml
image: minio/minio:latest
```

Gunakan versi yang eksplisit.

Pastikan:

```text
Backend → MinIO
Gallery image → accessible
Gallery video → accessible
Hero video → accessible
Public media URL → 200
Video Range request → 206
```

### Terminal logging

```text
[STORAGE] Checking MinIO container...
[STORAGE] MinIO container: RUNNING
[STORAGE] Bucket: mws-gallery
[STORAGE] Image upload: PASS
[STORAGE] Video upload: PASS
[STORAGE] Public image endpoint: 200
[STORAGE] Public video endpoint: 200
[STORAGE] Video Range request: 206
[STORAGE] Result: PASS
```

---

## 3. Remove Test / Dummy Content

Audit database dan CMS content sebelum staging.

Hapus/bersihkan seluruh content yang hanya digunakan untuk testing/development dan tidak boleh masuk staging/production.

Perhatikan:

* dummy news
* dummy academic content
* dummy gallery
* dummy Hero
* test users
* test contact/inquiry
* placeholder content

Jangan menghapus production-intended content secara sembarangan.

### Terminal logging

```text
[DATA] Scanning database for test/dummy content...
[DATA] Dummy content found: <count>
[DATA] Removing development-only records...
[DATA] Remaining dummy records: 0
[DATA] Result: PASS
```

Jangan print full user/content object ke terminal.

---

# 4. Migrate Frontend `fetch()` → Axios

Ini **Critical**, bukan cleanup biasa.

Audit seluruh:

```text
client/src
```

Cari:

```bash
rg "fetch\\(" client/src
```

Migrasikan application HTTP request ke centralized Axios client.

Rules:

* Gunakan satu centralized Axios instance.
* Jangan membuat Axios instance baru di setiap file.
* Pertahankan:

  * GET
  * POST
  * PUT
  * PATCH
  * DELETE
  * query params
  * request body
  * headers
  * credentials/cookies
  * upload multipart/form-data
  * error handling
  * auth/session behavior

Pastikan tidak ada application API call yang masih menggunakan native `fetch()`.

### Jangan rusak

* Google login
* CMS authentication
* session handling
* Gallery upload
* Gallery image
* Gallery video
* Hero API
* Academic API
* News API
* Contact API

### Terminal logging

Saat development/debugging, gunakan format:

```text
[API][GET] /api/pages/home
[API][200] /api/pages/home

[API][POST] /api/gallery
[API][201] /api/gallery

[API][POST] /api/auth/...
[API][401] /api/auth/...
```

Jangan log:

```text
Authorization header
Cookie
JWT
password
refresh token
```

Untuk error:

```text
[API][ERROR] POST /api/gallery
[API][ERROR] status=500
[API][ERROR] message=<safe error message>
```

Jangan dump full Axios config/request object karena bisa membocorkan credential.

---

# 5. Implement AOS — PUBLIC WEBSITE ONLY

AOS sudah ter-install.

**Jangan implement AOS di CMS/Admin.**

Scope:

```text
client/src/pages/*
client/src/features/*
client/src/components/*
```

yang merupakan **public/end-user website**.

Jangan tambahkan AOS ke:

```text
client/src/admin/*
```

### Rules

Gunakan AOS untuk:

* section reveal
* content reveal
* card entrance
* image/text reveal
* CTA section
* public page transitions/reveal

Gunakan secara subtle.

Jangan berlebihan.

### Hero exception

**Jangan mengganti animation Hero yang sekarang dengan AOS.**

Hero tetap menggunakan animation existing.

AOS hanya untuk content/section public di luar Hero jika memang diperlukan.

### Accessibility

Respect:

```text
prefers-reduced-motion
```

User yang mengaktifkan reduced motion tidak boleh dipaksa melihat animation yang tidak perlu.

### Terminal logging

Saat AOS initialization:

```text
[PUBLIC][AOS] Initializing...
[PUBLIC][AOS] Initialized
```

Untuk debugging development saja.

Jangan spam log setiap scroll/event.

---

# 6. Fix Lint Errors

Fix seluruh lint error critical yang sudah teridentifikasi:

```text
SidebarMenu.tsx
HeroSlides.tsx
Navbar.tsx
```

Terutama `setState`/effect issue.

Jangan melakukan refactor besar hanya demi lint.

Target:

```bash
bun run lint
```

atau command lint project yang tersedia:

```text
0 errors
```

Warnings existing boleh tetap jika memang sudah ada dan tidak blocking, tetapi jangan menambah warning baru.

### Terminal logging

```text
[QUALITY] Running frontend lint...
[QUALITY] Errors: 0
[QUALITY] Warnings: <count>
[QUALITY] Result: PASS
```

---

# 7. Remove Sensitive Debug Logging

Audit seluruh frontend/backend untuk debug log yang mencetak:

* user object
* user profile
* session
* token
* credential
* request headers
* private API response

Contoh yang harus dihapus:

```text
console.log("USER DATA:", user)
```

Gunakan safe logging bila memang dibutuhkan.

Contoh:

```text
[AUTH] Session loaded
[AUTH] User authenticated
```

Bukan:

```text
[AUTH] User: {...full object...}
```

---

# 🔎 CRITICAL VERIFICATION

Setelah semua Critical selesai, jalankan:

```text
Frontend
├── lint
├── typecheck
└── build

Backend
├── typecheck
├── tests
└── API verification

Storage
├── MinIO health
├── image upload
├── video upload
├── public media
└── Range request

Public
├── AOS
├── Hero
├── navigation
└── API loading

CMS
├── login
├── session
├── Gallery
└── existing CMS APIs
```

Terminal summary:

```text
========================================
 MWS STAGING READINESS — CRITICAL CHECK
========================================

[PASS] Backend staging
[PASS] MinIO
[PASS] Database test-data cleanup
[PASS] Fetch → Axios migration
[PASS] Public AOS
[PASS] Frontend lint
[PASS] Sensitive debug logs removed
[PASS] Frontend typecheck
[PASS] Frontend build
[PASS] Backend typecheck
[PASS] Backend tests
[PASS] API verification
[PASS] Storage verification

========================================
 CRITICAL STATUS: READY
========================================
```

**Jangan lanjut ke High sebelum status Critical PASS.**

---

# 🟠 HIGH — AFTER CRITICAL IS STABLE

## 8. Hero Slides CMS

Implement Hero Slides sebagai **inline/lightweight Elementor-style editor**.

Reference UI:

```text
/admin/content/contact
```

Hero editor harus memiliki:

* Hero preview/canvas
* click headline → inline edit
* click caption → inline edit
* click CTA → inline edit
* right-side properties panel
* Gallery/MinIO media picker
* add slide
* reorder slide
* delete slide
* save/update

### Media

Semua Hero media wajib berasal dari:

```text
Gallery → MinIO
```

Tidak boleh menggunakan local/static asset sebagai source Hero.

Jangan menggunakan:

```text
_DSC4760.jpg
```

sebagai fallback CMS source.

---

## 9. Hero Video

Support:

* video selection/upload
* poster selection dari Gallery
* loop checkbox
* autoplay
* muted
* playsInline

Public Hero styling dan animation **jangan diubah**.

---

## 10. Hero CTA

CTA menjadi bagian dari masing-masing slide.

Setiap slide memiliki:

```text
headline
caption
ctaLabel
ctaHref
```

Jangan menggunakan CTA global untuk semua slide.

---

## 11. Hero CRUD

Support:

```text
Create
Update
Reorder
Delete
```

Delete harus menggunakan confirmation.

Setelah save/update/delete:

```text
return to Hero list
```

---

## 12. Academic / Our School Data Integrity

Fix:

* Save Draft
* Publish
* API error handling
* load failure state
* prevent default data overwrite
* galleryId handling
* FAQ handling
* save error feedback

Jika initial API load gagal:

**jangan membuat editor terlihat seperti memiliki default data yang valid.**

Editor harus menunjukkan error/loading state yang jelas.

---

## 13. Draft / Publish

Review seluruh CMS:

* Draft harus benar-benar draft.
* Publish harus benar-benar publish.
* Preview harus mengarah ke content yang benar.
* Save error harus terlihat oleh user.
* Jangan menganggap request berhasil hanya karena UI kembali ke list.

---

## 14. Delete Confirmation

Tambahkan confirmation sebelum delete untuk:

* Hero Slides
* Community Stories
* Gallery
* resource CMS lain yang destructive

Jangan melakukan delete langsung dari satu klik tanpa confirmation.

---

## 15. Unsaved Changes

Tambahkan protection untuk editor yang memiliki perubahan belum disimpan.

Handle:

* navigation
* close
* browser refresh
* route change

Minimal beri warning ketika ada unsaved changes.

---

# FINAL QA

Setelah Critical + High selesai:

```bash
# frontend
bun run lint
bun run typecheck
bun run build

# backend
bun run typecheck
bun test
```

Kemudian lakukan E2E:

```text
CMS
 ↓
DB
 ↓
MinIO
 ↓
API
 ↓
Public Website
```

Test khusus Hero:

```text
Gallery image
    ↓
Hero image
    ↓
Public Hero

Gallery video
    ↓
Hero video
    ↓
Poster
    ↓
Loop
    ↓
Public Hero
```

---

# EXECUTION ORDER

```text
🔴 CRITICAL

Backend staging 502
        ↓
MinIO stabilization
        ↓
Test/dummy data cleanup
        ↓
Fetch → Axios
        ↓
AOS — PUBLIC ONLY
        ↓
Lint fixes
        ↓
Debug log cleanup
        ↓
Critical verification
        ↓
────────────────────

🟠 HIGH

Hero Inline Editor
        ↓
Hero Video / Poster / Loop
        ↓
Hero CTA
        ↓
Hero CRUD / Reorder
        ↓
Academic / Our School
        ↓
Draft / Publish
        ↓
Delete Confirmation
        ↓
Unsaved Changes
        ↓
High verification
        ↓
────────────────────

🚀 FINAL

Lint
Typecheck
Tests
Build
E2E
Staging verification
        ↓
Push / Deploy
```

# Important Constraints

* **AOS hanya public/end-user. Jangan pasang AOS di CMS/Admin.**
* Jangan ubah visual/style public website yang sudah ada kecuali penambahan AOS yang memang diperlukan.
* Jangan mengganti Hero animation dengan AOS.
* Jangan gunakan MinIO `latest` untuk staging.
* Jangan hapus volume MinIO lama.
* Jangan `docker compose down -v`.
* Jangan log credential/token/user object.
* Jangan melakukan refactor besar di luar scope.
* Jangan lanjut High sebelum semua Critical PASS.
* Setiap tahap harus memberikan terminal log yang jelas dengan prefix seperti `[STAGING]`, `[STORAGE]`, `[API]`, `[PUBLIC]`, `[QUALITY]`.
* Setelah selesai setiap major task, tampilkan status `PASS` atau `FAIL` di terminal.

