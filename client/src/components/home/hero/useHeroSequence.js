import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import { SCENES, LOOP_PAUSE } from "./heroConfig";

const TOTAL = SCENES.length;

// Each scene's timeline reduced to the 3 things that actually happen:
// the product card shows, it hides, then the scene advances. Timed with
// setTimeout chains (not a per-frame RAF/interval loop) — the camera pan
// itself is one continuous Framer Motion `animate` call per scene, so the
// hook only needs to wake up at these 3 moments, not 60 times a second.
function eventsFor(index) {
  const scene = SCENES[index];
  const isLast = index === TOTAL - 1;
  return [
    { at: scene.product.delay, type: "show" },
    { at: scene.product.delay + scene.product.duration, type: "hide" },
    { at: scene.duration + (isLast ? LOOP_PAUSE : 0), type: "advance" },
  ].sort((a, b) => a.at - b.at);
}

/**
 * Drives the cinematic hero sequence: which scene is active, whether its
 * product card should be visible, and play/pause/next/prev controls.
 *
 * const { scene, sceneIndex, productVisible, isPlaying, togglePlay,
 *         nextScene, prevScene, goToScene } = useHeroSequence();
 */
export function useHeroSequence({ autoPlay = true } = {}) {
  const reducedMotion = usePrefersReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [productVisible, setProductVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay && !reducedMotion);

  const sceneIndexRef = useRef(0);
  const elapsedRef = useRef(0); // seconds elapsed within the current scene
  const segmentStartRef = useRef(0); // performance.now() at the last (re)schedule, for pause accounting
  const eventsRef = useRef(eventsFor(0));
  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    const next = eventsRef.current[0];
    if (!next || !isPlayingRef.current) return;

    const delayMs = Math.max(0, (next.at - elapsedRef.current) * 1000);
    segmentStartRef.current = performance.now();
    timerRef.current = setTimeout(() => {
      elapsedRef.current = next.at;
      eventsRef.current = eventsRef.current.slice(1);

      if (next.type === "show") setProductVisible(true);
      else if (next.type === "hide") setProductVisible(false);
      else if (next.type === "advance") {
        setProductVisible(false);
        const newIndex = (sceneIndexRef.current + 1) % TOTAL;
        sceneIndexRef.current = newIndex;
        elapsedRef.current = 0;
        eventsRef.current = eventsFor(newIndex);
        setSceneIndex(newIndex);
      }
      scheduleNext();
    }, delayMs);
  }, [clearTimer]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      scheduleNext();
    } else {
      // Freeze in place: bank the time spent in the segment that just got
      // interrupted so resuming continues from here, not from scratch.
      elapsedRef.current += (performance.now() - segmentStartRef.current) / 1000;
      clearTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => clearTimer, [clearTimer]);

  const goToScene = useCallback(
    (index) => {
      clearTimer();
      const normalized = ((index % TOTAL) + TOTAL) % TOTAL;
      sceneIndexRef.current = normalized;
      elapsedRef.current = 0;
      eventsRef.current = eventsFor(normalized);
      setProductVisible(false);
      setSceneIndex(normalized);
      if (isPlayingRef.current) scheduleNext();
    },
    [clearTimer, scheduleNext]
  );

  const nextScene = useCallback(() => goToScene(sceneIndexRef.current + 1), [goToScene]);
  const prevScene = useCallback(() => goToScene(sceneIndexRef.current - 1), [goToScene]);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  return {
    scenes: SCENES,
    totalScenes: TOTAL,
    sceneIndex,
    scene: SCENES[sceneIndex],
    productVisible,
    isPlaying,
    togglePlay,
    nextScene,
    prevScene,
    goToScene,
    reducedMotion,
  };
}
