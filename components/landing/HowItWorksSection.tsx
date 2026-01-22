"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const steps = [
  {
    title: "El problema",
    description: "Los cursos genéricos te hacen recorrer caminos interminables. Pasas horas viendo contenido que no aplica a lo que realmente quieres construir.",
    imageLight: "/images/how-it-works-1-dark.png",
    imageDark: "/images/how-it-works-1-light.png",
  },
  {
    title: "Cuéntanos tu idea",
    description: "Describe el proyecto que quieres crear. Nuestra IA analiza miles de videos y selecciona únicamente los que necesitas para tu objetivo específico.",
    imageLight: "/images/how-it-works-2-light.png",
    imageDark: "/images/how-it-works-2-dark.png",
  },
  {
    title: "Tu camino directo",
    description: "Recibe un curso personalizado con videos ordenados paso a paso. Sin rodeos, sin relleno. Solo lo esencial para construir tu proyecto.",
    imageLight: "/images/how-it-works-3-light.png",
    imageDark: "/images/how-it-works-3-dark.png",
  },
];

export default function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const snapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Desktop: Detectar qué punto de snap está visible
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    snapRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setActiveIndex(index);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Mobile: Detectar scroll horizontal
  useEffect(() => {
    const container = mobileScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setMobileActiveIndex(Math.min(newIndex, steps.length - 1));
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mobile: Manejar touch para convertir swipe vertical a horizontal
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

    // Si el movimiento es más vertical que horizontal
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.offsetWidth;
      
      // Si no estamos en los límites, convertir a horizontal
      const atStart = scrollLeft <= 0 && deltaY < 0;
      const atEnd = scrollLeft >= maxScroll - 1 && deltaY > 0;
      
      if (!atStart && !atEnd) {
        e.preventDefault();
        container.scrollLeft += deltaY * 0.5;
        touchStartY.current = touchCurrentY;
      }
    }
  };

  // Navegar al siguiente/anterior slide
  const goToSlide = (index: number) => {
    const container = mobileScrollRef.current;
    if (container) {
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* ============ MOBILE VERSION (< 768px) ============ */}
      <section
        id="how-it-works-mobile"
        className="md:hidden min-h-screen bg-white dark:bg-gray-950 flex flex-col relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Horizontal Scroll Container */}
        <div
          ref={mobileScrollRef}
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide touch-pan-x"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full snap-center px-6 flex flex-col items-center justify-center min-h-screen"
              style={{ scrollSnapAlign: 'center' }}
            >
              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-4 text-center tracking-tight">
                {step.title.toLowerCase()}
              </h3>
              
              {/* Description */}
              <p className="text-base text-[#777777] dark:text-gray-400 leading-relaxed text-center max-w-sm mb-8">
                {step.description}
              </p>

              {/* Image */}
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

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                mobileActiveIndex === i
                  ? "bg-[#1472FF] w-8"
                  : "bg-gray-300 dark:bg-gray-600 w-2"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============ DESKTOP VERSION (>= 768px) ============ */}
      <div 
        id="how-it-works" 
        className="hidden md:block relative bg-white dark:bg-gray-950"
        style={{ height: `${steps.length * 100}vh` }}
      >
        {/* Contenido visual sticky */}
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-10 md:mb-14"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1472FF] leading-tight tracking-tight">
                Cómo Funciona
              </h2>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
              {/* Text Column - Left 1/3 */}
              <div className="lg:col-span-1">
                <div className="space-y-8">
                  {steps.map((s, i) => (
                    <div key={i} className="space-y-4">
                      <h3 className={`text-2xl md:text-3xl font-extrabold transition-colors duration-500 tracking-tight ${
                        activeIndex === i 
                          ? "text-[#4b4b4b] dark:text-white" 
                          : "text-gray-300 dark:text-gray-700"
                      }`}>
                        {s.title}
                      </h3>
                      <p className={`text-base md:text-lg leading-relaxed transition-colors duration-500 ${
                        activeIndex === i 
                          ? "text-[#777777] dark:text-gray-400" 
                          : "text-gray-300 dark:text-gray-700"
                      }`}>
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Column - Right 2/3 */}
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
                      {/* Light mode image */}
                      <Image
                        src={s.imageLight}
                        alt={s.title}
                        width={800}
                        height={600}
                        className="object-contain max-h-full dark:hidden"
                        priority={i === 0}
                      />
                      {/* Dark mode image */}
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

          {/* Next section indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeIndex === steps.length - 1 ? 1 : 0.3 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <button
              onClick={() => {
                const element = document.getElementById("available-courses");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex flex-col items-center gap-1 cursor-pointer group"
            >
              <span className="text-sm font-semibold tracking-wide text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors">
                Cursos
              </span>
              <motion.svg
                className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors"
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

        {/* Puntos de snap invisibles */}
        <div className="absolute inset-0 pointer-events-none">
          {steps.map((_, i) => (
            <div
              key={i}
              ref={(el) => { snapRefs.current[i] = el; }}
              className="h-screen snap-start"
            />
          ))}
        </div>
      </div>
    </>
  );
}
