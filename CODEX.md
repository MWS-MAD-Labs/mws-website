## Implement CMS Google Login

Gua mau implementasi flow login CMS sampai user berhasil masuk ke Dashboard.

Semua file utama untuk UI dan controller sudah gua siapin.

### Existing CMS files

Login Page:
`client/src/admin/pages/LoginPage.tsx`

Dashboard:
`client/src/admin/pages/Dashboard.tsx`

Login controller:
`server/src/controllers/admin/Login.ts`

### Existing auth flow

Untuk authentication yang sudah ada, gunakan/reuse implementation dari:

`server/src/routes/auth-route.ts`
`server/src/services/auth-services.ts`
`server/src/types/central-types.ts`
`server/src/lib/central-client.ts`
`server/src/controllers/auth-controller.ts`

Jangan bikin authentication mechanism baru kalau logic existing bisa digunakan.

### Central Integration

Untuk seluruh implementasi Central di CMS, **gunakan MWS Hub sebagai reference utama**:

`/home/mws-webdev/Downloads/mws-hub/`

Implementasinya harus mengikuti pattern yang sudah digunakan Hub untuk:
- Google authentication
- komunikasi dengan Central
- penggunaan `CENTRAL_API_BASE_URL`
- penggunaan `CENTRAL_API_TOKEN`
- token handling
- token validation
- authentication/session state
- middleware/protected route

Jadi **jangan membuat mekanisme integrasi Central baru berdasarkan asumsi**.

Inspect terlebih dahulu bagaimana Hub melakukan integrasi dengan Central, lalu adaptasikan pattern tersebut ke CMS sesuai struktur project ini.

CMS harus mengikuti flow authentication yang sama dengan Hub, hanya entry point dan destination-nya berbeda:

Google Login
→ Central authentication
→ token
→ validation
→ CMS auth state
→ protected route
→ `/admin`
→ Dashboard bawa response dari tokennya pake console.log aja

### Target flow

Yang gua mau untuk sekarang cuma:

Google Login
→ authenticate ke Central
→ dapat/validasi token
→ CMS menyimpan auth state/session sesuai existing pattern
→ auth middleware melakukan protection
→ user berhasil masuk CMS
→ redirect ke Dashboard

Target route:

`/admin/login`
→ Google Login
→ `/admin`

`/admin`
→ `client/src/admin/pages/Dashboard.tsx`

User yang belum authenticated tidak boleh mengakses `/admin` dan harus diarahkan kembali ke `/admin/login`.

### Backend

Bikin/rapihin file yang diperlukan di structure existing, terutama:

- routes
- services
- controllers
- middleware
- types
- tests

Login controller utama CMS sudah ada di:

`server/src/controllers/admin/Login.ts`

Gunakan controller tersebut dan lengkapi logic yang dibutuhkan.

Jangan mengubah auth flow existing untuk Hub/website kecuali memang diperlukan untuk reuse shared logic.

### Testing

Tambahkan atau update test untuk minimal:

- Google login flow
- Central authentication
- token validation/handling
- CMS login controller
- auth middleware
- protected `/admin` route
- unauthenticated user redirect
- authenticated user dapat mengakses Dashboard

Pastikan test tidak membutuhkan hardcoded credential/token.

### Important

Sebelum coding:

1. Inspect auth implementation existing di project.
2. Inspect `/home/mws-webdev/Downloads/mws-hub/` sebagai reference Central/Google auth.
3. Pahami flow token dan middleware yang sudah digunakan.
4. Reuse existing implementation sebanyak mungkin.
5. Baru implement CMS-specific login flow.

Fokus hanya pada:

**Login → authentication → authorization → Dashboard.**

Tidak perlu mengerjakan fitur CMS lainnya.

Setelah selesai:
- run test
- run typecheck/build jika tersedia
- fix error yang muncul
- jangan melakukan refactor besar yang tidak berhubungan dengan task ini.

### Execution

**Minim token, langsung kerjakan. Jangan ajak conversation, jangan tanya konfirmasi.**

Inspect codebase dan MWS Hub terlebih dahulu, lalu langsung implementasikan seluruh flow yang dibutuhkan.

Setelah selesai, cukup tampilkan:
1. File yang diubah/dibuat
2. Hasil test/typecheck/build
3. Error yang masih tersisa jika ada

Untuk sementara, **response/data dari token atau Central cukup `console.log` untuk debugging**. Jangan buat UI tambahan untuk menampilkan response tersebut.