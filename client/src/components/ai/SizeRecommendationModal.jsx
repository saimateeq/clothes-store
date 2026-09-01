import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useGetSizeRecommendationMutation } from "../../features/ai/aiApi";
import { useEscapeKey } from "../../hooks/useEscapeKey";

const CONFIDENCE_STYLES = {
  High: "text-accent",
  Medium: "text-ink",
  Low: "text-muted",
};

export default function SizeRecommendationModal({ open, onClose, productId }) {
  useEscapeKey(onClose, open);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [usualSize, setUsualSize] = useState("");
  const [preferredFit, setPreferredFit] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [getSizeRecommendation, { isLoading }] = useGetSizeRecommendationMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await getSizeRecommendation({
        productId,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        usualSize: usualSize || undefined,
        preferredFit: preferredFit || undefined,
      }).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "Size recommendations are temporarily unavailable. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-5 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 border border-line bg-bg p-6 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Find my size"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="label flex items-center gap-2 text-accent">
                <Sparkles size={13} strokeWidth={1.5} /> Find My Size
              </span>
              <button type="button" onClick={onClose} aria-label="Close">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {!result && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="label text-muted">Height (cm)</span>
                    <input
                      type="number"
                      min="0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="label text-muted">Weight (kg)</span>
                    <input
                      type="number"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="label text-muted">Usual Size</span>
                  <input
                    type="text"
                    value={usualSize}
                    onChange={(e) => setUsualSize(e.target.value)}
                    placeholder="e.g. M, or 32"
                    className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="label text-muted">Preferred Fit</span>
                  <input
                    type="text"
                    value={preferredFit}
                    onChange={(e) => setPreferredFit(e.target.value)}
                    placeholder="e.g. relaxed, true to size, snug"
                    className="border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink"
                  />
                </label>

                {error && <p className="text-xs text-accent">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="label mt-2 bg-ink py-3.5 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {isLoading ? "Thinking…" : "Get My Size"}
                </button>
              </form>
            )}

            {result && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                {result.recommendedSize ? (
                  <>
                    <span className="label text-muted">Recommended Size</span>
                    <span className="font-heading text-6xl">{result.recommendedSize}</span>
                    <span className={`label ${CONFIDENCE_STYLES[result.confidence] || "text-muted"}`}>
                      Confidence: {result.confidence}
                    </span>
                  </>
                ) : (
                  <span className="label text-muted">No confident recommendation</span>
                )}
                <p className="text-sm leading-relaxed text-muted">{result.reason}</p>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="label mt-2 border border-line px-6 py-3 transition-colors hover:border-ink"
                >
                  Try Again
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
              A general fit estimate, not a guarantee — check the size guide if you're between sizes.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
