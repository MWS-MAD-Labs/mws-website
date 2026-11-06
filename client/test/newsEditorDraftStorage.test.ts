import { afterEach, describe, expect, it } from 'bun:test';
import type { NewsForm } from '../src/admin/features/news/newsEditorModel';
import {
  clearNewsEditorDraft,
  loadNewsEditorDraft,
  saveNewsEditorDraft,
} from '../src/admin/features/news/newsEditorDraftStorage';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
const values = new Map<string, string>();

function emptyForm(): NewsForm {
  return {
    authorName: '',
    categoryId: '',
    content: '',
    coverImage: '',
    coverImageAlt: '',
    excerpt: '',
    isFeatured: false,
    publishedAt: '',
    readTime: '0',
    seoDescription: '',
    seoTitle: '',
    slug: '',
    status: 'DRAFT',
    tagIds: [],
    title: '',
    articlePhotos: [],
  };
}

function installStorage() {
  values.clear();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
  });
}

afterEach(() => {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
  values.clear();
});

describe('news editor draft storage', () => {
  it('restores a draft only for the account that saved it', () => {
    installStorage();
    const form = { ...emptyForm(), title: 'Unfinished article' };

    expect(
      saveNewsEditorDraft({
        form,
        hasLocalCoverFile: false,
        newsId: 'news-1',
        removedMediaIds: [],
        userId: 'admin-1',
      }),
    ).toBe(true);

    expect(loadNewsEditorDraft('news-1', 'admin-1').draft?.form.title).toBe(
      'Unfinished article',
    );
    expect(loadNewsEditorDraft('news-1', 'admin-2').draft).toBeNull();
  });

  it('clears only the selected account draft', () => {
    installStorage();
    const form = emptyForm();

    saveNewsEditorDraft({
      form,
      hasLocalCoverFile: false,
      newsId: 'news-1',
      removedMediaIds: [],
      userId: 'admin-1',
    });
    saveNewsEditorDraft({
      form,
      hasLocalCoverFile: false,
      newsId: 'news-1',
      removedMediaIds: [],
      userId: 'admin-2',
    });

    clearNewsEditorDraft('news-1', 'admin-1');

    expect(loadNewsEditorDraft('news-1', 'admin-1').draft).toBeNull();
    expect(loadNewsEditorDraft('news-1', 'admin-2').draft).not.toBeNull();
  });
});
