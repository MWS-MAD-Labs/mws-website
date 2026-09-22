import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  adminApi,
  type NewsCategory,
  type NewsCategoryPayload,
  type NewsTag,
  type NewsTagPayload,
} from '@/admin/api/adminApi';
import { AuthProvider } from '@/admin/auth/AuthProvider';
import { RequireAuth } from '@/admin/auth/RequireAuth';
import { useAuth } from '@/admin/auth/useAuth';
import AppShell from '@/admin/components/layout/AppShell';
import { hasCmsPermission } from '@/admin/types/auth';
import AdmissionsPage from '@/admin/features/admissions/AdmissionsPage';
import ContactPageEditor from '@/admin/features/contact/ContactPageEditor';
import CommunityStoriesPage from '@/admin/features/community-stories/CommunityStoriesPage';
import HeroSlidesPage from '@/admin/features/home/HeroSlidesPage';
import PageEditorPage from '@/admin/features/page/PageEditorPage';
import PagesManagementPage from '@/admin/features/page/PagesManagementPage';
import AffiliationsPage from '@/admin/features/placeholders/AffiliationsPage';
import AuditLogsPage from '@/admin/features/placeholders/AuditLogsPage';
import CampusTourPage from '@/admin/features/placeholders/CampusTourPage';
import CurriculumPage from '@/admin/features/placeholders/CurriculumPage';
import ElementaryPage from '@/admin/features/placeholders/ElementaryPage';
import GalleryDetailPage from '@/admin/features/gallery/GalleryDetailPage';
import GalleryListPage from '@/admin/features/gallery/GalleryListPage';
import HelpPage from '@/admin/features/placeholders/HelpPage';
import JuniorHighPage from '@/admin/features/placeholders/JuniorHighPage';
import KindergartenPage from '@/admin/features/placeholders/KindergartenPage';
import OurSchoolPage from '@/admin/features/our-school/OurSchoolPage';
import PermissionsPage from '@/admin/features/placeholders/PermissionsPage';
import CmsUsersPage from '@/admin/pages/CmsUsersPage';
import Dashboard from '@/admin/pages/Dashboard';
import LoginPage from '@/admin/pages/LoginPage';
import NewsPage from '../features/news/NewsPage';
import CreateUpdateNews from '../features/news/components/CreateUpdateNews';
import NewsCategories from '../features/news/NewsCategories';
import NewsTags from '../features/news/NewsTags';
import { getErrorMessage } from '../features/news/newsUtils';

type RouteMessage = {
  text: string;
  type: 'error' | 'success';
} | null;

function RequireUsersPermission({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!hasCmsPermission(user, 'users:manage')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function RequireContentPermission({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!hasCmsPermission(user, 'content:manage')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function NewsCategoriesRoute() {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<RouteMessage>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const items = await adminApi.newsCategories();
      setCategories(items);
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to load news categories.'),
        type: 'error',
      });
      return false;
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      adminApi
        .newsCategories()
        .then((items) => {
          if (isCurrent) setCategories(items);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage({
            text: getErrorMessage(error, 'Failed to load news categories.'),
            type: 'error',
          });
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return categories;

    return categories.filter((category) =>
      [
        category.name,
        category.slug,
        category.description ?? '',
        category.isActive ? 'active' : 'inactive',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [categories, search]);

  async function createCategory(payload: NewsCategoryPayload) {
    setSavingId('create');
    setMessage(null);

    try {
      await adminApi.createNewsCategory(payload);
      await loadCategories();
      setMessage({ text: 'News category created.', type: 'success' });
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to create news category.'),
        type: 'error',
      });
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function updateCategory(category: NewsCategory, payload: NewsCategoryPayload) {
    setSavingId(category.id);
    setMessage(null);

    try {
      await adminApi.updateNewsCategory(category.id, payload);
      await loadCategories();
      setMessage({ text: 'News category updated.', type: 'success' });
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to update news category.'),
        type: 'error',
      });
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function deleteCategory(category: NewsCategory) {
    setDeletingId(category.id);
    setMessage(null);

    try {
      await adminApi.deleteNewsCategory(category.id);
      await loadCategories();
      setMessage({ text: 'News category deleted.', type: 'success' });
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to delete news category.'),
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="News categories">
      <section className="space-y-5 p-6">
        <RouteMessageBanner message={message} />

        <NewsCategories
          categories={filteredCategories}
          deletingId={deletingId}
          isLoading={isLoading}
          savingId={savingId}
          search={search}
          onCreate={createCategory}
          onDelete={deleteCategory}
          onSearchChange={setSearch}
          onUpdate={updateCategory}
        />
      </section>
    </AppShell>
  );
}

function NewsTagsRoute() {
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<RouteMessage>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    try {
      const items = await adminApi.newsTags();
      setTags(items);
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to load news tags.'),
        type: 'error',
      });
      return false;
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      adminApi
        .newsTags()
        .then((items) => {
          if (isCurrent) setTags(items);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage({
            text: getErrorMessage(error, 'Failed to load news tags.'),
            type: 'error',
          });
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tags;

    return tags.filter((tag) => `${tag.name} ${tag.slug}`.toLowerCase().includes(query));
  }, [tags, search]);

  async function createTag(payload: NewsTagPayload) {
    setSavingId('create');
    setMessage(null);

    try {
      await adminApi.createNewsTag(payload);
      await loadTags();
      setMessage({ text: 'News tag created.', type: 'success' });
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to create news tag.'),
        type: 'error',
      });
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function updateTag(tag: NewsTag, payload: NewsTagPayload) {
    setSavingId(tag.id);
    setMessage(null);

    try {
      await adminApi.updateNewsTag(tag.id, payload);
      await loadTags();
      setMessage({ text: 'News tag updated.', type: 'success' });
      return true;
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to update news tag.'),
        type: 'error',
      });
      return false;
    } finally {
      setSavingId(null);
    }
  }

  async function deleteTag(tag: NewsTag) {
    setDeletingId(tag.id);
    setMessage(null);

    try {
      await adminApi.deleteNewsTag(tag.id);
      await loadTags();
      setMessage({ text: 'News tag deleted.', type: 'success' });
    } catch (error) {
      setMessage({
        text: getErrorMessage(error, 'Failed to delete news tag.'),
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell title="News tags">
      <section className="space-y-5 p-6">
        <RouteMessageBanner message={message} />

        <NewsTags
          deletingId={deletingId}
          isLoading={isLoading}
          savingId={savingId}
          search={search}
          tags={filteredTags}
          onCreate={createTag}
          onDelete={deleteTag}
          onSearchChange={setSearch}
          onUpdate={updateTag}
        />
      </section>
    </AppShell>
  );
}

function RouteMessageBanner({ message }: { message: RouteMessage }) {
  if (!message) return null;

  const classes =
    message.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700';

  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>{message.text}</div>;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          index
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="pages"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <PagesManagementPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="pages/:pageId/edit"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <PageEditorPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="hero-slides"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <HeroSlidesPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="our-school"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <OurSchoolPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="community-stories"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CommunityStoriesPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="contact"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <ContactPageEditor />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="academic/kindergarten"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <KindergartenPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="academic/elementary"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <ElementaryPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="academic/junior-high"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <JuniorHighPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/admissions"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <AdmissionsPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/campus-tour"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CampusTourPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/curriculum"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CurriculumPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="programs/affiliations"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <AffiliationsPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="news"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <NewsPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="news/categories"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <NewsCategoriesRoute />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="news/tags"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <NewsTagsRoute />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="news/new"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CreateUpdateNews />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="news/:newsId/edit"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <CreateUpdateNews />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="gallery"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <GalleryListPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route
          path="gallery/:galleryId"
          element={
            <RequireAuth>
              <RequireContentPermission>
                <GalleryDetailPage />
              </RequireContentPermission>
            </RequireAuth>
          }
        />
        <Route path="gallery/images" element={<Navigate to="/admin/gallery" replace />} />
        <Route path="gallery/videos" element={<Navigate to="/admin/gallery" replace />} />
        <Route
          path="users"
          element={
            <RequireAuth>
              <RequireUsersPermission>
                <CmsUsersPage />
              </RequireUsersPermission>
            </RequireAuth>
          }
        />
        <Route
          path="permissions"
          element={
            <RequireAuth>
              <RequireUsersPermission>
                <PermissionsPage />
              </RequireUsersPermission>
            </RequireAuth>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RequireAuth>
              <AuditLogsPage />
            </RequireAuth>
          }
        />
        <Route
          path="help"
          element={
            <RequireAuth>
              <HelpPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
