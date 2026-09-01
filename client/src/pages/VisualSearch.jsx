import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { useVisualSearchMutation } from "../features/ai/aiApi";
import { normalizeProducts } from "../features/products/productAdapter";
import ProductGrid from "../components/ProductGrid";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function VisualSearch() {
  useDocumentTitle("Search With Image");
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [visualSearch, { isLoading }] = useVisualSearchMutation();

  const handleFile = (f) => {
    setError(null);
    setResult(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("Image is too large — please choose one under 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSearch = async () => {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await visualSearch(formData).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "Visual search is temporarily unavailable. Please try again.");
    }
  };

  const products = normalizeProducts(result?.products);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col items-center gap-2 text-center">
        <span className="label flex items-center gap-2 text-accent">
          <Camera size={13} strokeWidth={1.5} /> Visual Search
        </span>
        <h1 className="font-heading text-5xl sm:text-6xl">Search With Image</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Upload a photo of a clothing item and we'll find similar styles from our collection.
        </p>
      </div>

      <div className="mx-auto max-w-md">
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 border border-dashed border-line py-16 text-muted transition-colors hover:border-ink hover:text-ink"
          >
            <Upload size={28} strokeWidth={1.25} />
            <span className="label">Upload a Photo</span>
            <span className="text-xs text-muted">JPG or PNG, up to 5MB</span>
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-line">
              <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-bg/90 text-ink"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            {!result && (
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="label bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {isLoading ? "Analyzing…" : "Search"}
              </button>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-accent">
            {error}
          </p>
        )}
      </div>

      {result?.analysis && (
        <div className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-2">
          {[result.analysis.clothingType, result.analysis.style, result.analysis.pattern, ...(result.analysis.colors || [])]
            .filter(Boolean)
            .map((tag) => (
              <span key={tag} className="label border border-line px-3 py-1.5 text-muted">
                {tag}
              </span>
            ))}
        </div>
      )}

      {result && (
        <div className="mx-auto mt-12 max-w-6xl">
          <p className="mb-8 text-center text-sm text-muted">{result.message}</p>
          {products.length > 0 && <ProductGrid products={products} columns="grid-cols-2 lg:grid-cols-4" />}
        </div>
      )}
    </div>
  );
}
