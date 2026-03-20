import AnimatedBackground from "@/components/landing/AnimatedBackground";
import Navbar from "@/components/shared/Navbar";
import HeroAlternate from "@/components/landing/HeroAlternate";

export default function HeroBPage() {
  return (
    <main className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <HeroAlternate />
    </main>
  );
}
