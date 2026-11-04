import { describe, expect, it } from 'bun:test';
import {
  isResizableImage,
  responsiveImageAttributes as responsiveImage,
} from '../src/lib/imageVariants';

const GALLERY = 'http://api.test/api/gallery-images/63429aec-e020-4809-8b84-8b2451d82eaa/file';

describe('responsiveImage', () => {
  it('offers resized copies of an uploaded image', () => {
    const image = responsiveImage(GALLERY, '(min-width: 768px) 33vw, 100vw');

    expect(image.src).toBe(GALLERY);
    expect(image.sizes).toBe('(min-width: 768px) 33vw, 100vw');
    expect(image.srcSet).toBe(
      [
        `${GALLERY}?w=320 320w`,
        `${GALLERY}?w=640 640w`,
        `${GALLERY}?w=960 960w`,
        `${GALLERY}?w=1280 1280w`,
        `${GALLERY} 2000w`,
      ].join(', '),
    );
  });

  it('recognises every resizable upload route', () => {
    for (const path of [
      '/api/news/media/63429aec-e020-4809-8b84-8b2451d82eaa/file',
      '/api/news/content-images/3f2504e0-4f89-41d3-9a0c-0305e82c3301.webp',
      '/api/pages/academic-assets/academic%2Fimages%2Fabc-photo.webp',
    ]) {
      expect(isResizableImage(path)).toBe(true);
    }
  });

  it('leaves bundled, external and non-image files alone', () => {
    for (const src of [
      '/assets-mws/DSC04079.jpg',
      'https://example.com/photo.jpg',
      '/api/gallery-images/videos/63429aec-e020-4809-8b84-8b2451d82eaa/file',
      '/api/pages/academic-assets/academic%2Fdocuments%2Fguide.pdf',
    ]) {
      expect(responsiveImage(src, '100vw').srcSet).toBeUndefined();
    }
  });
});
