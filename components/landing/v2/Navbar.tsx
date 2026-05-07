'use client';

/**
 * Navbar v2 — porteada del Nav del prototipo claude-design (sections-1.jsx:10-276)
 * a Next.js + Tailwind nativo.
 *
 * Comportamiento:
 *   - sobre el hero: navbar invisible (sin bg, sin blur). Solo logo + CTA.
 *   - pasado el hero: aparece bg + blur + se revelan los 5 links centrales.
 *   - logo PNG real (light/dark). Sobre el hero siempre la versión clara.
 *   - indicator pill que se desliza tras el link de la sección activa.
 *   - mobile: drawer fullscreen.
 *
 * Elimina dependencia de tokens.css del prototipo — todo va por Tailwind.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
// motion intentionally not used — Next 16 + Turbopack tiene un edge-case con
// motion.h1/h2/p/details/AnimatePresence que deja elementos en opacity:0.
// Para enter/exit del drawer móvil basta con un fadeIn CSS keyframe.
import Button from '@/components/ui/Button';

const links = [
  { label: 'cómo funciona', href: '#como', id: 'como' },
  { label: 'comparativa', href: '#vs', id: 'vs' },
  { label: 'pricing', href: '#pricing', id: 'pricing' },
  { label: 'empresas', href: '#empresas', id: 'empresas' },
  { label: 'faq', href: '#faq', id: 'faq' },
];

export default function NavbarV2() {
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLElement | null>(null);

  // bloquea scroll cuando el drawer móvil está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  // detecta dark mode (system + override por [data-theme] o class="dark")
  useEffect(() => {
    const compute = () => {
      const themeAttr = document.documentElement.getAttribute('data-theme');
      if (themeAttr === 'light') return setIsDark(false);
      if (themeAttr === 'dark') return setIsDark(true);
      if (document.documentElement.classList.contains('dark')) return setIsDark(true);
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    compute();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMq = () => compute();
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else mq.addListener(onMq);
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onMq);
      else mq.removeListener(onMq);
      observer.disconnect();
    };
  }, []);

  // detecta si dejamos atrás el hero + sección visible bajo la navbar
  useEffect(() => {
    const onScroll = () => {
      // Soporte para ambos heroes: el cinético (`.hero-section`) y el del video
      // (`.hero-demo-section`) por si en el futuro lo volvemos a meter.
      const hero =
        document.querySelector('.hero-demo-section') ||
        document.querySelector('.hero-section');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        setPastHero(rect.bottom <= 80);
      } else {
        setPastHero(window.scrollY > 80);
      }
      const navHeight = 100;
      let current: string | null = null;
      for (const { id } of links) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= navHeight + 50 && rect.bottom > navHeight) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // mide la posición del link activo para el pill
  useEffect(() => {
    const measure = () => {
      if (!activeSection || !navRef.current) {
        setPill((s) => ({ ...s, width: 0 }));
        return;
      }
      if ((navRef.current as HTMLElement).offsetParent === null) return;
      const link = navRef.current.querySelector(
        `[data-section="${activeSection}"]`
      ) as HTMLElement | null;
      if (!link) return;
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.width === 0) return;
      setPill({ left: linkRect.left - navRect.left, width: linkRect.width });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [activeSection]);

  const goTo = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // logo sigue el theme global (ya no hay video de fondo oscuro forzando logo claro).
  const logoSrc = isDark ? '/images/itera-logo-dark.png' : '/images/itera-logo-light.png';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        pastHero
          ? 'bg-white/90 dark:bg-gray-800/90'
          : 'bg-white/40 dark:bg-gray-800/40'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative h-20 flex items-center justify-between gap-4">
        {/* logo · siempre visible */}
        <a
          href="#top"
          onClick={(e) => goTo(e, '#top')}
          className="flex items-center z-10"
          aria-label="Itera"
        >
          <Image
            src={logoSrc}
            alt="Itera"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </a>

        {/* desktop nav · invisible sobre el hero, fade-in pasado el hero */}
        <nav
          ref={navRef}
          className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 top-0 bottom-0 transition-opacity duration-300"
          style={{
            opacity: pastHero ? 1 : 0,
            pointerEvents: pastHero ? 'auto' : 'none',
          }}
          aria-hidden={!pastHero}
        >
          {/* indicator pill */}
          <div
            className="absolute top-0 bottom-0 my-auto h-10 rounded-xl pointer-events-none border-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            style={{
              left: pill.left,
              width: pill.width,
              borderBottomWidth: 4,
              transition:
                'left 350ms cubic-bezier(.16,1,.3,1), width 350ms cubic-bezier(.16,1,.3,1), opacity 250ms ease-out',
              opacity: pastHero && activeSection && pill.width > 0 ? 1 : 0,
              zIndex: 0,
            }}
          />
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-section={l.id}
              onClick={(e) => goTo(e, l.href)}
              className={`relative z-10 px-4 py-2.5 font-bold uppercase transition-colors ${
                activeSection === l.id
                  ? 'text-ink dark:text-white'
                  : 'text-ink-muted dark:text-gray-400'
              }`}
              style={{ fontSize: 13, letterSpacing: '0.06em' }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* desktop CTA · siempre visible */}
        <div className="hidden lg:flex items-center z-10">
          <Button href="/auth/signup" variant="primary" size="sm">
            empezar gratis
          </Button>
        </div>

        {/* mobile menu button */}
        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors z-10 text-ink dark:text-white"
          onClick={() => setOpen(true)}
          aria-label="abrir menú"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* mobile drawer fullscreen */}
      {open && (
          <div
            className="lg:hidden fixed inset-0 z-[100] bg-white dark:bg-gray-800 flex flex-col"
            style={{ height: '100dvh', animation: 'v2-fadeIn 200ms ease-out' }}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-20 px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <a
                href="#top"
                onClick={(e) => goTo(e, '#top')}
                className="flex items-center"
              >
                <Image
                  src={isDark ? '/images/itera-logo-dark.png' : '/images/itera-logo-light.png'}
                  alt="Itera"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </a>
              <button
                onClick={() => setOpen(false)}
                aria-label="cerrar"
                className="w-10 h-10 inline-flex items-center justify-center text-ink dark:text-white"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-6 flex flex-col gap-1 overflow-y-auto">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => goTo(e, l.href)}
                  className={`px-4 py-4 text-lg font-bold rounded-xl ${
                    activeSection === l.id
                      ? 'text-primary bg-primary/10'
                      : 'text-ink dark:text-white'
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div
              className="px-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
            >
              <Button
                href="/auth/signup"
                variant="primary"
                size="md"
                className="w-full justify-center"
              >
                empezar gratis
              </Button>
            </div>
          </div>
        )}
    </header>
  );
}
