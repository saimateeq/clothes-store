import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { testimonials } from "../data/editorial";

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="border-y border-line bg-white/40">
      <div className="section-py mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center">
        <div className="flex gap-1 text-accent" aria-hidden="true">
          {Array.from({ length: current.rating }).map((_, i) => (
            <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
          ))}
        </div>

        <div className="min-h-[6rem] sm:min-h-[4.5rem]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-heading text-2xl leading-snug sm:text-3xl">
                &ldquo;{current.quote}&rdquo;
              </p>
              <footer className="mt-4 label text-muted">— {current.author}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="flex gap-2" role="tablist" aria-label="Testimonials">
          {testimonials.map((t, i) => (
            <button
              key={t.author}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial from ${t.author}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-ink" : "w-1.5 bg-line hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
