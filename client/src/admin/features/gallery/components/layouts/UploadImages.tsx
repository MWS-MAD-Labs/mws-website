import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";

type UploadImagesProps = {
  isSaving: boolean;
  onCancel: () => void;
  onUploadImage: (data: {
    caption: string;
    file: File;
    sortOrder: string;
    title: string;
  }) => Promise<void>;
};

export default function UploadImages({
  isSaving,
  onCancel,
  onUploadImage,
}: UploadImagesProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function chooseFile(nextFile: File | null) {
    if (!nextFile) return;
    setFile(nextFile);
    if (!title) setTitle(nextFile.name.replace(/\.[^.]+$/, ""));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    await onUploadImage({
      caption: caption.trim(),
      file,
      sortOrder,
      title: title.trim(),
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label
        className="grid min-h-40 cursor-pointer place-items-center rounded-lg border border-dashed border-[rgba(36,23,24,0.28)] bg-[#faf8f3] p-4 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {previewUrl ? (
          <img
            className="max-h-52 rounded object-contain"
            src={previewUrl}
            alt={file?.name ?? "Selected image preview"}
          />
        ) : (
          <span className="text-sm font-medium text-[#625759]">Choose image</span>
        )}
      </label>

      {file ? <div className="text-sm text-[#625759]">{file.name}</div> : null}

      <Field label="Title">
        <input
          className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Caption">
        <textarea
          className="min-h-20 rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </Field>
      <Field label="Sort Order">
        <input
          className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={isSaving || !file} type="submit">
          Upload
        </Button>
      </div>
    </form>
  );
}
