"use client";

import { motion } from "framer-motion";
import Tag from "@/components/ui/Tag";

const CATEGORIES = [
  "inteligencia artificial",
  "producto digital",
  "automatización",
  "no-code",
  "data & analytics",
  "diseño ui/ux",
  "marketing growth",
  "desarrollo web",
  "e-commerce",
  "finanzas personales",
];

export default function ExperimentTicker() {
  return (
    <section
      aria-label="categorías del laboratorio"
      className="relative py-10 border-y-2 border-gray-200 dark:border-gray-900 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-white dark:from-gray-900 to-transparent"
      />

      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 35,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
          <div key={`${cat}-${i}`} className="flex items-center gap-4 shrink-0">
            <Tag variant="outline" className="!text-base !px-5 !py-2">
              {cat}
            </Tag>
            <span
              aria-hidden
              className="w-2 h-2 rounded-full bg-[#1472FF] shrink-0"
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
