import type { NewsForm } from './newsEditorModel';

const STORAGE_PREFIX = 'mws:admin-news-editor-draft';
const STORAGE_VERSION = 1;

export type StoredNewsEditorDraft = {
  form: NewsForm;
  hasLocalCoverFile: boolean;
  lostLocalArticlePhotoCount: number;
  newsId: string | null;
  removedMediaIds: string[];
  savedAt: number;
  version: number;
};

function draftKey(newsId: string | undefined) {
  return `${STORAGE_PREFIX}:${newsId ?? 'new'}`;
}

function storableForm(form: NewsForm): { form: NewsForm; lostLocalArticlePhotoCount: number } {
  const existingPhotos = form.articlePhotos.filter((photo) => !photo.file);

  return {
    form: {
      ...form,
      articlePhotos: existingPhotos,
    },
    lostLocalArticlePhotoCount: form.articlePhotos.length - existingPhotos.length,
  };
}

function isStoredDraft(value: unknown): value is StoredNewsEditorDraft {
  if (!value || typeof value !== 'object') return false;

  const draft = value as Partial<StoredNewsEditorDraft>;
  return (
    draft.version === STORAGE_VERSION &&
    typeof draft.savedAt === 'number' &&
    draft.form !== undefined &&
    Array.isArray(draft.removedMediaIds)
  );
}

export function loadNewsEditorDraft(newsId: string | undefined): StoredNewsEditorDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(newsId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    return isStoredDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveNewsEditorDraft({
  form,
  hasLocalCoverFile,
  newsId,
  removedMediaIds,
}: {
  form: NewsForm;
  hasLocalCoverFile: boolean;
  newsId: string | undefined;
  removedMediaIds: string[];
}) {
  try {
    const storable = storableForm(form);
    const draft: StoredNewsEditorDraft = {
      form: storable.form,
      hasLocalCoverFile,
      lostLocalArticlePhotoCount: storable.lostLocalArticlePhotoCount,
      newsId: newsId ?? null,
      removedMediaIds,
      savedAt: Date.now(),
      version: STORAGE_VERSION,
    };

    window.localStorage.setItem(draftKey(newsId), JSON.stringify(draft));
  } catch {
    // Autosave is a safety net only; editing and saving through the API still work.
  }
}

export function clearNewsEditorDraft(newsId: string | undefined) {
  try {
    window.localStorage.removeItem(draftKey(newsId));
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
