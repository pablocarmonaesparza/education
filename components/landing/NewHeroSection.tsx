'use client';

/**
 * Hero section — rebuilt from the Claude Design handoff
 * (shader-wallpapers/Hero Shader.html, 2026-04-22).
 *
 * The interactive particle shader sits as an absolute-positioned background;
 * content sits above it with `pointer-events-none` so the shader receives
 * mouse/click everywhere the CTAs don't cover.
 *
 * Copy reflects the post-pivot positioning ("aprender AI para tu empresa",
 * ejercicios interactivos no videos). The previous `describe tu idea`
 * textarea flow was removed to match the Claude Design layout — if we want
 * the personalized-route entry point back on the landing, it belongs in a
 * separate section or a secondary modal, not the hero.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/ui/Button';
import HeroShader from './HeroShader';

export default function NewHeroSection() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const handleStart = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800"
    >
      {/* Interactive particle shader background */}
      <HeroShader />

      {/* Content — centered over the shader. `pointer-events-none` on the
          wrapper so the shader receives moves/clicks in its empty areas;
          CTAs re-enable events on themselves. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
      >
        {/* Eyebrow */}
        <div className="mb-5 text-xs tracking-[0.24em] uppercase text-black/55 dark:text-white/55 font-mono">
          lecciones nuevas diariamente
        </div>

        {/* H1 — single line, lowercase, Darker Grotesque black (900) */}
        <h1 className="font-display font-black lowercase whitespace-nowrap text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1] tracking-[-0.025em] text-[#0a0a0a] dark:text-white m-0">
          ai de{' '}
          <em className="not-italic font-black text-[#1472FF]">0 a 100</em>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-[17px] leading-[1.5] text-black/60 dark:text-white/60 max-w-[52ch] mx-auto max-md:text-base"
          style={{ textWrap: 'pretty' }}
        >
          Más de 100 lecciones de AI, Automatización, Vibe Coding y mucho más
        </p>

        {/* CTA — single primary action. Secondary CTA removed after
            hiding #how-it-works; the bottom chevron to #pricing handles
            the "learn more" affordance. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex justify-center pointer-events-auto max-md:w-full max-md:max-w-xs"
        >
          <Button
            variant="primary"
            depth="full"
            size="none"
            onClick={handleStart}
            className="px-6 py-3 text-sm max-md:w-full max-md:min-h-[48px]"
          >
            empezar gratis
          </Button>
        </motion.div>
      </motion.div>

      {/* Next-section indicator — same pattern as PricingSection's FAQ link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <button
          onClick={() => {
            document
              .getElementById('pricing')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
            Precios
          </span>
          <motion.svg
            className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </button>
      </motion.div>

      {/* Auth Modal — preserved from previous hero (signup entry point) */}
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm max-md:p-3 max-md:overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10 max-md:max-h-[90dvh] max-md:my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-900 relative max-md:overflow-y-auto max-md:max-h-[90dvh]">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-20"
                  aria-label="Cerrar"
                >
                  <svg
                    className="w-5 h-5"
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
                <AuthForm mode={authMode} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
