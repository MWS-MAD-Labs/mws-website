import { useCallback, useEffect, useState } from "react";
import { adminApi, type GalleryItem } from "@/admin/api/adminApi";
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from "@/features/contact/contactPageData";
import { useToastState } from "@/admin/components/ui/toastContext";
import {
  cleanContactContent,
  validateContactContent,
} from "../utils/contactPageEditorUtils";
import { uploadImageForPicker } from "@/admin/features/gallery/utils/uploadImageForPicker";

export function useContactPageEditor() {
  const [content, setContent] = useState<ContactPageContent>(
    defaultContactPageContent,
  );
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isDefault, setIsDefault] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useToastState<string>("", "error");
  const [notice, setNotice] = useToastState<string>("", "success");
  const [hasPendingMap, setHasPendingMap] = useState(false);

  const updateMapPending = useCallback((pending: boolean) => {
    setHasPendingMap(pending);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([adminApi.contactPage(), adminApi.galleries()])
      .then(([page, nextGalleries]) => {
        if (cancelled) return;
        setContent(withContactPageFallback(page.content));
        setGalleries(nextGalleries);
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
  }, [setError]);

  const updateContent = (
    updater: (current: ContactPageContent) => ContactPageContent,
  ) => {
    setContent((current) => updater(current));
  };

  const saveContent = async () => {
    setError("");
    setNotice("");

    if (hasPendingMap) {
      setError("Map: use the new location or cancel it before saving.");
      return;
    }

    const cleaned = cleanContactContent(content);
    const problem = validateContactContent(cleaned);
    if (problem) {
      setError(problem);
      return;
    }

    setIsSaving(true);

    try {
      const savedPage = await adminApi.updateContactPage(cleaned);
      setContent(withContactPageFallback(savedPage.content));
      setIsDefault(savedPage.isDefault);
      setNotice("Contact page saved.");
    } catch (saveError) {
      console.error("Contact page save failed:", saveError);
      setError(
        saveError instanceof Error && saveError.message
          ? `Contact page could not be saved: ${saveError.message}`
          : "Contact page could not be saved.",
      );
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

  const uploadHeroImage = async (file: File) => {
    setError("");
    setNotice("");
    setIsUploadingImage(true);

    try {
      const uploaded = await uploadImageForPicker({
        fallbackGalleryDescription: "Images uploaded from the Contact page editor.",
        fallbackGalleryTitle: "Contact Page",
        file,
        galleries,
        caption: content.hero.imageAlt || content.hero.title,
      });

      setContent((current) => ({
        ...current,
        hero: {
          ...current.hero,
          image: uploaded.path,
          imageAlt: uploaded.alt || current.hero.imageAlt,
        },
      }));
      setGalleries(uploaded.galleries);
      setNotice("Contact image uploaded. Save changes to publish it.");
    } catch (uploadError) {
      console.error("Contact image upload failed:", uploadError);
      setError(
        uploadError instanceof Error && uploadError.message
          ? `Contact image could not be uploaded: ${uploadError.message}`
          : "Contact image could not be uploaded.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
    content,
    error,
    galleries,
    hasPendingMap,
    isDefault,
    isLoading,
    isSaving,
    isUploadingImage,
    notice,
    resetContent,
    saveContent,
    setError,
    setNotice,
    updateContent,
    updateMapPending,
    uploadHeroImage,
  };
}
