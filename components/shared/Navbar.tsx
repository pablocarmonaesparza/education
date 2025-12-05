"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      
      // Detect when past hero section - check actual hero section height
      const heroSection = document.querySelector('section:first-of-type');
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const heroBottom = heroRect.bottom + scrollY;
        // Only change when completely past the hero section
        setPastHero(scrollY >= heroBottom - 100);
      } else {
        // Fallback: use viewport height
        const heroHeight = window.innerHeight;
        setPastHero(scrollY >= heroHeight - 50);
      }
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#available-courses", label: "Curso" },
    { href: "#how-it-works", label: "Cómo Funciona" },
    { href: "#pricing", label: "Precios" },
    { href: "#faq", label: "FAQ" },
  ];

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
        pastHero
          ? "backdrop-blur-md"
          : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold"
            >
              <span className={`transition-colors duration-300 ${
                pastHero ? "text-[#1472FF]" : "text-[#111827]"
              }`}>
                Leap
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.4 }}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative transition-colors font-medium cursor-pointer ${
                    pastHero
                      ? "text-gray-600 hover:text-gray-900"
                      : scrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-white hover:text-white/80"
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] hover:w-full transition-all duration-300" />
                </a>
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="hidden md:flex items-center ml-auto"
          >
            <Link
              href="/auth/signup"
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2 ${
                pastHero
                  ? "navbar-button-gradient text-white hover:opacity-90"
                  : "bg-white text-[#1472FF] hover:bg-gray-100 shadow-lg hover:shadow-xl"
              }`}
            >
              <span className="flex items-center gap-2">
                Regístrate
                <svg
                  className={`w-4 h-4 transition-transform ${
                    pastHero ? "text-white" : "text-[#1472FF]"
                  }`}
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
            className={`md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              pastHero || scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"
            }`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className={`w-full h-0.5 rounded-full origin-center transition-all ${
                  pastHero || scrolled ? "bg-gray-900" : "bg-white"
                }`}
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`w-full h-0.5 rounded-full transition-all ${
                  scrolled ? "bg-gray-900" : "bg-white"
                }`}
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className={`w-full h-0.5 rounded-full origin-center transition-all ${
                  pastHero || scrolled ? "bg-gray-900" : "bg-white"
                }`}
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
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50"
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
                      className="block py-3 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all font-medium cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="pt-4 border-t border-gray-200"
                  >
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-4 text-center font-semibold rounded-lg transition-all ${
                      pastHero
                        ? "navbar-button-gradient text-white hover:opacity-90"
                        : "bg-white text-[#1472FF] hover:bg-gray-100 shadow-lg"
                    }`}
                  >
                    Regístrate
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
