Implement ulang CMS authorization menggunakan **`CmsRole` enum**, dengan logic khusus berdasarkan `unit_id` dari Central.

Context:

* Google OAuth sudah working.
* Central = identity + employment status + `unit_id`.
* CMS DB = CMS user + authorization.
* Ganti `Role`/`roleId` menjadi `CmsRole?`.
* Roles: `SUPER_ADMIN`, `ADMIN`, `VIEWER`.
* `null` = tidak punya CMS access.

Flow:

`Google OAuth → Central lookup → employee + ACTIVE → cek unit_id → CMS authorization`

Rules:

* Jika `centralUser.unit_id` = unit ID milik **MAD Labs**, otomatis `SUPER_ADMIN`.
* Simpan/update role tersebut di CMS DB.
* Jika bukan MAD Labs, jangan otomatis diberi role.
* Cari CMS User berdasarkan email.
* Jika CMS User punya `ADMIN` → akses admin sesuai permission.
* Jika `VIEWER` → read-only/dashboard.
* Jika role `null` atau CMS User tidak ada → 403.
* Jangan mengambil CMS role dari Central.
* Jangan derive role dari `job_position` atau `job_level`.
* Semua authorization wajib backend.
* Jangan ubah `Testimonial.role`; itu bukan auth role.

Unit ID:

* Cari implementation di **MWS Hub** yang sudah mengambil/mapping `unit_id` dari Central.
* Reuse service/helper/client dan pola yang sama untuk CMS.
* Jangan duplicate Central lookup logic.
* Jangan hardcode `unit_id` jika implementation/configuration existing bisa digunakan.

Promotion:

* Hanya `SUPER_ADMIN` yang boleh promote/demote user.
* User non-MAD Labs awalnya `null`.
* `SUPER_ADMIN` dapat mengubahnya menjadi `ADMIN` atau `VIEWER`.
* ADMIN tidak boleh mengubah role menjadi privilege yang lebih tinggi.
* `SUPER_ADMIN` tidak boleh diberikan manual kepada user non-MAD Labs.
* Jika user SUPER_ADMIN sudah tidak lagi berada di MAD Labs, saat login berikutnya重新-evaluate dan tidak boleh mempertahankan SUPER_ADMIN otomatis.

Sebelum coding:

1. Trace auth flow Google → Central → session → middleware.
2. Audit penggunaan existing `Role`, `roleId`, permissions, dan user auth.
3. Cari dan inspect implementation MWS Hub untuk `unit_id`.
4. Pastikan migration aman dan tidak merusak data existing.

Implement end-to-end:

* `CmsRole` enum
* CMS user lookup
* Central `unit_id` authorization
* Reuse MWS Hub `unit_id` logic
* session authorization context
* backend role middleware/helper
* promotion/demotion endpoint
* frontend role-based access

Tests minimal:

* MAD Labs + ACTIVE → SUPER_ADMIN
* non-MAD Labs + ADMIN → allowed
* non-MAD Labs + VIEWER → read-only
* non-MAD Labs + no role → 403
* no CMS user → 403
* inactive Central → 403
* non-employee → 403
* ADMIN promote → 403
* SUPER_ADMIN promote → success
* SUPER_ADMIN dari MAD Labs pindah unit → tidak lagi SUPER_ADMIN

Run:

`bun run db:validate`
`bun run typecheck`
`bun test`

Jangan mengubah arsitektur Central untuk menyimpan CMS role. Gunakan existing auth flow dan jangan duplicate logic.

Di akhir kasih ringkasan singkat:

1. flow final
2. file yang berubah
3. migration
4. promotion/authorization
5. hasil test
