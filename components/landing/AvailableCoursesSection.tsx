"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const courseTypes = [
  { id: 1, title: "Chatbots Inteligentes", topics: ["LLMs", "APIs", "Automatización"], icon: "💬" },
  { id: 2, title: "Automatización de Procesos", topics: ["n8n", "Workflows", "APIs"], icon: "⚙️" },
  { id: 3, title: "Análisis de Datos con IA", topics: ["Data & Analytics", "Visualización", "Métricas"], icon: "📊" },
  { id: 4, title: "Productos con IA", topics: ["Vibe-Coding", "Deployment", "Productos"], icon: "🚀" },
  { id: 5, title: "Agentes Autónomos", topics: ["Agentes", "LLMs", "MCP"], icon: "🤖" },
  { id: 6, title: "Sistemas RAG", topics: ["RAG", "Vector Stores", "Embeddings"], icon: "🧠" },
  { id: 7, title: "Integraciones Empresariales", topics: ["APIs", "Webhooks", "Integraciones"], icon: "🔗" },
  { id: 8, title: "Monetización con IA", topics: ["Finanzas", "Métricas", "Productos"], icon: "💰" },
  { id: 9, title: "E-commerce Inteligente", topics: ["APIs", "Automatización", "Productos"], icon: "🛒" },
  { id: 10, title: "CRM Automatizado", topics: ["APIs", "n8n", "Data & Analytics"], icon: "📈" },
  { id: 11, title: "Asistentes Virtuales", topics: ["LLMs", "APIs", "Automatización"], icon: "👤" },
  { id: 12, title: "Reportes Automáticos", topics: ["Data & Analytics", "APIs", "Automatización"], icon: "📄" },
  { id: 13, title: "Marketing con IA", topics: ["Generación de Contenido", "Automatización", "Personalización"], icon: "📢" },
  { id: 14, title: "Seguridad Inteligente", topics: ["Monitoreo", "Automatización", "APIs"], icon: "🔐" },
  { id: 15, title: "Optimización de Costos", topics: ["Data & Analytics", "Automatización", "Eficiencia"], icon: "⚡" },
  { id: 16, title: "Innovación Continua", topics: ["Productos", "APIs", "Transformación"], icon: "💡" },
];

// Split courses into 2 rows
const row1Courses = courseTypes.slice(0, 6);
const row2Courses = courseTypes.slice(6, 11);

// Duplicate for infinite scroll effect (4x for smoother loop)
const duplicatedRow1 = [...row1Courses, ...row1Courses, ...row1Courses, ...row1Courses];
const duplicatedRow2 = [...row2Courses, ...row2Courses, ...row2Courses, ...row2Courses];

interface CarouselRowProps {
  courses: typeof courseTypes;
  direction: "left" | "right";
  duration: number;
}

function CarouselRow({ courses, direction, duration }: CarouselRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate dimensions - get original set size (divide by 4 since we quadrupled)
  const originalSetSize = courses.length / 4;

  // Measure actual card width dynamically
  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current && containerRef.current.children.length > 0) {
        // Measure the actual width of one complete set by measuring multiple cards
        const cards = Array.from(containerRef.current.children) as HTMLElement[];
        if (cards.length >= originalSetSize) {
          // Measure from first card to the end of the first set
          const firstCard = cards[0];
          const lastCardOfSet = cards[originalSetSize - 1];
          const firstCardLeft = firstCard.offsetLeft;
          const lastCardRight = lastCardOfSet.offsetLeft + lastCardOfSet.offsetWidth;
          const gap = window.innerWidth >= 768 ? 24 : 16;
          const calculatedWidth = lastCardRight - firstCardLeft + gap;
          setSingleSetWidth(calculatedWidth);
        } else {
          // Fallback: calculate based on card width and gap
          const firstCard = cards[0];
          const cardWidth = firstCard.offsetWidth;
          const gap = window.innerWidth >= 768 ? 24 : 16; // md:gap-6 = 24px, gap-4 = 16px
          const cardWithGap = cardWidth + gap;
          const calculatedWidth = cardWithGap * originalSetSize;
          setSingleSetWidth(calculatedWidth);
        }
      }
    };

    // Measure on mount and resize
    measureWidth();
    window.addEventListener('resize', measureWidth);
    
    // Also measure after a short delay to ensure cards are rendered
    const timeout = setTimeout(measureWidth, 100);
    const timeout2 = setTimeout(measureWidth, 500); // Additional measurement for safety

    return () => {
      window.removeEventListener('resize', measureWidth);
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, [originalSetSize, direction]);

  // Initialize offset for right direction
  useEffect(() => {
    if (singleSetWidth > 0 && !isInitialized) {
      // For right direction, start with negative offset so content can scroll right into view
      if (direction === "right") {
        offsetRef.current = singleSetWidth;
      }
      setIsInitialized(true);
    }
  }, [singleSetWidth, direction, isInitialized]);

  useEffect(() => {
    if (singleSetWidth === 0 || !isInitialized) return; // Wait for width calculation and initialization

    const speed = singleSetWidth / duration; // pixels per second

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (direction === "left") {
        // For left direction: offset increases, translateX becomes more negative
      offsetRef.current = offsetRef.current + speed * deltaTime;
      if (offsetRef.current >= singleSetWidth) {
        offsetRef.current = offsetRef.current - singleSetWidth;
        }
      } else {
        // For right direction: offset decreases, translateX becomes less negative (moves right)
        offsetRef.current = offsetRef.current - speed * deltaTime;
        if (offsetRef.current <= 0) {
          offsetRef.current = offsetRef.current + singleSetWidth;
        }
      }

      forceUpdate(n => n + 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, singleSetWidth, direction, isInitialized]);

  // Both directions use negative translateX, but right starts further back and moves toward 0
  const normalizedOffset = singleSetWidth > 0 ? offsetRef.current : 0;

  return (
    <div
      ref={containerRef}
      className="flex gap-4 md:gap-6"
      style={{
        width: "fit-content",
        willChange: "transform",
        transform: `translateX(${-normalizedOffset}px)`,
      }}
    >
      {courses.map((course, index) => (
        <div
          key={`${course.id}-${index}`}
          className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px] bg-white rounded-2xl p-4 md:p-5 shadow-lg shadow-black/10"
        >
          {/* Icon */}
          <div className="text-3xl md:text-4xl mb-3">
            {course.icon}
          </div>

          {/* Title */}
          <h3 className="text-base md:text-lg font-extrabold text-[#4b4b4b] mb-3 leading-tight tracking-tight">
            {course.title}
          </h3>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {course.topics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-[#1472FF]/10 text-[#1472FF] text-xs font-medium rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AvailableCoursesSection() {
  // Same duration for all rows (75% speed)
  const baseDuration = 60;

  return (
    <section id="available-courses" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-20">
      <div className="relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16"
        >
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 md:mb-8 leading-tight tracking-tight">
              posibilidades infinitas
            </h2>
            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto leading-relaxed">
              con nuestros más de 1,000 videos, generamos cursos personalizados para cualquier proyecto de IA y automatización
            </p>
          </div>
        </motion.div>

        {/* Auto-scrolling Carousels - 2 rows */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col gap-4 md:gap-6"
        >
          {/* Row 1 - Left direction */}
          <div className="overflow-x-hidden w-full">
            <CarouselRow
              courses={duplicatedRow1}
              direction="left"
              duration={baseDuration}
            />
          </div>

          {/* Row 2 - Right direction (opposite), same speed */}
          <div className="overflow-x-hidden w-full">
            <CarouselRow
              courses={duplicatedRow2}
              direction="right"
              duration={baseDuration}
            />
          </div>
        </motion.div>
      </div>

      {/* Next section indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        viewport={{ once: true }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
      >
        <button
          onClick={() => {
            const element = document.getElementById("pricing");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <span className="text-sm font-semibold tracking-wide text-white/60 group-hover:text-white/80 transition-colors">
            Precios
          </span>
          <motion.svg
            className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors"
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
    </section>
  );
}
