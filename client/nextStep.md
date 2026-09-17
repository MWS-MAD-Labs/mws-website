````md
# OurSchool Gallery Asset Integration — Schema

Update Prisma schema so `OurSchool` can store the specific image selected from Gallery.

## Requirements

- Keep existing `OurSchool.galleryId`.
- Add `featuredImageId` to store the selected `GalleryImage`.
- Add the required Prisma relations between `OurSchool` and `GalleryImage`.
- Image only for now. Do not add video support.
- Do not modify authentication.
- Do not modify frontend.
- Do not modify Gallery models beyond the relation required for `OurSchool`.

Expected relation:

```text
OurSchool
 ├── galleryId       → Gallery
 └── featuredImageId → GalleryImage
````

## After changes

Run:

```bash
npx prisma validate
npx prisma migrate dev --name add_our_school_featured_image
npx prisma generate
```

If Prisma reports a relation conflict, stop and explain it instead of changing unrelated models.

Do not implement anything beyond this task.

```
```
