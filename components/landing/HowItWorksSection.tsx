"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const steps = [
  {
    title: "Describe tu idea",
    description: "Escribe tu idea de proyecto en tus propias palabras. Puede ser cualquier cosa relacionada con automatización, IA o desarrollo de software.",
    imageLight: "/images/how-it-works-1-light.png",
    imageDark: "/images/how-it-works-1-dark.png",
  },
  {
    title: "Generamos tu curso",
    description: "Nuestra IA analiza tu idea y crea un plan de estudios personalizado con videos seleccionados específicamente para tu proyecto.",
    imageLight: "/images/how-it-works-2-light.png",
    imageDark: "/images/how-it-works-2-dark.png",
  },
  {
    title: "Aprende y construye",
    description: "Accede a videos cortos y prácticos que te guiarán paso a paso. Aprende mientras construyes tu proyecto real.",
    imageLight: "/images/how-it-works-3-light.png",
    imageDark: "/images/how-it-works-3-dark.png",
  },
];

export default function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const snapRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detectar qué punto de snap está visible
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

  return (
    <div 
      id="how-it-works"
      className="relative bg-white dark:bg-gray-950"
      style={{ height: `${steps.length * 100}vh` }}
    >
      {/* Contenido visual sticky */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-24">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
              Cómo Funciona
            </h2>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-center">
            {/* Text Column - Left 1/3 */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                {steps.map((s, i) => (
                  <div key={i} className="space-y-3">
                    <h3 className={`text-2xl md:text-3xl font-bold transition-colors duration-500 ${
                      activeIndex === i 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-400 dark:text-gray-600"
                    }`}>
                      {s.title}
                    </h3>
                    <p className={`text-base md:text-lg leading-relaxed transition-colors duration-500 ${
                      activeIndex === i 
                        ? "text-gray-600 dark:text-gray-400" 
                        : "text-gray-400 dark:text-gray-600"
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
      <div className="absolute inset-0">
        {steps.map((_, i) => (
          <div
            key={i}
            ref={(el) => { snapRefs.current[i] = el; }}
            className="h-screen snap-start"
          />
        ))}
      </div>
    </div>
  );
}
