"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

const pageNavLinks = [
  { href: "/", label: "Inicio" },
  { href: "/conferencias", label: "Conferencias" },
  { href: "/about", label: "Nosotros" },
  { href: "/#pricing", label: "Precios" },
  { href: "/terms", label: "Términos" },
  { href: "/privacy", label: "Privacidad" },
];

export default function PageNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/50 dark:bg-gray-800/50"
          : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {pageNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-2xl transition-colors duration-300 font-bold uppercase tracking-wide text-sm ${
                  isActive(link.href)
                    ? "text-[#4b4b4b] dark:text-white bg-gray-200 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
            <Button
              href="/auth/signup"
              variant="primary"
              depth="bottom"
              size="none"
              rounded2xl
              className="px-7 py-3 inline-flex items-center gap-2"
            >
              Comenzar
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={
                  mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }
                }
                className="w-full h-0.5 rounded-full origin-center transition-all bg-gray-900 dark:bg-white"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 rounded-full transition-all bg-gray-900 dark:bg-white"
              />
              <motion.span
                animate={
                  mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
                }
                className="w-full h-0.5 rounded-full origin-center transition-all bg-gray-900 dark:bg-white"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Fullscreen */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-[100] bg-white dark:bg-gray-800"
            style={{ height: "100dvh" }}
          >
            <div className="h-full flex flex-col">
              <div className="flex-shrink-0 flex justify-between items-center h-20 px-4 border-b border-gray-100 dark:border-gray-800">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  {isDark ? (
                    <Image
                      src="/images/itera-logo-dark.png"
                      alt="Itera"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <Image
                      src="/images/itera-logo-light.png"
                      alt="Itera"
                      width={120}
                      height={40}
                      className="h-8 w-auto"
                    />
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg
                    className="w-6 h-6 text-gray-900 dark:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-shrink-0 px-6 pt-6">
                <div className="flex flex-col gap-1">
                  {pageNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-4 px-4 rounded-xl transition-all font-medium text-lg ${
                        isActive(link.href)
                          ? "text-[#1472FF] bg-blue-50 dark:bg-blue-900/30"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0" />

              <div className="flex-shrink-0 px-6 pb-8">
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-4 text-center font-bold text-lg uppercase tracking-wide rounded-2xl bg-[#1472FF] border-b-4 border-[#0E5FCC] text-white"
                >
                  Comenzar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tablet Menu - Popup */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block lg:hidden overflow-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-4">
                {pageNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium ${
                      isActive(link.href)
                        ? "text-[#1472FF] bg-blue-50 dark:bg-blue-900/30"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-center font-bold uppercase tracking-wide rounded-2xl transition-all bg-[#1472FF] border-b-4 border-[#0E5FCC] text-white hover:bg-[#0E5FCC]"
                  >
                    Comenzar
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
