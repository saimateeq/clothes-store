import HeroSection from "../components/home/hero/HeroSection";
import CategorySection from "../components/CategorySection";
import NewArrivals from "../components/NewArrivals";
import BestSellers from "../components/BestSellers";
import CollectionBanner from "../components/CollectionBanner";
import Newsletter from "../components/Newsletter";
import Benefits from "../components/Benefits";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Brand-story sections (Our Story, Why Velora, Testimonials, Instagram feed)
// live on /about — this page stays focused on browsing and buying.
export default function Home() {
  useDocumentTitle();

  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivals />
      <BestSellers />
      <Newsletter />
      <Benefits />
    </>
  );
}
