'use client';

/**
 * Hero (cinético) v2 — porteado del prototipo claude-design (sections-1.jsx:345-728).
 *
 * Hero principal con:
 *   - tag "100 lecciones · 10 secciones · cero teoría inflada"
 *   - display con typing/cycle de 3 verbos: ejecutando · construyendo · equivocándote
 *   - body de marketing
 *   - 2 CTAs: empezar gratis (primary) + ver demo (ghost)
 *   - stats live con count-up animado
 *   - escena cinética: mock device + mascota expressive + chips flotantes
 *
 * Animaciones: typingCycle (sin lib), countUp (IntersectionObserver),
 * codeTyping (setInterval). Mascota con eye-tracking + mood que cambia con el step.
 */

import { useEffect, useRef, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { Caption } from '@/components/ui/Typography';

// === hooks === //

function useTypingCycle(
  variants: string[],
  options: { typeMs?: number; holdMs?: number; eraseMs?: number } = {}
) {
  const { typeMs = 55, holdMs = 1600, eraseMs = 25 } = options;
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'hold' | 'erasing'>('typing');

  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    const target = variants[idx];
    if (phase === 'typing') {
      if (text.length < target.length) {
        to = setTimeout(() => setText(target.slice(0, text.length + 1)), typeMs);
      } else {
        to = setTimeout(() => setPhase('hold'), holdMs);
      }
    } else if (phase === 'hold') {
      to = setTimeout(() => setPhase('erasing'), 0);
    } else if (phase === 'erasing') {
      if (text.length > 0) {
        to = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
      } else {
        setIdx((idx + 1) % variants.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(to);
  }, [text, phase, idx, variants, typeMs, holdMs, eraseMs]);

  return text;
}

function useCountUp(
  target: number,
  opts: { duration?: number; decimals?: number; start?: number } = {}
): [React.RefObject<HTMLDivElement | null>, number | string] {
  const { duration = 1400, decimals = 0, start = 0 } = opts;
  const [val, setVal] = useState(start);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const t0 = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - t0) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(start + (target - start) * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, start]);

  const out = decimals === 0 ? Math.round(val) : val.toFixed(decimals);
  return [ref, out];
}

// === expressive mascota interna del Hero === //

const MascotaExpressive = ({
  size = 120,
  mood = 'default',
  eyeXY = { x: 0, y: 0 },
}: {
  size?: number;
  mood?: 'default' | 'focused' | 'win';
  eyeXY?: { x: number; y: number };
}) => (
  <svg
    viewBox="0 0 240 240"
    width={size}
    height={size}
    style={{ filter: 'drop-shadow(0 6px 0 rgba(10,22,40,0.18))' }}
    aria-hidden="true"
  >
    <rect x="32" y="44" width="176" height="176" rx="44" fill="#0E5FCC" />
    <rect
      x="32"
      y="32"
      width="176"
      height="176"
      rx="44"
      fill="#1472FF"
      stroke="#0a1628"
      strokeWidth="3"
    />
    <path
      d="M48 60 Q48 44 64 44 L176 44 Q192 44 192 60 L192 78"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
    <g
      style={{
        transform: `translate(${eyeXY.x}px, ${eyeXY.y}px)`,
        transition: 'transform 80ms ease-out',
      }}
    >
      {mood === 'focused' ? (
        <>
          <rect x="82" y="116" width="28" height="6" rx="3" fill="#0a1628" />
          <rect x="146" y="116" width="28" height="6" rx="3" fill="#0a1628" />
        </>
      ) : mood === 'win' ? (
        <>
          <path
            d="M80 122 Q96 108 112 122"
            stroke="#0a1628"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M144 122 Q160 108 176 122"
            stroke="#0a1628"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle cx="96" cy="118" r="13" fill="#0a1628" />
          <circle cx="100" cy="114" r="4" fill="#fff" />
          <circle cx="160" cy="118" r="13" fill="#0a1628" />
          <circle cx="164" cy="114" r="4" fill="#fff" />
        </>
      )}
    </g>
    {mood === 'default' && (
      <path
        d="M108 156 Q128 168 148 156"
        stroke="#0a1628"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    )}
    {mood === 'focused' && (
      <rect x="116" y="158" width="24" height="5" rx="2.5" fill="#0a1628" />
    )}
    {mood === 'win' && (
      <path
        d="M100 152 Q128 184 156 152 Q140 174 128 174 Q116 174 100 152 Z"
        fill="#0a1628"
      />
    )}
    <g transform="translate(190 38)">
      <path
        d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z"
        fill="#22c55e"
        stroke="#0a1628"
        strokeWidth="2"
      />
    </g>
  </svg>
);

// === stat con count-up + barra === //

const Stat = forwardRef<
  HTMLDivElement,
  { value: number | string; label: string; pct: number; color: string }
>(({ value, label, pct, color }, ref) => (
  <div ref={ref} className="flex flex-col gap-1.5">
    <div
      className="font-display font-extrabold leading-none lowercase tracking-tight text-ink dark:text-white"
      style={{ fontSize: 26, letterSpacing: '-0.02em' }}
    >
      {value}
    </div>
    <Caption className="text-[11px] leading-snug">{label}</Caption>
    <div className="h-[5px] bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: 'width 1.4s cubic-bezier(.16,1,.3,1) 200ms',
        }}
      />
    </div>
  </div>
));
Stat.displayName = 'Stat';

const HeroLiveStats = () => {
  const [r1, v1] = useCountUp(100, { duration: 1800 });
  const [r2, v2] = useCountUp(10, { duration: 1600 });
  const [r3, v3] = useCountUp(10, { duration: 1400 });

  return (
    <div
      className="mt-8 grid grid-cols-3 gap-3.5 p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-ink dark:border-white"
      style={{ borderBottomWidth: 5 }}
    >
      <Stat ref={r1} value={v1} label="lecciones interactivas" pct={100} color="#1472FF" />
      <Stat ref={r2} value={v2} label="secciones del catálogo" pct={100} color="#16a34a" />
      <Stat ref={r3} value={`${v3} min`} label="por lección" pct={50} color="#7c3aed" />
    </div>
  );
};

// === escena del hero · mock device + mascota + chips === //

const HeroScene = () => {
  const codeLines = [
    { t: 'function pedirA(modelo, idea) {', c: '#94a3b8' },
    { t: '  return `${modelo}: dame ${idea}, paso a paso`;', c: '#cdd9e5' },
    { t: '}', c: '#94a3b8' },
    { t: '', c: '' },
    { t: "pedirA('claude', 'un plan de marketing');", c: '#fcd34d' },
  ];

  const [step, setStep] = useState(0); // 0 typing, 1 ran, 2 success
  const [typed, setTyped] = useState(0);
  const totalChars = codeLines.reduce((a, l) => a + l.t.length + 1, 0);

  // typing loop con reset
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= totalChars) {
        clearInterval(id);
        const t1 = setTimeout(() => setStep(1), 400);
        const t2 = setTimeout(() => setStep(2), 900);
        const t3 = setTimeout(() => {
          setTyped(0);
          setStep(0);
        }, 5500);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    }, 38);
    return () => clearInterval(id);
  }, [step === 0 && typed === 0 ? Date.now() : null, totalChars]);

  const mood: 'default' | 'focused' | 'win' =
    step === 0 ? 'default' : step === 1 ? 'focused' : 'win';

  // eye-tracking
  const [eyeXY, setEyeXY] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.min(1, Math.hypot(dx, dy) / 400);
      const ang = Math.atan2(dy, dx);
      setEyeXY({ x: Math.cos(ang) * dist * 4, y: Math.sin(ang) * dist * 3 });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full max-w-[540px] mx-auto">
      {/* mock device / IDE */}
      <div
        className="bg-white dark:bg-gray-800 border-2 border-ink dark:border-white rounded-2xl overflow-hidden relative z-[1]"
        style={{ borderBottomWidth: 6, boxShadow: '0 20px 0 -12px rgba(10,22,40,0.08)' }}
      >
        {/* tab bar */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <span
            className="block rounded-full"
            style={{
              width: 10,
              height: 10,
              background: '#ef4444',
              border: '1.5px solid #0a1628',
            }}
          />
          <span
            className="block rounded-full"
            style={{
              width: 10,
              height: 10,
              background: '#fbbf24',
              border: '1.5px solid #0a1628',
            }}
          />
          <span
            className="block rounded-full"
            style={{
              width: 10,
              height: 10,
              background: '#22c55e',
              border: '1.5px solid #0a1628',
            }}
          />
          <div
            className="ml-3 px-2.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-ink-muted"
            style={{ fontSize: 11 }}
          >
            lección 03 · prompt.js
          </div>
          <div
            className="ml-auto flex items-center gap-1 text-ink-muted font-mono"
            style={{ fontSize: 11 }}
          >
            <span
              className="block rounded-full"
              style={{
                width: 6,
                height: 6,
                background: step >= 1 ? '#22c55e' : '#1472FF',
              }}
            />
            {step === 0 ? 'editing' : step === 1 ? 'running' : 'passed'}
          </div>
        </div>

        {/* code area */}
        <div className="p-4" style={{ background: '#0a1628', color: '#e6edf3' }}>
          <div className="flex flex-col">
            {codeLines.map((line, i) => {
              let charsBefore = 0;
              for (let j = 0; j < i; j++) charsBefore += codeLines[j].t.length + 1;
              const visible = Math.min(line.t.length, Math.max(0, typed - charsBefore));
              const isTyping = visible > 0 && visible < line.t.length;
              const lineColor = i === 1 ? '#7dd3fc' : i === 4 ? '#fcd34d' : '#cdd9e5';
              return (
                <div
                  key={i}
                  className="flex gap-3 font-mono"
                  style={{ fontSize: 13, lineHeight: 1.75, minHeight: '1.75em' }}
                >
                  <span
                    className="text-right select-none flex-shrink-0"
                    style={{ color: '#5d6b7e', width: 18 }}
                  >
                    {i + 1}
                  </span>
                  <span className="whitespace-pre" style={{ color: lineColor }}>
                    {line.t.slice(0, visible)}
                    {isTyping && (
                      <span
                        className="inline-block align-baseline"
                        style={{
                          width: 7,
                          height: 14,
                          background: '#7dd3fc',
                          verticalAlign: '-2px',
                        }}
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* output */}
          <div
            className="mt-3.5 pt-3 flex items-center gap-2.5"
            style={{ borderTop: '1px dashed #334155', minHeight: 28 }}
          >
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 10,
                color: '#5d6b7e',
                letterSpacing: '0.1em',
              }}
            >
              output
            </span>
            {step === 0 && (
              <span className="font-mono" style={{ fontSize: 12, color: '#5d6b7e' }}>
                —
              </span>
            )}
            {step === 1 && (
              <span className="font-mono" style={{ fontSize: 12, color: '#fbbf24' }}>
                ejecutando…
              </span>
            )}
            {step === 2 && (
              <span
                className="font-mono"
                style={{
                  fontSize: 12,
                  color: '#22c55e',
                  animation: 'v2-fadeIn 280ms ease-out',
                }}
              >
                {'"prompt enviado a claude"'} ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* mascota expressive arriba-derecha */}
      <div className="absolute z-[2] v2-heroBob" style={{ top: -36, right: -18 }}>
        <MascotaExpressive size={108} mood={mood} eyeXY={eyeXY} />
      </div>

      {/* badge "+1 lección" arriba-izquierda cuando step=2 */}
      <div
        className="absolute z-[2] flex items-center gap-1.5 font-display font-extrabold lowercase"
        style={{
          top: -18,
          left: -14,
          background: '#22c55e',
          color: '#052e16',
          border: '2px solid #16a34a',
          borderBottom: '5px solid #16a34a',
          padding: '8px 12px',
          borderRadius: 12,
          fontSize: 13,
          transform: `rotate(-4deg) scale(${step === 2 ? 1 : 0})`,
          opacity: step === 2 ? 1 : 0,
          transition: 'transform 320ms cubic-bezier(.34,1.56,.64,1), opacity 200ms',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="#052e16"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="4 12 10 18 20 6" />
        </svg>
        +1 lección
      </div>

      {/* chip flotante: racha */}
      <div className="absolute z-[2] v2-floatA" style={{ bottom: -44, left: -14 }}>
        <div
          className="inline-flex items-center gap-2.5 bg-white dark:bg-gray-800 text-ink dark:text-white"
          style={{
            border: '2px solid #0a1628',
            borderBottom: '5px solid #0a1628',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span
            className="block rounded-full"
            style={{
              width: 10,
              height: 10,
              background: '#22c55e',
              border: '1.5px solid #0a1628',
            }}
          />
          <span className="lowercase">racha · 7 días</span>
        </div>
      </div>

      {/* chip flotante: progreso */}
      <div className="absolute z-[2] v2-floatB" style={{ bottom: -56, right: -32 }}>
        <div
          className="inline-flex flex-col gap-1.5 bg-white dark:bg-gray-800"
          style={{
            border: '2px solid #0a1628',
            borderBottom: '5px solid #0a1628',
            padding: '9px 12px',
            borderRadius: 12,
            minWidth: 160,
          }}
        >
          <div
            className="font-mono uppercase text-ink-muted"
            style={{ fontSize: 10, letterSpacing: '0.1em' }}
          >
            tu ruta
          </div>
          <div
            className="font-display font-extrabold lowercase text-ink dark:text-white"
            style={{ fontSize: 16, lineHeight: 1 }}
          >
            03 / 100
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{
              height: 5,
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              className="h-full"
              style={{ width: '3%', background: '#1472FF' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// === HERO === //

export default function Hero() {
  const verb = useTypingCycle(
    ['ejecutando', 'construyendo', 'equivocándote', 'pensando', 'razonando'],
    { typeMs: 55, holdMs: 1500, eraseMs: 28 }
  );

  return (
    <section
      id="home"
      className="hero-section relative overflow-hidden bg-white dark:bg-gray-800"
      style={{ paddingTop: 56 }}
    >
      {/* blobs animados de fondo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0"
      >
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <radialGradient id="v2HeroBlob1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1472FF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1472FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="v2HeroBlob2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="80%" cy="20%" rx="280" ry="220" fill="url(#v2HeroBlob1)">
            <animate
              attributeName="cx"
              values="80%;72%;80%"
              dur="11s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="20%;28%;20%"
              dur="9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="15%" cy="85%" rx="220" ry="180" fill="url(#v2HeroBlob2)">
            <animate
              attributeName="cx"
              values="15%;22%;15%"
              dur="13s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="85%;78%;85%"
              dur="10s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-[1] py-16 md:py-24 grid gap-12 md:grid-cols-[1.1fr_1fr] items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <Tag variant="primary">100 lecciones · 10 secciones · cero teoría inflada</Tag>
          </motion.div>

          <h1
            className="font-display font-extrabold text-ink dark:text-white lowercase"
            style={{
              minHeight: '3.4em',
              fontSize: 'clamp(48px, 9vw, 96px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
            }}
          >
            <span className="block">
              aprende <span className="normal-case">IA</span>
            </span>
            <span className="block text-primary">
              {verb}
              <span
                className="inline-block text-primary v2-caret font-bold"
                style={{ marginLeft: '0.04em' }}
              >
                _
              </span>
            </span>
            <span
              className="block text-ink-muted font-bold"
              style={{ fontSize: '0.55em', marginTop: '0.1em' }}
            >
              no estudiando
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink dark:text-gray-300">
            100 lecciones interactivas para aplicar IA en tu trabajo. Ejercicios cortos donde
            modificas archivos reales, automatizas procesos y ejecutas con tu propia IA.
            Terminas ejecutando, no estudiando.
          </p>

          {/* tres CTAs intent-driven (porteado del HeroDemo del prototipo).
              `outline` con depth porque el hero v2 tiene fondo claro — el
              estilo glass del original requería fondo oscuro de video. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap md:flex-nowrap gap-3"
          >
            {[
              { label: 'aprender ia desde cero', intent: 'beginner', primary: true },
              { label: 'construir mi proyecto', intent: 'build' },
              { label: 'aplicar ia en mi trabajo', intent: 'work' },
            ].map(({ label, intent, primary }) => (
              <Button
                key={intent}
                href={`/auth/signup?intent=${intent}`}
                variant={primary ? 'primary' : 'outline'}
                size="lg"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {label}
              </Button>
            ))}
          </motion.div>

          <HeroLiveStats />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 flex items-center gap-2.5 text-ink-muted text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-completado-dark"
              aria-hidden="true"
            >
              <polyline points="4 12 10 18 20 6" />
            </svg>
            <span className="lowercase">primeras 20 lecciones gratis · sin tarjeta</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}
