Pertama, cek dan audit kondisi staging di:

https://beta.millenniaws.sch.id

Pastikan staging dapat diakses dengan normal sebelum melakukan perubahan apa pun.

## TASK

Lakukan audit staging terlebih dahulu secara menyeluruh untuk menemukan masalah, regresi, atau hal yang belum sesuai dengan kondisi production/public website saat ini.

Jangan langsung memperbaiki kode.

### Audit yang perlu dilakukan

Periksa setidaknya:

- Apakah semua halaman utama dapat dibuka dan dirender dengan normal.
- Apakah ada halaman yang blank, white screen, atau content yang hilang.
- Apakah ada error di browser console.
- Apakah ada error network/API request.
- Apakah asset image, font, CSS, JS, dan media berhasil dimuat.
- Apakah responsive layout berjalan dengan normal.
- Periksa behavior khusus mobile/iOS jika memungkinkan.
- Periksa animation dan interaction yang berpotensi menyebabkan content tidak terlihat.
- Periksa React lifecycle yang berkaitan dengan animation atau page transition.
- Periksa apakah ada perbedaan behavior antara initial page load dan navigation antar-route.
- Identifikasi masalah yang terlihat dari sisi frontend maupun konfigurasi staging.

Tujuan tahap ini adalah mendapatkan gambaran kondisi staging secara aktual, bukan sekadar menebak berdasarkan source code.

## Setelah audit

Buat ringkasan hasil audit dengan kategori:

### Critical
Masalah yang menyebabkan halaman tidak dapat digunakan, blank, content hilang, atau functionality utama rusak.

### High
Masalah yang cukup serius tetapi halaman masih dapat digunakan.

### Medium / Low
Masalah minor, visual inconsistency, atau improvement.

Untuk setiap temuan, sertakan:
- halaman/area yang terdampak
- gejala
- kemungkinan root cause
- file/code terkait jika dapat ditemukan
- apakah perlu diperbaiki sekarang atau tidak

## Setelah audit, fokus ke BUG STAGING nomor 1

BUG STAGING:

1. AOS fade animation bermasalah di iOS.
   - Di iOS, halaman bisa menjadi putih dan content tidak terlihat.
   - Ada content yang sempat muncul lalu tiba-tiba hilang.
   - Dugaan awal berkaitan dengan AOS.
   - Jangan langsung menganggap AOS sebagai penyebab sebelum melakukan audit dan tracing.

Fokus investigasi dan perbaikan hanya pada masalah AOS/iOS ini.

Periksa:
- Semua penggunaan AOS.
- `AOS.init()`.
- `AOS.refresh()` dan `AOS.refreshHard()`.
- `data-aos`.
- Lifecycle React.
- Route changes.
- Initial hidden state dari AOS.
- Timing antara render content dan initialization AOS.
- Behavior Safari/iOS.
- Apakah element tetap hidden ketika animation gagal atau tidak selesai.
- Apakah ada CSS AOS yang menyebabkan content tidak terlihat.

### Arahan animation

AOS tetap boleh digunakan.

Animation yang diperbolehkan:
- `fade`
- `fade-up`
- `fade-left`
- `fade-right`

Hindari:
- `fade-up-left`
- `fade-up-right`
- animation diagonal yang terlalu dekoratif
- terlalu banyak variasi animation berbeda dalam satu halaman

`fade-left` dan `fade-right` tetap boleh digunakan jika memang sesuai dengan layout.

Tujuannya adalah animation yang subtle dan konsisten untuk website sekolah, bukan menghilangkan AOS.

### Progressive enhancement

Yang paling penting:

Content harus tetap terlihat walaupun AOS gagal, tidak terinisialisasi, atau animation tidak berjalan.

Jangan sampai AOS membuat:

render → element hidden → animation gagal → element tetap hidden.

Animation harus menjadi enhancement, bukan dependency untuk menampilkan content.

## Scope

JANGAN mengerjakan:

- BUG nomor 2 — Google OAuth callback.
- BUG nomor 3 — UI yang terlihat AI/slop.
- Redesign public website.
- Perubahan visual yang tidak berkaitan dengan AOS.
- Migrasi ke animation library lain kecuali benar-benar terbukti diperlukan.

Jangan melakukan perubahan besar sebelum root cause ditemukan.

## Setelah perbaikan

Lakukan verification:

1. Initial page load.
2. Navigation antar halaman.
3. Desktop.
4. Mobile.
5. iOS/Safari jika environment memungkinkan.
6. Pastikan tidak ada white screen atau content yang tetap hidden.
7. Pastikan animation tetap berjalan secara normal pada browser yang mendukungnya.
8. Jalankan typecheck/lint/build yang relevan.

Terakhir, laporkan:

- hasil audit staging
- root cause bug AOS/iOS
- file yang diubah
- perubahan yang dilakukan
- hasil verification
- issue lain yang ditemukan tetapi sengaja tidak dikerjakan karena di luar scope.
