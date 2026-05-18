'use client';

/**
 * HeroDemo v2 — porteado del prototipo claude-design (sections-1.jsx:938-1095).
 *
 * Pieza distintiva del rediseño: video full-bleed que cambia entre versión light
 * (playa diurna) y dark (campamento estrellado) según el theme del sistema; tres
 * CTAs glass con backdrop-blur sobre el video.
 *
 * Anchor: id="hero" + className="hero-demo-section" (la Navbar v2 detecta este
 * último para activar el bg + blur una vez que pasamos el hero).
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const ctas = [
  { label: 'aprender ia desde cero', intent: 'beginner' },
  { label: 'construir mi proyecto', intent: 'build' },
  { label: 'aplicar ia en mi trabajo', intent: 'work' },
];

export default function HeroDemoV2() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  // detecta dark mode (system + override por [data-theme] o class="dark" en root)
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

  // pausa el video cuando NO está visible (libera CPU/decode al scrollear)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.1 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // respeta prefers-reduced-motion
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // light: playa diurna · dark: campamento estrellado
  const videoSrc = isDark
    ? '/videos/hero-video-dark-mode.mp4'
    : '/videos/hero-video-light-mode.mp4';

  return (
    <section
      id="hero"
      className="hero-demo-section relative overflow-hidden min-h-screen flex items-center justify-center text-white"
      style={{ background: isDark ? '#0a1628' : '#7ec9e0' }}
    >
      {/* video bg · key fuerza remount al cambiar theme para re-cargar el src */}
      <video
        key={isDark ? 'dark' : 'light'}
        ref={videoRef}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-poster.jpg"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* tinte oscuro para legibilidad del texto */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'rgba(10, 22, 40, 0.35)' }}
      />

      {/* gradiente vertical en el último cuarto · light mode (transición a blanco) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none dark:hidden"
        style={{
          height: '25%',
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
        }}
      />
      {/* gradiente vertical · dark mode (transición a gris oscuro) */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none hidden dark:block"
        style={{
          height: '25%',
          background:
            'linear-gradient(to bottom, rgba(31,41,55,0) 0%, rgba(31,41,55,1) 100%)',
        }}
      />

      {/* contenido encima */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-[3] text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-extrabold leading-[1.05] tracking-tight lowercase mx-auto"
          style={{
            color: '#fff',
            fontSize: 'clamp(48px, 9vw, 96px)',
            maxWidth: 1100,
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.28), 0 12px 56px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span className="block">
            <span className="normal-case">IA</span> para liberarte,
          </span>
          <span className="block">no reemplazarte</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto"
          style={{
            color: '#e6edf3',
            maxWidth: 720,
            margin: '24px auto 0',
            fontSize: 20,
            lineHeight: 1.5,
            textShadow:
              '0 1px 12px rgba(0, 0, 0, 0.28), 0 6px 36px rgba(0, 0, 0, 0.2)',
          }}
        >
          Aprende hoy{' '}
          <strong style={{ fontWeight: 700, color: '#fff' }}>
            Inteligencia Artificial
          </strong>{' '}
          y retoma
          <br />
          el control de tu trabajo, tus finanzas y tu vida.
        </motion.p>

        {/* tres CTAs intent-driven · liquid glass sobre el video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {ctas.map(({ label, intent }) => (
            <Button
              key={intent}
              href={`/auth/signup?intent=${intent}`}
              variant="outline"
              size="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.35)',
                borderBottomColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 24px rgba(0, 0, 0, 0.18)',
              }}
            >
              {label}
            </Button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
