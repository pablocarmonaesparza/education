"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isDark, setIsDark] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const navLinks = [
    { href: "#how-it-works", label: "Cómo Funciona", id: "how-it-works" },
    { href: "#available-courses", label: "Cursos", id: "available-courses" },
    { href: "#pricing", label: "Precios", id: "pricing" },
    { href: "#faq", label: "FAQ", id: "faq" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      // Detect active section
      const navHeight = 100;
      let currentSection: string | null = null;

      for (const link of navLinks) {
        const section = document.getElementById(link.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          // Check if section is in view (with some tolerance)
          if (rect.top <= navHeight + 50 && rect.bottom > navHeight) {
            currentSection = link.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update indicator position when active section changes
  useEffect(() => {
    if (activeSection && navRef.current) {
      const activeLink = navRef.current.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
        });
      }
    }
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    const hash = href.replace('#', '');
    const element = document.getElementById(hash);
    if (element) {
      const navHeight = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  };

  // Only show Navbar on the landing page (home page "/")
  if (!pathname || pathname !== '/') {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/50 dark:bg-gray-950/50"
          : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link href="/" className="group flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? (
                <Image
                  src="/images/logo-light.png"
                  alt="Itera"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              ) : (
                <Image
                  src="/images/logo-dark.png"
                  alt="Itera"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              )}
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered on page */}
          <div
            ref={navRef}
            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
              >
                <a
                  href={link.href}
                  data-section={link.id}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative transition-colors duration-300 font-medium cursor-pointer pb-1 ${
                    activeSection === link.id
                      ? "text-[#1472FF]"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </a>
              </motion.div>
            ))}

            {/* Sliding indicator */}
            {activeSection && (
              <motion.div
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] rounded-full"
                initial={false}
                animate={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
          </div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="hidden md:flex items-center"
          >
            <Link
              href="/auth/signup"
              className="px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2 navbar-button-gradient text-white hover:opacity-90"
            >
              <span className="flex items-center gap-2">
                Regístrate Gratis
                <svg
                  className="w-4 h-4 transition-transform text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 rounded-full origin-center transition-all bg-gray-900 dark:bg-white"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 rounded-full transition-all bg-gray-900 dark:bg-white"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 rounded-full origin-center transition-all bg-gray-900 dark:bg-white"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`block py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium cursor-pointer ${
                        activeSection === link.id
                          ? "text-[#1472FF] bg-blue-50 dark:bg-blue-900/30"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-center font-semibold rounded-lg transition-all navbar-button-gradient text-white hover:opacity-90"
                  >
                    Regístrate Gratis
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
