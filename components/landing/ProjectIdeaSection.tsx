'use client';

/**
 * Section for the personalized-route entry point. Sits between
 * AvailableCoursesSection and PricingSection: "you've seen what Itera is,
 * now if you already have a project in mind, tell us and we'll build the
 * route for you."
 *
 * Flow: user types idea (100–1000 chars) → click CTA → idea persisted to
 * sessionStorage + cookie (same keys the original hero textarea used) →
 * redirect to `/auth/signup`. The existing AuthForm reads
 * `pendingProjectIdea` and routes to onboarding with it pre-loaded.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { depth } from '@/lib/design-tokens';

const MIN_CHARACTERS = 100;
const MAX_CHARACTERS = 1000;

export default function ProjectIdeaSection() {
  const router = useRouter();
  const [idea, setIdea] = useState('');

  const trimmed = idea.trim();
  const isValid =
    trimmed.length >= MIN_CHARACTERS && trimmed.length <= MAX_CHARACTERS;
  const isOverLimit = idea.length > MAX_CHARACTERS;

  const handleSubmit = () => {
    if (!isValid) return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingProjectIdea', trimmed);
      // Cookie so server-side redirect handlers (OAuth callback) can pick
      // up the idea — sessionStorage alone is client-only.
      document.cookie = `pendingProjectIdea=${encodeURIComponent(
        trimmed,
      )}; path=/; max-age=3600; SameSite=Lax`;
    }

    router.push('/auth/signup');
  };

  return (
    <section
      id="project-idea"
      className="relative py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-md:py-16"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 max-md:mb-6"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink dark:text-white leading-tight tracking-tight max-md:text-2xl">
            cuéntanos tu proyecto
          </h2>
          <p className="mt-4 text-base md:text-lg text-ink-muted dark:text-gray-400 max-w-xl mx-auto max-md:text-sm max-md:mt-3">
            Armamos tu ruta personalizada con solo las lecciones que
            necesitas — en el orden correcto, sin relleno.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className={`rounded-2xl ${depth.border} ${depth.bottom} ${
            isOverLimit
              ? 'border-red-300 border-b-red-400 dark:border-red-800 dark:border-b-red-800'
              : 'border-gray-200 border-b-gray-300 dark:border-gray-900 dark:border-b-gray-900'
          } bg-white dark:bg-gray-800 p-5 md:p-6`}
        >
          <textarea
            value={idea}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARACTERS) {
                setIdea(e.target.value);
              }
            }}
            placeholder="Quiero construir un chatbot para que mis clientes pidan por WhatsApp. Debe entender el menú, calcular totales y pasar al pago cuando el cliente confirme."
            rows={4}
            className="w-full bg-transparent text-base text-ink dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none leading-relaxed max-md:text-sm"
          />
          <div className="flex items-center justify-between mt-2 gap-3">
            <p
              className={`text-xs font-medium ${
                isValid
                  ? 'text-completado'
                  : isOverLimit
                    ? 'text-red-500'
                    : 'text-ink-muted dark:text-gray-400'
              }`}
            >
              {idea.length}/{MIN_CHARACTERS} mínimo
            </p>
          </div>
          <Button
            variant="primary"
            depth="full"
            size="none"
            onClick={handleSubmit}
            disabled={!isValid}
            className="mt-4 w-full px-6 py-3 text-sm inline-flex items-center justify-center gap-2 max-md:min-h-[48px]"
          >
            armar mi ruta
            <svg
              className="w-4 h-4"
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
        </motion.div>
      </div>
    </section>
  );
}
