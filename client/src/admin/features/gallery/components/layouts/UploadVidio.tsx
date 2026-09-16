import {
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";

type UploadVidioProps = {
  isSaving: boolean;
  onCancel: () => void;
  onCreateYoutube: (data: {
    caption: string | null;
    sortOrder: number;
    title: string | null;
    url: string;
  }) => Promise<void>;
  onUploadVideo: (data: {
    caption: string;
    file: File;
    sortOrder: string;
    title: string;
  }) => Promise<void>;
};

type Mode = "upload" | "youtube";

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function UploadVidio({
  isSaving,
  onCancel,
  onCreateYoutube,
  onUploadVideo,
}: UploadVidioProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
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
    if (mode === "upload") {
      if (!file) return;
      await onUploadVideo({
        caption: caption.trim(),
        file,
        sortOrder,
        title: title.trim(),
      });
      return;
    }

    await onCreateYoutube({
      caption: optionalText(caption),
      sortOrder: Number(sortOrder || 0),
      title: optionalText(title),
      url: youtubeUrl.trim(),
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 rounded border border-[rgba(36,23,24,0.12)] p-1">
        <button
          className={`rounded px-3 py-2 text-sm font-semibold ${
            mode === "upload" ? "bg-[#241718] text-white" : "text-[#625759]"
          }`}
          type="button"
          onClick={() => setMode("upload")}
        >
          Upload Video
        </button>
        <button
          className={`rounded px-3 py-2 text-sm font-semibold ${
            mode === "youtube" ? "bg-[#241718] text-white" : "text-[#625759]"
          }`}
          type="button"
          onClick={() => setMode("youtube")}
        >
          YouTube URL
        </button>
      </div>

      {mode === "upload" ? (
        <>
          <label
            className="grid min-h-40 cursor-pointer place-items-center rounded-lg border border-dashed border-[rgba(36,23,24,0.28)] bg-[#faf8f3] p-4 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              className="sr-only"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <video className="max-h-52 rounded" src={previewUrl} controls />
            ) : (
              <span className="text-sm font-medium text-[#625759]">
                Choose video
              </span>
            )}
          </label>
          {file ? <div className="text-sm text-[#625759]">{file.name}</div> : null}
        </>
      ) : (
        <Field label="YouTube URL">
          <input
            className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
            placeholder="https://www.youtube.com/watch?v=..."
            required={mode === "youtube"}
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
          />
        </Field>
      )}

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
        <Button
          disabled={isSaving || (mode === "upload" ? !file : !youtubeUrl.trim())}
          type="submit"
        >
          Save Video
        </Button>
      </div>
    </form>
  );
}
