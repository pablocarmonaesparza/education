"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.dataset.route = pathname ?? "";
  }, [pathname]);

  useEffect(() => {
    // Handle hash navigation when the page loads or route changes
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.substring(1); // Remove the # symbol
        
        // Try multiple times with increasing delays to handle dynamic content
        const tryScroll = (attempt: number = 0) => {
          const element = document.getElementById(elementId);
          
          if (element) {
            // Calculate offset for fixed navbar (assuming navbar is ~80px tall)
            const navbarHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          } else if (attempt < 5) {
            // Retry up to 5 times with increasing delays
            setTimeout(() => tryScroll(attempt + 1), 200 * (attempt + 1));
          }
        };

        // Start trying after a short delay
        setTimeout(() => tryScroll(), 100);
      }
    };

    // Handle initial load
    handleHashScroll();

    // Also handle hash changes (e.g., when clicking links on the same page)
    const handleHashChange = () => {
      handleHashScroll();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}

