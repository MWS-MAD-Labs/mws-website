import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import type { GalleryItem } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import type { GalleryAssetTab } from '../types';

type GalleryDetailHeaderProps = {
  gallery: GalleryItem | null;
  onOpenUpload: (type: GalleryAssetTab) => void;
};

export default function GalleryDetailHeader({ gallery, onOpenUpload }: GalleryDetailHeaderProps) {
  return (
    <div className="border-b border-[#E2E8F0] px-5 py-4">
      <ContentPageHeader
        breadcrumbs={[
          { label: 'Media' },
          { label: 'Gallery', path: '/admin/gallery' },
          { label: gallery?.title ?? 'Gallery Detail' },
        ]}
        title={gallery?.title ?? 'Gallery Detail'}
        description={gallery?.description || 'Manage gallery images and videos.'}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <Link to="/admin/gallery">
              <Button size="sm" type="button" variant="outline">
                Back
              </Button>
            </Link>

            {gallery ? (
              <>
                <Button
                  className="inline-flex items-center gap-1.5 px-3 text-xs"
                  size="sm"
                  type="button"
                  onClick={() => onOpenUpload('images')}
                >
                  <Upload size={14} />
                  <span>Upload Image</span>
                </Button>
                <Button
                  className="inline-flex items-center gap-1.5 px-3 text-xs"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onOpenUpload('videos')}
                >
                  <Upload size={14} />
                  <span>Upload Video</span>
                </Button>
              </>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
