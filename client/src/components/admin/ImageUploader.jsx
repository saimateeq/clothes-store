import { useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";
import { useUploadImagesMutation } from "../../features/uploads/uploadsApi";

// images: [{ url, publicId, isPrimary }]
export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [uploadImages, { isLoading }] = useUploadImagesMutation();
  const [error, setError] = useState(null);
  const [manualUrl, setManualUrl] = useState("");

  const handleFiles = async (fileList) => {
    setError(null);
    const files = Array.from(fileList);
    if (!files.length) return;

    const res = await uploadImages(files)
      .unwrap()
      .catch((err) => {
        setError(err.data?.message || "Upload failed");
        return null;
      });
    if (res) {
      const newImages = res.data.images.map((img, i) => ({
        ...img,
        isPrimary: images.length === 0 && i === 0,
      }));
      onChange([...images, ...newImages]);
    }
  };

  const addManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange([...images, { url: manualUrl.trim(), isPrimary: images.length === 0 }]);
    setManualUrl("");
  };

  const setPrimary = (index) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const removeAt = (index) => {
    const next = images.filter((_, i) => i !== index);
    if (next.length && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.url + i} className="group relative aspect-[3/4] overflow-hidden border border-line">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 opacity-0 transition-all group-hover:bg-ink/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setPrimary(i)}
                aria-label="Set as primary image"
                className="flex h-7 w-7 items-center justify-center bg-bg/90"
              >
                <Star size={13} className={img.isPrimary ? "fill-accent text-accent" : ""} />
              </button>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="flex h-7 w-7 items-center justify-center bg-bg/90"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {img.isPrimary && <span className="label absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[9px] text-bg">Primary</span>}
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border border-dashed border-line text-muted hover:border-ink hover:text-ink disabled:opacity-50"
        >
          <Upload size={18} strokeWidth={1.5} />
          <span className="label text-[10px]">{isLoading ? "Uploading…" : "Upload"}</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex flex-col gap-2 text-xs text-accent">
          <p>{error}</p>
          <p className="text-muted">You can paste an image URL directly instead:</p>
          <div className="flex gap-2">
            <input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://…"
              className="w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button type="button" onClick={addManualUrl} className="label border border-ink px-3 text-xs">
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
