import { Eye, MoreHorizontal, Pencil } from 'lucide-react';

import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import { managedPages } from './config/pages';

export default function PagesManagementPage() {
  return (
    <AppShell title="Pages">
      <section className="space-y-6 px-6 py-6 lg:px-8 lg:py-7">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Pages' }]}
          title="Your Site's Pages"
          description="Manage and edit your website pages."
          action={
            <span className="text-sm text-[#64748B]">
              {managedPages.length} {managedPages.length === 1 ? 'page' : 'pages'}
            </span>
          }
        />

        {/* Page Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {managedPages.map((page) => (
            <article
              key={page.id}
              className="group overflow-hidden rounded-lg border border-[#E2E8F0] bg-white transition-shadow hover:shadow-sm"
            >
              {/* Preview */}
              <div className="relative aspect-[16/9] overflow-hidden border-b border-[#E2E8F0] bg-[#F1F5F9]">
                {/* Browser-style preview */}
                <div className="absolute inset-3 overflow-hidden rounded border border-[#E2E8F0] bg-white shadow-sm">
                  {/* Browser bar */}
                  <div className="flex h-5 items-center gap-1 border-b border-[#E2E8F0] bg-[#F1F5F9] px-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#64748B]/30" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#64748B]/30" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#64748B]/30" />
                  </div>

                  {/* Page preview */}
                  <div className="space-y-2.5 p-3">
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 rounded bg-[#E2E8F0]" />

                      <div className="flex gap-1">
                        <div className="h-1.5 w-6 rounded bg-[#F1F5F9]" />
                        <div className="h-1.5 w-6 rounded bg-[#F1F5F9]" />
                        <div className="h-1.5 w-6 rounded bg-[#F1F5F9]" />
                      </div>
                    </div>

                    <div className="h-14 rounded bg-[#F1F5F9]" />

                    <div className="space-y-1.5">
                      <div className="h-1.5 w-3/4 rounded bg-[#F1F5F9]" />
                      <div className="h-1.5 w-full rounded bg-[#F1F5F9]" />
                      <div className="h-1.5 w-2/3 rounded bg-[#F1F5F9]" />
                    </div>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-[#1C2434] shadow-sm transition-colors hover:bg-[#F1F5F9]"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-[#1C2434] shadow-sm transition-colors hover:bg-[#F1F5F9]"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 py-4">
                {/* Title + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'h-2 w-2 shrink-0 rounded-full',
                          page.status === 'Published' ? 'bg-[#10B981]' : 'bg-[#64748B]/30',
                        ].join(' ')}
                      />

                      <h3 className="truncate text-sm font-semibold text-[#1C2434]">{page.title}</h3>
                    </div>

                    <p className="mt-1.5 truncate pl-4 font-mono text-[11px] text-[#64748B]">
                      {page.path}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={`More actions for ${page.title}`}
                    className="shrink-0 rounded-md p-1 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#1C2434]"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>

                {/* Meta */}
                <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                  <span className="text-[11px] text-[#64748B]">{page.template}</span>

                  <span
                    className={[
                      'rounded-md px-2 py-1 text-[10px] font-semibold',
                      page.status === 'Published'
                        ? 'bg-[#10B981]/10 text-[#047857]'
                        : 'bg-[#F1F5F9] text-[#64748B]',
                    ].join(' ')}
                  >
                    {page.status}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
