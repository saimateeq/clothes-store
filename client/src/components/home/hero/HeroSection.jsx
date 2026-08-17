import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useGetProductBySlugQuery } from "../../../features/products/productsApi";
import { normalizeProduct } from "../../../features/products/productAdapter";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { useHeroSequence } from "./useHeroSequence";
import { SCENES, buildCameraKeyframesCSS } from "./heroConfig";
import HeroScene from "./HeroScene";
import HeroProductCard from "./HeroProductCard";
import HeroNavigation from "./HeroNavigation";
import HeroProgress from "./HeroProgress";
import HeroCTA from "./HeroCTA";

const CAMERA_CSS = buildCameraKeyframesCSS();
const SWIPE_THRESHOLD = 60;

/**
 * VELORA's cinematic hero — 4 static campaign photos staged as a fashion
 * film using CSS camera pans, Framer Motion crossfades, and product cards
 * that surface in sync with each "shot." See heroConfig.js to retime
 * scenes or swap products; see the composed pieces (HeroScene,
 * HeroProductCard, HeroNavigation, HeroProgress, HeroCTA) for the visuals.
 */
export default function HeroSection() {
  const {
    scenes,
    totalScenes,
    sceneIndex,
    scene,
    productVisible,
    isPlaying,
    togglePlay,
    nextScene,
    prevScene,
    goToScene,
    reducedMotion,
  } = useHeroSequence();

  const isDesktop = useIsDesktop();
  const enableParallax = isDesktop && !reducedMotion;

  // Fetch each scene's real product once, up front — this both keeps the
  // card a "real component with real data" (never fake navigation) and
  // doubles as preloading that data before any card ever needs to render.
  const product1 = useGetProductBySlugQuery(SCENES[0].product.slug);
  const product2 = useGetProductBySlugQuery(SCENES[1].product.slug);
  const product3 = useGetProductBySlugQuery(SCENES[2].product.slug);
  const product4 = useGetProductBySlugQuery(SCENES[3].product.slug);

  const productsBySlug = useMemo(() => {
    const map = {};
    [product1.data, product2.data, product3.data, product4.data].forEach((result) => {
      const doc = result?.data?.product;
      if (doc) map[doc.slug] = normalizeProduct(doc);
    });
    return map;
  }, [product1.data, product2.data, product3.data, product4.data]);

  const currentProduct = productsBySlug[scene.product.slug] ?? null;

  // Preload the next scene's image so the crossfade never reveals a frame
  // that's still decoding.
  useEffect(() => {
    const next = scenes[(sceneIndex + 1) % totalScenes];
    const img = new Image();
    img.src = isDesktop ? next.images.webp : next.images.webpMobile;
  }, [sceneIndex, scenes, totalScenes, isDesktop]);

  // Subtle mouse parallax (desktop + motion-safe only) — the image drifts
  // a few px opposite the cursor. useSpring smooths the raw mouse deltas so
  // the movement reads as a gentle drift, not a snap-to-cursor jump.
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 60, damping: 20, mass: 0.6 });
  const springY = useSpring(mvY, { stiffness: 60, damping: 20, mass: 0.6 });
  const parallaxX = useTransform(springX, [-0.5, 0.5], ["10px", "-10px"]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], ["6px", "-6px"]);

  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!enableParallax || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetParallax = () => {
    mvX.set(0);
    mvY.set(0);
  };

  // Touch swipe (mobile): drag the scene layer, release past the threshold
  // to advance/rewind. Snaps back to 0 either way — the scene change itself
  // is what visually resolves the gesture, not a lingering drag offset.
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) nextScene();
    else if (info.offset.x > SWIPE_THRESHOLD) prevScene();
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
      className="relative h-[100svh] min-h-[700px] w-full overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label="VELORA Autumn/Winter 2026 campaign"
    >
      {/* eslint-disable-next-line react/no-danger */}
      <style>{CAMERA_CSS}</style>

      <motion.div
        className="absolute inset-0"
        style={enableParallax ? { x: parallaxX, y: parallaxY } : undefined}
        drag={!isDesktop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence>
          <HeroScene key={scene.id} scene={scene} isPlaying={isPlaying} reducedMotion={reducedMotion} />
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {productVisible && currentProduct && (
          <HeroProductCard key={`${scene.id}-card`} product={currentProduct} />
        )}
      </AnimatePresence>

      <HeroCTA />

      <div className="absolute inset-x-5 bottom-6 z-10 hidden items-center justify-between sm:flex lg:inset-x-8">
        <HeroProgress scenes={scenes} sceneIndex={sceneIndex} isPlaying={isPlaying} onSelect={goToScene} />
        <HeroNavigation isPlaying={isPlaying} onTogglePlay={togglePlay} onPrev={prevScene} onNext={nextScene} />
      </div>
    </section>
  );
}
