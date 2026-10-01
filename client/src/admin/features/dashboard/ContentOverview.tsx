import { ArrowRight, GraduationCap, Images, LayoutPanelTop, Newspaper, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardContentSummary } from '@/admin/api/adminApi';
import { formatFullCount } from './format';

function OverviewItem({
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
      className="group flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F1F5F9]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#3C50E0]/10 text-[#3C50E0]">
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[#1C2434]">{title}</p>
          <ArrowRight
            size={14}
            className="shrink-0 text-[#64748B] transition-colors group-hover:text-[#3C50E0]"
            aria-hidden="true"
          />
        </div>
        <p className="mt-0.5 truncate text-xs text-[#64748B]">{detail}</p>
      </div>
      <p className="shrink-0 text-right text-xl font-semibold tabular-nums text-[#1C2434]">
        {formatFullCount(value)}
        <span className="ml-1 text-xs font-normal text-[#64748B]">{unit}</span>
      </p>
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
    <section aria-labelledby="overview-title" className="rounded-lg border border-[#E2E8F0] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3">
        <h2 id="overview-title" className="text-sm font-semibold text-[#1C2434]">
          Content Overview
        </h2>
        <span className="text-xs text-[#64748B]">Live website content</span>
      </div>

      <div className="grid divide-y divide-[#E2E8F0] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <OverviewItem
          to="/admin/news"
          icon={Newspaper}
          title="News"
          value={news.published}
          unit="live"
          detail={newsDetail || 'No drafts waiting'}
        />
        <OverviewItem
          to="/admin/content/home"
          icon={LayoutPanelTop}
          title="Home Hero"
          value={hero.active}
          unit="shown"
          detail={
            hiddenSlides > 0
              ? count(hiddenSlides, 'hidden slide')
              : hero.total
                ? 'All slides are shown'
                : 'Default hero is shown'
          }
        />
        <OverviewItem
          to="/admin/gallery"
          icon={Images}
          title="Gallery"
          value={gallery.images + gallery.videos}
          unit="files"
          detail={`${count(gallery.images, 'photo')} · ${count(gallery.videos, 'video')}`}
        />
        <OverviewItem
          to="/admin/academic/kindergarten"
          icon={GraduationCap}
          title="Academic"
          value={liveAcademic}
          unit="live"
          detail={
            academicWithChanges
              ? `${count(academicWithChanges, 'page')} with unpublished changes`
              : 'Everything is published'
          }
        />
      </div>
    </section>
  );
}
