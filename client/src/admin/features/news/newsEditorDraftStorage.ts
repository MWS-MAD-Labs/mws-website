import type { NewsForm } from './newsEditorModel';

const STORAGE_PREFIX = 'mws:admin-news-editor-draft';
const STORAGE_VERSION = 2;

export type StoredNewsEditorDraft = {
  form: NewsForm;
  hasLocalCoverFile: boolean;
  lostLocalArticlePhotoCount: number;
  newsId: string | null;
  removedMediaIds: string[];
  savedAt: number;
  userId: string;
  version: number;
};

export type NewsEditorDraftLoadResult = {
  draft: StoredNewsEditorDraft | null;
  storageAvailable: boolean;
};

function draftKey(newsId: string | undefined, userId: string) {
  return `${STORAGE_PREFIX}:${userId}:${newsId ?? 'new'}`;
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
    typeof draft.userId === 'string' &&
    draft.form !== undefined &&
    Array.isArray(draft.removedMediaIds)
  );
}

export function loadNewsEditorDraft(
  newsId: string | undefined,
  userId: string,
): NewsEditorDraftLoadResult {
  let raw: string | null;

  try {
    raw = window.localStorage.getItem(draftKey(newsId, userId));
  } catch {
    return { draft: null, storageAvailable: false };
  }

  if (!raw) return { draft: null, storageAvailable: true };

  try {
    const parsed = JSON.parse(raw) as unknown;
    return {
      draft:
        isStoredDraft(parsed) && parsed.userId === userId && parsed.newsId === (newsId ?? null)
          ? parsed
          : null,
      storageAvailable: true,
    };
  } catch {
    return { draft: null, storageAvailable: true };
  }
}

export function saveNewsEditorDraft({
  form,
  hasLocalCoverFile,
  newsId,
  removedMediaIds,
  userId,
}: {
  form: NewsForm;
  hasLocalCoverFile: boolean;
  newsId: string | undefined;
  removedMediaIds: string[];
  userId: string;
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
      userId,
      version: STORAGE_VERSION,
    };

    window.localStorage.setItem(draftKey(newsId, userId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearNewsEditorDraft(newsId: string | undefined, userId: string) {
  try {
    window.localStorage.removeItem(draftKey(newsId, userId));
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
