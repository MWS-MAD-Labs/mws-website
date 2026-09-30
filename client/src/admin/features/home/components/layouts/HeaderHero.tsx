import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

const breadcrumbs = [{ label: 'Content' }, { label: 'Home' }];

export default function HeaderHero() {
  return (
    <ContentPageHeader
      breadcrumbs={breadcrumbs}
      title="Hero Carousel"
      description="Manage homepage hero slides, media, content, and visibility."
    />
  );
}
