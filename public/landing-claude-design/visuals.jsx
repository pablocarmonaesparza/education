// itera mascota + composiciones geométricas (sin humanos)
// mascota: cuadrado-blob azul con cara minimal, estilo duo-pero-geométrico

const Mascota = ({ size = 220, mood = "default", className = "" }) => {
  // mood: default, focused, win
  return (
    <svg viewBox="0 0 240 240" width={size} height={size} className={className} aria-label="itera">
      {/* sombra depth */}
      <rect x="32" y="44" width="176" height="176" rx="44"
            fill="var(--primary-dark)" />
      {/* cuerpo */}
      <rect x="32" y="32" width="176" height="176" rx="44"
            fill="var(--primary)" stroke="#0a1628" strokeWidth="3" />
      {/* highlight superior */}
      <path d="M48 60 Q48 44 64 44 L176 44 Q192 44 192 60 L192 78"
            stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* ojos */}
      <g>
        <circle cx="96" cy="118" r="13" fill="#0a1628" />
        <circle cx="100" cy="114" r="4" fill="#fff" />
        <circle cx="160" cy="118" r="13" fill="#0a1628" />
        <circle cx="164" cy="114" r="4" fill="#fff" />
      </g>
      {/* boca según mood */}
      {mood === "default" && (
        <path d="M108 156 Q128 168 148 156" stroke="#0a1628" strokeWidth="5" strokeLinecap="round" fill="none" />
      )}
      {mood === "focused" && (
        <rect x="116" y="158" width="24" height="5" rx="2.5" fill="#0a1628" />
      )}
      {mood === "win" && (
        <path d="M104 152 Q128 178 152 152 Q140 168 128 168 Q116 168 104 152 Z" fill="#0a1628" />
      )}
      {/* destellito accent */}
      <g transform="translate(190 38)">
        <path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="var(--accent)" stroke="#0a1628" strokeWidth="2" />
      </g>
    </svg>
  );
};

// chip flotante "ejercicio" — visual auxiliar del hero
const ExerciseChip = ({ label, status = "doing", style = {} }) => {
  const colors = {
    doing:   { bg: "#fff", border: "#0a1628", dot: "var(--primary)" },
    done:    { bg: "var(--accent-soft)", border: "var(--accent-dark)", dot: "var(--accent)" },
    locked:  { bg: "var(--bg-soft)", border: "#9ca3af", dot: "#9ca3af" },
  }[status];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      background: colors.bg, border: `2px solid ${colors.border}`,
      borderBottom: `5px solid ${colors.border}`,
      padding: "10px 14px", borderRadius: 12,
      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
      color: "#0a1628",
      ...style,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: 999, background: colors.dot, border: "1.5px solid #0a1628" }} />
      <span style={{ textTransform: "lowercase" }}>{label}</span>
      {status === "done" && <Icon.check style={{ color: "var(--accent-dark)" }} />}
    </div>
  );
};

// composición visual del hero: mascota + chips orbitando + cuadrícula sutil
const HeroVisual = () => {
  const [eyeXY, setEyeXY] = React.useState({ x: 0, y: 0 });
  const [progress, setProgress] = React.useState(33);
  const wrapRef = React.useRef(null);

  // ojos siguen al cursor
  React.useEffect(() => {
    const onMove = (e) => {
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
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // progreso "tipea" subiendo
  React.useEffect(() => {
    let raf, target = 33;
    const tick = () => {
      target = 33 + (Math.sin(Date.now() / 1400) + 1) * 17; // 33-67
      setProgress((p) => p + (target - p) * 0.06);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", maxWidth: 480, aspectRatio: "1 / 1", margin: "0 auto" }}>
      {/* fondo cuadriculado animado */}
      <svg viewBox="0 0 480 480" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--border)" strokeWidth="1"/>
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="60%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="480" height="480" fill="url(#grid)" />
        <circle cx="240" cy="240" r="200" fill="url(#glow)">
          <animate attributeName="r" values="180;220;180" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* mascota con eye-tracking + bob */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "heroBob 4.8s ease-in-out infinite" }}>
        <MascotaTracking size={260} eyeXY={eyeXY} />
      </div>

      {/* chip 1: lección done — flotando */}
      <div className="rise d-3 floatA" style={{ position: "absolute", top: "8%", left: "-4%" }}>
        <ExerciseChip label="lección 03 · variables" status="done" />
      </div>

      {/* chip 2: ejercicio activo con barra de progreso */}
      <div className="rise d-4 floatB" style={{ position: "absolute", top: "32%", right: "-8%" }}>
        <div style={{
          display: "inline-flex", flexDirection: "column", gap: 8,
          background: "#fff", border: "2px solid #0a1628",
          borderBottom: "5px solid #0a1628",
          padding: "10px 14px", borderRadius: 12, minWidth: 200,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "#0a1628" }}>
            <span style={{ position: "relative", width: 10, height: 10 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: "var(--primary)", border: "1.5px solid #0a1628" }} />
              <span style={{ position: "absolute", inset: -4, borderRadius: 999, background: "var(--primary)", opacity: 0.4, animation: "ping 1.6s ease-out infinite" }} />
            </span>
            <span className="lower">ejercicio: tu primer fetch</span>
          </div>
          <div style={{ height: 6, background: "var(--bg-darker)", border: "1.5px solid #0a1628", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--primary)", transition: "width 100ms linear" }} />
          </div>
        </div>
      </div>

      {/* chip 3: locked — flotando lento */}
      <div className="rise d-5 floatC" style={{ position: "absolute", bottom: "10%", left: "0%" }}>
        <ExerciseChip label="lección 05 · loops" status="locked" />
      </div>

      {/* badge de progreso con pop */}
      <div className="rise d-5" style={{
        position: "absolute", bottom: "-2%", right: "-2%",
        background: "var(--accent)", color: "#052e16",
        border: "2px solid var(--accent-dark)", borderBottom: "6px solid var(--accent-dark)",
        padding: "10px 14px", borderRadius: 12,
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18,
        textTransform: "lowercase",
        transform: "rotate(-4deg)",
        animation: "wobble 5s ease-in-out infinite",
      }}>
        +3 lecciones hoy
      </div>

      {/* sparkles que aparecen */}
      <div style={{ position: "absolute", top: "18%", right: "12%", animation: "twinkle 2.4s ease-in-out infinite" }}>
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="var(--accent)" stroke="#0a1628" strokeWidth="1.5"/></svg>
      </div>
      <div style={{ position: "absolute", bottom: "32%", right: "20%", animation: "twinkle 2.4s ease-in-out 0.8s infinite" }}>
        <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="var(--primary)" stroke="#0a1628" strokeWidth="1.5"/></svg>
      </div>
    </div>
  );
};

// mascota con ojos que siguen al cursor
const MascotaTracking = ({ size = 260, eyeXY = { x: 0, y: 0 } }) => (
  <svg viewBox="0 0 240 240" width={size} height={size} aria-label="itera">
    <rect x="32" y="44" width="176" height="176" rx="44" fill="var(--primary-dark)" />
    <rect x="32" y="32" width="176" height="176" rx="44" fill="var(--primary)" stroke="#0a1628" strokeWidth="3" />
    <path d="M48 60 Q48 44 64 44 L176 44 Q192 44 192 60 L192 78"
          stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" fill="none" />
    {/* ojos siguiendo */}
    <g style={{ transform: `translate(${eyeXY.x}px, ${eyeXY.y}px)`, transition: "transform 80ms ease-out" }}>
      <circle cx="96" cy="118" r="13" fill="#0a1628" />
      <circle cx="100" cy="114" r="4" fill="#fff" />
      <circle cx="160" cy="118" r="13" fill="#0a1628" />
      <circle cx="164" cy="114" r="4" fill="#fff" />
    </g>
    <path d="M108 156 Q128 168 148 156" stroke="#0a1628" strokeWidth="5" strokeLinecap="round" fill="none" />
    <g transform="translate(190 38)">
      <path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="var(--accent)" stroke="#0a1628" strokeWidth="2">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
      </path>
    </g>
  </svg>
);

// visual genérico para sección "cómo funciona" — paso N
const StepVisual = ({ n, kind }) => {
  if (kind === "quiz") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["¿qué quieres construir?", "¿cuánto tiempo tienes/sem?", "¿desde dónde empiezas?"].map((q, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            background: i === 0 ? "var(--primary-soft)" : "var(--bg-soft)",
            border: "2px solid",
            borderColor: i === 0 ? "var(--primary-dark)" : "var(--border)",
            borderRadius: 10,
            fontSize: 13, fontWeight: 600, color: "#0a1628",
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 999,
              border: "2px solid",
              borderColor: i === 0 ? "var(--primary-dark)" : "var(--border)",
              background: i === 0 ? "var(--primary)" : "transparent",
            }}/>
            <span className="lower">{q}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "path") {
    // ruta con nodos (algunos done, current, next)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { l: "01 fundamentos", s: "done" },
          { l: "02 asistentes", s: "done" },
          { l: "03 contenido", s: "doing" },
          { l: "04 automatización", s: "next" },
          { l: "05 bases de datos", s: "next" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 24, height: 24, borderRadius: 999, flexShrink: 0,
              border: "2px solid #0a1628",
              background: row.s === "done" ? "var(--accent)" : row.s === "doing" ? "var(--primary)" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {row.s === "done" && <Icon.check style={{ color: "#052e16", width: 12, height: 12 }} />}
            </span>
            <span style={{
              flex: 1, fontSize: 13, fontWeight: 700, color: "#0a1628",
              padding: "8px 12px",
              background: row.s === "doing" ? "var(--primary-soft)" : "transparent",
              border: row.s === "doing" ? "2px solid var(--primary-dark)" : "2px solid transparent",
              borderRadius: 8,
            }}>{row.l}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "exercise") {
    return (
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.6 }}>
        <div style={{
          background: "#0a1628", color: "#cbd5e1",
          padding: "12px 14px", borderRadius: 10, border: "2px solid #0a1628",
        }}>
          <div style={{ color: "#94a3b8", marginBottom: 6 }}>// elige el contexto que falta en el prompt</div>
          <div><span style={{ color: "#a78bfa" }}>prompt</span> = <span style={{ color: "#60a5fa" }}>"resume este reporte"</span></div>
          <div style={{ paddingLeft: 16, color: "var(--accent)" }}>+ ___ ;</div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[`"en 5 bullets para ceo"`, `"corto"`, `"breve"`].map((opt, i) => (
            <span key={i} style={{
              padding: "6px 10px", fontSize: 12, fontWeight: 700,
              background: i === 0 ? "var(--accent-soft)" : "var(--bg)",
              border: "2px solid",
              borderColor: i === 0 ? "var(--accent-dark)" : "var(--border)",
              borderRadius: 8, color: "#0a1628",
            }}>{opt}</span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

Object.assign(window, { Mascota, ExerciseChip, HeroVisual, StepVisual });
