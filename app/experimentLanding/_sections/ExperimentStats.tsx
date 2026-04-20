"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Banda de estadísticas con count-up al entrar en viewport.
 * Usa StatCard del DS (sin reescribir estilos).
 */

const STATS = [
  { icon: "⚡", value: 60, suffix: "s", label: "genera tu curso", color: "blue" as const },
  { icon: "🎯", value: 100, suffix: "%", label: "personalizado", color: "green" as const },
  { icon: "🎬", value: 1200, suffix: "+", label: "videos generados", color: "orange" as const },
  { icon: "🧠", value: 24, suffix: "/7", label: "tutor ia activo", color: "neutral" as const },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const mv = { value: 0 };
    const controls = animate(mv.value, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(Math.round(latest).toString());
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function ExperimentStats() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="los números del laboratorio"
          subtitle="cada número es un experimento ejecutado"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map((s) => (
            <StatCard
              key={s.label}
              icon={s.icon}
              value={<CountUp to={s.value} suffix={s.suffix} />}
              label={s.label}
              color={s.color}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
