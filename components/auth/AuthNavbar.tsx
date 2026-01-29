'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';

export default function AuthNavbar() {
  const pathname = usePathname();
  const isSignupPage = pathname === '/auth/signup';
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
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {isDark ? (
              <Image
                src="/images/itera-logo-dark.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            ) : (
              <Image
                src="/images/itera-logo-light.png"
                alt="Itera"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            )}
          </Link>

          {/* Auth Button - Show opposite page */}
          {isSignupPage ? (
            <Button
              href="/auth/login"
              variant="primary"
              depth="bottom"
              size="none"
              rounded2xl
              className="px-7 py-3 inline-flex items-center gap-2"
            >
              Iniciar Sesión
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          ) : (
            <Button
              href="/auth/signup"
              variant="primary"
              depth="bottom"
              size="none"
              rounded2xl
              className="px-7 py-3 inline-flex items-center gap-2"
            >
              Comenzar
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

