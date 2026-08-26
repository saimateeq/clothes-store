const MESSAGE = "FREE SHIPPING ON ORDERS OVER $100 · EASY 30-DAY RETURNS · NEW SEASON NOW AVAILABLE";

export default function AnnouncementBar() {
  const track = Array.from({ length: 4 }, () => MESSAGE).join("  ·  ");

  return (
    <div className="sticky top-0 z-50 flex h-9 items-center overflow-hidden border-b border-line bg-ink text-bg">
      <div className="flex w-max animate-marquee">
        <span className="label px-4 tracking-[0.18em] whitespace-nowrap">{track}</span>
        <span className="label px-4 tracking-[0.18em] whitespace-nowrap" aria-hidden="true">
          {track}
        </span>
      </div>
    </div>
  );
}
