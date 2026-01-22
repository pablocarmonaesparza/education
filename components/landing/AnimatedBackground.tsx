"use client";

import { useEffect, useState, useRef } from "react";

// Interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Color stops for the scroll journey
// Progress: 0 = start, 1 = full blue, then back to normal
const COLOR_STOPS = {
  hero: 0,           // 0% - base color
  howItWorks1: 0.1,  // 10%
  howItWorks2: 0.2,  // 20%
  howItWorks3: 0.3,  // 30%
  courses: 1,        // 100% - full blue
  pricing: 0,        // 0% - back to base
  faq: 0,            // 0% - base
};

export default function AnimatedBackground() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const updateProgress = () => {
      // Get all section positions
      const heroSection = document.getElementById("hero");
      const howItWorksSection = document.getElementById("how-it-works") || document.getElementById("how-it-works-mobile");
      const coursesSection = document.getElementById("available-courses");
      const pricingSection = document.getElementById("pricing");

      if (!howItWorksSection || !coursesSection || !pricingSection) {
        rafRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportCenter = scrollY + windowHeight / 2;

      // Get section boundaries
      const heroTop = heroSection?.offsetTop || 0;
      const heroBottom = heroTop + (heroSection?.offsetHeight || windowHeight);
      
      const howItWorksTop = howItWorksSection.offsetTop;
      const howItWorksHeight = howItWorksSection.offsetHeight;
      const howItWorksBottom = howItWorksTop + howItWorksHeight;
      
      const coursesTop = coursesSection.offsetTop;
      const coursesBottom = coursesTop + coursesSection.offsetHeight;
      
      const pricingTop = pricingSection.offsetTop;

      let newProgress = 0;

      // Hero section - base color
      if (viewportCenter < howItWorksTop) {
        newProgress = 0;
      }
      // How it works section - gradually increase from 0% to 30%
      else if (viewportCenter >= howItWorksTop && viewportCenter < howItWorksBottom) {
        const sectionProgress = (viewportCenter - howItWorksTop) / howItWorksHeight;
        // Map 0-1 section progress to 0-0.3 color progress
        newProgress = sectionProgress * 0.3;
      }
      // Transition from how-it-works to courses - 30% to 100%
      else if (viewportCenter >= howItWorksBottom && viewportCenter < coursesTop + windowHeight * 0.3) {
        const transitionZone = coursesTop + windowHeight * 0.3 - howItWorksBottom;
        const transitionProgress = (viewportCenter - howItWorksBottom) / transitionZone;
        newProgress = 0.3 + transitionProgress * 0.7; // 30% to 100%
      }
      // Courses section - full blue (100%)
      else if (viewportCenter >= coursesTop && viewportCenter < coursesBottom - windowHeight * 0.3) {
        newProgress = 1;
      }
      // Transition from courses to pricing - 100% to 0%
      else if (viewportCenter >= coursesBottom - windowHeight * 0.3 && viewportCenter < pricingTop + windowHeight * 0.3) {
        const transitionStart = coursesBottom - windowHeight * 0.3;
        const transitionEnd = pricingTop + windowHeight * 0.3;
        const transitionProgress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        newProgress = 1 - transitionProgress; // 100% to 0%
      }
      // Pricing and beyond - base color
      else {
        newProgress = 0;
      }

      setProgress(Math.max(0, Math.min(1, newProgress)));
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Colors
  const lightModeBase = "#FFFFFF";
  const darkModeBase = "#030712";
  const accentColor = "#1472FF";

  const lightColor = interpolateColor(lightModeBase, accentColor, progress);
  const darkColor = interpolateColor(darkModeBase, accentColor, progress);

  return (
    <div
      className="fixed inset-0 -z-10 transition-colors duration-150 ease-out bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]"
      style={{
        '--bg-light': lightColor,
        '--bg-dark': darkColor,
      } as React.CSSProperties}
    />
  );
}
