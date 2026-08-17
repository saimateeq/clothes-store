import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";
import { finalTextReveal } from "./heroAnimations";

function MagneticShopLink() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.35);
    y.set(relY * 0.35);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link
        ref={ref}
        to="/shop"
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
        className="group label inline-flex items-center gap-3 border border-white/70 px-8 py-4 text-white transition-colors duration-300 hover:bg-white hover:text-ink"
      >
        Shop Collection
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </motion.div>
  );
}

/**
 * Persistent brand message + CTA, anchored to the bottom of the hero.
 * Reveals once on mount (finalTextReveal), independent of scene changes —
 * this is the "final brand message" beat, kept visible throughout rather
 * than gated behind the fourth scene, so the CTA is always reachable.
 */
export default function HeroCTA() {
  return (
    // Mobile: parked near the top, below the navbar, so it never competes
    // with the bottom-sheet product card for the same real estate. Desktop:
    // classic bottom-anchored campaign layout.
    <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex flex-col items-center gap-5 px-5 text-center sm:top-auto sm:bottom-12">
      <motion.span
        custom={0}
        variants={finalTextReveal}
        initial="hidden"
        animate="visible"
        className="label text-white/70"
      >
        Autumn / Winter 2026
      </motion.span>

      <motion.h1
        custom={1}
        variants={finalTextReveal}
        initial="hidden"
        animate="visible"
        className="font-heading text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl"
      >
        The New Season
      </motion.h1>

      <motion.p
        custom={2}
        variants={finalTextReveal}
        initial="hidden"
        animate="visible"
        className="max-w-xs text-sm text-white/80 sm:text-base"
      >
        Designed for the Everyday.
      </motion.p>

      <motion.div custom={3} variants={finalTextReveal} initial="hidden" animate="visible" className="pointer-events-auto">
        <MagneticShopLink />
      </motion.div>

      <motion.div
        custom={4}
        variants={finalTextReveal}
        initial="hidden"
        animate="visible"
        className="mt-2 hidden flex-col items-center gap-2 text-white/60 sm:flex"
        aria-hidden="true"
      >
        <span className="label text-[10px]">Scroll to Explore</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={14} strokeWidth={1.5} />
        </motion.span>
      </motion.div>
    </div>
  );
}
