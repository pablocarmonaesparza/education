import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import AltHeroSection from '@/components/homeAlt/AltHeroSection';
import AltTickerSection from '@/components/homeAlt/AltTickerSection';
import AltMissionSection from '@/components/homeAlt/AltMissionSection';
import AltServicesSection from '@/components/homeAlt/AltServicesSection';
import AltCtaSection from '@/components/homeAlt/AltCtaSection';
import AltTestimonialsSection from '@/components/homeAlt/AltTestimonialsSection';

export default function HomeAltPage() {
  return (
    <>
      <Navbar />
      <main>
        <AltHeroSection />
        <AltTickerSection />
        <AltMissionSection />
        <AltServicesSection />
        <AltCtaSection />
        <AltTestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
