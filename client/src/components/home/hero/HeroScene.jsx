import { motion } from "framer-motion";
import { sceneVariants } from "./heroAnimations";

/**
 * One "shot" of the cinematic hero: a full-bleed still image with a slow
 * camera push/pan (CSS keyframes, so pausing is a true browser-native
 * freeze) inside a clip-path wipe used as the scene-to-scene transition
 * (Framer Motion, since that's a one-shot enter/exit, not a continuous
 * loop). Mount/unmount this via AnimatePresence keyed on scene.id.
 */
export default function HeroScene({ scene, isPlaying, reducedMotion }) {
  const { images, alt, camera, duration } = scene;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className="h-full w-full"
        style={
          reducedMotion
            ? undefined
            : {
                animationName: `hero-cam-${scene.id}`,
                animationDuration: `${duration}s`,
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                animationFillMode: "forwards",
                animationPlayState: isPlaying ? "running" : "paused",
                transformOrigin: camera.origin,
                willChange: "transform",
              }
        }
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={images.webpMobile} type="image/webp" />
          <source srcSet={images.webp} type="image/webp" />
          <source media="(max-width: 767px)" srcSet={images.jpgMobile} type="image/jpeg" />
          <img
            src={images.jpg}
            alt={alt}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </picture>
      </div>

      {/* Editorial scrim — keeps overlaid text/UI legible without flattening the photography */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-ink/25" />
    </motion.div>
  );
}
