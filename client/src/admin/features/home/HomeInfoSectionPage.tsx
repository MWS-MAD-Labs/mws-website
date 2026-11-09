import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type HomeContentData, type NewsCategory } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import { useToastState } from '@/admin/components/ui/toastContext';
import NewsEditorMessage from '@/admin/features/news/components/layouts/NewsEditorMessage';
import HeroEditorHeader from './components/layouts/HeroEditorHeader';
import { HERO_SLIDES_PATH } from './heroSlideForm';

const MAX_INFO_CATEGORIES = 5;

type HomeSettingsForm = {
  infoSectionCategoryIds: string[];
  infoSectionTitle: string;
};

function settingsFormFromContent(content: HomeContentData): HomeSettingsForm {
  return {
    infoSectionCategoryIds:
      content.settings.infoSectionCategoryIds ??
      (content.settings.infoSectionCategoryId ? [content.settings.infoSectionCategoryId] : []),
    infoSectionTitle: content.settings.infoSectionTitle,
  };
}

export default function HomeInfoSectionPage() {
  const navigate = useNavigate();
  const [newsCategories, setNewsCategories] = useState<NewsCategory[]>([]);
  const [homeSettings, setHomeSettings] = useState<HomeSettingsForm>({
    infoSectionCategoryIds: [],
    infoSectionTitle: 'Everything you need to know about joining MWS.',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const isBusy = isLoading || isSaving;

  useEffect(() => {
    queueMicrotask(() => {
      adminApi
        .homeContent()
        .then((content) => {
          setNewsCategories(content.categories);
          setHomeSettings(settingsFormFromContent(content));
        })
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load home settings.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, [setMessage]);

  async function saveHomeSettings() {
    setIsSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updateHomeContentSettings({
        infoSectionTitle: homeSettings.infoSectionTitle,
        infoSectionCategoryIds: homeSettings.infoSectionCategoryIds,
      });
      setNewsCategories(data.categories);
      setHomeSettings(settingsFormFromContent(data));
      setMessage('Home info section settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save home settings.');
    } finally {
      setIsSaving(false);
    }
  }

  function toggleCategory(categoryId: string, checked: boolean) {
    setHomeSettings((current) => ({
      ...current,
      infoSectionCategoryIds: checked
        ? [...current.infoSectionCategoryIds, categoryId].slice(0, MAX_INFO_CATEGORIES)
        : current.infoSectionCategoryIds.filter((id) => id !== categoryId),
    }));
  }

  return (
    <AppShell title="Home Info Section">
      <section className="w-full space-y-5 p-6">
        <HeroEditorHeader
          backLabel="Back to hero slides"
          breadcrumb="Info Section"
          title="Info Section"
          description="Choose the News categories used by the Home information cards."
          onClose={() => navigate(HERO_SLIDES_PATH)}
        />

        <NewsEditorMessage message={message} />

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading info section...
          </div>
        ) : (
          <section className="w-full rounded-lg border border-[#E2E8F0] bg-white">
            <div className="grid gap-4 p-5">
              <Field label="Section title">
                <input
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                  disabled={isBusy}
                  value={homeSettings.infoSectionTitle}
                  onChange={(event) =>
                    setHomeSettings((current) => ({
                      ...current,
                      infoSectionTitle: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field as="div" label="News categories">
                <div className="grid gap-2 rounded-lg border border-[#E2E8F0] p-3">
                  <p className="text-xs text-[#64748B]">
                    Choose up to {MAX_INFO_CATEGORIES} categories. Public Home will show these as
                    Info Section tabs.
                  </p>

                  {newsCategories.map((category) => {
                    const isSelected = homeSettings.infoSectionCategoryIds.includes(category.id);
                    const isLimitReached =
                      !isSelected &&
                      homeSettings.infoSectionCategoryIds.length >= MAX_INFO_CATEGORIES;

                    return (
                      <label
                        className={[
                          'flex items-center gap-2 text-sm',
                          isLimitReached ? 'text-[#94A3B8]' : 'text-[#1C2434]',
                        ].join(' ')}
                        key={category.id}
                      >
                        <input
                          checked={isSelected}
                          disabled={isBusy || isLimitReached}
                          type="checkbox"
                          onChange={(event) => toggleCategory(category.id, event.target.checked)}
                        />
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">
                            {category.name}
                            {category.isActive ? '' : ' (inactive)'}
                          </span>
                          <span className="shrink-0 rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                            {category._count?.posts ?? 0}
                          </span>
                        </span>
                      </label>
                    );
                  })}

                  <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-xs text-[#64748B]">
                    <span>
                      {homeSettings.infoSectionCategoryIds.length}/{MAX_INFO_CATEGORIES} selected
                    </span>
                    {homeSettings.infoSectionCategoryIds.length ? (
                      <button
                        className="font-semibold text-[#3C50E0]"
                        disabled={isBusy}
                        type="button"
                        onClick={() =>
                          setHomeSettings((current) => ({
                            ...current,
                            infoSectionCategoryIds: [],
                          }))
                        }
                      >
                        Use default cards
                      </button>
                    ) : null}
                  </div>
                </div>
              </Field>

              <div className="flex justify-end">
                <Button
                  className="inline-flex items-center gap-2"
                  disabled={isBusy}
                  type="button"
                  onClick={() => void saveHomeSettings()}
                >
                  <Save size={15} />
                  {isSaving ? 'Saving...' : 'Save Info Section'}
                </Button>
              </div>
            </div>
          </section>
        )}
      </section>
    </AppShell>
  );
}
