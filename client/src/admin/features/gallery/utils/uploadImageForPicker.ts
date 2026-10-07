import { adminApi, type GalleryImageItem, type GalleryItem } from '@/admin/api/adminApi';

type UploadImageForPickerOptions = {
  caption?: string;
  fallbackGalleryDescription?: string;
  fallbackGalleryTitle?: string;
  file: File;
  galleries: GalleryItem[];
  preferredGalleryId?: string | null;
};

type UploadImageForPickerResult = {
  alt: string;
  galleries: GalleryItem[];
  galleryId: string;
  image: GalleryImageItem;
  path: string;
};

function titleFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, '').trim() || 'Uploaded image';
}

export async function uploadImageForPicker({
  caption,
  fallbackGalleryDescription = 'Images uploaded from CMS image pickers.',
  fallbackGalleryTitle = 'CMS Uploads',
  file,
  galleries,
  preferredGalleryId,
}: UploadImageForPickerOptions): Promise<UploadImageForPickerResult> {
  const preferredGallery = preferredGalleryId
    ? galleries.find((gallery) => gallery.id === preferredGalleryId)
    : null;
  const namedGallery = galleries.find((gallery) => gallery.title === fallbackGalleryTitle);
  const targetGallery =
    preferredGallery ??
    namedGallery ??
    galleries[0] ??
    (await adminApi.createGallery({
      description: fallbackGalleryDescription,
      title: fallbackGalleryTitle,
    }));
  const title = titleFromFile(file);
  const image = await adminApi.uploadGalleryImage(targetGallery.id, {
    caption,
    file,
    title,
  });

  return {
    alt: image.title || image.caption || title,
    galleries: await adminApi.galleries(),
    galleryId: targetGallery.id,
    image,
    path: adminApi.galleryImagePublicPath(image),
  };
}
