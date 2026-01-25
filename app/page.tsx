import { Suspense } from "react";
import NewHeroSection from "@/components/landing/NewHeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AvailableCoursesSection from "@/components/landing/AvailableCoursesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Navbar from "@/components/shared/Navbar";
import StructuredData from "@/components/shared/StructuredData";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Handle OAuth codes that land on wrong page */}
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <AnimatedBackground />
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
