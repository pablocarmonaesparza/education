"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Get scroll progress of the entire page
  const { scrollYProgress } = useScroll();
  
  // We need to know section positions to map scroll progress correctly
  // This will be calculated after mount
  const [sectionRatios, setSectionRatios] = useState({
    heroEnd: 0.1,
    howItWorksEnd: 0.4,
    coursesStart: 0.4,
    coursesEnd: 0.6,
    pricingStart: 0.6,
  });

  useEffect(() => {
    setMounted(true);
    
    const calculateRatios = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      const heroSection = document.getElementById("hero");
      const howItWorksSection = document.getElementById("how-it-works") || document.getElementById("how-it-works-mobile");
      const coursesSection = document.getElementById("available-courses");
      const pricingSection = document.getElementById("pricing");
      
      if (heroSection && howItWorksSection && coursesSection && pricingSection && docHeight > 0) {
        const heroEnd = (heroSection.offsetTop + heroSection.offsetHeight) / docHeight;
        const howItWorksEnd = (howItWorksSection.offsetTop + howItWorksSection.offsetHeight) / docHeight;
        const coursesStart = coursesSection.offsetTop / docHeight;
        const coursesEnd = (coursesSection.offsetTop + coursesSection.offsetHeight) / docHeight;
        const pricingStart = pricingSection.offsetTop / docHeight;
        
        setSectionRatios({
          heroEnd: Math.min(heroEnd, 0.15),
          howItWorksEnd: Math.min(howItWorksEnd, 0.5),
          coursesStart: Math.max(coursesStart, 0.35),
          coursesEnd: Math.min(coursesEnd, 0.7),
          pricingStart: Math.max(pricingStart, 0.6),
        });
      }
    };
    
    // Calculate after a short delay to ensure DOM is ready
    setTimeout(calculateRatios, 100);
    window.addEventListener("resize", calculateRatios);
    
    return () => window.removeEventListener("resize", calculateRatios);
  }, []);

  // Transform scroll progress to color progress (0 to 1 and back to 0)
  // Hero: 0, HowItWorks: 0->0.3, Courses: 1, Pricing: 0
  const colorProgress = useTransform(
    scrollYProgress,
    [
      0,                           // Start
      sectionRatios.heroEnd,       // End of hero
      sectionRatios.howItWorksEnd, // End of how-it-works (30%)
      sectionRatios.coursesStart,  // Start of courses (ramp to 100%)
      sectionRatios.coursesEnd - 0.05, // Most of courses (100%)
      sectionRatios.pricingStart,  // Start of pricing (back to 0)
      1                            // End
    ],
    [0, 0, 0.3, 1, 1, 0, 0]
  );

  // Light mode: white to blue
  const lightBg = useTransform(
    colorProgress,
    [0, 0.3, 1],
    ["#FFFFFF", "#a8c9ff", "#1472FF"]
  );

  // Dark mode: gray-950 to blue  
  const darkBg = useTransform(
    colorProgress,
    [0, 0.3, 1],
    ["#030712", "#0a2d5c", "#1472FF"]
  );

  // Debug: log progress changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Uncomment to debug:
    // console.log("Scroll progress:", latest, "Color progress:", colorProgress.get());
  });

  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 bg-white dark:bg-gray-950" />
    );
  }

  return (
    <>
      {/* Light mode background */}
      <motion.div
        className="fixed inset-0 -z-10 dark:hidden"
        style={{ backgroundColor: lightBg }}
      />
      {/* Dark mode background */}
      <motion.div
        className="fixed inset-0 -z-10 hidden dark:block"
        style={{ backgroundColor: darkBg }}
      />
    </>
  );
}
