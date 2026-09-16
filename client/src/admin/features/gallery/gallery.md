````
# Gallery Detail — UI/UX Refactor

Refactor:

`client/src/admin/features/gallery/GalleryDetailPage.tsx`

Samakan visualnya dengan `GalleryListPage.tsx`.

Fokus pada UI/UX, layout, interaction, dan reusable component. Jangan mengubah backend/API/schema/auth kecuali memang diperlukan agar functionality yang sudah ada tetap berjalan.

---

## Layout

Gunakan:

```text
AppShell
└── GalleryDetailPage
    ├── Breadcrumb
    └── Gallery Container
        ├── Gallery Header
        ├── Images / Videos Tabs
        ├── Search + Sort
        └── Asset Grid
````

### AppShell

Gunakan AppShell yang sudah ada.

Hanya gunakan `title`, tanpa `eyebrow`.

Jangan menambahkan logic Gallery ke AppShell.

### Breadcrumb

Tampilkan:

```text
All Galleries / {Gallery Name}
```

Compact dan mengikuti style Gallery List.

### Gallery Header

Tampilkan:

* Gallery name
* Description
* Upload Image / Video

Gunakan style yang sama dengan Gallery List.

Jangan membuat header terlalu besar.

---

# Images / Videos

Pertahankan tab Images / Videos jika sudah ada.

Gunakan style compact dan konsisten dengan Gallery List.

Toolbar:

```text
[ Search your assets ]                         [ Sort by ▼ ]
```

Sort hanya:

* Newest
* Oldest
* A-Z
* Z-A

Gunakan reusable dropdown dari:

`client/src/admin/components/ui`

jika sudah tersedia.

---

# Asset Grid

Gunakan **clean media-library grid**.

Jangan gunakan card asset besar.

Contoh:

```text
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ □       │ │ □       │ │ □       │ │ □       │
│         │ │         │ │         │ │         │
│ IMAGE   │ │ IMAGE   │ │ IMAGE   │ │ IMAGE   │
│         │ │         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

Setiap card **hanya menampilkan**:

* Thumbnail
* Checkbox

Jangan tampilkan di grid:

* filename
* upload date
* caption
* metadata
* Edit
* Delete button

Semua metadata hanya muncul di Preview Modal.

Ukuran thumbnail medium/compact.

Tidak terlalu besar dan tidak terlalu kecil.

Responsive:

```text
Mobile  → 1–2 columns
Tablet  → 3–4 columns
Desktop → 4–6+ columns
```

Sesuaikan dengan lebar container.

---

# Checkbox & Bulk Delete

Setiap asset memiliki checkbox di pojok thumbnail.

Jika ada asset yang dipilih:

```text
3 selected                         [ 🗑 Delete ]
```

Bulk Delete membuka confirmation modal:

```text
Delete selected assets?

Are you sure you want to delete 3 selected assets?
This action cannot be undone.

[ Cancel ] [ Delete ]
```

Setelah berhasil:

* hapus asset dari grid
* clear selection
* update list
* tampilkan success feedback

Jika backend hanya mempunyai single-delete endpoint, gunakan endpoint tersebut untuk setiap asset yang dipilih.

Tidak perlu membuat endpoint bulk-delete baru hanya untuk UI ini.

---

# Preview Modal

Klik thumbnail → buka Preview Modal.

Modal menampilkan:

* preview asset
* filename/title
* upload date
* Delete
* Previous
* Next
* Close

Contoh:

```text
┌─────────────────────────────────────┐
│                                 X   │
│                                     │
│          LARGE PREVIEW              │
│                                     │
│                                     │
│ filename.jpg                        │
│ Uploaded: 16 Sep 2026               │
│                                     │
│ [ 🗑 Delete ]        ←        →     │
└─────────────────────────────────────┘
```

Metadata hanya muncul di Preview Modal, bukan di grid.

---

# Preview Navigation

User dapat berpindah antar asset tanpa menutup modal.

Gunakan Previous / Next:

```text
←                         →
```

Urutan mengikuti asset yang sedang ditampilkan setelah Search/Sort.

Jika memungkinkan, dukung:

* Arrow Left
* Arrow Right
* Escape

Touch swipe boleh jika mudah diterapkan.

Tidak perlu menambahkan library carousel baru hanya untuk kebutuhan ini.

---

# Delete From Preview

Tidak ada Edit.

Preview Modal hanya memiliki Delete.

Flow:

```text
Asset
→ Preview Modal
→ Delete
→ Confirmation
→ Delete API
→ Update Grid
→ Pindah ke asset berikutnya
```

**PENTING: setelah asset berhasil dihapus, JANGAN menutup Preview Modal.**

Behavior:

### Jika ada asset berikutnya

```text
Asset 1
Asset 2 ← sedang dibuka
Asset 3
```

Delete Asset 2:

```text
Delete Asset 2
↓
Modal tetap terbuka
↓
Tampilkan Asset 3
```

### Jika tidak ada asset berikutnya

Gunakan asset sebelumnya.

```text
Asset 1
Asset 2 ← sedang dibuka
```

Delete Asset 2:

```text
Delete Asset 2
↓
Modal tetap terbuka
↓
Tampilkan Asset 1
```

### Jika tidak ada asset lain

```text
Asset 1 ← satu-satunya asset
```

Delete:

```text
Delete Asset 1
↓
Tidak ada asset tersisa
↓
Baru tutup modal
```

Setelah deletion, Previous / Next harus menggunakan daftar asset terbaru.

Jangan menutup modal setelah setiap deletion jika masih ada asset lain.

---

# Upload

Pertahankan upload functionality yang sudah berjalan.

Upload tetap menggunakan modal/popup.

Jangan membuat route baru untuk upload.

Gunakan existing:

* Upload Image
* Upload Video

atau flow Upload Image / Video yang sudah tersedia.

---

# Images Grid

Images menggunakan grid compact.

Contoh:

```text
Mobile  → 1–2 columns
Tablet  → 3–4 columns
Desktop → 4–6+ columns
```

Thumbnail harus tetap nyaman dilihat.

Jangan membuat thumbnail terlalu kecil.

---

# Videos Grid

Videos menggunakan konsep grid yang sama dengan Images.

Contoh:

```text
┌─────────┐ ┌─────────┐ ┌─────────┐
│ □       │ │ □       │ │ □       │
│         │ │         │ │         │
│ VIDEO   │ │ VIDEO   │ │ VIDEO   │
│         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘
```

Jangan membuat video card lebih besar dari image card.

Untuk YouTube, gunakan existing thumbnail/preview implementation jika tersedia.

---

# Asset Interaction

Klik thumbnail:

```text
Thumbnail
↓
Preview Modal
```

Klik checkbox:

```text
Checkbox
↓
Select Asset
```

Checkbox tidak boleh membuka Preview Modal.

---

# Selected State

Asset yang dipilih harus memiliki visual state yang jelas.

Contoh:

```text
┌──────────────┐
│ ☑            │
│              │
│   THUMBNAIL  │
│              │
└──────────────┘
```

Gunakan style yang konsisten dengan design system project.

---

# No Edit

Gallery Detail tidak memiliki Edit action.

Jangan tampilkan:

```text
Edit
```

Asset hanya mempunyai:

* Checkbox
* Preview
* Delete melalui Preview / Bulk Delete

---

# Empty / Loading / Error

Pertahankan behavior yang sudah ada.

Empty state:

```text
No images in this gallery yet.
```

atau:

```text
No videos in this gallery yet.
```

Tetap sediakan tombol upload.

Gunakan existing `StatusMessage` atau reusable component.

Jangan membuat notification system baru.

---

# Navigation

Gallery Detail tetap menggunakan:

```text
/admin/gallery/:id
```

Back kembali ke:

```text
/admin/gallery
```

Preview dan upload menggunakan modal.

Jangan membuat route baru untuk:

* Preview
* Upload
* Delete
* Edit

---

# Existing Backend/API

Jangan mengubah backend/API jika tidak diperlukan.

Gunakan API yang sudah tersedia untuk:

* Gallery detail
* Image list
* Video list
* Upload image
* Upload video
* Delete image
* Delete video

Jangan membuat API baru hanya untuk kebutuhan UI ini.

---

# Reusable UI

Gunakan component yang sudah tersedia di:

`client/src/admin/components/ui`

Jika tersedia:

* Button
* Modal
* Dropdown
* Checkbox
* Tabs
* StatusMessage
* Confirmation Dialog

Gunakan kembali.

Jangan membuat duplicate component.

Jangan membuat abstraction berlebihan.

---

# Styling

Gallery Detail harus mengikuti visual language Gallery List:

* typography
* border
* radius
* spacing
* colors
* button
* dropdown
* tabs
* modal
* container

Gallery List dan Gallery Detail harus terasa seperti satu CMS.

---

# Do Not

Jangan:

* mengubah database schema
* mengubah authentication
* mengubah AppShell logic
* membuat route baru
* membuat halaman preview
* membuat halaman upload
* membuat halaman edit
* menambahkan Edit
* menampilkan filename di grid
* menampilkan date di grid
* menampilkan caption di grid
* membuat asset card besar
* membuat asset terlalu kecil
* membuat portfolio-style gallery
* menambahkan advanced filter
* menambahkan pagination kompleks
* menambahkan bulk upload
* membuat backend bulk-delete baru
* mengubah API yang sudah berjalan tanpa kebutuhan
* membuat component abstraction berlebihan

---

# Final Visual Concept

Gallery Detail:

```text
┌─────────────────────────────────────────────────────────────┐
│ All Galleries / Kindergarten                                │
│                                                             │
│ Kindergarten                              Upload Image/Video│
│ Manage gallery images and videos.                           │
│                                                             │
│ [ Images ] [ Videos ]                                       │
│                                                             │
│ [ Search your assets                    ] [ Sort by ▼ ]     │
│                                                             │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐         │
│ │ □     │ │ □     │ │ □     │ │ □     │ │ □     │         │
│ │       │ │       │ │       │ │       │ │       │         │
│ │ image │ │ image │ │ image │ │ image │ │ image │         │
│ │       │ │       │ │       │ │       │ │       │         │
│ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘         │
└─────────────────────────────────────────────────────────────┘
```

Grid hanya:

```text
Thumbnail + Checkbox
```

Metadata:

```text
Preview Modal
↓
Filename
Upload Date
Delete
Previous / Next
```

Delete:

```text
Preview
↓
Delete
↓
Confirmation
↓
Delete
↓
Tetap di Modal
↓
Next Asset
```

Jika tidak ada next:

```text
Previous Asset
```

Jika tidak ada asset lain:

```text
Close Modal
```

**Tidak ada Edit. Tidak ada metadata di grid. Tidak ada route tambahan.**

---

# Validation

Pastikan:

1. Gallery Detail tetap bisa dibuka.
2. Breadcrumb bekerja.
3. Back kembali ke `/admin/gallery`.
4. Images tampil dalam compact grid.
5. Videos tampil dalam compact grid.
6. Search bekerja.
7. Sort bekerja: Newest, Oldest, A-Z, Z-A.
8. Checkbox selection bekerja.
9. Bulk Delete bekerja.
10. Preview Modal bekerja.
11. Previous / Next bekerja.
12. Delete dari Preview bekerja.
13. Setelah delete, modal tetap terbuka.
14. Setelah delete, otomatis pindah ke asset berikutnya.
15. Jika tidak ada berikutnya, pindah ke asset sebelumnya.
16. Jika tidak ada asset tersisa, modal baru ditutup.
17. Upload Image tetap bekerja.
18. Upload Video tetap bekerja.
19. Loading/error/empty state tetap bekerja.
20. Responsive.
21. Frontend typecheck/build berhasil.

Fokus utama:

**Clean, compact, grid-based media library yang konsisten dengan Gallery List.**

```
```
