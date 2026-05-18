'use client';

/**
 * Project input section — entry point for the "ruta personalizada" flow.
 *
 * Flow: user describes what they want to build → idea saved to
 * sessionStorage (and cookie fallback for OAuth round-trips where
 * sessionStorage is wiped) → redirect to /auth/signup → after successful
 * signup, `window.location.href = '/onboarding'` → onboarding routes to
 * /projectDescription, which reads `pendingProjectIdea` as its initial
 * state and pre-populates the textarea there.
 *
 * Revived from the previous NewHeroSection textarea flow that was removed
 * when the hero was rebuilt from the Claude Design handoff. Lives here as
 * a standalone section so the hero stays visually simple.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

const MIN_CHARS = 100;
const MAX_CHARS = 1000;

export default function ProjectInputSection() {
  const router = useRouter();
  const [idea, setIdea] = useState('');

  const trimmedLength = idea.trim().length;
  const isValid = trimmedLength >= MIN_CHARS && trimmedLength <= MAX_CHARS;
  const isOverLimit = idea.length > MAX_CHARS;

  const handleSubmit = () => {
    if (!isValid) return;
    const trimmed = idea.trim();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingProjectIdea', trimmed);
      // Cookie fallback for OAuth redirects where sessionStorage is lost.
      document.cookie = `pendingProjectIdea=${encodeURIComponent(trimmed)}; path=/; max-age=3600; SameSite=Lax`;
    }
    router.push('/auth/signup');
  };

  return (
    <section
      id="project-input"
      className="relative min-h-screen flex flex-col items-center justify-center py-20 md:py-28 px-4 max-md:px-3"
    >
      <div className="container mx-auto max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12 max-md:mb-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink dark:text-white leading-tight tracking-tight max-md:text-3xl lowercase">
            tu proyecto, tu ruta
          </h2>
          <p className="mt-4 text-lg text-ink-muted dark:text-gray-400 max-w-xl mx-auto max-md:text-base">
            Cuéntanos qué quieres construir o aprender a hacer. Armamos una ruta con solo las lecciones que necesitas, en el orden correcto.
          </p>
        </motion.div>

        {/* Textarea */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-left"
        >
          <Textarea
            value={idea}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setIdea(e.target.value);
              }
            }}
            placeholder="Ej. Quiero automatizar el proceso de facturación de mi empresa con AI, para que las facturas se generen y envíen cuando se confirma una venta."
            rows={5}
            className="w-full"
          />
          <div className="flex justify-end mt-2">
            <span
              className={`text-xs font-medium ${
                trimmedLength >= MIN_CHARS
                  ? 'text-completado'
                  : 'text-ink-muted dark:text-gray-400'
              }`}
            >
              {trimmedLength}/{MIN_CHARS} mínimo
            </span>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500 mt-1 text-center">
              Excediste el límite de {MAX_CHARS} caracteres.
            </p>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="primary"
            depth="full"
            size="none"
            onClick={handleSubmit}
            disabled={!isValid}
            className="px-8 py-3 text-base max-md:w-full max-md:max-w-xs max-md:min-h-[48px]"
          >
            generar mi ruta
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
