import { useEffect, useState, type FormEvent } from 'react';
import { Save, Trash2 } from 'lucide-react';

import {
  adminApi,
  type AcademicMasterLevel,
  type AcademicMasterLevelPayload,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import {
  academicLevelConfigs,
  academicLevelOrder,
  findMasterLevel,
} from './academicCrudModel';
import { useToastState } from '@/admin/components/ui/toastContext';

type LevelForm = {
  id: string | null;
  title: string;
  description: string;
};

function initialForms(levels: AcademicMasterLevel[]): Record<string, LevelForm> {
  return Object.fromEntries(
    academicLevelOrder.map((key) => {
      const config = academicLevelConfigs[key];
      const level = findMasterLevel(levels, key);
      return [
        key,
        {
          id: level?.id ?? null,
          title: level?.title ?? config.masterTitle,
          description: level?.description ?? '',
        },
      ];
    }),
  );
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function payloadFromForm(form: LevelForm): AcademicMasterLevelPayload {
  return {
    title: form.title,
    description: optionalText(form.description),
  };
}

export default function AcademicLevelsPage() {
  const [forms, setForms] = useState<Record<string, LevelForm>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);

  async function loadData() {
    const levels = await adminApi.academicMasterLevels();
    setForms(initialForms(levels));
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      loadData()
        .catch((error) => {
          if (!cancelled) {
            setMessage(error instanceof Error ? error.message : 'Failed to load Academic levels.');
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

  function updateForm(key: string, patch: Partial<LevelForm>) {
    setForms((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...patch,
      },
    }));
  }

  async function saveLevel(key: string, event: FormEvent) {
    event.preventDefault();
    const form = forms[key];
    if (!form) return;

    setSavingKey(key);
    setMessage(null);

    try {
      const saved = form.id
        ? await adminApi.updateAcademicMasterLevel(form.id, payloadFromForm(form))
        : await adminApi.createAcademicMasterLevel(payloadFromForm(form));

      updateForm(key, {
        id: saved.id,
        title: saved.title,
        description: saved.description ?? '',
      });
      setMessage(`${saved.title} saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save Academic level.');
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteLevel(key: string) {
    const form = forms[key];
    const config = academicLevelConfigs[key as keyof typeof academicLevelConfigs];
    if (!form?.id || !config) return;

    const confirmed = window.confirm(`Delete ${form.title}?`);
    if (!confirmed) return;

    setSavingKey(key);
    setMessage(null);

    try {
      await adminApi.deleteAcademicMasterLevel(form.id);
      updateForm(key, {
        id: null,
        title: config.masterTitle,
        description: '',
      });
      setMessage(`${form.title} deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete Academic level.');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <AppShell title="Academic Levels">
      <div className="grid gap-5 px-6 py-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Academic' }, { label: 'Levels' }]}
          title="Academic Levels"
          description="Manage the three fixed AcademicLevel master records."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
            Loading Academic levels...
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {academicLevelOrder.map((key) => {
              const config = academicLevelConfigs[key];
              const form = forms[key];
              if (!form) return null;
              const isSaving = savingKey === key;

              return (
                <form
                  className="grid gap-4 rounded-lg border border-[#E2E8F0] bg-white p-5"
                  key={key}
                  onSubmit={(event) => void saveLevel(key, event)}
                >
                  <div>
                    <h2 className="text-base font-semibold text-[#1C2434]">{config.title}</h2>
                    <p className="text-sm text-[#64748B]">
                      {form.id ? `Record ID: ${form.id}` : 'No master record yet.'}
                    </p>
                  </div>

                  <Field label="Title">
                    <input
                      required
                      className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={form.title}
                      onChange={(event) => updateForm(key, { title: event.target.value })}
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      className="min-h-28 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={form.description}
                      onChange={(event) =>
                        updateForm(key, { description: event.target.value })
                      }
                    />
                  </Field>

                  <div className="flex flex-wrap justify-between gap-2">
                    {form.id ? (
                      <Button
                        disabled={isSaving}
                        type="button"
                        variant="danger"
                        onClick={() => void deleteLevel(key)}
                      >
                        <Trash2 size={15} />
                        Delete
                      </Button>
                    ) : (
                      <span />
                    )}
                    <Button disabled={isSaving} type="submit">
                      <Save size={15} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
