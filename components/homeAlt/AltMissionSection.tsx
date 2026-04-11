'use client';

import StatCard from '@/components/ui/StatCard';
import { Title, Body } from '@/components/ui/Typography';

const STATS = [
  { icon: '🎓', value: '500+', label: 'Cursos generados', color: 'blue' as const },
  { icon: '📚', value: '10k+', label: 'Lecciones creadas', color: 'green' as const },
  { icon: '⭐', value: '98%', label: 'Satisfacción', color: 'orange' as const },
];

export default function AltMissionSection() {
  return (
    <section className="py-24 md:py-32 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 space-y-16">
        <div className="max-w-3xl">
          <Title className="!text-3xl md:!text-5xl !leading-[1.15]">
            nuestra misión es democratizar la educación en inteligencia
            artificial con cursos que se adaptan a ti.
          </Title>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} className="!p-8" />
          ))}
        </div>
      </div>
    </section>
  );
}
