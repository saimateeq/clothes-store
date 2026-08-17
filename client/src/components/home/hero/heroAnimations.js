// Centralized Framer Motion variants for the hero — every component below
// imports from here rather than defining animation objects inline, so
// tuning the "feel" of the hero means editing one file.

const EASE_EDITORIAL = [0.65, 0, 0.35, 1];
const EASE_REVEAL = [0.16, 1, 0.3, 1];

// Scene-to-scene crossfade + clip-path wipe (used by HeroScene, mounted via
// AnimatePresence keyed on scene.id).
export const sceneVariants = {
  initial: { opacity: 0, scale: 1.03, clipPath: "inset(0 100% 0 0)" },
  animate: {
    opacity: 1,
    scale: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.9, ease: EASE_EDITORIAL },
  },
  exit: { opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } },
};

// The full-height parallelogram card is edge-anchored to the right, so it
// enters/exits by sliding along its own width (x in %) rather than a fixed
// pixel offset — it always travels fully off-canvas regardless of viewport.
export const productCardEnterRight = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: "0%",
    transition: { duration: 0.65, ease: EASE_REVEAL },
  },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.45, ease: "easeInOut" } },
};

// Mobile bottom-sheet variant of the same card (slides up, not sideways).
export const productCardEnterSheet = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_REVEAL } },
  exit: { opacity: 0, y: 24, transition: { duration: 0.35, ease: "easeInOut" } },
};

// Final brand message — heading lines reveal one after another via a
// `custom` index passed to each motion element.
export const finalTextReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: EASE_REVEAL },
  }),
};
