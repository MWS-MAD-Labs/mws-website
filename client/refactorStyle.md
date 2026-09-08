Sekarang refactor styling di seluruh CMS `mws-website`.

**PENTING: ini bukan redesign.**

Tujuannya hanya memindahkan styling yang sekarang masih menggunakan external CSS / CSS file ke **Tailwind CSS yang sudah tersedia di project**.

Requirements:

* Pertahankan **visual appearance 100% semirip mungkin** dengan kondisi sekarang.
* Jangan mengubah layout, spacing, ukuran, warna, typography, border, radius, shadow, responsive behavior, atau interaction yang sudah ada.
* Jangan membuat design baru.
* CSS yang sekarang sudah menghasilkan tampilan tertentu harus diterjemahkan ke utility class Tailwind yang ekuivalen.
* Gunakan Tailwind CSS yang **sudah ada/configured di project**, jangan menambahkan styling framework baru.
* Hapus external CSS hanya setelah seluruh penggunaan CSS tersebut sudah dimigrasikan.
* Kalau ada styling yang tidak bisa langsung direpresentasikan dengan utility Tailwind, cari solusi Tailwind yang paling dekat. Jangan mengubah visual hanya demi mempermudah refactor.

Sekalian rapikan component structure:

* Kalau ada UI yang sama/berulang, extract menjadi reusable component.
* Gunakan component yang sudah ada jika memungkinkan.
* Jangan membuat satu page/component menjadi terlalu besar.
* Refactor component hanya untuk meningkatkan reuse/structure, **bukan mengubah behavior**.

Scope utama:
`client/src`

Sebelum selesai:

1. Pastikan tampilan tetap sama seperti sebelumnya.
2. Pastikan external CSS yang sudah tidak digunakan dihapus.
3. Pastikan tidak ada duplicate component yang jelas bisa direuse.
4. Jalankan typecheck/test yang tersedia.
5. Langsung kerjakan, jangan hanya memberikan rekomendasi atau laporan.

**Sekali lagi: preserve existing design. Yang berubah hanya implementation dari external CSS → Tailwind CSS.**

**Jika suatu styling tidak bisa direpresentasikan secara identik dengan Tailwind utility, jangan mengubah visual untuk memaksakan Tailwind. Pertahankan nilai/style yang diperlukan dengan pendekatan Tailwind yang paling dekat dan laporkan bagian tersebut.**