import { Suspense } from "react";
import NewHeroSection from "@/components/landing/NewHeroSection";
import CursosSection from "@/components/landing/CursosSection";
import CapacitacionSection from "@/components/landing/CapacitacionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ProjectInputSection from "@/components/landing/ProjectInputSection";
import AvailableCoursesSection from "@/components/landing/AvailableCoursesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Navbar from "@/components/shared/Navbar";
import StructuredData from "@/components/shared/StructuredData";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import Footer from "@/components/shared/Footer";

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
      <CursosSection />
      {/* Secciones archivadas — landing actual: Hero → Cursos → Pricing → FAQ.
          Capacitación está temporalmente oculta hasta que tengamos contenido. */}
      {/* <CapacitacionSection /> */}
      {/* <HowItWorksSection /> */}
      {/* <ProjectInputSection /> */}
      {/* <AvailableCoursesSection /> */}
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
