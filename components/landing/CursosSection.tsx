"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

/**
 * Cursos section.
 *
 * Mensaje principal: el curso se adapta al negocio del usuario. Esta
 * estructura está clonada de la antigua HowItWorksSection (sticky scroll
 * desktop + carrusel horizontal mobile) — la idea es iterar el copy de
 * los 3 pasos para contar la historia "tu negocio → ruta personalizada".
 *
 * Mantiene el patrón dual-id que el Navbar usa para fallback mobile:
 *   - desktop: id="cursos"
 *   - mobile:  id="cursos-mobile"
 */

const steps = [
  {
    title: "contenido",
    description:
      "Nos encargamos de llevarte paso a paso, desde ¿qué es la IA? hasta sus aplicaciones más recientes. Actualizamos el temario constantemente para que nunca quedes atrás.",
    imageLight: "/images/how-it-works-1-dark.png",
    imageDark: "/images/how-it-works-1-light.png",
  },
  {
    title: "personalizado",
    description:
      "Adaptamos los casos y ejemplos al proyecto que tú quieres construir. En menos de una semana tienes una ruta hecha a tu medida, sin lecciones de relleno.",
    imageLight: "/images/how-it-works-2-light.png",
    imageDark: "/images/how-it-works-2-dark.png",
  },
  {
    title: "teoría & práctica",
    description:
      "Más de 100 lecciones y 700 ejercicios de inteligencia artificial, automatización, bases de datos, agentes, orquestadores, implementación y mucho más.",
    imageLight: "/images/how-it-works-3-light.png",
    imageDark: "/images/how-it-works-3-dark.png",
  },
];

// Cuántos viewports REALES de scroll dura cada step (la distancia sticky).
// El wrapper total mide `100vh + STEP_VH * steps.length` — los primeros
// 100vh son el sticky child quedándose pegado, y los STEP_VH × N restantes
// son el "stick budget" donde el usuario scrollea con la card fija.
// Bajo (15-25) skip con momentum, alto (60+) muchos notches por step.
// 35vh ≈ 3-4 notches en un trackpad típico — sweet spot.
const STEP_VH = 35;

export default function CursosSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const mobileSectionRef = useRef<HTMLElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Desktop: calcular activeIndex directo del scroll progress dentro del
  // wrapper. Antes usaba IntersectionObserver con threshold 0.5, lo cual
  // creaba "dead zones" — el step no cambiaba hasta que el snap-point
  // cruzaba 50% visible — y permitía saltarse steps en scrolls rápidos.
  //
  // Esta versión mapea scroll position → step index linealmente, así
  // cada wheel notch produce respuesta inmediata y el orden se preserva.
  useEffect(() => {
    const wrapper = sectionRef.current;
    if (!wrapper) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = wrapper.getBoundingClientRect();
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      const next = Math.min(
        steps.length - 1,
        Math.floor(progress * steps.length),
      );
      setActiveIndex((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Mobile: detectar scroll horizontal
  useEffect(() => {
    const container = mobileScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setMobileActiveIndex(Math.min(newIndex, steps.length - 1));
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mobile: convertir swipe vertical en scroll horizontal cuando estamos
  // dentro del rango — salir por arriba/abajo deja que la página haga su
  // scroll vertical normal.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = mobileScrollRef.current;
    if (!container) return;

    const touchCurrentY = e.touches[0].clientY;
    const touchCurrentX = e.touches[0].clientX;
    const deltaY = touchStartY.current - touchCurrentY;
    const deltaX = touchStartX.current - touchCurrentX;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.offsetWidth;

      const atStart = scrollLeft <= 0 && deltaY < 0;
      const atEnd = scrollLeft >= maxScroll - 1 && deltaY > 0;

      if (!atStart && !atEnd) {
        e.preventDefault();
        container.scrollLeft += deltaY * 0.5;
        touchStartY.current = touchCurrentY;
      }
    }
  };

  const goToSlide = (index: number) => {
    const container = mobileScrollRef.current;
    if (container) {
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* ============ MOBILE (< 768px) ============ */}
      <section
        ref={mobileSectionRef}
        id="cursos-mobile"
        className="md:hidden min-h-screen flex flex-col relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          ref={mobileScrollRef}
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full snap-center px-6 flex flex-col items-center justify-center min-h-screen"
              style={{ scrollSnapAlign: "center" }}
            >
              <h3 className="text-3xl md:text-4xl font-extrabold text-primary mb-4 text-center tracking-tight">
                {step.title.toLowerCase()}
              </h3>
              <p className="text-base text-ink dark:text-gray-300 leading-relaxed text-center max-w-sm mb-8">
                {step.description}
              </p>
              <div className="relative w-full h-64">
                <Image
                  src={step.imageLight}
                  alt={step.title}
                  fill
                  className="object-contain dark:hidden"
                  priority={i === 0}
                />
                <Image
                  src={step.imageDark}
                  alt={step.title}
                  fill
                  className="object-contain hidden dark:block"
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                mobileActiveIndex === i
                  ? "bg-primary w-8"
                  : "bg-gray-300 dark:bg-gray-600 w-2"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============ DESKTOP (>= 768px) ============ */}
      {/* Wrapper de altura 100vh + (N × STEP_VH) para sticky scroll. Los
          primeros 100vh los ocupa el sticky child; los restantes N×STEP_VH
          son el "stick budget" — el rango donde el child queda fijo y el
          activeIndex avanza con el scroll.
          Importante: <div>, no <section>. El selector global
          `body[data-route="/"] section { scroll-snap-align: start }` haría
          que este wrapper sea un único snap point — el browser intentaría
          mantener su top en el viewport start y eso pelea con el sticky
          scroll interno. Como <div> el scroll fluye libre. */}
      <div
        ref={sectionRef}
        id="cursos"
        className="hidden md:block relative"
        // height = 100vh (lo que ocupa el sticky child) + STEP_VH × N
        // (distancia adicional que el usuario scrollea mientras el child
        // queda pegado). Con esta fórmula, cada step recibe exactamente
        // STEP_VH de scroll real. Sin el +100vh, scrollable = (N-1)*STEP_VH
        // lo cual comprime los steps y permite que momentum-scroll los
        // salte visualmente.
        style={{ height: `calc(100vh + ${steps.length * STEP_VH}vh)` }}
      >
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-ink dark:text-white leading-tight tracking-tight">
                cómo funciona
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
              {/* Texto — 1/3 izquierda */}
              <div className="lg:col-span-1">
                <div className="space-y-8">
                  {steps.map((s, i) => (
                    <div key={i} className="space-y-4">
                      <h3
                        className={`text-2xl md:text-3xl font-extrabold transition-colors duration-500 tracking-tight ${
                          activeIndex === i
                            ? "text-primary"
                            : "text-primary/30 dark:text-primary/40"
                        }`}
                      >
                        {s.title}
                      </h3>
                      <p
                        className={`text-base md:text-lg leading-relaxed transition-colors duration-500 ${
                          activeIndex === i
                            ? "text-ink dark:text-gray-300"
                            : "text-ink/30 dark:text-gray-500/50"
                        }`}
                      >
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imágenes — 2/3 derecha */}
              <div className="lg:col-span-2 relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {steps.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: activeIndex === i ? 1 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0 flex items-center justify-center p-4"
                    >
                      <Image
                        src={s.imageLight}
                        alt={s.title}
                        width={800}
                        height={600}
                        className="object-contain max-h-full dark:hidden"
                        priority={i === 0}
                      />
                      <Image
                        src={s.imageDark}
                        alt={s.title}
                        width={800}
                        height={600}
                        className="object-contain max-h-full hidden dark:block"
                        priority={i === 0}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chevron al siguiente — solo aparece nítido en el último step.
              Apunta a Pricing (Capacitación está oculta hasta tener contenido). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIndex === steps.length - 1 ? 1 : 0.3 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <button
              onClick={() => {
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <span className="text-sm font-semibold tracking-wide text-ink/60 dark:text-white/60 group-hover:text-ink/80 dark:group-hover:text-white/80 transition-colors">
                Precios
              </span>
              <motion.svg
                className="w-5 h-5 text-ink/60 dark:text-white/60 group-hover:text-ink/80 dark:group-hover:text-white/80 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
        </div>
      </div>
    </>
  );
}
