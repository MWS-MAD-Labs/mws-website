import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

import { adminApi, type AdmissionGuidelinesContent } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Tiptap from '@/admin/components/Tiptap';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import { inputClass } from '@/admin/features/news/components/layouts/formStyles';

const defaultContent: AdmissionGuidelinesContent = {
  title: 'Admission Guidelines',
  hero: {
    title: 'Admission Guidelines',
    description:
      'Review the requirements, documents, and next steps for joining Millennia World School.',
  },
  body:
    '<p>Our admissions team will guide your family through every step, from initial consultation to enrollment confirmation.</p>',
  checklist: [
    'Contact the admissions team or book a school tour.',
    'Prepare the student and family documents requested by the school.',
    'Complete the placement and review process with our team.',
  ],
  documents: [
    'Student birth certificate or family card',
    'Previous school report, if available',
    'Parent or guardian contact information',
  ],
  cta: {
    label: 'Message admissions',
    href: '/admission',
  },
};

function normalizeContent(value: AdmissionGuidelinesContent | null): AdmissionGuidelinesContent {
  if (!value) return defaultContent;

  return {
    ...defaultContent,
    ...value,
    hero: {
      ...defaultContent.hero,
      ...(value.hero ?? {}),
    },
    cta: {
      ...defaultContent.cta,
      ...(value.cta ?? {}),
    },
    checklist: value.checklist?.length ? value.checklist : defaultContent.checklist,
    documents: value.documents?.length ? value.documents : defaultContent.documents,
  };
}

function linesToItems(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdmissionGuidelinesPage() {
  const [content, setContent] = useState<AdmissionGuidelinesContent>(defaultContent);
  const [checklistText, setChecklistText] = useState(defaultContent.checklist.join('\n'));
  const [documentsText, setDocumentsText] = useState(defaultContent.documents.join('\n'));
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      adminApi
        .admissionGuidelines()
        .then((page) => {
          if (cancelled) return;
          const nextContent = normalizeContent(page.body);
          setContent(nextContent);
          setChecklistText(nextContent.checklist.join('\n'));
          setDocumentsText(nextContent.documents.join('\n'));
          setStatus(page.status);
        })
        .catch((error) => {
          if (!cancelled) {
            setMessage(
              error instanceof Error ? error.message : 'Failed to load admission guidelines.',
            );
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [setMessage]);

  async function persist(nextStatus: 'DRAFT' | 'PUBLISHED') {
    setIsSaving(true);
    setMessage(null);

    try {
      const nextContent = {
        ...content,
        checklist: linesToItems(checklistText),
        documents: linesToItems(documentsText),
      };
      const page = await adminApi.updateAdmissionGuidelines({
        body: nextContent,
        status: nextStatus,
      });
      const savedContent = normalizeContent(page.body);
      setContent(savedContent);
      setChecklistText(savedContent.checklist.join('\n'));
      setDocumentsText(savedContent.documents.join('\n'));
      setStatus(page.status);
      setMessage(nextStatus === 'PUBLISHED' ? 'Admission guidelines published.' : 'Draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save admission guidelines.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Admission Guidelines">
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[
            { label: 'Content' },
            { label: 'Admissions', path: '/admin/content/admissions' },
            { label: 'Guidelines' },
          ]}
          title="Admission Guidelines"
          description="Edit the public admission guidelines page."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isSaving || isLoading}
                type="button"
                variant="outline"
                onClick={() => window.open('/admission/guidelines', '_blank', 'noopener,noreferrer')}
              >
                <Eye size={15} />
                Preview
              </Button>
              <Button disabled={isSaving || isLoading} type="button" variant="outline" onClick={() => void persist('DRAFT')}>
                Save Draft
              </Button>
              <Button disabled={isSaving || isLoading} type="button" onClick={() => void persist('PUBLISHED')}>
                {isSaving ? 'Saving...' : status === 'PUBLISHED' ? 'Update' : 'Publish'}
              </Button>
            </div>
          }
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading admission guidelines...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0 space-y-5">
              <section className="rounded-lg border border-[#E2E8F0] bg-white">
                <div className="border-b border-[#E2E8F0] px-5 py-4">
                  <h2 className="text-base font-semibold text-[#1C2434]">Content</h2>
                </div>
                <div className="grid gap-4 p-5">
                  <Field label="Page title">
                    <input
                      className={inputClass}
                      value={content.title}
                      onChange={(event) =>
                        setContent((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Hero title">
                    <input
                      className={inputClass}
                      value={content.hero.title}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          hero: { ...current.hero, title: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Hero description">
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={content.hero.description}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          hero: { ...current.hero, description: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field as="div" label="Body">
                    <Tiptap
                      ariaLabel="Admission guidelines body"
                      placeholder="Write admission guidelines..."
                      size="article"
                      value={content.body}
                      onChange={(value) =>
                        setContent((current) => ({ ...current, body: value }))
                      }
                    />
                  </Field>
                </div>
              </section>
            </main>

            <aside className="min-w-0 space-y-5">
              <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                <h2 className="text-sm font-semibold text-[#1C2434]">Publishing</h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Current status: {status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </p>
              </section>

              <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                <div className="grid gap-4">
                  <Field label="Checklist">
                    <textarea
                      className={`${inputClass} min-h-36 resize-y`}
                      value={checklistText}
                      onChange={(event) => setChecklistText(event.target.value)}
                    />
                  </Field>
                  <Field label="Required documents">
                    <textarea
                      className={`${inputClass} min-h-36 resize-y`}
                      value={documentsText}
                      onChange={(event) => setDocumentsText(event.target.value)}
                    />
                  </Field>
                  <Field label="CTA label">
                    <input
                      className={inputClass}
                      value={content.cta.label}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          cta: { ...current.cta, label: event.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field label="CTA URL">
                    <input
                      className={inputClass}
                      value={content.cta.href}
                      onChange={(event) =>
                        setContent((current) => ({
                          ...current,
                          cta: { ...current.cta, href: event.target.value },
                        }))
                      }
                    />
                  </Field>
                </div>
              </section>
            </aside>
          </div>
        )}
      </section>
    </AppShell>
  );
}
