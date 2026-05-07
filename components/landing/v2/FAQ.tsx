'use client';

/**
 * FAQ v2 — porteado del prototipo claude-design (sections-2.jsx:337-398).
 * Acordeón de preguntas frecuentes usando <details>/<summary> nativo.
 */

import { motion } from 'framer-motion';
import { Headline, Title, Body } from '@/components/ui/Typography';

const qs = [
  {
    q: '¿necesito saber programar para empezar?',
    a: 'no. la mayoría de las lecciones aplican IA sin código (prompts, automatizaciones visuales, integraciones). si tu trabajo lo requiere, las secciones de api, mcp y vibe coding cubren código real.',
  },
  {
    q: '¿cuánto tiempo me toma terminar las 100 lecciones?',
    a: 'depende de tu ritmo. el promedio interno es de 6 a 10 semanas dedicando 30–45 min al día. cada lección está diseñada para ≈10 minutos.',
  },
  {
    q: '¿qué pasa cuando termino la ruta?',
    a: 'tienes IA aplicada a tu trabajo concreto: prompts probados, automatizaciones que corren, integraciones que funcionan. después puedes seguir con la ruta avanzada o saltar a otra sección.',
  },
  {
    q: '¿cómo es el formato exactamente?',
    a: '100% interactivo. respondes preguntas, completas prompts, configuras automatizaciones, modificas archivos reales. cero clases pasivas, cero teoría inflada. cada lección termina con algo aplicado.',
  },
  {
    q: '¿qué cubren las 10 secciones?',
    a: 'fundamentos, asistentes (claude/chatgpt/gemini/perplexity), contenido (imagen/video/voz), automatización (n8n/claude code/mcp schedulers), bases de datos (supabase/notion/rag), api, mcp y skills, agentes, vibe coding e implementación.',
  },
  {
    q: '¿cómo se factura empresas?',
    a: 'anual con factura local en méxico, colombia, argentina y chile. internacional vía stripe en usd. cobramos por usuario activo, no por asiento comprado.',
  },
  {
    q: '¿puedo cancelar pro en cualquier momento?',
    a: 'sí. desde tu panel, sin pasos extra ni mail de retención. mantienes el acceso hasta el final del periodo pagado.',
  },
  {
    q: '¿qué hacen con mi data y mis prompts?',
    a: 'tu data y tus prompts son tuyos. nada se usa para entrenar modelos de itera. puedes exportar todo cuando quieras.',
  },
];

const ChevIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="flex-shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function FAQ() {
  return (
    <section id="faq" className="bg-white dark:bg-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Headline>preguntas frecuentes</Headline>
          <Title className="mt-3">todo lo que importa antes de empezar</Title>
          <Body className="mt-4">
            ¿No encuentras algo? Escríbenos a hola@itera.la y te respondemos personas reales.
          </Body>
        </motion.div>
        <div className="flex flex-col gap-3">
          {qs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 open:bg-gray-50 dark:open:bg-gray-900 transition-colors"
              style={{ borderBottomWidth: 4 }}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4 font-bold text-base text-ink dark:text-white">
                <span className="lowercase">{item.q}</span>
                <ChevIcon />
              </summary>
              <div className="pt-3.5">
                <Body>{item.a}</Body>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
