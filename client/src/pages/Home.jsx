import HeroSection from "../components/home/hero/HeroSection";
import CategorySection from "../components/CategorySection";
import NewArrivals from "../components/NewArrivals";
import EditorialSection from "../components/EditorialSection";
import BestSellers from "../components/BestSellers";
import CollectionBanner from "../components/CollectionBanner";
import WhyVelora from "../components/WhyVelora";
import SocialGallery from "../components/SocialGallery";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Benefits from "../components/Benefits";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivals />
      <EditorialSection />
      <BestSellers />
      <CollectionBanner />
      <WhyVelora />
      <SocialGallery />
      <Testimonials />
      <Newsletter />
      <Benefits />
    </>
  );
}
