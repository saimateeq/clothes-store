import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { useGenerateProductDescriptionMutation } from "../../features/admin/adminAiApi";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => null);
      }}
      className="flex shrink-0 items-center gap-1 text-xs text-muted hover:text-ink"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// Never writes to the product form on its own — every field here needs an
// explicit "Apply" click from the admin (onApply), and the admin's own
// Save/Save Changes button is still what actually persists anything.
export default function AiDescriptionPanel({ getInputs, onApply }) {
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState("");
  const [fit, setFit] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [generate, { isLoading }] = useGenerateProductDescriptionMutation();

  const handleGenerate = async () => {
    setError(null);
    const inputs = getInputs();
    if (!inputs.name) {
      setError("Enter a product name above first.");
      return;
    }
    try {
      const res = await generate({ ...inputs, features: features || undefined, fit: fit || undefined, audience: audience || undefined }).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "AI copy generation is temporarily unavailable.");
    }
  };

  const fields = result
    ? [
        { key: "description", label: "Description", value: result.description },
        { key: "shortDescription", label: "Short Description", value: result.shortDescription },
        { key: "seoTitle", label: "SEO Title", value: result.seoTitle },
        { key: "seoMetaDescription", label: "SEO Meta Description", value: result.seoMetaDescription },
        { key: "tags", label: "Tags", value: result.tags.join(", ") },
      ]
    : [];

  return (
    <section className="flex flex-col gap-4 border border-line p-6">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center justify-between">
        <h2 className="label flex items-center gap-2 text-accent">
          <Sparkles size={13} strokeWidth={1.5} /> Generate With AI
        </h2>
        <span className="label text-muted">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">
            Uses the Name, Category, Material, Price, and first Color already filled in above, plus anything here:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="label text-muted">Features</span>
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="e.g. hidden pockets, belted"
                className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label text-muted">Fit</span>
              <input
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                placeholder="e.g. relaxed, oversized"
                className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label text-muted">Target Audience</span>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. women 25-40"
                className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="label w-fit border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg disabled:opacity-50"
          >
            {isLoading ? "Generating…" : result ? "Regenerate" : "Generate"}
          </button>

          {result && (
            <div className="mt-2 flex flex-col gap-5 border-t border-line pt-5">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="label text-muted">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <CopyButton text={field.value} />
                      <button
                        type="button"
                        onClick={() => onApply({ [field.key]: field.value })}
                        className="label shrink-0 text-accent hover:opacity-70"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{field.value}</p>
                </div>
              ))}

              {result.highlights.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="label text-muted">Highlights</span>
                    <CopyButton text={result.highlights.join("\n")} />
                  </div>
                  <ul className="list-inside list-disc text-sm leading-relaxed">
                    {result.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.socialCaption && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="label text-muted">Social Caption</span>
                    <CopyButton text={result.socialCaption} />
                  </div>
                  <p className="text-sm leading-relaxed">{result.socialCaption}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
