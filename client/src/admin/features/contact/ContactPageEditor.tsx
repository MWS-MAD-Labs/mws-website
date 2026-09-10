import { useEffect, useState, type FormEvent } from "react";
import { RotateCcw, Save } from "lucide-react";
import { adminApi } from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from "@/features/contact/contactPageData";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function TextField({ label, onChange, required = true, value }: TextFieldProps) {
  return (
    <label className="block text-sm font-semibold text-[#241718]">
      {label}
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-2 h-10 w-full rounded-md border border-[rgba(36,23,24,0.18)] px-3 text-sm font-normal outline-none focus:border-[#7e1518]"
      />
    </label>
  );
}

type TextAreaFieldProps = TextFieldProps & {
  rows?: number;
};

function TextAreaField({
  label,
  onChange,
  required = true,
  rows = 4,
  value,
}: TextAreaFieldProps) {
  return (
    <label className="block text-sm font-semibold text-[#241718]">
      {label}
      <textarea
        value={value}
        required={required}
        rows={rows}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-2 w-full rounded-md border border-[rgba(36,23,24,0.18)] px-3 py-3 text-sm font-normal outline-none focus:border-[#7e1518]"
      />
    </label>
  );
}

function linesToText(lines: string[]) {
  return lines.join("\n");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function categoryRowsToText(
  categories: ContactPageContent["form"]["categories"],
) {
  return categories
    .map((category) => `${category.value}|${category.label}`)
    .join("\n");
}

function textToCategoryRows(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawValue, ...labelParts] = line.split("|");
      const categoryValue = rawValue?.trim() || "general";
      const label = labelParts.join("|").trim() || categoryValue;

      return { value: categoryValue, label };
    });
}

function officeRowsToText(items: ContactPageContent["officeHours"]["items"]) {
  return items.map((item) => `${item.title}|${item.text}`).join("\n");
}

function textToOfficeRows(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawTitle, ...textParts] = line.split("|");
      const title = rawTitle?.trim() || "Office Hours";
      const text = textParts.join("|").trim() || title;

      return { title, text };
    });
}

export default function ContactPageEditor() {
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

  const updateContent = (updater: (current: ContactPageContent) => ContactPageContent) => {
    setContent((current) => updater(current));
  };

  const saveContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    if (!window.confirm("Reset Contact page content to default?")) return;

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

  return (
    <AppShell
      eyebrow="Content / Pages"
      title="Edit Contact Page"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-md border border-[rgba(36,23,24,0.14)] px-3 py-2 text-xs font-semibold text-[#625759]">
            {isDefault ? "Default Content" : "CMS Override"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="inline-flex items-center gap-2"
            disabled={isSaving || isDefault}
            onClick={() => void resetContent()}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </Button>
        </div>
      }
    >
      <section className="flex-1 p-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-[#7e1518]/20 bg-[#7e1518]/10 px-4 py-3 text-sm text-[#7e1518]"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        <form onSubmit={saveContent} className="space-y-5">
          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#241718]">Hero</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Title"
                value={content.hero.title}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    hero: { ...current.hero, title: value },
                  }))
                }
              />
              <TextField
                label="Image Alt"
                value={content.hero.imageAlt}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    hero: { ...current.hero, imageAlt: value },
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <TextField
                label="Hero Image URL"
                value={content.hero.image}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    hero: { ...current.hero, image: value },
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#241718]">Contact Form</h2>
            <TextField
              label="Form Title"
              value={content.form.title}
              onChange={(value) =>
                updateContent((current) => ({
                  ...current,
                  form: { ...current.form, title: value },
                }))
              }
            />
            <div className="mt-4">
              <TextAreaField
                label="Success Message"
                value={content.form.successMessage}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    form: { ...current.form, successMessage: value },
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Categories"
                rows={5}
                value={categoryRowsToText(content.form.categories)}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    form: {
                      ...current.form,
                      categories: textToCategoryRows(value),
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#241718]">Campus Info</h2>
            <TextAreaField
              label="Intro"
              value={content.intro}
              onChange={(value) =>
                updateContent((current) => ({ ...current, intro: value }))
              }
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Address Section Title"
                value={content.address.title}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    address: { ...current.address, title: value },
                  }))
                }
              />
              <TextField
                label="School Name"
                value={content.address.name}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    address: { ...current.address, name: value },
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Address Lines"
                value={linesToText(content.address.lines)}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    address: { ...current.address, lines: textToLines(value) },
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#241718]">
              Direct Contacts
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Section Title"
                value={content.directContacts.title}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    directContacts: {
                      ...current.directContacts,
                      title: value,
                    },
                  }))
                }
              />
              <TextField
                label="Heading"
                value={content.directContacts.heading}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    directContacts: {
                      ...current.directContacts,
                      heading: value,
                    },
                  }))
                }
              />
              <TextField
                label="Phone"
                value={content.directContacts.phone}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    directContacts: {
                      ...current.directContacts,
                      phone: value,
                    },
                  }))
                }
              />
              <TextField
                label="WhatsApp"
                value={content.directContacts.whatsapp}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    directContacts: {
                      ...current.directContacts,
                      whatsapp: value,
                    },
                  }))
                }
              />
              <TextField
                label="Email"
                value={content.directContacts.email}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    directContacts: {
                      ...current.directContacts,
                      email: value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#241718]">
              Office Hours & Map
            </h2>
            <TextField
              label="Office Hours Title"
              value={content.officeHours.title}
              onChange={(value) =>
                updateContent((current) => ({
                  ...current,
                  officeHours: { ...current.officeHours, title: value },
                }))
              }
            />
            <div className="mt-4">
              <TextAreaField
                label="Office Hours Items"
                rows={5}
                value={officeRowsToText(content.officeHours.items)}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    officeHours: {
                      ...current.officeHours,
                      items: textToOfficeRows(value),
                    },
                  }))
                }
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Map Section Title"
                value={content.map.title}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    map: { ...current.map, title: value },
                  }))
                }
              />
              <TextField
                label="Map Iframe Title"
                value={content.map.titleAttr}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    map: { ...current.map, titleAttr: value },
                  }))
                }
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Map Embed URL"
                rows={4}
                value={content.map.src}
                onChange={(value) =>
                  updateContent((current) => ({
                    ...current,
                    map: { ...current.map, src: value },
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2"
            >
              <Save size={15} />
              <span>{isSaving ? "Saving..." : "Save Contact Page"}</span>
            </Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
