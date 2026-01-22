"use client";

import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [bgColor, setBgColor] = useState("#030712");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollY / docHeight : 0;

      // Color interpolation
      let colorProgress = 0;
      if (scrollProgress < 0.15) {
        colorProgress = 0;
      } else if (scrollProgress < 0.35) {
        colorProgress = ((scrollProgress - 0.15) / 0.2) * 0.3;
      } else if (scrollProgress < 0.45) {
        colorProgress = 0.3 + ((scrollProgress - 0.35) / 0.1) * 0.7;
      } else if (scrollProgress < 0.55) {
        colorProgress = 1;
      } else if (scrollProgress < 0.7) {
        colorProgress = 1 - ((scrollProgress - 0.55) / 0.15);
      } else {
        colorProgress = 0;
      }

      colorProgress = Math.max(0, Math.min(1, colorProgress));

      // Interpolate: dark gray (#030712) to blue (#1472FF)
      const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
      const r = lerp(3, 20, colorProgress);
      const g = lerp(7, 114, colorProgress);
      const b = lerp(18, 255, colorProgress);
      
      const newColor = `rgb(${r}, ${g}, ${b})`;
      setBgColor(newColor);
      
      // Also apply to body directly as backup
      document.body.style.backgroundColor = newColor;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        backgroundColor: bgColor,
        transition: "background-color 150ms ease-out",
        pointerEvents: "none",
      }}
    />
  );
}
