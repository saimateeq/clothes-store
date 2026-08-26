import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { storyImage } from "../data/editorial";

const HEADING_LINES = ["DESIGNED", "FOR THE", "EVERYDAY"];

export default function EditorialSection() {
  return (
    <section className="section-py mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-6">
      <div className="order-2 flex flex-col gap-8 lg:order-1 lg:pr-12">
        <div>
          {HEADING_LINES.map((line, i) => (
            <div key={line} className="overflow-hidden">
              <motion.h2
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-5xl leading-[0.95] sm:text-6xl lg:text-7xl"
              >
                {line}
              </motion.h2>
            </div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-md text-lg leading-relaxed text-muted"
        >
          We believe clothing should feel as good as it looks. Every piece is thoughtfully
          designed with timeless silhouettes, premium materials, and effortless comfort.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Link to="/shop" className="link-underline group inline-flex items-center gap-2 label">
            Our Story
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.15 }}
        whileInView={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="order-1 aspect-[4/5] overflow-hidden lg:order-2 lg:aspect-[3/4]"
      >
        <img
          src={storyImage}
          alt="Model in a neutral-toned wardrobe, seated in natural light"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </motion.div>
    </section>
  );
}
