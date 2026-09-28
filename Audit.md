Lakukan **FULL AUDIT SAJA — NO FIX / NO CODE CHANGES**.

Project:

`~/Downloads/mws-website`

## TUJUAN UTAMA

Audit **SEMUA FITUR dan SEMUA PATH/ROUTE** yang tersedia di project, lalu bandingkan:

* LOCAL → `http://localhost:7001`
* STAGING → `http://172.16.0.189:7001`

Jangan hanya mengecek route yang sudah diketahui error.

**Semua route harus dicek dan semua fitur utama pada setiap route harus diuji.**

---

## 1. DISCOVER SEMUA ROUTE

Baca langsung:

* `client/src/app/App.tsx`
* `client/src/admin/app/App.tsx`

Temukan **semua route aktual**, termasuk:

* public routes
* admin routes
* login/auth routes
* nested routes
* dynamic routes
* detail pages
* create/edit pages
* preview pages
* catch-all / 404
* route dengan parameter seperti `/:slug`, `/:id`, dll.

Jangan mengarang route berdasarkan asumsi.

Selain route definitions, scan source code untuk menemukan fitur/page yang mungkin tidak terlihat langsung dari kedua `App.tsx`.

---

# 2. AUDIT SETIAP ROUTE

Untuk **SETIAP route**, cek:

### Page

* route bisa dibuka
* page berhasil render
* tidak blank screen
* tidak crash
* tidak infinite loading
* loading state selesai
* error state bekerja

### UI

* semua section/component utama muncul
* data tampil
* image/media tampil
* button/link berfungsi
* navigation berfungsi
* modal/dropdown/tab bekerja jika ada
* form tampil dan bisa digunakan
* pagination/filter/search bekerja jika ada

### API

* request API yang digunakan
* HTTP method
* URL/endpoint
* status code
* response shape
* missing/undefined/null data
* API error
* timeout/request failure

### Browser

* console error
* console warning yang relevan
* uncaught exception
* failed network request
* asset/image/font failure

### Navigation

* internal link
* back/forward navigation
* redirect
* dynamic route
* slug/id handling
* refresh langsung pada route
* SPA fallback

---

# 3. AUDIT SEMUA FITUR

Jangan berhenti setelah page berhasil render.

Untuk setiap halaman, identifikasi fitur yang tersedia dan **uji fitur tersebut**.

Contoh:

### Public

* Navbar
* dropdown/menu
* hero slider
* CTA
* program navigation
* academic navigation
* news list
* news detail
* category/tag filtering
* search
* gallery
* video
* testimonials
* FAQ
* affiliations
* contact
* admission
* book a tour
* form submission
* footer links
* responsive/mobile navigation
* dynamic content

Gunakan fitur aktual yang ditemukan di source code. Jangan menganggap semua contoh di atas pasti ada.

### Admin

Audit semua fitur yang tersedia, termasuk:

* login/logout
* session
* `/auth/me`
* dashboard
* CRUD
* create
* update
* delete
* publish/unpublish
* status change
* search/filter
* pagination
* image upload
* gallery
* news
* categories
* tags
* programs
* testimonials
* FAQs
* affiliations
* content/page management
* preview
* navigation/sidebar
* modal
* form validation
* permission/authorization

Sekali lagi: **gunakan fitur aktual dari project sebagai sumber utama.**

---

# 4. LOCAL VS STAGING

Setiap route dan fitur harus dibandingkan antara:

**LOCAL**

`http://localhost:7001`

dan

**STAGING**

`http://172.16.0.189:7001`

Jika Local PASS tetapi Staging FAIL, trace penyebabnya.

Periksa secara read-only:

* frontend environment
* API base URL
* backend API
* API response
* database/content
* asset URL
* authentication/session
* cookies
* CORS
* deployment/build
* Docker configuration
* SPA routing

---

# 5. KNOWN ERRORS — WAJIB DICEK

Pastikan audit memverifikasi:

### `/academic`

`Cannot read properties of undefined (reading 'filter')`

### `/our-school`

`Cannot read properties of undefined (reading 'hero')`

### `/news`

`Cannot read properties of undefined (reading 'items')`

Cari juga **error lain yang belum diketahui**.

---

# 6. ACCESS BOUNDARIES

Semua audit harus **READ-ONLY**.

BOLEH:

* membaca source
* menjalankan app
* membuka browser
* membaca console
* membaca Network
* GET/read-only API request
* membaca backend code
* membaca Prisma schema
* membaca environment/config untuk investigasi
* menggunakan existing authentication/session

DILARANG:

* edit source code
* membuat patch
* auto-fix
* refactor
* mengubah `.env`
* mengubah database
* INSERT/UPDATE/DELETE
* migration
* upload/delete data
* mengubah authentication
* mengubah permission
* membuat user baru
* deploy/redeploy
* commit
* push

Jika fitur membutuhkan login dan session tidak tersedia, **jangan bypass auth**.

Catat:

`BLOCKED — AUTH REQUIRED`

lalu lanjutkan audit fitur/route lainnya.

---

# 7. ROOT CAUSE

Untuk setiap masalah, tentukan berdasarkan evidence:

* `CONFIRMED ROOT CAUSE`
* `LIKELY CAUSE`
* `UNKNOWN`

Sertakan:

* route
* feature
* error
* API request
* response
* source file
* line
* local result
* staging result
* evidence

Jangan menyimpulkan root cause hanya dari dugaan.

---

# 8. OUTPUT

## A. Complete Route Inventory

| Route | Type   | Local     | Staging   | Main Features |
| ----- | ------ | --------- | --------- | ------------- |
| `/`   | Public | PASS/FAIL | PASS/FAIL | ...           |
| ...   | ...    | ...       | ...       | ...           |

## B. Feature Audit

| Route  | Feature | Local     | Staging   | Issue |
| ------ | ------- | --------- | --------- | ----- |
| `/...` | ...     | PASS/FAIL | PASS/FAIL | ...   |

## C. All Findings

Kelompokkan semua masalah berdasarkan:

* Runtime
* API
* Database/content
* Asset
* Authentication/session
* Navigation/routing
* Form
* UI interaction
* Deployment/environment

## D. Local vs Staging Differences

Tampilkan semua perbedaan yang ditemukan.

## E. Severity

Gunakan:

* CRITICAL
* HIGH
* MEDIUM
* LOW

Berdasarkan **dampak teknis**, bukan ranking kualitas.

---

# FINAL RULE

**JANGAN MEMPERBAIKI APAPUN.**

Tujuan task ini hanya:

**DISCOVER → TEST → COMPARE → TRACE → DOCUMENT**

Setelah seluruh route dan seluruh fitur selesai diaudit:

**STOP.**

Jangan melakukan fix, refactor, commit, atau push.
