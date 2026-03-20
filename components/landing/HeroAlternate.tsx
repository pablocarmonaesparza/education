"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";

/* ─── Types ─────────────────────────────────────────────────────── */

type MoneyKey = "extra" | "salary" | "business";
type TimeKey  = "light" | "medium" | "full";
type Step     = "money" | "time" | "generating" | "result";

interface Project {
  name: string;
  description: string;
  monetization: string;
  launchTime: string;
  tools: string[];
}

/* ─── Data ───────────────────────────────────────────────────────── */

const MONEY_OPTIONS = [
  {
    key:    "extra"    as MoneyKey,
    emoji:  "💵",
    amount: "$500/mes",
    label:  "un ingreso extra",
    detail: "Sin dejar tu trabajo actual",
  },
  {
    key:    "salary"   as MoneyKey,
    emoji:  "💰",
    amount: "$2,000–5,000/mes",
    label:  "reemplazar mi sueldo",
    detail: "Trabajar para ti, no para otro",
  },
  {
    key:    "business" as MoneyKey,
    emoji:  "🚀",
    amount: "+$10,000/mes",
    label:  "construir un negocio",
    detail: "Escala, equipo, independencia real",
  },
];

const TIME_OPTIONS = [
  { key: "light"  as TimeKey, label: "30–60 min", detail: "después del trabajo" },
  { key: "medium" as TimeKey, label: "2–3 horas", detail: "por las tardes"       },
  { key: "full"   as TimeKey, label: "4+ horas",  detail: "es mi prioridad"      },
];

const PROJECTS: Record<MoneyKey, Record<TimeKey, Project>> = {
  extra: {
    light: {
      name: "Agente de WhatsApp para negocios locales",
      description: "Configuras chatbots para restaurantes, estéticas y tiendas que responden preguntas, agendan citas y capturan leads automáticamente. Lo montas una vez, cobras para siempre.",
      monetization: "$300 de setup + $100/mes de mantenimiento. Con 5 clientes tienes $500/mes.",
      launchTime: "2 semanas",
      tools: ["WhatsApp API", "n8n", "ChatGPT"],
    },
    medium: {
      name: "Freelance de automatizaciones",
      description: "Conectas sistemas que no se hablan: CRM, email, facturación, reportes. Sin código. Cada proyecto toma 2–3 días y puedes hacerlos desde cualquier lugar.",
      monetization: "$400–600 por proyecto. Con 1–2 proyectos por mes llegas a $500–$800.",
      launchTime: "1 semana",
      tools: ["Make", "Zapier", "Airtable"],
    },
    full: {
      name: "Creador de contenido con IA para marcas",
      description: "Produces posts, emails y copies para pequeñas marcas usando IA generativa. Tú editas y validas, la IA produce en minutos lo que antes tomaba horas.",
      monetization: "$100/mes por cliente. Con 5 clientes tienes $500/mes consistentes.",
      launchTime: "1 semana",
      tools: ["ChatGPT", "Midjourney", "Buffer"],
    },
  },
  salary: {
    light: {
      name: "Micro-SaaS de IA para un nicho",
      description: "Una herramienta simple que automatiza un proceso doloroso en una industria: legal, contabilidad, salud. Suscripción mensual, ingresos recurrentes sin más horas.",
      monetization: "$49/mes × 50 usuarios = $2,450/mes escalables.",
      launchTime: "4 semanas",
      tools: ["Next.js", "Claude API", "Stripe"],
    },
    medium: {
      name: "Agencia de chatbots y CRMs",
      description: "Vendes paquetes de chatbot + automatización de seguimiento a PYMES. Ellos pagan mensual, tú configuras una vez y cobras recurrente.",
      monetization: "8 clientes a $300/mes = $2,400/mes recurrentes.",
      launchTime: "3 semanas",
      tools: ["WhatsApp API", "n8n", "Supabase"],
    },
    full: {
      name: "Servicio de marketing automatizado",
      description: "Email sequences, reportes de ads, publicaciones automáticas y seguimiento de leads. Un sistema completo que operas para 5–7 clientes simultáneamente.",
      monetization: "6 clientes a $400/mes = $2,400/mes consistentes.",
      launchTime: "2 semanas",
      tools: ["n8n", "ChatGPT", "Meta Ads API"],
    },
  },
  business: {
    light: {
      name: "Plataforma SaaS con IA",
      description: "Producto digital de suscripción que resuelve un problema real de nicho. La IA opera el servicio, tú gestionas el negocio. Ingresos que crecen mientras duermes.",
      monetization: "$97/mes × 100 usuarios = $9,700/mes recurrentes.",
      launchTime: "6–8 semanas",
      tools: ["Next.js", "Claude API", "Stripe", "Supabase"],
    },
    medium: {
      name: "Agencia de IA para empresas medianas",
      description: "Proyectos completos de automatización para empresas de 20–200 empleados. Análisis, diseño e implementación. Ticket alto, clientes de largo plazo.",
      monetization: "2–3 proyectos/mes a $4,000 = $10,000+/mes.",
      launchTime: "4 semanas",
      tools: ["Claude API", "n8n", "Python", "APIs REST"],
    },
    full: {
      name: "Empresa de soluciones de IA",
      description: "SaaS propio + agencia + formación. Tres fuentes de ingreso con un equipo pequeño. Tú te enfocas en estrategia y ventas.",
      monetization: "SaaS $5k + clientes $5k + cursos $2k = $12,000+/mes.",
      launchTime: "8–12 semanas",
      tools: ["Claude API", "n8n", "Next.js", "Stripe"],
    },
  },
};

/* ─── Animation config ───────────────────────────────────────────── */

const slide = {
  enter:  (dir: 1 | -1) => ({ x: `${dir * 55}%`, opacity: 0, scale: 0.97 }),
  center:              () => ({ x: 0,              opacity: 1, scale: 1    }),
  exit:   (dir: 1 | -1) => ({ x: `${dir * -55}%`, opacity: 0, scale: 0.97 }),
};
const slideTrans = { duration: 0.36, ease: [0.32, 0, 0.12, 1] as number[] };

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ─── Selection pill (shown under headline) ──────────────────────── */

function SelectionPill({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        bg-[#1472FF]/10 border border-[#1472FF]/25
        text-xs font-bold text-[#0E5FCC] dark:text-[#1472FF]
        hover:bg-[#1472FF]/20 transition-colors"
    >
      {children}
      <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  );
}

/* ─── Step dots ──────────────────────────────────────────────────── */

function StepDots({ step }: { step: Step }) {
  const map: Record<Step, number> = { money: 0, time: 1, generating: 2, result: 2 };
  const current = map[step];
  return (
    <div className="flex items-center gap-2 mb-7">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            width:           i === current ? 22 : 6,
            backgroundColor: i <= current ? "#1472FF" : "#e5e7eb",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

/* ─── Option card (money) ────────────────────────────────────────── */

function MoneyCard({
  emoji, amount, label, detail, selected, onClick,
}: {
  emoji: string; amount: string; label: string; detail: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left
        border-2 border-b-4 transition-colors duration-150
        active:border-b-2 active:mt-[2px] group
        ${selected
          ? "bg-[#1472FF] border-[#0E5FCC] text-white"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-950 hover:border-[#1472FF]/40 hover:border-b-[#1472FF]/60"
        }
      `}
    >
      <span className="text-2xl flex-shrink-0 leading-none">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-extrabold text-lg leading-tight tracking-tight ${selected ? "text-white" : "text-[#4b4b4b] dark:text-white"}`}>
          {amount}
        </p>
        <p className={`text-sm font-semibold mt-0.5 ${selected ? "text-blue-100" : "text-[#1472FF]"}`}>
          {label}
        </p>
        <p className={`text-xs mt-1 ${selected ? "text-blue-200" : "text-[#777777] dark:text-gray-400"}`}>
          {detail}
        </p>
      </div>
      {/* Arrow that appears on hover, checkmark when selected */}
      <div className="flex-shrink-0 w-6 h-6">
        {selected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        ) : (
          <svg
            className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#1472FF] transition-colors"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </motion.button>
  );
}

/* ─── Time chip ──────────────────────────────────────────────────── */

function TimeChip({
  label, detail, selected, onClick,
}: {
  label: string; detail: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`
        flex-1 min-w-[100px] flex flex-col items-center justify-center
        gap-1 py-5 px-3 rounded-2xl
        border-2 border-b-4 transition-colors duration-150
        active:border-b-2 active:mt-[2px]
        ${selected
          ? "bg-[#1472FF] border-[#0E5FCC]"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-950 hover:border-[#1472FF]/40"
        }
      `}
    >
      <span className={`text-base font-extrabold leading-tight ${selected ? "text-white" : "text-[#4b4b4b] dark:text-white"}`}>
        {label}
      </span>
      <span className={`text-xs text-center leading-snug ${selected ? "text-blue-100" : "text-[#777777] dark:text-gray-400"}`}>
        {detail}
      </span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-1">
          <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

/* ─── Generating state ───────────────────────────────────────────── */

function GeneratingStep({ money, time }: { money: MoneyKey; time: TimeKey }) {
  const moneyOpt = MONEY_OPTIONS.find(o => o.key === money)!;
  const timeOpt  = TIME_OPTIONS.find(o => o.key === time)!;

  const checks = [
    `Meta: ${moneyOpt.amount}`,
    `Tiempo: ${timeOpt.label} al día`,
    "Buscando el proyecto ideal…",
  ];

  return (
    <div className="py-10 flex flex-col items-center text-center">
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#1472FF] mb-8"
      />

      <p className="text-sm font-bold uppercase tracking-widest text-[#777777] dark:text-gray-400 mb-6">
        armando tu proyecto
      </p>

      <div className="space-y-3 text-left w-full max-w-[240px]">
        {checks.map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.28, duration: 0.25 }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.28 + 0.1 }}
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                ${i < 2 ? "bg-[#1472FF]" : "bg-gray-200 dark:bg-gray-700"}
              `}
            >
              {i < 2 ? (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400"
                />
              )}
            </motion.div>
            <span className={`text-sm ${i < 2 ? "text-[#4b4b4b] dark:text-white font-medium" : "text-[#777777] dark:text-gray-400"}`}>
              {text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Project card (staggered reveal) ───────────────────────────── */

function ProjectCard({
  project,
  onStart,
}: {
  project: Project;
  onStart: () => void;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-b-4
        border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-950
        p-6 max-md:p-4 overflow-hidden"
    >
      <motion.div variants={fadeUp}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1472FF] mb-1.5">
          tu proyecto
        </p>
        <h2 className="text-xl font-extrabold text-[#4b4b4b] dark:text-white leading-tight tracking-tight mb-3 max-md:text-lg">
          {project.name}
        </h2>
      </motion.div>

      <motion.p variants={fadeUp} className="text-sm text-[#777777] dark:text-gray-400 leading-relaxed mb-5">
        {project.description}
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-start gap-2.5 flex-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
          <span className="text-base mt-0.5 flex-shrink-0">💰</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white mb-1">
              cómo ganas dinero
            </p>
            <p className="text-xs text-[#777777] dark:text-gray-400 leading-relaxed">
              {project.monetization}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 sm:w-36 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
          <span className="text-base mt-0.5 flex-shrink-0">⚡</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#4b4b4b] dark:text-white mb-1">
              lo lanzas en
            </p>
            <p className="text-sm font-extrabold text-[#1472FF]">{project.launchTime}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-5">
        {project.tools.map((t) => <Tag key={t} variant="neutral">{t}</Tag>)}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Button
          variant="primary" size="xl" depth="bottom" rounded2xl
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2"
        >
          quiero construir esto
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */

export default function HeroAlternate() {
  const [step,      setStep]      = useState<Step>("money");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [money,     setMoney]     = useState<MoneyKey | null>(null);
  const [time,      setTime]      = useState<TimeKey  | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const go = (next: Step, dir: 1 | -1) => {
    setDirection(dir);
    setStep(next);
  };

  const selectMoney = (key: MoneyKey) => {
    setMoney(key);
    go("time", 1);
  };

  const selectTime = (key: TimeKey) => {
    setTime(key);
    setDirection(1);
    setStep("generating");
    timerRef.current = setTimeout(() => go("result", 1), 1500);
  };

  const resetMoney = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMoney(null);
    setTime(null);
    go("money", -1);
  };

  const resetTime = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTime(null);
    go("time", -1);
  };

  const project = money && time ? PROJECTS[money][time] : null;
  const moneyOpt = MONEY_OPTIONS.find(o => o.key === money);
  const timeOpt  = TIME_OPTIONS.find(o => o.key === time);

  const handleStart = () => {
    if (!project) return;
    const idea = `Quiero construir: ${project.name}. ${project.description} Meta: ${project.monetization}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingProjectIdea", idea);
      document.cookie = `pendingProjectIdea=${encodeURIComponent(idea)}; path=/; max-age=3600; SameSite=Lax`;
    }
    router.push("/auth/signup");
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20 max-md:pt-16 max-md:pb-16">
      <div className="w-full max-w-md mx-auto">

        {/* Headline + dynamic selection summary */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight leading-tight mb-3">
            tu próximo<br />proyecto
          </h1>

          {/* Selection pills build up under the title */}
          <AnimatePresence mode="popLayout">
            {(moneyOpt || timeOpt) && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 overflow-hidden"
              >
                {moneyOpt && (
                  <SelectionPill onRemove={resetMoney}>
                    {moneyOpt.emoji} {moneyOpt.amount}
                  </SelectionPill>
                )}
                {timeOpt && (
                  <SelectionPill onRemove={resetTime}>
                    {timeOpt.label} al día
                  </SelectionPill>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Step dots */}
        <StepDots step={step} />

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {step === "money" && (
              <motion.div key="money" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit" transition={slideTrans}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#777777] dark:text-gray-400 mb-4">
                  ¿cuánto quieres ganar al mes?
                </p>
                <div className="flex flex-col gap-3">
                  {MONEY_OPTIONS.map(o => (
                    <MoneyCard key={o.key} {...o}
                      selected={money === o.key}
                      onClick={() => selectMoney(o.key)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === "time" && (
              <motion.div key="time" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit" transition={slideTrans}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#777777] dark:text-gray-400 mb-4">
                  ¿cuánto tiempo tienes al día?
                </p>
                <div className="flex gap-3 flex-wrap">
                  {TIME_OPTIONS.map(o => (
                    <TimeChip key={o.key} label={o.label} detail={o.detail}
                      selected={time === o.key}
                      onClick={() => selectTime(o.key)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === "generating" && money && time && (
              <motion.div key="generating" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit" transition={slideTrans}>
                <GeneratingStep money={money} time={time} />
              </motion.div>
            )}

            {step === "result" && project && (
              <motion.div key="result" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit" transition={slideTrans}>
                <ProjectCard project={project} onStart={handleStart} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
