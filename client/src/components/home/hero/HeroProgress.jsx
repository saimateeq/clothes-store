/**
 * Minimal "01 / 04" counter + a thin per-scene fill line. The active
 * segment fills over the scene's duration (paused = frozen mid-fill, via
 * the same CSS animation-play-state trick HeroScene uses for the camera —
 * see heroConfig.buildCameraKeyframesCSS). Segments are clickable to jump.
 */
export default function HeroProgress({ scenes, sceneIndex, isPlaying, onSelect }) {
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3" role="tablist" aria-label="Hero scenes">
      <span className="label text-white/90">{pad(sceneIndex + 1)}</span>
      <div className="flex items-center gap-1.5">
        {scenes.map((scene, i) => (
          <button
            key={scene.id}
            type="button"
            role="tab"
            aria-selected={i === sceneIndex}
            aria-label={`Go to scene ${i + 1}`}
            onClick={() => onSelect(i)}
            className="h-[3px] w-8 overflow-hidden bg-white/25 sm:w-10"
          >
            <span
              className="block h-full w-full origin-left bg-white"
              style={{
                transform: i < sceneIndex ? "scaleX(1)" : "scaleX(0)",
                ...(i === sceneIndex
                  ? {
                      animationName: "hero-progress-fill",
                      animationDuration: `${scene.duration}s`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      animationPlayState: isPlaying ? "running" : "paused",
                    }
                  : {}),
              }}
            />
          </button>
        ))}
      </div>
      <span className="label text-white/60">{pad(scenes.length)}</span>
    </div>
  );
}
