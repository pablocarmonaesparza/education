"use client";

import { Suspense } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import ExperimentHero from "./_sections/ExperimentHero";
import ExperimentTicker from "./_sections/ExperimentTicker";
import ExperimentBento from "./_sections/ExperimentBento";
import ExperimentFlow from "./_sections/ExperimentFlow";
import ExperimentStats from "./_sections/ExperimentStats";
import ExperimentShowcase from "./_sections/ExperimentShowcase";
import ExperimentFAQ from "./_sections/ExperimentFAQ";
import ExperimentCTA from "./_sections/ExperimentCTA";

/**
 * /experimentLanding
 *
 * Landing page experimental inspirada en la estructura del Webflow Template
 * (hero + ticker + servicios + proceso + stats + faq + cta + footer),
 * reconstruida 100% sobre el design system de Itera:
 *
 *   - Navbar / Footer compartidos (components/shared)
 *   - Typography, Button, Card, Tag, StatCard, SectionHeader, IconButton,
 *     EmptyState, Divider, Spinner (components/ui)
 *   - CompositeCard, HorizontalScroll (components/shared)
 *
 * Animaciones con Framer Motion; nunca reemplazan al design system,
 * se aplican encima.
 */
export default function ExperimentLandingPage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <AnimatedBackground />
      <Navbar />

      <ExperimentHero />
      <ExperimentTicker />
      <ExperimentBento />
      <ExperimentShowcase />
      <ExperimentFlow />
      <ExperimentStats />
      <ExperimentFAQ />
      <ExperimentCTA />

      <Footer />
    </main>
  );
}
