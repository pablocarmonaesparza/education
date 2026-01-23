"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [bgColor, setBgColor] = useState("");
  // Start with null to prevent flash, then detect actual mode
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect dark mode immediately on mount
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Wait until we know the actual dark mode state
    if (isDarkMode === null) return;

    // Base colors
    const lightBase = { r: 255, g: 255, b: 255 }; // #FFFFFF
    const darkBase = { r: 10, g: 30, b: 61 };     // #0a1e3d (azul marino)
    const accent = { r: 20, g: 114, b: 255 };     // #1472FF

    const baseColor = isDarkMode ? darkBase : lightBase;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const viewportCenter = window.scrollY + windowHeight / 2;

      // Get section elements
      const hero = document.getElementById("hero");
      const howItWorks = document.getElementById("how-it-works") || document.getElementById("how-it-works-mobile");
      const availableCourses = document.getElementById("available-courses");
      const pricing = document.getElementById("pricing");

      if (!hero || !howItWorks || !availableCourses || !pricing) {
        return;
      }

      // Get positions
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const howItWorksTop = howItWorks.offsetTop;
      const howItWorksHeight = howItWorks.offsetHeight;
      const stepHeight = howItWorksHeight / 3;

      const coursesTop = availableCourses.offsetTop;
      const coursesBottom = coursesTop + availableCourses.offsetHeight;

      const pricingTop = pricing.offsetTop;

      let colorProgress = 0;

      // Hero section - 0%
      if (viewportCenter < heroBottom - windowHeight * 0.3) {
        colorProgress = 0;
      }
      // Smooth transition: Hero → El Problema (0% → 10%)
      else if (viewportCenter >= heroBottom - windowHeight * 0.3 && viewportCenter < howItWorksTop + stepHeight * 0.5) {
        const transitionStart = heroBottom - windowHeight * 0.3;
        const transitionEnd = howItWorksTop + stepHeight * 0.5;
        const progress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        colorProgress = progress * 0.1;
      }
      // Step 1: El Problema - 10%
      else if (viewportCenter >= howItWorksTop + stepHeight * 0.5 && viewportCenter < howItWorksTop + stepHeight) {
        colorProgress = 0.1;
      }
      // Smooth transition: El Problema → Cuéntanos Tu Idea (10% → 20%)
      else if (viewportCenter >= howItWorksTop + stepHeight && viewportCenter < howItWorksTop + stepHeight * 1.5) {
        const transitionStart = howItWorksTop + stepHeight;
        const transitionEnd = howItWorksTop + stepHeight * 1.5;
        const progress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        colorProgress = 0.1 + progress * 0.1;
      }
      // Step 2: Cuéntanos Tu Idea - 20%
      else if (viewportCenter >= howItWorksTop + stepHeight * 1.5 && viewportCenter < howItWorksTop + stepHeight * 2) {
        colorProgress = 0.2;
      }
      // Smooth transition: Cuéntanos Tu Idea → Tu Camino Directo (20% → 30%)
      else if (viewportCenter >= howItWorksTop + stepHeight * 2 && viewportCenter < howItWorksTop + stepHeight * 2.5) {
        const transitionStart = howItWorksTop + stepHeight * 2;
        const transitionEnd = howItWorksTop + stepHeight * 2.5;
        const progress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        colorProgress = 0.2 + progress * 0.1;
      }
      // Step 3: Tu Camino Directo - 30%
      else if (viewportCenter >= howItWorksTop + stepHeight * 2.5 && viewportCenter < howItWorksTop + howItWorksHeight) {
        colorProgress = 0.3;
      }
      // Smooth transition: Tu Camino Directo → Posibilidades Infinitas (30% → 100%)
      else if (viewportCenter >= howItWorksTop + howItWorksHeight && viewportCenter < coursesTop + windowHeight * 0.3) {
        const transitionStart = howItWorksTop + howItWorksHeight;
        const transitionEnd = coursesTop + windowHeight * 0.3;
        const progress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        colorProgress = 0.3 + progress * 0.7;
      }
      // Posibilidades Infinitas - 100%
      else if (viewportCenter >= coursesTop + windowHeight * 0.3 && viewportCenter < coursesBottom - windowHeight * 0.3) {
        colorProgress = 1;
      }
      // Smooth transition: Posibilidades Infinitas → Nuestros Planes (100% → 0%)
      else if (viewportCenter >= coursesBottom - windowHeight * 0.3 && viewportCenter < pricingTop + windowHeight * 0.2) {
        const transitionStart = coursesBottom - windowHeight * 0.3;
        const transitionEnd = pricingTop + windowHeight * 0.2;
        const progress = (viewportCenter - transitionStart) / (transitionEnd - transitionStart);
        colorProgress = 1 - progress;
      }
      // Nuestros Planes and beyond - 0%
      else {
        colorProgress = 0;
      }

      // Clamp
      colorProgress = Math.max(0, Math.min(1, colorProgress));

      // Interpolate between base color and accent
      const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
      const r = lerp(baseColor.r, accent.r, colorProgress);
      const g = lerp(baseColor.g, accent.g, colorProgress);
      const b = lerp(baseColor.b, accent.b, colorProgress);
      
      const newColor = `rgb(${r}, ${g}, ${b})`;
      setBgColor(newColor);
      document.body.style.backgroundColor = newColor;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.backgroundColor = "";
    };
  }, [isDarkMode]);

  // Don't render until we know the dark mode state to prevent flash
  if (isDarkMode === null) {
    return null;
  }

  // Initial color based on mode
  const initialColor = isDarkMode ? "#0a1e3d" : "#FFFFFF";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundColor: bgColor || initialColor,
        transition: "background-color 150ms ease-out",
        pointerEvents: "none",
      }}
    />
  );
}
