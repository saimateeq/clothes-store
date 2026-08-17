import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoryTiles } from "../data/editorial";

export default function CategorySection() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3">
      {categoryTiles.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: i * 0.1 }}
        >
          <Link
            to={tile.href}
            className="group relative block aspect-[3/4] overflow-hidden sm:aspect-[4/5]"
          >
            <img
              src={tile.image}
              alt={`Shop the ${tile.label} collection`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-ink/25 transition-colors duration-500 group-hover:bg-ink/45" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white sm:p-8">
              <span className="font-heading text-3xl transition-transform duration-500 group-hover:-translate-y-2 sm:text-4xl">
                {tile.label}
              </span>
              <span className="label flex items-center gap-2 opacity-90 transition-transform duration-500 group-hover:-translate-y-2">
                Explore
                <ArrowRight
                  size={14}
                  className="transition-transform duration-500 group-hover:translate-x-2"
                />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </section>
  );
}
