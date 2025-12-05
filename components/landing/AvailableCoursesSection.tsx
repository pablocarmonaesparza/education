"use client";

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

export default function AvailableCoursesSection() {
  return (
    <section id="available-courses" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#1472FF]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 pt-32 md:pt-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Posibilidades Infinitas
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Con nuestros más de 1,000 videos, generamos cursos personalizados para cualquier proyecto de IA y automatización.
          </p>
        </motion.div>

        {/* Course Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {courseTypes.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-4 md:p-5 shadow-md border-2 border-gray-100 hover:border-[#1472FF]/20 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {course.icon}
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 leading-tight">
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
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-16"
        >
          <p className="text-base md:text-lg text-gray-700 font-light">
            ¿Tienes otra idea? Describe tu proyecto y crearemos un curso 100% personalizado para ti.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

