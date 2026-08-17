import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/**
 * Discreet playback controls for the hero sequence — previous/next scene
 * and pause/resume. Deliberately small and low-contrast against the
 * cinematic imagery rather than looking like a video-player chrome bar.
 */
export default function HeroNavigation({ isPlaying, onTogglePlay, onPrev, onNext }) {
  const buttonClass =
    "flex h-8 w-8 items-center justify-center text-white/80 transition-colors hover:text-white focus-visible:text-white";

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onPrev} aria-label="Previous scene" className={buttonClass}>
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={!isPlaying}
        className={buttonClass}
      >
        {isPlaying ? <Pause size={14} strokeWidth={1.5} /> : <Play size={14} strokeWidth={1.5} />}
      </button>
      <button type="button" onClick={onNext} aria-label="Next scene" className={buttonClass}>
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
