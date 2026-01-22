'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function OnboardingNavbar() {
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {isDark ? (
              <Image
                src="/images/itera-logo-light.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            ) : (
              <Image
                src="/images/itera-logo-dark.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

