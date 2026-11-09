import { adminApi, type GalleryItem, type GalleryVideoItem } from '@/admin/api/adminApi';

/** Same limits the Gallery API enforces in server/src/services/gallery-service.ts. */
export const PICKER_VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';
const ACCEPTED_VIDEO_TYPES = new Set(PICKER_VIDEO_ACCEPT.split(','));
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

type UploadVideoForPickerOptions = {
  caption?: string;
  fallbackGalleryDescription?: string;
  fallbackGalleryTitle?: string;
  file: File;
  galleries: GalleryItem[];
  preferredGalleryId?: string | null;
};

type UploadVideoForPickerResult = {
  alt: string;
  galleries: GalleryItem[];
  galleryId: string;
  path: string;
  video: GalleryVideoItem;
};

function titleFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, '').trim() || 'Uploaded video';
}

/**
 * Video counterpart of uploadImageForPicker: uploads a local file into the
 * Gallery Library and returns the public path to store on the content record.
 */
export async function uploadVideoForPicker({
  caption,
  fallbackGalleryDescription = 'Videos uploaded from CMS media pickers.',
  fallbackGalleryTitle = 'CMS Uploads',
  file,
  galleries,
  preferredGalleryId,
}: UploadVideoForPickerOptions): Promise<UploadVideoForPickerResult> {
  if (!ACCEPTED_VIDEO_TYPES.has(file.type)) {
    throw new Error('Video must be an MP4, WebM, or MOV file.');
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video must be 50 MB or smaller.');
  }

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
  const video = await adminApi.uploadGalleryVideo(targetGallery.id, {
    caption,
    file,
    title,
  });

  return {
    alt: video.title || video.caption || title,
    galleries: await adminApi.galleries(),
    galleryId: targetGallery.id,
    path: adminApi.galleryVideoPublicPath(video),
    video,
  };
}
