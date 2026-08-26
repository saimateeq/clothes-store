import EditorialSection from "../components/EditorialSection";
import WhyVelora from "../components/WhyVelora";
import Testimonials from "../components/Testimonials";
import SocialGallery from "../components/SocialGallery";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// The brand-story half of what used to be one long home page — split out
// so the home page stays focused on browsing/buying and this page can be
// its own considered introduction to VELORA.
export default function About() {
  useDocumentTitle("Our Story");

  return (
    <>
      <div className="mx-auto max-w-[1600px] px-5 pb-4 pt-14 sm:px-8 sm:pt-16 lg:pt-20">
        <span className="label text-accent">About Velora</span>
        <h1 className="mt-4 font-heading text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
          Our Story
        </h1>
      </div>
      <EditorialSection />
      <WhyVelora />
      <Testimonials />
      <SocialGallery />
    </>
  );
}
