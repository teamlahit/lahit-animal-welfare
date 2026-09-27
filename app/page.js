import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ImpactStats from "@/components/ImpactStats";
import AdoptionSection from "@/components/AdoptionSection";
import RescueStories from "@/components/RescueStories";
import HelpCards from "@/components/HelpCards";
import EmergencyRescue from "@/components/EmergencyRescue";
import InstagramFeed from "@/components/InstagramFeed";
import DonationSection from "@/components/DonationSection";
import VolunteerSection from "@/components/VolunteerSection";
import RescueMap from "@/components/RescueMap";
import Footer from "@/components/Footer";
import PublicSiteGate from "@/components/PublicSiteGate";
import BlogHighlights from "@/components/BlogHighlights";

export default function Home() {
  return (
    <PublicSiteGate><main className="public-page min-h-screen">
      <Navbar />
      <HeroSection />
      <ImpactStats />
      <RescueStories />
      <RescueMap />
      <DonationSection />
      <AdoptionSection />
      <HelpCards />
      <EmergencyRescue />
      <InstagramFeed />
      <VolunteerSection />
      <Footer />
    </main></PublicSiteGate>
  );
}
