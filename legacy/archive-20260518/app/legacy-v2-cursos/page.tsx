/**
 * Home (v2) — landing porteada del prototipo claude-design al stack Next.js + Tailwind.
 *
 * Composición canónica del prototipo (`public/landing-claude-design/app.jsx:43-69`),
 * sin el HeroDemo del video (queda postergado).
 *
 * Hero (cinético) → Problema → Como → Compare → Testimonios →
 * Pricing → Empresas → FAQ → CtaCierre → Footer.
 *
 * El layout viejo queda preservado en `app/legacy/page.tsx` por si necesitamos volver.
 */

import { Suspense } from "react";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import StructuredData from "@/components/shared/StructuredData";
import Footer from "@/components/shared/Footer";

import Navbar from "@/components/landing/v2/Navbar";
import Hero from "@/components/landing/v2/Hero";
import Problema from "@/components/landing/v2/Problema";
import Como from "@/components/landing/v2/Como";
import Compare from "@/components/landing/v2/Compare";
import Testimonios from "@/components/landing/v2/Testimonios";
import Pricing from "@/components/landing/v2/Pricing";
import Empresas from "@/components/landing/v2/Empresas";
import FAQ from "@/components/landing/v2/FAQ";
import CtaCierre from "@/components/landing/v2/CtaCierre";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-800">
      {/* OAuth callbacks que aterrizan en / (ej. signup con Google) */}
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <StructuredData />
      <Navbar />
      <Hero />
      <Problema />
      <Como />
      <Compare />
      <Testimonios />
      <Pricing />
      <Empresas />
      <FAQ />
      <CtaCierre />
      <Footer />
    </main>
  );
}
