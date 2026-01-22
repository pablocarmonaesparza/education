"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [bgColor, setBgColor] = useState({ light: "#FFFFFF", dark: "#030712" });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollY / docHeight : 0;

      // Simple color interpolation based on scroll
      // 0-20%: base, 20-50%: transition to blue, 50-70%: blue, 70-100%: back to base
      let colorProgress = 0;

      if (scrollProgress < 0.15) {
        colorProgress = 0;
      } else if (scrollProgress < 0.35) {
        // Transition from 0 to 0.3
        colorProgress = ((scrollProgress - 0.15) / 0.2) * 0.3;
      } else if (scrollProgress < 0.45) {
        // Transition from 0.3 to 1
        colorProgress = 0.3 + ((scrollProgress - 0.35) / 0.1) * 0.7;
      } else if (scrollProgress < 0.55) {
        // Full blue
        colorProgress = 1;
      } else if (scrollProgress < 0.7) {
        // Transition back to 0
        colorProgress = 1 - ((scrollProgress - 0.55) / 0.15);
      } else {
        colorProgress = 0;
      }

      // Clamp
      colorProgress = Math.max(0, Math.min(1, colorProgress));

      // Interpolate colors
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      
      // Light mode: white (#FFFFFF) to blue (#1472FF)
      const lightR = Math.round(lerp(255, 20, colorProgress));
      const lightG = Math.round(lerp(255, 114, colorProgress));
      const lightB = Math.round(lerp(255, 255, colorProgress));
      
      // Dark mode: gray-950 (#030712) to blue (#1472FF)
      const darkR = Math.round(lerp(3, 20, colorProgress));
      const darkG = Math.round(lerp(7, 114, colorProgress));
      const darkB = Math.round(lerp(18, 255, colorProgress));

      setBgColor({
        light: `rgb(${lightR}, ${lightG}, ${lightB})`,
        dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
      });
    };

    handleScroll(); // Initial call
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 -z-10 dark:hidden transition-colors duration-200"
        style={{ backgroundColor: bgColor.light }}
      />
      <div
        className="fixed inset-0 -z-10 hidden dark:block transition-colors duration-200"
        style={{ backgroundColor: bgColor.dark }}
      />
    </>
  );
}
