// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for the cinematic hero. Edit this file to change
// scene timing, camera movement, or which product each scene showcases —
// nothing else in the hero needs to change.
//
// HOW TO RETIME A SCENE
//   Change `duration` (seconds the scene plays before the next one begins)
//   or `product.delay` / `product.duration` (when the card appears/how long
//   it stays, both measured from the scene's own start, not the timeline).
//
// HOW TO CHANGE ZOOM STRENGTH
//   Edit the `camera` block: `scale` is [from, to] — a bigger gap between
//   the two numbers means a more dramatic push-in. `x`/`y` are percentage
//   pans (e.g. "-1%"), `origin` is the CSS transform-origin the zoom pushes
//   toward (aim it at the garment, not the model's face).
//
// HOW TO ADD/REMOVE A SCENE
//   Add or remove an entry in SCENES (and its 4 image imports below). The
//   sequence hook and progress indicator both read SCENES.length, so
//   nothing else needs updating.
//
// HOW TO CONNECT A CARD TO A DIFFERENT PRODUCT
//   Change `product.slug` to any real product slug from the catalog — the
//   card fetches live name/price/image/colors from the API by that slug,
//   so admin-side price or name changes show up here automatically.
// ─────────────────────────────────────────────────────────────────────────

import model1 from "../../../assets/hero/model-1.webp";
import model1Mobile from "../../../assets/hero/model-1-mobile.webp";
import model1Jpg from "../../../assets/hero/model-1.jpg";
import model1MobileJpg from "../../../assets/hero/model-1-mobile.jpg";

import model2 from "../../../assets/hero/model-2.webp";
import model2Mobile from "../../../assets/hero/model-2-mobile.webp";
import model2Jpg from "../../../assets/hero/model-2.jpg";
import model2MobileJpg from "../../../assets/hero/model-2-mobile.jpg";

import model3 from "../../../assets/hero/model-3.webp";
import model3Mobile from "../../../assets/hero/model-3-mobile.webp";
import model3Jpg from "../../../assets/hero/model-3.jpg";
import model3MobileJpg from "../../../assets/hero/model-3-mobile.jpg";

import model4 from "../../../assets/hero/model-4.webp";
import model4Mobile from "../../../assets/hero/model-4-mobile.webp";
import model4Jpg from "../../../assets/hero/model-4.jpg";
import model4MobileJpg from "../../../assets/hero/model-4-mobile.jpg";

export const SCENES = [
  {
    id: 1,
    alt: "Model walking in an oversized ivory linen shirt and tailored trousers",
    images: { webp: model1, webpMobile: model1Mobile, jpg: model1Jpg, jpgMobile: model1MobileJpg },
    duration: 5.5,
    camera: {
      scale: [1, 1.12],
      x: ["0%", "-1%"],
      y: ["0%", "-1%"],
      origin: "58% 38%",
    },
    product: { slug: "oversized-linen-shirt", delay: 2.2, duration: 2.5 },
  },
  {
    id: 2,
    alt: "Model in a structured beige blazer and matching trousers",
    images: { webp: model2, webpMobile: model2Mobile, jpg: model2Jpg, jpgMobile: model2MobileJpg },
    duration: 5.5,
    camera: {
      scale: [1.08, 1.16],
      x: ["2%", "-2%"],
      y: ["0%", "0%"],
      origin: "48% 32%",
    },
    product: { slug: "structured-blazer", delay: 2.2, duration: 2.5 },
  },
  {
    id: 3,
    alt: "Model in a flowing minimal ivory cotton dress",
    images: { webp: model3, webpMobile: model3Mobile, jpg: model3Jpg, jpgMobile: model3MobileJpg },
    duration: 5.5,
    camera: {
      scale: [1, 1.12],
      // Panning left (negative x) rather than right — as the camera pushes
      // in, the image drifts toward the left edge, opening up the negative
      // space on the right for the product card to slide into.
      x: ["0%", "-4%"],
      y: ["1%", "-2%"],
      origin: "55% 42%",
    },
    product: { slug: "minimal-cotton-dress", delay: 2.2, duration: 2.5 },
  },
  {
    id: 4,
    alt: "Model in a charcoal wool blazer, the season's strongest silhouette",
    images: { webp: model4, webpMobile: model4Mobile, jpg: model4Jpg, jpgMobile: model4MobileJpg },
    duration: 5.5,
    camera: {
      scale: [1.03, 1.15],
      x: ["1%", "-2%"],
      y: ["0%", "-1%"],
      origin: "50% 30%",
    },
    product: { slug: "unstructured-wool-blazer", delay: 2.2, duration: 2.5 },
  },
];

// Brief hold on the calmed final frame before the sequence loops back to
// scene 1 — the "final brand message" beat from the spec.
export const LOOP_PAUSE = 1.2;

export const TRANSITION_DURATION = 0.9;

// Generates one @keyframes rule per scene straight from SCENES[].camera, so
// the CSS-driven camera pan (native animation-play-state pause/resume,
// GPU-composited) never has to be hand-kept-in-sync with this config —
// change a scale/x/y value above and the keyframes below follow.
export function buildCameraKeyframesCSS() {
  const camera = SCENES.map((scene) => {
    const { scale, x, y } = scene.camera;
    return `@keyframes hero-cam-${scene.id} {
      0% { transform: scale(${scale[0]}) translate(${x[0]}, ${y[0]}); }
      100% { transform: scale(${scale[1]}) translate(${x[1]}, ${y[1]}); }
    }`;
  }).join("\n");

  // Shared by HeroProgress for the thin per-scene fill line — same
  // animation-play-state pause trick as the camera keyframes above.
  const progress = `@keyframes hero-progress-fill {
    0% { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }`;

  return `${camera}\n${progress}`;
}
