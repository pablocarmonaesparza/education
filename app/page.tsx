import NewHeroSection from "@/components/landing/NewHeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AvailableCoursesSection from "@/components/landing/AvailableCoursesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Navbar from "@/components/shared/Navbar";
import StructuredData from "@/components/shared/StructuredData";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <StructuredData />
      <NewHeroSection />
      <HowItWorksSection />
      <AvailableCoursesSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
