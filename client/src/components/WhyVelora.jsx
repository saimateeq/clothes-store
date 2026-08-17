import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whyVeloraItems } from "../data/editorial";
import SectionHeading from "./SectionHeading";

export default function WhyVelora() {
  const [active, setActive] = useState(0);
  const activeItem = whyVeloraItems[active];

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:py-28">
      <SectionHeading label="Our Promise" heading="Why Velora" />

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="flex flex-col">
          {whyVeloraItems.map((item, i) => (
            <li key={item.title} className="border-b border-line first:border-t">
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={active === i}
                className={`flex w-full items-baseline gap-6 py-6 text-left transition-opacity duration-300 sm:py-8 ${
                  active === i ? "opacity-100" : "opacity-45 hover:opacity-75"
                }`}
              >
                <span className="label text-accent">{item.index}</span>
                <span className="font-heading text-2xl sm:text-3xl lg:text-4xl">
                  {item.title}
                </span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-300 lg:hidden" style={{ gridTemplateRows: active === i ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="pb-6 pr-4 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="relative hidden aspect-[4/5] overflow-hidden bg-line lg:block">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeItem.image}
              src={activeItem.image}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeItem.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-sm text-sm leading-relaxed text-white/90"
              >
                {activeItem.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
