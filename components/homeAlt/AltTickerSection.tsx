'use client';

import Tag from '@/components/ui/Tag';

const CATEGORIES = [
  'Chatbots',
  'Automatización',
  'Análisis de Datos',
  'Agentes Autónomos',
  'RAG',
  'Prompting',
  'Computer Vision',
  'NLP',
  'LLMs',
  'Fine-tuning',
];

export default function AltTickerSection() {
  // Double the list for seamless infinite scroll
  const items = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="py-8 bg-white dark:bg-gray-950 overflow-hidden border-y border-gray-200 dark:border-gray-800">
      <div className="flex animate-ticker whitespace-nowrap gap-4">
        {items.map((cat, i) => (
          <Tag key={`${cat}-${i}`} variant="primary" className="shrink-0 text-base px-6 py-3">
            {cat}
          </Tag>
        ))}
      </div>

      {/* Keyframe animation via inline style tag */}
      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
