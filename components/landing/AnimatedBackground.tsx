"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
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

    // Simple background: white for light mode, navy blue for dark mode
    const bgColor = isDarkMode ? "#0a1e3d" : "#FFFFFF";
    
    // Set background color on body and html
    document.body.style.backgroundColor = bgColor;
    document.documentElement.style.backgroundColor = bgColor;

    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, [isDarkMode]);

  // Don't render until we know the dark mode state to prevent flash
  if (isDarkMode === null) {
    return null;
  }

  // Background color based on mode
  const bgColor = isDarkMode ? "#0a1e3d" : "#FFFFFF";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundColor: bgColor,
        pointerEvents: "none",
      }}
    />
  );
}
