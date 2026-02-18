"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";

const courseTypes = [
  { 
    id: 1, 
    title: "Chatbots Inteligentes", 
    topics: ["LLMs", "APIs", "Automatización"], 
    icon: "💬",
    description: "Aprende a crear chatbots inteligentes que entienden contexto, responden preguntas complejas y se integran con WhatsApp, Telegram y más.",
    modules: ["Fundamentos de LLMs", "Diseño de conversaciones", "Integración con plataformas", "Manejo de contexto"]
  },
  { 
    id: 2, 
    title: "Automatización de Procesos", 
    topics: ["n8n", "Workflows", "APIs"], 
    icon: "⚙️",
    description: "Domina n8n y otras herramientas para automatizar tareas repetitivas, conectar aplicaciones y crear workflows inteligentes.",
    modules: ["Introducción a n8n", "Conectores y APIs", "Lógica condicional", "Automatización avanzada"]
  },
  { 
    id: 3, 
    title: "Análisis de Datos con IA", 
    topics: ["Data & Analytics", "Visualización", "Métricas"], 
    icon: "📊",
    description: "Transforma datos en insights accionables usando IA para análisis predictivo, visualización y reportes automáticos.",
    modules: ["Preparación de datos", "Modelos predictivos", "Visualización", "Dashboards inteligentes"]
  },
  { 
    id: 4, 
    title: "Productos con IA", 
    topics: ["Vibe-Coding", "Deployment", "Productos"], 
    icon: "🚀",
    description: "Construye productos completos con IA: desde la idea hasta el deployment, usando las mejores prácticas de desarrollo.",
    modules: ["Ideación con IA", "Prototipado rápido", "MVP development", "Escalamiento"]
  },
  { 
    id: 5, 
    title: "Agentes Autónomos", 
    topics: ["Agentes", "LLMs", "MCP"], 
    icon: "🤖",
    description: "Crea agentes que toman decisiones, ejecutan tareas y aprenden de sus interacciones de forma autónoma.",
    modules: ["Arquitectura de agentes", "Toma de decisiones", "Memory systems", "Multi-agent systems"]
  },
  { 
    id: 6, 
    title: "Sistemas RAG", 
    topics: ["RAG", "Vector Stores", "Embeddings"], 
    icon: "🧠",
    description: "Implementa sistemas de Retrieval Augmented Generation para que tus IAs accedan a conocimiento específico de tu empresa.",
    modules: ["Embeddings 101", "Vector databases", "Chunking strategies", "RAG optimization"]
  },
  { 
    id: 7, 
    title: "Integraciones Empresariales", 
    topics: ["APIs", "Webhooks", "Integraciones"], 
    icon: "🔗",
    description: "Conecta sistemas empresariales, CRMs, ERPs y herramientas de productividad con flujos de IA automatizados.",
    modules: ["APIs REST y GraphQL", "Webhooks", "Autenticación", "Sincronización de datos"]
  },
  { 
    id: 8, 
    title: "Monetización con IA", 
    topics: ["Finanzas", "Métricas", "Productos"], 
    icon: "💰",
    description: "Aprende a crear productos de IA rentables, establecer precios y escalar tu negocio de forma sostenible.",
    modules: ["Modelos de negocio", "Pricing strategies", "Unit economics", "Growth hacking"]
  },
  { 
    id: 9, 
    title: "E-commerce Inteligente", 
    topics: ["APIs", "Automatización", "Productos"], 
    icon: "🛒",
    description: "Automatiza tu tienda online con IA: recomendaciones personalizadas, atención al cliente y gestión de inventario.",
    modules: ["Recomendaciones", "Chatbots de ventas", "Gestión automática", "Análisis de comportamiento"]
  },
  { 
    id: 10, 
    title: "CRM Automatizado", 
    topics: ["APIs", "n8n", "Data & Analytics"], 
    icon: "📈",
    description: "Transforma tu CRM con automatizaciones inteligentes que califican leads, nutren prospectos y cierran ventas.",
    modules: ["Lead scoring", "Nurturing automático", "Integración con ventas", "Reportes predictivos"]
  },
  { 
    id: 11, 
    title: "Asistentes Virtuales", 
    topics: ["LLMs", "APIs", "Automatización"], 
    icon: "👤",
    description: "Diseña asistentes virtuales personalizados que ayudan a usuarios con tareas específicas de tu industria.",
    modules: ["Diseño de personalidad", "Knowledge base", "Multi-canal", "Escalamiento humano"]
  },
  { 
    id: 12, 
    title: "Reportes Automáticos", 
    topics: ["Data & Analytics", "APIs", "Automatización"], 
    icon: "📄",
    description: "Genera reportes automáticos con narrativas en lenguaje natural, gráficos dinámicos y distribución programada.",
    modules: ["Extracción de datos", "Generación de narrativas", "Visualización", "Distribución automática"]
  },
  { 
    id: 13, 
    title: "Marketing con IA", 
    topics: ["Generación de Contenido", "Automatización", "Personalización"], 
    icon: "📢",
    description: "Potencia tu marketing con IA: genera contenido, personaliza campañas y optimiza conversiones automáticamente.",
    modules: ["Generación de contenido", "Segmentación IA", "A/B testing automático", "Personalización"]
  },
  { 
    id: 14, 
    title: "Seguridad Inteligente", 
    topics: ["Monitoreo", "Automatización", "APIs"], 
    icon: "🔐",
    description: "Implementa sistemas de seguridad con IA que detectan anomalías, previenen fraudes y protegen datos.",
    modules: ["Detección de anomalías", "Prevención de fraude", "Monitoreo en tiempo real", "Respuesta automática"]
  },
  { 
    id: 15, 
    title: "Optimización de Costos", 
    topics: ["Data & Analytics", "Automatización", "Eficiencia"], 
    icon: "⚡",
    description: "Reduce costos operativos identificando ineficiencias y automatizando procesos con ROI medible.",
    modules: ["Análisis de procesos", "Identificación de oportunidades", "Automatización ROI", "Monitoreo de ahorros"]
  },
  { 
    id: 16, 
    title: "Innovación Continua", 
    topics: ["Productos", "APIs", "Transformación"], 
    icon: "💡",
    description: "Establece una cultura de innovación con IA: experimenta rápido, mide resultados e itera constantemente.",
    modules: ["Framework de innovación", "Experimentación rápida", "Métricas de impacto", "Escalamiento de éxitos"]
  },
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
  isPaused: boolean;
  onSelectCourse: (course: typeof courseTypes[0]) => void;
}

function CarouselRow({ courses, direction, duration, isPaused, onSelectCourse }: CarouselRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);
  const [singleSetWidth, setSingleSetWidth] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate dimensions - get original set size (divide by 4 since we quadrupled)
  const originalSetSize = Math.floor(courses.length / 4);

  // Measure actual card width dynamically
  useEffect(() => {
    const measureWidth = () => {
      if (containerRef.current && containerRef.current.children.length > 0) {
        const cards = Array.from(containerRef.current.children) as HTMLElement[];
        
        if (cards.length === 0) return;
        
        // Get gap based on screen size
        const gap = window.innerWidth >= 768 ? 24 : 16;
        
        if (cards.length >= originalSetSize && originalSetSize > 0) {
          // Measure from first card to the end of the first set
          const firstCard = cards[0];
          const lastCardOfSet = cards[originalSetSize - 1];
          
          if (firstCard && lastCardOfSet) {
            const firstCardLeft = firstCard.offsetLeft;
            const lastCardRight = lastCardOfSet.offsetLeft + lastCardOfSet.offsetWidth;
            const calculatedWidth = lastCardRight - firstCardLeft + gap;
            
            if (calculatedWidth > 0) {
              setSingleSetWidth(calculatedWidth);
              return;
            }
          }
        }
        
        // Fallback: calculate based on card width and gap
        const firstCard = cards[0];
        if (firstCard && originalSetSize > 0) {
          const cardWidth = firstCard.offsetWidth || 200; // fallback width
          const cardWithGap = cardWidth + gap;
          const calculatedWidth = cardWithGap * originalSetSize;
          
          if (calculatedWidth > 0) {
            setSingleSetWidth(calculatedWidth);
          }
        }
      }
    };

    // Measure on mount and resize
    measureWidth();
    window.addEventListener('resize', measureWidth);
    
    // Also measure after delays to ensure cards are rendered
    const timeout = setTimeout(measureWidth, 100);
    const timeout2 = setTimeout(measureWidth, 500);
    const timeout3 = setTimeout(measureWidth, 1000); // Extra safety check

    return () => {
      window.removeEventListener('resize', measureWidth);
      clearTimeout(timeout);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [originalSetSize, direction]);

  // Initialize offset for right direction
  useEffect(() => {
    if (singleSetWidth > 0 && !isInitialized) {
      // For right direction, start with negative offset so content can scroll right into view
      if (direction === "right") {
        offsetRef.current = singleSetWidth;
      } else {
        offsetRef.current = 0;
      }
      setIsInitialized(true);
      forceUpdate(n => n + 1); // Trigger render after initialization
    }
  }, [singleSetWidth, direction, isInitialized]);

  useEffect(() => {
    // Only start animation if we have a valid width and are initialized
    if (singleSetWidth === 0 || !isInitialized) {
      // Still update to show content even if not animating yet
      forceUpdate(n => n + 1);
      return;
    }

    if (isPaused) return; // Stop animation when paused

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
  }, [duration, singleSetWidth, direction, isInitialized, isPaused]);

  // Reset lastTimeRef when resuming to avoid jumps
  useEffect(() => {
    if (!isPaused) {
      lastTimeRef.current = 0;
    }
  }, [isPaused]);

  // Both directions use negative translateX, but right starts further back and moves toward 0
  const normalizedOffset = singleSetWidth > 0 ? offsetRef.current : 0;

  // Always render content, even if width calculation is not ready
  return (
    <div
      ref={containerRef}
      className="flex gap-4 md:gap-6"
      style={{
        width: "fit-content",
        willChange: singleSetWidth > 0 ? "transform" : "auto",
        transform: `translateX(${-normalizedOffset}px)`,
        opacity: isInitialized ? 1 : 1, // Always visible, even during initialization
      }}
    >
      {courses.map((course, index) => (
        <button
          key={`${course.id}-${index}`}
          onClick={() => onSelectCourse(course)}
          className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px] bg-[#0a1e3d] rounded-2xl p-4 md:p-5 border-2 border-[#4b5563] border-b-4 border-b-[#4b5563] text-left cursor-pointer transition-all duration-200"
        >
          {/* Icon */}
          <div className="text-3xl md:text-4xl mb-3">
            {course.icon}
          </div>

          {/* Title */}
          <h3 className="text-base md:text-lg font-extrabold text-white mb-3 leading-tight tracking-tight">
            {course.title}
          </h3>

          {/* Topics */}
          <div className="flex flex-wrap gap-1.5">
            {course.topics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function AvailableCoursesSection() {
  // Same duration for all rows (75% speed)
  const baseDuration = 60;
  const [selectedCourse, setSelectedCourse] = useState<typeof courseTypes[0] | null>(null);

  const handleSelectCourse = (course: typeof courseTypes[0]) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  return (
    <section id="available-courses" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12">
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
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
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
          <div className="overflow-x-hidden w-full relative min-h-[200px]">
            <CarouselRow
              courses={duplicatedRow1}
              direction="left"
              duration={baseDuration}
              isPaused={selectedCourse !== null}
              onSelectCourse={handleSelectCourse}
            />
          </div>

          {/* Row 2 - Right direction (opposite), same speed */}
          <div className="overflow-x-hidden w-full relative min-h-[200px]">
            <CarouselRow
              courses={duplicatedRow2}
              direction="right"
              duration={baseDuration}
              isPaused={selectedCourse !== null}
              onSelectCourse={handleSelectCourse}
            />
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 mb-16 flex justify-center"
        >
          <Button
            variant="outline"
            depth="bottom"
            size="none"
            rounded2xl
            href="/auth/signup"
            className="px-10 py-4 inline-flex items-center gap-2 text-[#1472FF] bg-white border-b-gray-300 hover:bg-gray-100"
          >
            Comenzar
            <svg
              className="w-5 h-5"
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

      {/* Expanded Course Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-[#0a1e3d] rounded-2xl p-6 md:p-8 border-2 border-b-4 border-[#1472FF]/30 border-b-[#0E5FCC]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Icon and Title */}
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl md:text-5xl">
                  {selectedCourse.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  {selectedCourse.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-white/80 text-base md:text-lg mb-6 leading-relaxed">
                {selectedCourse.description}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCourse.topics.map((topic, i) => (
                  <Tag
                    key={i}
                    variant="primary"
                    className="bg-[#1472FF]/30 text-white border-[#1472FF]/50"
                  >
                    {topic}
                  </Tag>
                ))}
              </div>

              {/* Modules */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-white/60 uppercase tracking-wide mb-3">
                  Módulos incluidos
                </h4>
                <div className="space-y-2">
                  {selectedCourse.modules?.map((module, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/90">
                      <div className="w-6 h-6 rounded-full bg-[#1472FF]/30 flex items-center justify-center text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <span className="text-sm md:text-base">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                href="/auth/signup"
                variant="primary"
                depth="bottom"
                size="none"
                rounded2xl
                className="w-full px-6 py-3 inline-flex items-center justify-center gap-2"
              >
                Crear mi curso personalizado
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
