"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import CompositeCard from "@/components/shared/CompositeCard";
import IconButton from "@/components/ui/IconButton";
import Tag from "@/components/ui/Tag";
import { Caption, Headline } from "@/components/ui/Typography";
import ProgressBar from "@/components/ui/ProgressBar";
import Divider from "@/components/ui/Divider";

const SHOWCASE = [
  {
    id: "01",
    category: "automatización",
    title: "agente de whatsapp para mi tienda",
    progress: 84,
    tags: ["ia", "no-code", "integraciones"],
  },
  {
    id: "02",
    category: "producto",
    title: "mvp de app de finanzas personales",
    progress: 61,
    tags: ["next.js", "supabase", "ui/ux"],
  },
  {
    id: "03",
    category: "growth",
    title: "funnel completo para mi curso online",
    progress: 47,
    tags: ["marketing", "copy", "ads"],
  },
];

export default function ExperimentShowcase() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="proyectos reales construidos con itera"
          subtitle="cada uno parte de una idea en una frase"
        />

        <div className="space-y-4">
          {SHOWCASE.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href="/#hero"
                className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1472FF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                aria-label={`Abrir ${item.title}`}
              >
                <CompositeCard
                  contentClassName="!text-left"
                  leading={
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1472FF]/10 text-[#0E5FCC] dark:text-[#1472FF] font-extrabold text-xl">
                      {item.id}
                    </div>
                  }
                  trailing={
                    <IconButton as="div" variant="primary" aria-label={`Abrir ${item.title}`}>
                      <ArrowRightIcon />
                    </IconButton>
                  }
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag variant="primary">{item.category}</Tag>
                    {item.tags.map((t) => (
                      <Tag key={t} variant="neutral">
                        {t}
                      </Tag>
                    ))}
                  </div>
                  <Headline className="mt-2 !normal-case !text-base !text-[#4b4b4b] dark:!text-white !font-bold !tracking-normal">
                    {item.title}
                  </Headline>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <Caption>progreso del proyecto</Caption>
                      <Caption className="!text-[#0E5FCC] dark:!text-[#1472FF] !font-bold">
                        {item.progress}%
                      </Caption>
                    </div>
                    <ProgressBar value={item.progress} size="sm" />
                  </div>
                </CompositeCard>
              </Link>
            </motion.div>
          ))}
        </div>

        <Divider className="mt-12" />
      </div>
    </section>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
}
