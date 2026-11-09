import type { ReactNode } from 'react';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

const breadcrumbs = [{ label: 'Content' }, { label: 'Home' }];

export default function HeaderHero({ action }: { action?: ReactNode }) {
  return (
    <ContentPageHeader
      action={action}
      breadcrumbs={breadcrumbs}
      title="Hero Carousel"
      description="Manage homepage hero slides, media, content, and visibility."
    />
  );
}
