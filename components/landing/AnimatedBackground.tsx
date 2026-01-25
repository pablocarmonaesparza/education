"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [bgColor, setBgColor] = useState<string>("");

  useEffect(() => {
    // Detect dark mode using system preference (prefers-color-scheme)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const checkDarkMode = (e?: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e ? e.matches : mediaQuery.matches;
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode(mediaQuery);

    // Watch for system preference changes
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, []);

  useEffect(() => {
    // Wait until we know the actual dark mode state
    if (isDarkMode === null) return;

    // Base colors
    const lightBase = { r: 255, g: 255, b: 255 }; // #FFFFFF
    const darkBase = { r: 17, g: 24, b: 39 };     // #111827 (gray-900)
    const accent = { r: 20, g: 114, b: 255 };     // #1472FF

    const baseColor = isDarkMode ? darkBase : lightBase;
    const initialBgColor = isDarkMode ? "#111827" : "#FFFFFF";
    
    // Set initial background color
    setBgColor(initialBgColor);
    document.body.style.backgroundColor = initialBgColor;
    document.documentElement.style.backgroundColor = initialBgColor;

    const handleScroll = () => {
      const section = document.getElementById("available-courses");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      let progress = 0;
      
      // Calculate progress based on section position
      // Start transition when section enters viewport
      if (rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3) {
        // Section is in view - calculate how centered it is
        const sectionCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
        const maxDistance = windowHeight * 0.8;
        
        // More centered = higher progress
        progress = Math.max(0, 1 - (distanceFromCenter / maxDistance));
        progress = Math.min(1, progress * 1.5); // Boost the effect
      }

      // Interpolate between base color and accent
      const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
      const r = lerp(baseColor.r, accent.r, progress);
      const g = lerp(baseColor.g, accent.g, progress);
      const b = lerp(baseColor.b, accent.b, progress);
      
      const newColor = `rgb(${r}, ${g}, ${b})`;
      setBgColor(newColor);
      document.body.style.backgroundColor = newColor;
      document.documentElement.style.backgroundColor = newColor;
    };

    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, [isDarkMode]);

  // Don't render until we know the dark mode state to prevent flash
  if (isDarkMode === null) {
    return null;
  }

  // Initial color based on mode
  const initialColor = isDarkMode ? "#111827" : "#FFFFFF";

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
