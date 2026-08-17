import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { campaignImage } from "../data/editorial";

export default function CollectionBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      className="group relative flex h-[85vh] min-h-[520px] items-center overflow-hidden"
    >
      <motion.div style={{ y }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
        <motion.img
          src={campaignImage}
          alt="Lightweight summer garments on a neutral backdrop"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-ink/35" />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 text-white sm:px-8">
        <span className="label">The Edit</span>
        <h2 className="mt-4 font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
          THE SUMMER EDIT
        </h2>
        <p className="mt-5 max-w-xs text-lg leading-relaxed text-white/85">
          Lightweight. Effortless. Timeless.
        </p>
        <Link
          to="/shop"
          className="link-underline group/link mt-8 inline-flex items-center gap-2 label"
        >
          Explore Collection
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover/link:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
