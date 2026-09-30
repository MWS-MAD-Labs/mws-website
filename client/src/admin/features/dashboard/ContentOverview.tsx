import { ArrowRight, GraduationCap, Images, LayoutPanelTop, Newspaper, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardContentSummary } from '@/admin/api/adminApi';
import { formatFullCount } from './format';

function OverviewCard({
  to,
  icon: Icon,
  title,
  value,
  unit,
  detail,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  value: number;
  unit: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-[#7e1518]/40 hover:bg-[#7e1518]/[0.02]"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        <Icon size={16} className="text-[#7e1518]" aria-hidden="true" />
        {title}
        <ArrowRight
          size={14}
          className="ml-auto text-gray-300 transition-colors group-hover:text-[#7e1518]"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#241718]">
        {formatFullCount(value)}
        <span className="ml-1.5 text-sm font-normal text-gray-500">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </Link>
  );
}

function count(value: number, singular: string, plural = `${singular}s`) {
  return `${formatFullCount(value)} ${value === 1 ? singular : plural}`;
}

export default function ContentOverview({ content }: { content: DashboardContentSummary }) {
  const { news, hero, gallery, academic } = content;
  const liveAcademic = academic.filter((page) => page.isPublished).length;
  const academicWithChanges = academic.filter((page) => page.hasUnpublishedChanges).length;
  const hiddenSlides = hero.total - hero.active;

  const newsDetail = [
    news.drafts ? count(news.drafts, 'draft') : null,
    news.scheduled ? `${formatFullCount(news.scheduled)} scheduled` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <OverviewCard
        to="/admin/news"
        icon={Newspaper}
        title="News"
        value={news.published}
        unit="live"
        detail={newsDetail || 'No drafts waiting'}
      />
      <OverviewCard
        to="/admin/content/home"
        icon={LayoutPanelTop}
        title="Home hero"
        value={hero.active}
        unit={hero.active === 1 ? 'slide shown' : 'slides shown'}
        detail={
          hiddenSlides > 0
            ? count(hiddenSlides, 'hidden slide')
            : hero.total
              ? 'All slides are shown'
              : 'No slides yet, so the default hero is shown'
        }
      />
      <OverviewCard
        to="/admin/gallery"
        icon={Images}
        title="Gallery library"
        value={gallery.images + gallery.videos}
        unit="files"
        detail={`${count(gallery.images, 'photo')} · ${count(gallery.videos, 'video')} in ${count(gallery.galleries, 'gallery', 'galleries')}`}
      />
      <OverviewCard
        to="/admin/academic/kindergarten"
        icon={GraduationCap}
        title="Academic pages"
        value={liveAcademic}
        unit="live"
        detail={
          academicWithChanges
            ? `${count(academicWithChanges, 'page')} with unpublished changes`
            : 'Everything is published'
        }
      />
    </div>
  );
}
