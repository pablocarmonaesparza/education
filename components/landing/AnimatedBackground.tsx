"use client";

import { useEffect, useState, useCallback } from "react";

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

export default function AnimatedBackground() {
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const howItWorksSection = document.getElementById("how-it-works") || document.getElementById("how-it-works-mobile");
    const coursesSection = document.getElementById("available-courses");
    const pricingSection = document.getElementById("pricing");

    if (!howItWorksSection || !coursesSection || !pricingSection) {
      return;
    }

    const windowHeight = window.innerHeight;
    
    // Use getBoundingClientRect for accurate positions
    const howItWorksRect = howItWorksSection.getBoundingClientRect();
    const coursesRect = coursesSection.getBoundingClientRect();
    const pricingRect = pricingSection.getBoundingClientRect();

    let newProgress = 0;

    // Calculate based on where sections are relative to viewport
    const viewportMiddle = windowHeight / 2;

    // Hero section (before how-it-works enters) - base color
    if (howItWorksRect.top > viewportMiddle) {
      newProgress = 0;
    }
    // How it works section - gradually increase from 0% to 30%
    else if (howItWorksRect.top <= viewportMiddle && howItWorksRect.bottom > viewportMiddle) {
      // How far through the section are we? (0 to 1)
      const sectionProgress = (viewportMiddle - howItWorksRect.top) / howItWorksRect.height;
      // Map to 0-0.3
      newProgress = Math.min(sectionProgress * 0.35, 0.3);
    }
    // Between how-it-works and courses - transition 30% to 100%
    else if (howItWorksRect.bottom <= viewportMiddle && coursesRect.top > viewportMiddle) {
      // We're in the gap, interpolate
      const gapSize = coursesRect.top - howItWorksRect.bottom;
      const gapProgress = (viewportMiddle - howItWorksRect.bottom) / gapSize;
      newProgress = 0.3 + gapProgress * 0.7;
    }
    // Courses section - full blue (100%)
    else if (coursesRect.top <= viewportMiddle && coursesRect.bottom > viewportMiddle) {
      // Check if we're in the last 30% of courses (transition out)
      const sectionProgress = (viewportMiddle - coursesRect.top) / coursesRect.height;
      if (sectionProgress > 0.7) {
        // Start transitioning out
        const exitProgress = (sectionProgress - 0.7) / 0.3;
        newProgress = 1 - exitProgress * 0.5; // Go from 100% to 50%
      } else {
        newProgress = 1;
      }
    }
    // Between courses and pricing - transition to 0%
    else if (coursesRect.bottom <= viewportMiddle && pricingRect.top > viewportMiddle) {
      const gapSize = pricingRect.top - coursesRect.bottom;
      const gapProgress = (viewportMiddle - coursesRect.bottom) / gapSize;
      newProgress = 0.5 - gapProgress * 0.5; // 50% to 0%
    }
    // Pricing and beyond - base color
    else if (pricingRect.top <= viewportMiddle) {
      newProgress = 0;
    }

    setProgress(Math.max(0, Math.min(1, newProgress)));
  }, []);

  useEffect(() => {
    // Initial update
    updateProgress();

    // Listen to scroll events with passive for better performance
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  // Colors
  const lightModeBase = "#FFFFFF";
  const darkModeBase = "#030712";
  const accentColor = "#1472FF";

  const lightColor = interpolateColor(lightModeBase, accentColor, progress);
  const darkColor = interpolateColor(darkModeBase, accentColor, progress);

  return (
    <div
      className="fixed inset-0 -z-10 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]"
      style={{
        '--bg-light': lightColor,
        '--bg-dark': darkColor,
        transition: 'background-color 100ms ease-out',
      } as React.CSSProperties}
    />
  );
}
