import { Camera } from "lucide-react";
import { galleryImages } from "../data/editorial";
import SectionHeading from "./SectionHeading";

const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

export default function SocialGallery() {
  return (
    <section className="section-py mx-auto max-w-[1600px] px-5 sm:px-8">
      <SectionHeading label="@veloraofficial" heading="Follow Velora" />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        {galleryImages.map((src, i) => (
          <a
            key={src}
            href="#"
            className={`group relative overflow-hidden ${ASPECTS[i]} ${
              i === 0 ? "col-span-2 row-span-1 sm:col-span-1" : ""
            }`}
            aria-label="View on Instagram"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/0 text-white opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
              <Camera size={20} strokeWidth={1.5} />
              <span className="label">View</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
