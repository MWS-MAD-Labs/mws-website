import { ArrowRight, CircleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardContentSummary } from '@/admin/api/adminApi';

type AttentionItem = { key: string; text: string; to: string; action: string };

function attentionItems(content: DashboardContentSummary): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (content.news.drafts > 0) {
    items.push({
      key: 'drafts',
      text: `${content.news.drafts} news ${content.news.drafts === 1 ? 'draft is' : 'drafts are'} not published yet.`,
      to: '/admin/news?status=DRAFT',
      action: 'Review drafts',
    });
  }

  content.academic
    .filter((page) => page.hasUnpublishedChanges)
    .forEach((page) =>
      items.push({
        key: `academic-${page.levelKey}`,
        text: `${page.title} has saved changes that are not live yet.`,
        to: `/admin/academic/${page.levelKey}`,
        action: 'Open and publish',
      }),
    );

  if (content.hero.missingMedia > 0) {
    items.push({
      key: 'hero-media',
      text: `${content.hero.missingMedia} visible hero ${content.hero.missingMedia === 1 ? 'slide has' : 'slides have'} no image or video.`,
      to: '/admin/content/home',
      action: 'Add media',
    });
  }

  if (content.users && content.users.pendingInvitations > 0) {
    items.push({
      key: 'invitations',
      text: `${content.users.pendingInvitations} CMS ${content.users.pendingInvitations === 1 ? 'invitation is' : 'invitations are'} waiting to be accepted.`,
      to: '/admin/users',
      action: 'View invitations',
    });
  }

  return items;
}

/** Only rendered when something actually needs a decision. */
export default function AttentionList({ content }: { content: DashboardContentSummary }) {
  const items = attentionItems(content);
  if (!items.length) return null;

  return (
    <section
      aria-labelledby="attention-title"
      className="rounded-lg border border-amber-200 bg-amber-50/60"
    >
      <h2
        id="attention-title"
        className="flex items-center gap-2 border-b border-amber-200 px-5 py-3 text-sm font-semibold text-amber-900"
      >
        <CircleAlert size={16} aria-hidden="true" />
        Needs your attention
      </h2>
      <ul className="divide-y divide-amber-200/70">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm"
          >
            <span className="text-amber-900">{item.text}</span>
            <Link
              to={item.to}
              className="inline-flex items-center gap-1 font-semibold text-[#7e1518] hover:underline"
            >
              {item.action}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
