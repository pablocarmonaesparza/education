"use client";

import { motion } from "framer-motion";
import Card from '@/components/ui/Card';

export default function SocialProofSection() {
  const testimonials = [
    {
      name: "Carlos Méndez",
      role: "Founder @ AutomateLatam",
      image: "https://i.pravatar.cc/150?img=12",
      quote: "En 3 semanas pasé de no saber nada de IA a tener mi primer agente automatizando procesos de mi empresa. El ROI fue inmediato.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      role: "Desarrolladora Freelance",
      image: "https://i.pravatar.cc/150?img=5",
      quote: "La personalización es real. Mi ruta fue totalmente diferente a la de otros estudiantes. Exactamente lo que necesitaba para mi proyecto.",
      rating: 5,
    },
    {
      name: "Miguel Torres",
      role: "Product Manager",
      image: "https://i.pravatar.cc/150?img=33",
      quote: "400 videos de 1-3 minutos me permitieron aprender en mis tiempos muertos. Terminé el curso en 2 semanas sin sacrificar mi trabajo.",
      rating: 5,
    },
  ];

  const stats = [
    {
      number: "2,500+",
      label: "Estudiantes Activos",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      number: "94%",
      label: "Tasa de Completación",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "4.9/5",
      label: "Rating Promedio",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      number: "3 semanas",
      label: "Tiempo Promedio a MVP",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-24 md:mb-32">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1472FF] text-white mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#4b4b4b] dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-[#777777] dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4b4b4b] dark:text-white mb-4 leading-tight">
            Lo Que Dicen Nuestros Estudiantes
          </h2>
          <p className="text-xl md:text-2xl text-[#777777] dark:text-gray-400 max-w-3xl mx-auto font-light">
            Personas reales construyendo proyectos reales con IA
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Card variant="neutral" padding="lg" className="md:p-10 h-full">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#4b4b4b] dark:text-gray-300 mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-[#4b4b4b] dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#777777] dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-[#777777] dark:text-gray-400 mb-8">Confiado por profesionales en:</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">Google</div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">Meta</div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">Amazon</div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">Microsoft</div>
            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">Apple</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
