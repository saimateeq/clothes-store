import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="newsletter" className="relative overflow-hidden bg-ink text-bg">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
        <span className="absolute -left-10 top-1/2 -translate-y-1/2 whitespace-nowrap font-heading text-[22vw] leading-none">
          VELORA VELORA
        </span>
      </div>

      <div className="section-py relative mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="label text-accent">Newsletter</span>
          <h2 className="mt-4 font-heading text-5xl leading-[0.95] sm:text-6xl">
            GET 10% OFF
            <br />
            YOUR FIRST ORDER
          </h2>
          <p className="mt-5 max-w-sm text-white/70">
            Sign up for new collections, exclusive releases and more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {submitted ? (
            <div className="flex items-center gap-3 border-b border-white/30 py-4 text-white">
              <Check size={18} />
              <span>Thank you — check your inbox to confirm.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-4 border-b border-white/30 py-4 transition-colors duration-300 focus-within:border-white"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-transparent font-heading text-2xl outline-none placeholder:text-white/40 sm:text-3xl"
              />
              <button
                type="submit"
                className="label group flex shrink-0 items-center gap-2 pb-1 text-white"
              >
                Join
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </form>
          )}
          <p className="mt-4 text-xs text-white/50">
            By signing up, you agree to our Privacy Policy and Terms.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
