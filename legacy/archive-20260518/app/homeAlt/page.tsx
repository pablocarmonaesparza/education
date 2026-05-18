import { Suspense } from "react";
import NewHeroSectionAlt from "@/components/landing/NewHeroSectionAlt";
import CursosSection from "@/components/landing/CursosSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Navbar from "@/components/shared/Navbar";
import StructuredData from "@/components/shared/StructuredData";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import Footer from "@/components/shared/Footer";

/**
 * /homeAlt — variante de la landing para evaluar el hero contrarian con
 * imagen de playa AI de fondo. Solo cambia el hero; el resto de la
 * página mantiene los componentes vivos para que el cambio se vea en
 * contexto real (Cursos → Pricing → FAQ → Footer).
 *
 * Notas:
 *   - No carga AnimatedBackground (la imagen del hero es full-bleed; el
 *     resto de las secciones ya manejan su propio fondo).
 *   - Si esta variante gana, el cambio se mueve a app/page.tsx.
 */
export default function HomeAltPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <Navbar />
      <StructuredData />
      <NewHeroSectionAlt />
      <CursosSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
