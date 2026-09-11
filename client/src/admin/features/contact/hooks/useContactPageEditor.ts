import { useEffect, useState } from "react";
import { adminApi } from "@/admin/api/adminApi";
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from "@/features/contact/contactPageData";

export function useContactPageEditor() {
  const [content, setContent] = useState<ContactPageContent>(
    defaultContactPageContent,
  );
  const [isDefault, setIsDefault] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    adminApi
      .contactPage()
      .then((page) => {
        if (cancelled) return;
        setContent(withContactPageFallback(page.content));
        setIsDefault(page.isDefault);
      })
      .catch((pageError) => {
        console.error("Contact page request failed:", pageError);
        if (!cancelled) setError("Contact page content could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateContent = (
    updater: (current: ContactPageContent) => ContactPageContent,
  ) => {
    setContent((current) => updater(current));
  };

  const saveContent = async () => {
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const savedPage = await adminApi.updateContactPage(content);
      setContent(withContactPageFallback(savedPage.content));
      setIsDefault(savedPage.isDefault);
      setNotice("Contact page saved.");
    } catch (saveError) {
      console.error("Contact page save failed:", saveError);
      setError("Contact page could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetContent = async () => {
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await adminApi.resetContactPage();
      setContent(defaultContactPageContent);
      setIsDefault(true);
      setNotice("Contact page reset to default.");
    } catch (resetError) {
      console.error("Contact page reset failed:", resetError);
      setError("Contact page could not be reset.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content,
    error,
    isDefault,
    isLoading,
    isSaving,
    notice,
    resetContent,
    saveContent,
    setError,
    setNotice,
    updateContent,
  };
}
