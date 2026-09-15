Kita sedang mengerjakan fitur Gallery berdasarkan Gallery.md.

Login/auth sudah selesai. Hero Slide dan fitur CMS lain OUT OF SCOPE.

Untuk tahap ini JANGAN implementasikan Gallery CRUD dulu.

Kerjakan hanya:
1. Inspect project:
   - server/prisma/schema.prisma
   - server/src/lib/minio.ts
   - docker-compose.yml
   - .env terkait MinIO
   - package.json
   - struktur backend/frontend
   - existing storage/upload implementation
   - existing auth/middleware/permission

2. Verifikasi MinIO:
   - konfigurasi Docker
   - env
   - MinIO client
   - bucket

3. Pastikan backend Bun/TypeScript bisa:
   - connect ke MinIO
   - check/create bucket
   - upload object
   - check object
   - delete object

4. Gunakan package `minio` yang sudah ada.
5. Jangan hardcode credential.
6. Jangan membuat konfigurasi MinIO duplicate.
7. Jangan mengubah auth/login.
8. Jangan mengubah Prisma schema.
9. Jangan implement frontend.
10. Jangan implement Gallery CRUD.

Jika konfigurasi MinIO sudah benar, cukup lakukan test/verification.
Jika ada masalah, perbaiki hanya bagian MinIO yang diperlukan.

Setelah selesai, laporkan:
- file yang dicek/diubah
- hasil koneksi MinIO
- bucket
- hasil upload
- hasil object check
- hasil delete
- error yang ditemukan
- command/test yang dijalankan

STOP setelah tahap ini. Jangan lanjut ke tahap Gallery Repository.