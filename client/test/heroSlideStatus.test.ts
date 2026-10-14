import { describe, expect, it } from 'bun:test';
import { getHeroSlideStatus } from '../src/admin/features/home/heroSlideStatus';

describe('getHeroSlideStatus', () => {
  it('prioritizes missing media even when the slide is inactive', () => {
    expect(
      getHeroSlideStatus({
        caption: null,
        isActive: false,
        mediaPath: null,
        title: 'Welcome',
      }).label,
    ).toBe('Needs media');
  });

  it('marks inactive complete slides as hidden', () => {
    expect(
      getHeroSlideStatus({
        caption: 'Caption',
        isActive: false,
        mediaPath: '/api/gallery-images/11111111-1111-4111-8111-111111111111/file',
        title: 'Welcome',
      }).label,
    ).toBe('Hidden');
  });

  it('marks active complete slides as ready', () => {
    expect(
      getHeroSlideStatus({
        caption: 'Caption',
        isActive: true,
        mediaPath: '/api/gallery-images/11111111-1111-4111-8111-111111111111/file',
        title: 'Welcome',
      }).label,
    ).toBe('Ready');
  });
});
