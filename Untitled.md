# Audit & Testing Checklist MWS Website

Oct 12, 2026 · @Mad Labs

## Ringkasan

Website publik dan CMS secara umum sudah jalan: 17 halaman publik terbuka normal di staging (desktop dan mobile), endpoint admin menolak akses tanpa login, dan type-check, lint, serta 161 dari 162 test lulus. Ada 1 issue Critical, 4 High, 12 Medium, dan 10 Low yang masih terbuka.

Audit ini read-only. Tidak ada kode, database, atau config yang diubah. Sumbernya kode lokal di branch `main` (termasuk perubahan yang belum di-commit) dan staging `beta.millenniaws.sch.id` per 12 Oktober 2026.

Yang perlu diputuskan di meeting:

1. **Migrasi data Academic sebelum production.** Migration academic menghapus tabel lama tanpa menyalin isinya. Pilihannya: buat script salin data, atau konten Academic diinput ulang di CMS.
2. **Anti-spam form Contact.** Pilih proteksinya: rate limit saja, atau rate limit plus captcha (misalnya Cloudflare Turnstile).
3. **Aturan ukuran media.** Tentukan batas foto dan video, dan apakah foto perlu di-resize otomatis. Homepage staging sekarang memuat sekitar 69 MB.
4. **Rencana redeploy staging.** Staging masih build lama (sebelum commit `a16dc07`) dan `GOOGLE_CALENDAR_ID` belum diset.
5. **Pindah domain dari WordPress lama.** Logo dan 15 gambar masih diambil dari `millenniaws.sch.id/wp-content`, jadi akan rusak saat WordPress dimatikan.

## Temuan audit

Urutan tabel dari yang paling berisiko. "Bukti" adalah hasil cek langsung ke kode atau ke staging.

| ID | Severity | Area | Issue dan bukti | Lokasi | Dampak | Rekomendasi |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | Critical | Database | Migration academic menjalankan DROP pada tabel `AcademicLevelPage` tanpa satu pun INSERT untuk menyalin data ke struktur baru. | `server/prisma/migrations/20261001021649_update_academic_structure/migration.sql` | Saat dijalankan di production, konten halaman Kindergarten, Elementary, dan High School hilang. | Tambahkan langkah salin data sebelum DROP, atau sepakati input ulang. Backup DB sebelum migrate. |
| H1 | High | Public / Email | Form Contact tidak punya rate limit, captcha, atau honeypot. Setiap submit membuat 1 inquiry dan mengirim 1 email notifikasi. Rate limiter hanya dipakai di endpoint analytics. | `server/src/controllers/api/ContactInquiries.ts` | Bot bisa membanjiri tabel inquiry dan inbox, lalu menghabiskan kuota Gmail/SMTP. | Rate limit per IP (misalnya 5 per 10 menit) plus honeypot atau Turnstile. |
| H2 | High | Performa | Homepage staging memuat sekitar 69 MB di desktop dan mobile: video hero 22,1 MB (terlihat 2 request), foto berita 8,2 MB, 2,6 MB, 2,4 MB, plus `JH.jpg` 1,4 MB. Foto tidak di-resize saat upload. | Homepage, `news-service.ts`, `gallery-service.ts` | Halaman lambat dan boros kuota di HP. Skor Lighthouse dan SEO turun. | Resize/kompres saat upload (misalnya maks 1920 px, WebP), buat thumbnail, siapkan video versi mobile, dan pakai `preload="metadata"`. |
| H3 | High | CMS Gallery | Hapus gambar dari Gallery tidak mengecek apakah gambar dipakai di Hero, News, Popup, atau halaman lain. | `server/src/services/gallery-service.ts` (deleteImage) | Gambar di website publik tiba-tiba rusak tanpa peringatan. | Cek referensi sebelum hapus, dan tampilkan "dipakai di X halaman" di dialog konfirmasi. |
| H4 | High | CMS Academic | Tabel level academic tidak punya unique constraint per level. Pembacaan memakai `findFirst` urut `updatedAt`. | `academic-page-service.ts` (findLevelRecord), `schema.prisma` | Kalau ada baris ganda, website menampilkan versi yang salah dan perubahan admin terlihat "tidak tersimpan". | Unique index pada `levelKey`, lalu bersihkan duplikat. |
| M1 | Medium | Public | Logo dan gambar di-hotlink dari WordPress lama `millenniaws.sch.id/wp-content` (15 referensi). | `client/src/pages/home.tsx`, `aboutUS.tsx`, `server/src/services/page-data-service.ts` | Saat domain pindah dan WordPress dimatikan, logo dan gambar ini rusak. | Pindahkan file ke `/assets-mws` atau MinIO. |
| M2 | Medium | Security | Response staging hanya membawa HSTS dan `nosniff` (dari Cloudflare). Tidak ada CSP, X-Frame-Options/frame-ancestors, Referrer-Policy, atau Permissions-Policy. | `client/nginx.conf` | Halaman admin bisa di-embed di iframe (clickjacking), dan tidak ada lapisan perlindungan XSS tambahan. | Tambah header tersebut di nginx; minimal `frame-ancestors 'none'` untuk `/admin`. |
| M3 | Medium | Public / SEO | URL yang tidak ada (contoh `/does-not-exist`) langsung diarahkan ke homepage. Tidak ada halaman 404. | `client/src/app/App.tsx` (route `*`) | Pengunjung tidak tahu link-nya salah. Google menganggapnya soft-404. | Buat halaman 404 dengan link ke menu utama. |
| M4 | Medium | Public / SEO | Judul tab browser salah ketik: "Ourschool", "Aboutmillennia", "Bookatour", "Schoolcalendar", "Highschool", "Faq". Tanda `-` dihapus, bukan diganti spasi. | `client/src/components/layout/PageLayout.tsx:113` | Judul jelek di tab browser, bookmark, dan hasil Google. | Ganti `-` dengan spasi, atau set judul per halaman. |
| M5 | Medium | Public About | Halaman `/about-millennia` memakai konten statis (tidak mengambil data dari CMS), H1-nya "Our School", dan gambar hero berisi teks `'about-us'` (bukan path gambar). | `client/src/pages/aboutUS.tsx:13-16` | Admin tidak bisa mengedit About, judul membingungkan, dan gambar hero kosong. | Sambungkan ke CMS (atau putuskan memang statis), lalu perbaiki judul dan gambar. |
| M6 | Medium | Public News | Breadcrumb halaman News tertulis "Home > About MWS > Our School" (salin-tempel). | `client/src/pages/news/school-news.tsx:128` | Navigasi menyesatkan. | Ganti menjadi Home > School News. |
| M7 | Medium | CMS UX | Tidak ada peringatan perubahan belum disimpan (tidak ada `beforeunload` atau `useBlocker`) di editor CMS mana pun. | Semua editor di `client/src/admin` | Admin kehilangan tulisan kalau klik menu lain atau menutup tab. | Tambah guard perubahan belum disimpan, minimal di News, Academic, dan Contact. |
| M8 | Medium | CMS Upload | Batas video di server 200 MB, tetapi nginx hanya menerima 100 MB. | `gallery-service.ts:19`, `client/nginx.conf:14` | Video 100–200 MB gagal dengan error 413 non-JSON, sehingga CMS menampilkan pesan yang tidak jelas. | Samakan batasnya, lalu tampilkan batas ukuran di form upload. |
| M9 | Medium | CMS Session | Client API tidak punya penanganan 401 global. Hanya `/auth/me` yang mengarahkan ke login. | `client/src/lib/api.ts`, `client/src/admin/api/authApi.ts:10` | Kalau sesi 8 jam habis saat mengedit, tombol Simpan gagal dengan error umum dan admin tidak diarahkan ke login. | Interceptor 401: tampilkan "Sesi habis" lalu arahkan ke login (simpan draft lokal kalau bisa). |
| M10 | Medium | CMS Academic | Kalau level academic tidak berstatus published, website menampilkan konten default bawaan kode, bukan versi terakhir yang pernah dipublish. | `academic-page-service.ts:657-671` (getPublicLevel) | Simpan sebagai draft bisa membuat halaman publik kembali ke teks bawaan. | Simpan versi published dan draft terpisah. Minimal tampilkan peringatan di CMS. |
| M11 | Medium | CMS Our School | Website publik memilih record Our School terbaru (urut `updatedAt`, ambil 20). | `server/src/repositories/page-data-repository.ts:74` (getLatestOurSchool) | Kalau ada lebih dari 1 record, konten yang tampil tidak pasti. | Jadikan singleton (1 record tetap) atau unique key. |
| M12 | Medium | Deploy | Staging masih build lama: `/about-millennia` memuat gambar dari `http://localhost:7001/...` (diblokir CORS; sudah diperbaiki di commit `a16dc07`). `/api/calendar/events` di staging mengembalikan `configured:false`. | Staging | Gambar About rusak dan agenda Google Calendar kosong di staging. | Redeploy staging, lalu set `GOOGLE_CALENDAR_ID` dan service account. |
| L1 | Low | API Popup | Update Popup Promoted dengan data sebagian (PATCH) mengembalikan `isActive`, `sortOrder`, dan `openInNewTab` ke nilai default. Sudah dicoba dengan `{title}` saja. `buttonUrl` juga menerima `javascript:`. UI saat ini selalu mengirim semua field, jadi belum kena. | `server/src/validation/schemas/popup-promoted-schema.ts` | Data bisa berubah tanpa disadari kalau API dipakai sebagian. | Hapus `.default()` di schema update dan validasi URL (http/https atau path `/`). |
| L2 | Low | Repo | Fitur Popup Promoted (controller, service, migration, halaman CMS) belum di-commit. Ada file `code.gs` nyasar di root repo. | `git status` | Push sebagian bisa membuat migration atau route tidak lengkap. | Commit fitur bersama migration-nya. Pindahkan atau hapus `code.gs`. |
| L3 | Low | Auth | `POST /auth/google` menukar kode Google tanpa mengecek OAuth `state`. Flow utama (`GET /auth/google/callback`) sudah mengecek state. | `server/src/controllers/admin/Login.ts:64` | Membuka celah login CSRF. | Hapus endpoint lama ini kalau tidak dipakai, atau wajibkan state. |
| L4 | Low | Auth | Logout hanya menghapus cookie. JWT tetap valid sampai 8 jam. Risiko berkurang karena setiap request mengecek ulang user CMS dan Central. | `Login.ts:143` | Cookie yang bocor tetap bisa dipakai setelah logout. | Tambah session version atau denylist kalau diperlukan. |
| L5 | Low | Calendar | Event Google Calendar tidak di-cache di server. Setiap kunjungan memanggil Google API (cache hanya 60 detik di browser). | `server/src/controllers/api/Calendar.ts` | Lambat dan bisa terkena kuota Google saat traffic tinggi. | Cache di memori 5–10 menit. |
| L6 | Low | CMS UX | Label dan route tidak konsisten: menu "partners" huruf kecil, "Gambar Galeri" dan "Video Galeri" berbahasa Indonesia di tengah UI berbahasa Inggris, "(opsional)", route `/admin/gallery/Gambar`, redirect lama `/admin/VoiceComunity`. Ada yang memakai `window.confirm`, ada yang memakai modal. | `client/src/admin/config/navigation.ts`, `App.tsx`, `Field.tsx`, `CmsUsersPage.tsx` | Terlihat kurang rapi dan membingungkan admin baru. | Satukan bahasa, huruf, dan gaya dialog konfirmasi. |
| L7 | Low | Public | `/academic/junior-high` menampilkan halaman High School (H1 "High School"). | `client/src/app/App.tsx:36` | Pengunjung yang mencari Junior High dapat konten yang salah. | Redirect ke `/academic/high-school` atau buat halaman sendiri. |
| L8 | Low | Public SEO | `/community-stories` punya 2 H1. | `client/src/pages/community-stories.tsx` | Sedikit berpengaruh ke SEO dan screen reader. | Jadikan H1 kedua sebagai H2. |
| L9 | Low | Test | Test `sendMail ... no email transport` gagal lokal karena tidak me-reset `MAIL_TRANSPORT` (`.env` lokal berisi `gmail`). Di CI lulus. | `server/src/test` (mailer test) | Hasil test lokal tidak konsisten. | Hapus `MAIL_TRANSPORT` di setup test tersebut. |
| L10 | Low | Inquiry | IP pengirim inquiry diambil dari entri pertama `x-forwarded-for`, yang bisa dipalsukan. | `ContactInquiries.ts:16` | Data IP tidak bisa dipercaya untuk blokir spam. | Pakai `CF-Connecting-IP` atau IP dari proxy terpercaya. |

## Status temuan audit sebelumnya (1 Oktober 2026)

Dari audit 1 Oktober, 2 temuan sudah beres, 1 sebagian beres, dan 6 masih terbuka (sudah masuk ke tabel di atas).

| Temuan lama | Status sekarang | Catatan |
| --- | --- | --- |
| Role MAD Labs tidak konsisten (ADMIN vs SUPER\_ADMIN) | Beres | Login MAD Labs otomatis menjadi SUPER\_ADMIN, dan audit log-nya sudah konsisten. |
| Banyak aksi hapus tanpa konfirmasi | Sebagian beres | Hero, Community Stories, Gallery, Media Library, Partners, Popup, Calendar, FAQ, dan CMS Users sudah punya konfirmasi. Gaya dialognya masih campur (L6). |
| Editor Contact | Beres (struktur baru) | Sekarang ada sidebar Publishing, Preview, dan Reset dengan konfirmasi. |
| Migration academic menghapus data | Masih terbuka | C1 |
| Unique constraint level academic | Masih terbuka | H4 |
| Our School memakai record terbaru | Masih terbuka | M11 |
| Hapus gambar tanpa cek referensi | Masih terbuka | H3 |
| Batas upload server vs nginx | Masih terbuka | M8 |
| Penanganan 401 global | Masih terbuka | M9 |

## Yang sudah terverifikasi berjalan baik

- **Build dan test:** type-check client dan server bersih, lint bersih, 161/162 test server lulus (yang gagal hanya L9), dan Prisma schema valid.
- **Proteksi admin:** di staging, `/auth/me`, `/admin/analytics`, `/admin/users`, `/admin/popup-promoted`, dan `/admin/contact-inquiries` mengembalikan 401 tanpa login.
- **Login Google:** callback mengecek OAuth `state`. Cookie sesi HttpOnly dan SameSite Strict, berlaku 8 jam.
- **Hak akses selalu dicek ulang:** setiap request admin mengecek ulang identitas Central (cache 90 detik) dan status user CMS. Admin yang dinonaktifkan langsung kehilangan akses. Menu `/admin/users` selalu mengecek Central terbaru.
- **Halaman publik:** 17 route terbuka di staging (desktop 1366 px dan mobile 390 px) tanpa horizontal scroll dan tanpa error console, kecuali `/about-millennia` (M12).
- **Analytics:** endpoint pageview memakai rate limit 120/menit. Path admin, bot, dan duplikat 10 detik tidak dihitung.
- **Popup Promoted (lokal):** jadwal tampil dikonversi ke UTC dari browser (aman untuk WIB). Popup yang ditutup tidak muncul lagi di sesi yang sama, dan muncul lagi kalau isinya diubah. Tombol ESC menutup popup.

## Checklist testing (login sampai logout)

Jalankan di staging, berurutan dari atas. Centang yang lulus. Kalau gagal, tulis catatannya sebagai komentar di baris tersebut. Item bertanda (lihat Mx/Hx) berkaitan dengan temuan yang sudah diketahui.

### 0. Persiapan

- [ ] Akun A: email MAD Labs yang belum pernah login CMS
- [ ] Akun B: email Millennia di Central yang sudah di-invite sebagai ADMIN
- [ ] Akun C: email Millennia di Central tanpa akses CMS
- [ ] Akun D: Gmail pribadi (tidak ada di Central)
- [ ] Akun E: user CMS yang akan dinonaktifkan saat test
- [ ] Browser: Chrome desktop, Safari iPhone, Chrome Android
- [ ] File uji: JPG/PNG/WebP kurang dari 10 MB, JPG lebih dari 10 MB, PDF kurang dari 25 MB, video 50 MB, video 150 MB, file .exe yang di-rename jadi .jpg
- [ ] Backup database staging sebelum mulai

### 1. Login

- [ ] Buka `/admin` tanpa login: diarahkan ke `/admin/login`
- [ ] Akun A login pertama kali: masuk sebagai SUPER\_ADMIN, dan ada audit log `CMS_USER_AUTO_REGISTERED`
- [ ] Akun B login: masuk sebagai ADMIN, invitation berubah menjadi diterima
- [ ] Akun C login: ditolak dengan pesan "This account does not have CMS access."
- [ ] Akun D login: ditolak dengan pesan yang jelas
- [ ] Klik Cancel di layar Google: kembali ke halaman login dengan pesan, bukan halaman kosong
- [ ] Refresh URL callback lama atau buka di tab lain: muncul error `google_state`, lalu bisa login ulang
- [ ] Cek cookie di DevTools: HttpOnly, Secure, SameSite=Strict, kedaluwarsa 8 jam
- [ ] Buka link dalam (misalnya `/admin/news/new`) saat belum login: catat apakah setelah login kembali ke halaman itu atau ke Dashboard
- [ ] Login di 2 tab sekaligus: keduanya tetap jalan

### 2. Sesi dan hak akses

- [ ] ADMIN tidak melihat menu CMS Users dan Permissions
- [ ] ADMIN membuka `/admin/users` langsung lewat URL: ditolak atau diarahkan
- [ ] SUPER\_ADMIN menonaktifkan akun E saat E sedang login: request berikutnya dari E ditolak (403)
- [ ] Hapus cookie sesi lalu klik Simpan di editor: catat pesannya. Yang diharapkan: "Sesi habis" lalu diarahkan ke login (M9)
- [ ] Biarkan tab terbuka lebih dari 8 jam lalu lakukan aksi: perilakunya sama dengan item sebelumnya

### 3. Dashboard

- [ ] Ringkasan konten (jumlah news, gallery, dan seterusnya) sesuai dengan data di tiap menu
- [ ] Analytics 7, 30, dan 90 hari tampil, dan grafik terbaca di layar kecil
- [ ] Buka 3 halaman publik di browser lain: views bertambah setelah refresh dashboard
- [ ] Buka halaman `/admin`: tidak ikut terhitung di analytics
- [ ] Link di "Perlu perhatian" dan "Update terbaru" membuka item yang benar

### 4. CMS Users dan Audit Log

- [ ] Invite email Central yang valid: email undangan masuk (cek folder spam) dan link-nya benar
- [ ] Invite email yang tidak ada di Central: ditolak dengan pesan jelas
- [ ] Invite email yang sudah di-invite atau sudah jadi user: ditolak atau diberi info
- [ ] Kirim ulang undangan: email kedua masuk
- [ ] Cabut undangan: ada konfirmasi, lalu orang itu tidak bisa login
- [ ] Ubah role ADMIN ke SUPER\_ADMIN dan sebaliknya: ada konfirmasi, efeknya langsung terasa
- [ ] Coba menonaktifkan diri sendiri atau SUPER\_ADMIN terakhir: catat apakah dicegah
- [ ] Aktifkan kembali user nonaktif: user bisa login lagi
- [ ] Audit log mencatat semua aksi di atas, lengkap dengan pelaku dan waktu (WIB)

### 5. Inquiries (form Contact)

- [ ] Kirim form `/contact` dari publik dengan data valid: muncul pesan sukses
- [ ] Field wajib kosong atau email salah format: muncul pesan error per field
- [ ] Inquiry muncul di CMS > Inquiries dengan data lengkap
- [ ] Email notifikasi inquiry masuk ke alamat tujuan
- [ ] Ubah status inquiry dan pakai filter status: berfungsi
- [ ] Kirim form 20 kali cepat-cepat: catat apakah dibatasi. Sekarang belum ada pembatasan (H1)

### 6. Content: Home (Hero slides)

- [ ] Tambah slide dengan gambar: tampil di homepage
- [ ] Tambah slide dengan video: tampil dan autoplay muted di HP
- [ ] Edit teks dan tombol, ubah urutan, nonaktifkan slide: perubahan terlihat di publik
- [ ] Hapus slide: ada konfirmasi
- [ ] Upload gambar lebih dari 10 MB: ditolak dengan pesan jelas
- [ ] Upload file palsu (.exe di-rename .jpg): ditolak

### 7. Content: Admissions, Admission Guidelines, FAQ

- [ ] Edit halaman Admissions, simpan: tampil di `/admission`
- [ ] Tambah, edit, urutkan, dan hapus Admission Guidelines: tampil di `/admission/guidelines`
- [ ] Tambah, edit, urutkan, dan hapus FAQ: tampil di `/admission/faq`
- [ ] Draft atau tidak aktif: tidak tampil di publik

### 8. Content: Our School dan About

- [ ] Edit Our School (teks, gambar, visi-misi), simpan: tampil di `/our-school`
- [ ] Cek `/about-millennia`: kontennya statis (tidak berubah dari CMS), H1 dan gambar hero (M5)

### 9. Content: Community Stories dan Community Voices

- [ ] Tambah, edit, dan hapus story dengan gambar: tampil di `/community-stories`
- [ ] Tambah, edit, dan hapus voice (testimoni): tampil di publik
- [ ] URL lama `/admin/VoiceComunity` diarahkan ke Community Voices

### 10. Content: Contact page

- [ ] Edit hero, alamat, kontak, dan peta, lalu Preview: preview sesuai
- [ ] Publish: tampil di `/contact`
- [ ] Reset ke default: ada konfirmasi dan isi kembali ke default

### 11. Content: Popup Promoted (setelah fitur di-deploy)

- [ ] Buat popup dengan poster (upload baru dan pilih dari library), judul, deskripsi, dan tombol
- [ ] Tombol ke halaman internal (`/admission`): pindah halaman tanpa reload
- [ ] Tombol ke link luar dengan "open in new tab": membuka tab baru
- [ ] Jadwal tampil (mulai dan selesai, jam WIB): popup muncul dan hilang tepat waktu
- [ ] Tanggal selesai lebih awal dari tanggal mulai: ditolak
- [ ] Status tidak aktif: tidak muncul di publik
- [ ] Dua popup aktif: yang tampil sesuai urutan (sortOrder)
- [ ] Tutup popup (tombol X, ESC, dan klik luar): tidak muncul lagi di sesi yang sama; muncul lagi setelah isinya diedit
- [ ] Tampilan popup di iPhone dan Android: poster dan tombol tidak terpotong
- [ ] Hapus popup: ada konfirmasi

### 12. Academic

- [ ] Edit Overview, simpan, dan publish: tampil di `/academic`
- [ ] Edit Kindergarten, Elementary, dan High School (teks, gambar, dokumen PDF): tampil di halaman masing-masing
- [ ] Simpan sebagai draft: catat apakah halaman publik kembali ke teks bawaan (M10)
- [ ] Upload gambar lebih dari 10 MB dan PDF lebih dari 25 MB: ditolak dengan pesan jelas
- [ ] FAQ Academic: tambah, edit, urutkan, hapus
- [ ] Partners: tambah logo, edit, urutkan, hapus (ada konfirmasi), tampil di publik
- [ ] Cek `/academic/junior-high` (L7)

### 13. News

- [ ] Categories dan Tags: tambah, edit, hapus. Coba hapus kategori yang masih dipakai post
- [ ] Buat post baru: judul, slug otomatis, excerpt, isi, cover, kategori, tag, SEO
- [ ] Slug dengan huruf besar atau spasi: ditolak dengan pesan jelas
- [ ] Slug yang sama dengan post lain: ditolak dengan pesan jelas
- [ ] Editor: bold, italic, underline, heading, list, link. Tekan Enter di kotak link tidak ikut menyimpan post
- [ ] Paste dari Google Docs atau Word: format rapi, tidak ada style aneh
- [ ] Paste `<script>` atau `<img onerror>`: dibersihkan, tidak jalan di halaman publik
- [ ] Upload foto artikel lebih dari 10 MB: ditolak
- [ ] Simpan draft: tidak tampil di `/news`. Publish: tampil di `/news` dan `/news/<slug>`
- [ ] Edit post yang sudah publish: perubahan tampil di publik
- [ ] Pindah menu saat ada tulisan belum disimpan: catat apakah ada peringatan (M7)
- [ ] Hapus post: ada konfirmasi, lalu `/news/<slug>` lama menampilkan pesan "tidak ditemukan"

### 14. Gallery dan Media Library

- [ ] Buat album, upload beberapa gambar sekaligus, edit alt text, hapus
- [ ] Upload video 50 MB: berhasil, lalu bisa diputar
- [ ] Upload video 150 MB: catat pesannya. Saat ini kena error 413 dari nginx (M8)
- [ ] Hapus gambar yang sedang dipakai di Hero atau News: catat apakah ada peringatan (H3)
- [ ] Pilih gambar dari Media Library di modul lain (Hero, News, Popup): berfungsi
- [ ] Gallery publik menampilkan gambar dan video dengan benar

### 15. Calendar

- [ ] Tambah, edit, dan hapus event academic (tanggal dan jam WIB benar): tampil di `/school-calendar`
- [ ] Event Google Calendar tampil (setelah `GOOGLE_CALENDAR_ID` diset di staging)
- [ ] Event yang lewat atau dibatalkan tidak tampil

### 16. Menu lain

- [ ] Pages management dan edit halaman: berfungsi
- [ ] Programs (Campus Tour, Curriculum, Affiliations): edit dan tampil di publik
- [ ] Help: tampil
- [ ] Permissions (khusus SUPER\_ADMIN): tampil dan sesuai role

### 17. Cek situs publik (setelah semua perubahan)

- [ ] Semua 17 halaman terbuka di desktop, iPhone, dan Android tanpa error dan tanpa scroll ke samping
- [ ] Animasi saat scroll di iPhone Safari: konten tidak hilang atau berkedip
- [ ] Semua link di Navbar dan Footer menuju halaman yang benar
- [ ] Form Book a Tour dan chatbot berfungsi
- [ ] Judul tab browser tiap halaman benar (M4)
- [ ] URL ngawur (`/abc`): perilakunya (M3)
- [ ] Lighthouse mobile untuk Home: catat skor Performance dan total ukuran halaman (H2)
- [ ] Tidak ada gambar yang masih diambil dari `millenniaws.sch.id/wp-content` (M1)

### 18. Logout

- [ ] Klik Logout: diarahkan ke halaman login, dan cookie sesi hilang di DevTools
- [ ] Tekan Back di browser: tidak bisa melihat data CMS (diarahkan ke login)
- [ ] Buka `/admin` di tab lain yang masih terbuka lalu refresh: diarahkan ke login
- [ ] Panggil `/auth/me` setelah logout: 401
- [ ] Login ulang dengan akun yang sama: berhasil dan kembali ke Dashboard

## Urutan perbaikan yang disarankan

Tahap 1 wajib selesai sebelum go-live production. Tahap 2 sebaiknya selesai sebelum domain dipindah dari WordPress.

1. **Sebelum production:**
   1. Selesaikan masalah migrasi data Academic dan backup DB (C1)
   2. Proteksi spam di form Contact (H1)
   3. Commit fitur Popup Promoted lengkap dengan migration-nya, lalu redeploy staging dan set Google Calendar (L2, M12)
   4. Unique constraint level academic dan record Our School (H4, M11)
2. **Sebelum pindah domain:**
   1. Pindahkan semua aset dari WordPress lama (M1)
   2. Resize dan kompres foto, siapkan video versi mobile (H2)
   3. Cek referensi sebelum hapus gambar (H3)
   4. Security headers di nginx (M2)
   5. Samakan batas upload (M8) dan tambah penanganan sesi habis (M9)
3. **Perbaikan UX dan SEO:** draft Academic (M10), peringatan perubahan belum disimpan (M7), halaman 404 (M3), judul tab (M4), About (M5), breadcrumb News (M6)
4. **Perapian:** semua item Low (L1–L10)
