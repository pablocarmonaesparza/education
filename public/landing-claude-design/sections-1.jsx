// landing sections — itera

// === NAV ===
// Portado del Navbar.tsx del Next.js de Itera, adaptado a vanilla React + tokens.css.
// Comportamiento:
//   - sobre el hero: navbar invisible (sin bg, sin blur), solo logo y CTA flotando
//   - pasado el hero: aparece el bg + blur + se revelan los links centrales
//   - logo PNG real (light/dark según theme; sobre el hero siempre versión clara)
//   - indicator pill que se desliza tras el link de la sección activa
const Nav = () => {
  const [open, setOpen] = React.useState(false);
  const [pastHero, setPastHero] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState(null);
  const [pill, setPill] = React.useState({ left: 0, width: 0 });
  const navRef = React.useRef(null);

  React.useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);

  // detecta dark mode (system + override por [data-theme] en el root)
  React.useEffect(() => {
    const compute = () => {
      const themeAttr = document.documentElement.getAttribute("data-theme");
      if (themeAttr === "light") return setIsDark(false);
      if (themeAttr === "dark") return setIsDark(true);
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    compute();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => compute();
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else mq.addListener(onMq);
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onMq);
      else mq.removeListener(onMq);
      observer.disconnect();
    };
  }, []);

  const links = [
    { label: "cómo funciona", href: "#como", id: "como" },
    { label: "comparativa", href: "#vs", id: "vs" },
    { label: "pricing", href: "#pricing", id: "pricing" },
    { label: "empresas", href: "#empresas", id: "empresas" },
    { label: "faq", href: "#faq", id: "faq" },
  ];

  // scroll: detecta si dejamos atrás el hero + sección visible bajo la navbar
  React.useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector(".hero-demo-section");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // pasamos cuando el bottom del hero queda sobre la navbar (80px)
        setPastHero(rect.bottom <= 80);
      } else {
        setPastHero(window.scrollY > 80);
      }
      const navHeight = 100;
      let current = null;
      for (const { id } of links) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= navHeight + 50 && rect.bottom > navHeight) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // mide la posición del link activo para el pill
  React.useEffect(() => {
    const measure = () => {
      if (!activeSection || !navRef.current) {
        setPill((s) => ({ ...s, width: 0 }));
        return;
      }
      if (navRef.current.offsetParent === null) return;
      const link = navRef.current.querySelector(`[data-section="${activeSection}"]`);
      if (!link) return;
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.width === 0) return;
      setPill({ left: linkRect.left - navRect.left, width: linkRect.width });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [activeSection]);

  const goTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (href === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // sobre el hero el logo siempre va en versión clara (fondo oscuro del video).
  // pasado el hero, sigue el theme del sistema.
  const logoSrc = (!pastHero || isDark) ? "itera-logo-dark.png" : "itera-logo-light.png";

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: pastHero ? "rgba(var(--bg-rgb), 0.9)" : "transparent",
      backdropFilter: pastHero ? "blur(12px)" : "none",
      WebkitBackdropFilter: pastHero ? "blur(12px)" : "none",
      transition: "background 350ms ease-out, backdrop-filter 350ms ease-out",
    }}>
      <div className="container" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 80, gap: 16, position: "relative",
      }}>
        {/* logo - siempre visible */}
        <a href="#top" onClick={(e) => goTo(e, "#top")} style={{
          display: "flex", alignItems: "center", zIndex: 2,
        }}>
          <img
            src={logoSrc}
            alt="Itera"
            width="120" height="40"
            style={{ height: 32, width: "auto", display: "block" }}
          />
        </a>

        {/* desktop nav · invisible sobre el hero, fade-in al pasarlo */}
        <nav
          ref={navRef}
          className="nav-desktop"
          style={{
            display: "flex", alignItems: "center", gap: 4,
            position: "absolute", left: "50%", top: 0, bottom: 0,
            transform: "translateX(-50%)",
            zIndex: 1,
            opacity: pastHero ? 1 : 0,
            pointerEvents: pastHero ? "auto" : "none",
            transition: "opacity 350ms ease-out",
          }}
        >
          {/* indicator pill */}
          <div style={{
            position: "absolute",
            top: 0, bottom: 0, margin: "auto 0",
            height: 40,
            left: pill.left,
            width: pill.width,
            background: "var(--bg-darker)",
            border: "2px solid var(--border)",
            borderBottomWidth: 4,
            borderRadius: "var(--r-md)",
            transition: "left 350ms cubic-bezier(.16,1,.3,1), width 350ms cubic-bezier(.16,1,.3,1), opacity 250ms ease-out",
            opacity: pastHero && activeSection && pill.width > 0 ? 1 : 0,
            zIndex: 0,
            pointerEvents: "none",
          }} />
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              data-section={l.id}
              onClick={(e) => goTo(e, l.href)}
              className="rise"
              style={{
                position: "relative", zIndex: 1,
                padding: "10px 16px",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: activeSection === l.id ? "var(--text-strong)" : "var(--text-muted)",
                transition: "color 200ms ease-out",
                animationDelay: `${100 * (i + 1)}ms`,
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* desktop CTA - siempre visible */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", zIndex: 2 }}>
          <Button variant="primary" size="sm" onClick={(e) => goTo(e, "#pricing")}>
            empezar gratis
          </Button>
        </div>

        {/* mobile menu button - color blanco sobre hero, text-strong después */}
        <button
          className="nav-mobile-only"
          onClick={() => setOpen(true)}
          aria-label="abrir menú"
          style={{
            display: "none", border: "none",
            background: "transparent", padding: 8, cursor: "pointer",
            color: pastHero ? "var(--text-strong)" : "#fff",
            transition: "color 350ms ease-out",
            zIndex: 2,
          }}>
          <Icon.menu />
        </button>
      </div>

      {/* mobile fullscreen drawer */}
      {open && (
        <div role="dialog" aria-modal="true" style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "var(--bg)",
          height: "100dvh",
          display: "flex", flexDirection: "column",
          animation: "itRise 200ms ease-out",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            height: 80, padding: "0 var(--gutter)",
            borderBottom: "1px solid var(--border)", flexShrink: 0,
          }}>
            <a href="#top" onClick={(e) => goTo(e, "#top")} style={{ display: "flex", alignItems: "center" }}>
              <img
                src={isDark ? "itera-logo-dark.png" : "itera-logo-light.png"}
                alt="Itera"
                width="120" height="40"
                style={{ height: 32, width: "auto", display: "block" }}
              />
            </a>
            <button
              onClick={() => setOpen(false)} aria-label="cerrar"
              style={{
                width: 40, height: 40, border: "none", background: "transparent",
                cursor: "pointer", color: "var(--text-strong)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <Icon.x />
            </button>
          </div>
          <div style={{ flex: 1, padding: "24px var(--gutter)", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => goTo(e, l.href)}
                style={{
                  padding: "16px", fontSize: 18, fontWeight: 700,
                  color: activeSection === l.id ? "var(--primary)" : "var(--text-strong)",
                  textTransform: "lowercase",
                  borderRadius: "var(--r-md)",
                  background: activeSection === l.id ? "var(--primary-soft)" : "transparent",
                }}>{l.label}</a>
            ))}
          </div>
          <div style={{
            padding: "24px var(--gutter) max(24px, env(safe-area-inset-bottom))",
            borderTop: "1px solid var(--border)", flexShrink: 0,
          }}>
            <Button variant="primary" size="md" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => goTo(e, "#pricing")}>
              empezar gratis
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

// === HERO ===
// === HERO cinético ===
// hook: typing/cycling de variantes de headline
const useTypingCycle = (variants, options = {}) => {
  const { typeMs = 55, holdMs = 1600, eraseMs = 25 } = options;
  const [idx, setIdx] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState("typing"); // typing | hold | erasing

  React.useEffect(() => {
    let to;
    const target = variants[idx];
    if (phase === "typing") {
      if (text.length < target.length) {
        to = setTimeout(() => setText(target.slice(0, text.length + 1)), typeMs);
      } else {
        to = setTimeout(() => setPhase("hold"), holdMs);
      }
    } else if (phase === "hold") {
      to = setTimeout(() => setPhase("erasing"), 0);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        to = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
      } else {
        setIdx((idx + 1) % variants.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(to);
  }, [text, phase, idx, variants, typeMs, holdMs, eraseMs]);

  return text;
};

// hook: count-up cuando entra en viewport
const useCountUp = (target, opts = {}) => {
  const { duration = 1400, decimals = 0, start = 0 } = opts;
  const [val, setVal] = React.useState(start);
  const ref = React.useRef(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(start + (target - start) * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, start]);

  return [ref, decimals === 0 ? Math.round(val) : val.toFixed(decimals)];
};

const Hero = () => {
  const verb = useTypingCycle(
    ["ejecutando.", "construyendo.", "equivocándote."],
    { typeMs: 55, holdMs: 1500, eraseMs: 28 }
  );

  return (
    <section className="section hero-section" style={{ paddingTop: 56, position: "relative", overflow: "hidden" }}>
      {/* blobs de fondo animados */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none">
          <defs>
            <radialGradient id="heroBlob1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heroBlob2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="80%" cy="20%" rx="280" ry="220" fill="url(#heroBlob1)">
            <animate attributeName="cx" values="80%;72%;80%" dur="11s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="20%;28%;20%" dur="9s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="15%" cy="85%" rx="220" ry="180" fill="url(#heroBlob2)">
            <animate attributeName="cx" values="15%;22%;15%" dur="13s" repeatCount="indefinite"/>
            <animate attributeName="cy" values="85%;78%;85%" dur="10s" repeatCount="indefinite"/>
          </ellipse>
        </svg>
      </div>

      <div className="container hero-grid" style={{
        display: "grid", gap: 48, alignItems: "center", position: "relative", zIndex: 1,
      }}>
        <div>
          <div className="rise d-0" style={{ marginBottom: 20 }}>
            <Tag variant="primary">
              <Icon.bolt style={{ width: 14, height: 14 }} />
              100 lecciones · 10 secciones · cero teoría inflada
            </Tag>
          </div>
          <Display className="rise d-1" style={{ minHeight: "3.4em", fontSize: "clamp(48px, 9vw, 96px)" }}>
            <span style={{ display: "block" }}>aprende <span style={{ textTransform: "none" }}>IA</span></span>
            <span style={{ display: "block", color: "var(--primary)" }}>
              {verb}
              <span style={{
                display: "inline", color: "var(--primary)", fontWeight: 700,
                animation: "caret 1s steps(2) infinite", marginLeft: "0.04em",
              }}>_</span>
            </span>
            <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.55em", fontWeight: 700, marginTop: "0.1em" }}>no estudiando</span>
          </Display>
          <BodyLg className="rise d-2" style={{ marginTop: 24, maxWidth: 560 }}>
            100 lecciones interactivas para aplicar IA en tu trabajo. Ejercicios cortos donde modificas archivos reales, automatizas procesos y ejecutas con tu propia IA. Terminas ejecutando, no estudiando.
          </BodyLg>
          <div className="rise d-3" style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button variant="primary" size="lg">
              empezar gratis
              <Icon.arrow />
            </Button>
            <Button variant="ghost" size="lg">
              <Icon.play />
              ver demo (30 seg)
            </Button>
          </div>

          {/* live stats strip */}
          <HeroLiveStats />

          <div className="rise d-4" style={{
            marginTop: 20, display: "flex", alignItems: "center", gap: 10,
            color: "var(--text-muted)", fontSize: 13,
          }}>
            <Icon.check style={{ color: "var(--accent-dark)", width: 16, height: 16 }} />
            <span className="lower">primeras 20 lecciones gratis · sin tarjeta</span>
          </div>
        </div>
        <div className="rise d-2">
          <HeroScene />
        </div>
      </div>
    </section>
  );
};

// stats con count-up + barras que se llenan
const HeroLiveStats = () => {
  const [r1, v1] = useCountUp(100, { duration: 1800 });
  const [r2, v2] = useCountUp(10, { duration: 1600 });
  const [r3, v3] = useCountUp(10, { duration: 1400 });

  return (
    <div className="rise d-4" style={{
      marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 14, padding: 18,
      background: "var(--bg)",
      border: "2px solid var(--text-strong)",
      borderBottom: "5px solid var(--text-strong)",
      borderRadius: 14,
    }}>
      <Stat ref={r1} value={v1} label="lecciones interactivas" pct={100} color="var(--primary)" />
      <Stat ref={r2} value={v2} label="secciones del catálogo" pct={100} color="var(--accent-dark)" />
      <Stat ref={r3} value={`${v3} min`} label="por lección" pct={50} color="#7c3aed" inverted />
    </div>
  );
};

const Stat = React.forwardRef(({ value, label, pct, color, inverted }, ref) => (
  <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{
      fontFamily: "var(--font-heading)", fontWeight: 800,
      fontSize: 26, lineHeight: 1, color: "var(--text-strong)",
      letterSpacing: "-0.02em", textTransform: "lowercase",
    }}>{value}</div>
    <Caption style={{ fontSize: 11, lineHeight: 1.3 }}>{label}</Caption>
    <div style={{ height: 5, background: "var(--bg-darker)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{
        height: "100%", width: `${pct}%`, background: color,
        transition: "width 1.4s cubic-bezier(.16,1,.3,1) 200ms",
      }} />
    </div>
  </div>
));

// escena cinética: mock device con código que se escribe + mascota observando
const HeroScene = () => {
  const [step, setStep] = React.useState(0); // 0 typing, 1 ran, 2 success
  const codeLines = [
    { t: "function pedirA(modelo, idea) {", c: "var(--text-muted)" },
    { t: "  return `${modelo}: dame ${idea}, paso a paso`;", c: "var(--text-strong)" },
    { t: "}", c: "var(--text-muted)" },
    { t: "", c: "" },
    { t: "pedirA('claude', 'un plan de marketing');", c: "var(--primary-dark)" },
  ];
  const [typed, setTyped] = React.useState(0);

  React.useEffect(() => {
    const totalChars = codeLines.reduce((a, l) => a + l.t.length + 1, 0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= totalChars) {
        clearInterval(id);
        setTimeout(() => setStep(1), 400);
        setTimeout(() => setStep(2), 900);
        setTimeout(() => { setTyped(0); setStep(0); }, 5500);
      }
    }, 38);
    return () => clearInterval(id);
  }, [step === 0 && typed === 0 ? Date.now() : null]); // restart loop

  // mood mascota según step
  const mood = step === 0 ? "default" : step === 1 ? "focused" : "win";

  // ojos siguen al cursor
  const [eyeXY, setEyeXY] = React.useState({ x: 0, y: 0 });
  const wrapRef = React.useRef(null);
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

  // chars typed → render líneas progresivamente
  const renderLines = () => {
    let remaining = typed;
    return codeLines.map((line, i) => {
      const visible = Math.min(line.t.length, Math.max(0, remaining));
      remaining -= visible + 1; // +1 por el \n
      return (
        <div key={i} style={{ display: "flex", gap: 12, fontFamily: "ui-monospace, SF Mono, Menlo, monospace", fontSize: 12.5, lineHeight: 1.7 }}>
          <span style={{ color: "var(--text-muted)", width: 18, flexShrink: 0, textAlign: "right", userSelect: "none" }}>{i + 1}</span>
          <span style={{ color: line.c, whiteSpace: "pre" }}>
            {line.t.slice(0, visible)}
            {visible > 0 && visible < line.t.length && (
              <span style={{ display: "inline-block", width: 6, height: 12, background: "var(--primary)", verticalAlign: "-2px", animation: "caret 1s steps(2) infinite" }} />
            )}
          </span>
        </div>
      );
    });
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", maxWidth: 540, margin: "0 auto" }}>
      {/* mock device / IDE */}
      <div style={{
        background: "var(--bg)", border: "2px solid var(--text-strong)",
        borderBottom: "6px solid var(--text-strong)", borderRadius: 16,
        boxShadow: "0 20px 0 -12px rgba(10,22,40,0.08)",
        overflow: "hidden", position: "relative", zIndex: 1,
      }}>
        {/* tab bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderBottom: "1.5px solid var(--border)",
          background: "var(--bg-soft)",
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#ef4444", border: "1.5px solid #0a1628" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#fbbf24", border: "1.5px solid #0a1628" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#22c55e", border: "1.5px solid #0a1628" }} />
          <div style={{
            marginLeft: 12, padding: "3px 10px",
            background: "var(--bg)", border: "1.5px solid var(--border)",
            borderRadius: 6, fontSize: 11, fontFamily: "ui-monospace, monospace", color: "var(--text-muted)",
          }}>lección 03 · prompt.js</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center", fontSize: 11, color: "var(--text-muted)", fontFamily: "ui-monospace, monospace" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: step >= 1 ? "var(--accent)" : "var(--primary)" }} />
            {step === 0 ? "editing" : step === 1 ? "running" : "passed"}
          </div>
        </div>

        {/* code area */}
        <div style={{ padding: "16px 14px", background: "#0a1628", color: "#e6edf3" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {codeLines.map((line, i) => {
              let charsBefore = 0;
              for (let j = 0; j < i; j++) charsBefore += codeLines[j].t.length + 1;
              const visible = Math.min(line.t.length, Math.max(0, typed - charsBefore));
              const isTyping = visible > 0 && visible < line.t.length;
              const isDone = visible === line.t.length;

              return (
                <div key={i} style={{ display: "flex", gap: 12, fontFamily: "ui-monospace, SF Mono, Menlo, monospace", fontSize: 13, lineHeight: 1.75, minHeight: "1.75em" }}>
                  <span style={{ color: "#5d6b7e", width: 18, flexShrink: 0, textAlign: "right", userSelect: "none" }}>{i + 1}</span>
                  <span style={{ whiteSpace: "pre", color: i === 1 ? "#7dd3fc" : i === 4 ? "#fcd34d" : "#cdd9e5" }}>
                    {line.t.slice(0, visible)}
                    {isTyping && (
                      <span style={{ display: "inline-block", width: 7, height: 14, background: "#7dd3fc", verticalAlign: "-2px" }} />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* output panel */}
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: "1px dashed #334155",
            display: "flex", alignItems: "center", gap: 10, minHeight: 28,
          }}>
            <span style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "#5d6b7e", textTransform: "uppercase", letterSpacing: "0.1em" }}>output</span>
            {step === 0 && <span style={{ fontSize: 12, color: "#5d6b7e", fontFamily: "ui-monospace, monospace" }}>—</span>}
            {step === 1 && <span style={{ fontSize: 12, color: "#fbbf24", fontFamily: "ui-monospace, monospace" }}>ejecutando…</span>}
            {step === 2 && (
              <span style={{
                fontSize: 12, color: "#22c55e", fontFamily: "ui-monospace, monospace",
                animation: "fadeIn 280ms ease-out",
              }}>{'"prompt enviado a claude"'} ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* mascota expresiva flotando arriba-derecha */}
      <div style={{
        position: "absolute", top: -36, right: -18, zIndex: 2,
        animation: "heroBob 4.8s ease-in-out infinite",
      }}>
        <MascotaExpressive size={108} mood={mood} eyeXY={eyeXY} />
      </div>

      {/* badge "passed" arriba-izq cuando step=2 */}
      <div style={{
        position: "absolute", top: -18, left: -14, zIndex: 2,
        background: "var(--accent)", color: "#052e16",
        border: "2px solid var(--accent-dark)", borderBottom: "5px solid var(--accent-dark)",
        padding: "8px 12px", borderRadius: 12,
        fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 13,
        textTransform: "lowercase",
        transform: `rotate(-4deg) scale(${step === 2 ? 1 : 0})`,
        opacity: step === 2 ? 1 : 0,
        transition: "transform 320ms cubic-bezier(.34,1.56,.64,1), opacity 200ms",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <Icon.check style={{ color: "#052e16", width: 14, height: 14 }} />
        +1 lección
      </div>

      {/* chip flotante: streak */}
      <div className="floatA" style={{
        position: "absolute", bottom: -44, left: -14, zIndex: 2,
      }}>
        <ExerciseChip label="racha · 7 días" status="done" />
      </div>

      {/* chip flotante: progreso */}
      <div className="floatB" style={{
        position: "absolute", bottom: -56, right: -32, zIndex: 2,
      }}>
        <div style={{
          display: "inline-flex", flexDirection: "column", gap: 6,
          background: "var(--bg)", border: "2px solid var(--text-strong)",
          borderBottom: "5px solid var(--text-strong)",
          padding: "9px 12px", borderRadius: 12, minWidth: 160,
        }}>
          <div style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>tu ruta</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16, color: "var(--text-strong)", textTransform: "lowercase", lineHeight: 1 }}>03 / 100</div>
          <div style={{ height: 5, background: "var(--bg-darker)", border: "1px solid var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "3%", background: "var(--primary)" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// mascota con expresiones según mood
const MascotaExpressive = ({ size = 120, mood = "default", eyeXY = { x: 0, y: 0 } }) => (
  <svg viewBox="0 0 240 240" width={size} height={size} style={{ filter: "drop-shadow(0 6px 0 rgba(10,22,40,0.18))" }}>
    <rect x="32" y="44" width="176" height="176" rx="44" fill="var(--primary-dark)" />
    <rect x="32" y="32" width="176" height="176" rx="44" fill="var(--primary)" stroke="#0a1628" strokeWidth="3" />
    <path d="M48 60 Q48 44 64 44 L176 44 Q192 44 192 60 L192 78"
          stroke="rgba(255,255,255,0.35)" strokeWidth="6" strokeLinecap="round" fill="none" />

    {/* ojos: cambian forma según mood */}
    <g style={{ transform: `translate(${eyeXY.x}px, ${eyeXY.y}px)`, transition: "transform 80ms ease-out" }}>
      {mood === "focused" ? (
        // ojos entrecerrados (focused/concentrado)
        <>
          <rect x="82" y="116" width="28" height="6" rx="3" fill="#0a1628" />
          <rect x="146" y="116" width="28" height="6" rx="3" fill="#0a1628" />
        </>
      ) : mood === "win" ? (
        // ojos felices ( ^ ^ )
        <>
          <path d="M80 122 Q96 108 112 122" stroke="#0a1628" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M144 122 Q160 108 176 122" stroke="#0a1628" strokeWidth="6" strokeLinecap="round" fill="none" />
        </>
      ) : (
        // default
        <>
          <circle cx="96" cy="118" r="13" fill="#0a1628" />
          <circle cx="100" cy="114" r="4" fill="#fff" />
          <circle cx="160" cy="118" r="13" fill="#0a1628" />
          <circle cx="164" cy="114" r="4" fill="#fff" />
        </>
      )}
    </g>

    {/* boca */}
    {mood === "default" && (
      <path d="M108 156 Q128 168 148 156" stroke="#0a1628" strokeWidth="5" strokeLinecap="round" fill="none" />
    )}
    {mood === "focused" && (
      <rect x="116" y="158" width="24" height="5" rx="2.5" fill="#0a1628" />
    )}
    {mood === "win" && (
      <path d="M100 152 Q128 184 156 152 Q140 174 128 174 Q116 174 100 152 Z" fill="#0a1628" />
    )}

    {/* destellito accent (siempre) */}
    <g transform="translate(190 38)">
      <path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="var(--accent)" stroke="#0a1628" strokeWidth="2">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
      </path>
    </g>

    {/* sparkles extra cuando win */}
    {mood === "win" && (
      <>
        <g transform="translate(50 60)" style={{ animation: "twinkle 1.2s ease-in-out infinite" }}>
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="var(--accent)" stroke="#0a1628" strokeWidth="1.5" />
        </g>
        <g transform="translate(200 200)" style={{ animation: "twinkle 1.2s ease-in-out 0.4s infinite" }}>
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#fbbf24" stroke="#0a1628" strokeWidth="1.5" />
        </g>
      </>
    )}
  </svg>
);

// === PROBLEMA · split asimétrico (1 stat hero + 2 stack lateral) ===
const Problema = () => {
  const [r1, v1] = useCountUp(13, { duration: 1800 });
  const [r2, v2] = useCountUp(40, { duration: 1500 });
  const [r3, v3] = useCountUp(70, { duration: 2000 });
  return (
  <section className="section" style={{ background: "var(--bg-soft)" }}>
    <div className="container">
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <Headline>el problema</Headline>
        <Title style={{ marginTop: 12 }}>
          <span style={{ display: "block" }}>ya viste 5 cursos de <span style={{ textTransform: "none" }}>IA</span></span>
          <span style={{ display: "block" }}>terminaste 0</span>
          <span style={{ display: "block" }}>tu trabajo sigue igual</span>
        </Title>
      </div>
      <div className="problema-asym" style={{ display: "grid", gap: 20 }}>
        {/* hero stat */}
        <div ref={r1} className="card" style={{
          background: "var(--primary)", color: "#fff",
          borderColor: "var(--primary-dark)",
          cursor: "default",
          padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between",
          minHeight: 320,
        }}>
          <Tag variant="neutral" style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
            stat principal
          </Tag>
          <div>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 800,
              fontSize: "clamp(80px, 12vw, 160px)", lineHeight: 0.9,
              color: "#fff", letterSpacing: "-0.04em", textTransform: "lowercase",
            }}>{v1}%</div>
            <Body style={{ color: "#cfe1ff", marginTop: 16, fontSize: 18, maxWidth: 380 }}>
              Tasa de finalización promedio en cursos online de IA. La mayoría abandona antes del 20%.
            </Body>
            <Caption style={{ color: "rgba(255,255,255,0.6)", display: "block", marginTop: 12 }}>Fuente: HarvardX/MITx HEPN study (2019), n=565k usuarios.</Caption>
          </div>
        </div>
        {/* stack lateral */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card variant="neutral" style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
            <div ref={r2} style={{
              fontFamily: "var(--font-heading)", fontWeight: 800,
              fontSize: 64, lineHeight: 1, color: "var(--primary)",
              letterSpacing: "-0.03em", flexShrink: 0,
            }}>{v2}+</div>
            <div>
              <Body style={{ color: "var(--text-strong)", fontWeight: 600 }}>Horas de contenido pasivo por curso de IA</Body>
              <Caption style={{ display: "block", marginTop: 6 }}>Promedio en specializations de Coursera, edX, Udemy</Caption>
            </div>
          </Card>
          <Card variant="neutral" style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
            <div ref={r3} style={{
              fontFamily: "var(--font-heading)", fontWeight: 800,
              fontSize: 64, lineHeight: 1, color: "var(--accent-dark)",
              letterSpacing: "-0.03em", flexShrink: 0,
            }}>{v3}%</div>
            <div>
              <Body style={{ color: "var(--text-strong)", fontWeight: 600 }}>De capacitaciones corporativas no se aplican al trabajo</Body>
              <Caption style={{ display: "block", marginTop: 6 }}>Brinkerhoff, training transfer research</Caption>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </section>
  );
};

// === CÓMO FUNCIONA · timeline horizontal con flechas conectoras ===
const Como = () => (
  <section id="como" className="section">
    <div className="container">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
        <div>
          <Headline>cómo funciona itera</Headline>
          <Title style={{ marginTop: 12, maxWidth: 600 }}>
            tres pasos · cero teoría inflada
          </Title>
        </div>
        <Caption style={{ maxWidth: 280 }}>Tiempo al primer ejercicio aplicado: ≈12 minutos desde signup</Caption>
      </div>

      <div className="como-timeline" style={{
        display: "grid",
        gap: 20,
        gridTemplateColumns: "1fr",
        alignItems: "stretch",
        position: "relative",
      }}>
        {[
          {
            n: "01", title: "cuestionario calibrado", time: "2 min",
            body: "Ocho preguntas que ajustan dificultad, ritmo y para qué quieres usar IA. Sin encuesta de 40 campos.",
            visual: <StepVisual kind="quiz" />,
          },
          {
            n: "02", title: "ruta personalizada", time: "100 lecciones",
            body: "El orden se reordena según lo que ya sabes y lo que necesitas aplicar. Nada de empezar por qué es un LLM si eso ya lo dominas.",
            visual: <StepVisual kind="path" />,
          },
          {
            n: "03", title: "ejercicios cortos", time: "≈10 min c/u",
            body: "Ejecutas, no miras. Cada lección termina con un prompt probado, una automatización corriendo o una integración funcionando.",
            visual: <StepVisual kind="exercise" />,
          },
        ].map((step, i, arr) => (
          <React.Fragment key={i}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* numeral grande arriba a la izquierda */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{
                  fontFamily: "var(--font-heading)", fontWeight: 800,
                  fontSize: 88, lineHeight: 0.85, color: "var(--primary)",
                  letterSpacing: "-0.04em",
                }}>{step.n}</span>
                <Tag variant="primary">{step.time}</Tag>
              </div>
              <Card variant={i === 1 ? "primary" : "neutral"} style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                <div>
                  <Title as="h3" style={{ fontSize: 22 }}>{step.title}</Title>
                  <Body style={{ marginTop: 8, fontSize: 14 }}>{step.body}</Body>
                </div>
                <div style={{ marginTop: "auto", paddingTop: 8 }}>{step.visual}</div>
              </Card>
            </div>
            {i < arr.length - 1 && (
              <div className="como-arrow" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary)",
              }}>
                <Icon.arrow style={{ width: 36, height: 36, strokeWidth: 2 }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

// === COMPARATIVA ===
const Compare = () => {
  const rows = [
    ["formato",          "ejercicio interactivo",  "contenido pasivo"],
    ["duración por unidad", "≈10 min",                 "≈1 h"],
    ["output al terminar",  <><span style={{ textTransform: "none" }}>IA</span> aplicada a tu trabajo</>, "certificado pdf"],
    ["dificultad",          "ajustada al perfil",      "fija para todos"],
    ["actualización",       "lecciones nuevas cada modelo", "estática"],
    ["soporte de pares",    "comunidad por caso real",  "foros generales"],
  ];
  return (
    <section id="vs" className="section" style={{ background: "var(--bg-soft)" }}>
      <div className="container">
        <div style={{ marginBottom: 48, maxWidth: 720 }}>
          <Headline>comparativa</Headline>
          <Title style={{ marginTop: 12 }}>itera vs cursos, universidades y capacitaciones</Title>
          <Body style={{ marginTop: 16 }}>
            No comparamos por marketing — comparamos por formato. Cursos, universidades y capacitaciones (Udemy, Coursera, Platzi, Masterclass, programas universitarios, capacitaciones corporativas) optimizan consumo pasivo. Nosotros optimizamos ejecución.
          </Body>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="vs-grid" style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr",
          }}>
            {/* header */}
            <div style={{ padding: 20, background: "#fff", borderBottom: "2px solid var(--text-strong)" }}>
              <Caption className="upper" style={{ fontWeight: 700 }}>eje</Caption>
            </div>
            <div style={{ padding: 20, background: "var(--primary)", color: "#fff", borderBottom: "2px solid var(--text-strong)", borderLeft: "2px solid var(--text-strong)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, textTransform: "lowercase" }}>itera</span>
            </div>
            <div style={{ padding: 20, background: "#fff", borderBottom: "2px solid var(--text-strong)", borderLeft: "2px solid var(--text-strong)" }}>
              <Caption className="upper" style={{ fontWeight: 700 }}>cursos · universidades · capacitaciones</Caption>
            </div>
            {/* rows */}
            {rows.map(([eje, a, b], i) => (
              <React.Fragment key={i}>
                <div style={{ padding: 18, borderBottom: i === rows.length - 1 ? 0 : "1px solid var(--border)", fontWeight: 600, color: "var(--text-strong)", fontSize: 14, textTransform: "lowercase" }}>{eje}</div>
                <div style={{
                  padding: 18, borderBottom: i === rows.length - 1 ? 0 : "1px solid var(--border)",
                  borderLeft: "2px solid var(--text-strong)",
                  background: "var(--primary-soft)",
                  display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#0a1628",
                }}>
                  <Icon.check style={{ color: "var(--accent-dark)", flexShrink: 0 }} />
                  <span className="lower">{a}</span>
                </div>
                <div style={{
                  padding: 18, borderBottom: i === rows.length - 1 ? 0 : "1px solid var(--border)",
                  borderLeft: "2px solid var(--text-strong)",
                  display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 14,
                }}>
                  <Icon.x style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <span className="lower">{b}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// === HERO DEMO · video bg + título manifesto + CTA ===
const HeroDemo = () => {
  const videoRef = React.useRef(null);
  const [isDark, setIsDark] = React.useState(false);

  // detecta dark mode (system + override por [data-theme] en el root)
  React.useEffect(() => {
    const compute = () => {
      const themeAttr = document.documentElement.getAttribute("data-theme");
      if (themeAttr === "light") return setIsDark(false);
      if (themeAttr === "dark") return setIsDark(true);
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    compute();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => compute();
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else mq.addListener(onMq);
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onMq);
      else mq.removeListener(onMq);
      observer.disconnect();
    };
  }, []);

  // pausar el video cuando NO está visible (libera CPU/decode)
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }),
      { threshold: 0.1 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // respetar prefers-reduced-motion: ni siquiera reproducir
  const reduced = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // light: playa diurna · dark: campamento estrellado
  const videoSrc = isDark ? "hero-video-dark-mode.mp4?v=7" : "hero-video-light-mode.mp4?v=7";

  return (
  <section className="section hero-demo-section" style={{
    position: "relative",
    overflow: "hidden",
    background: isDark ? "#0a1628" : "#7ec9e0",
    color: "#fff",
  }}>
    {/* video de fondo · cambia de fuente al cambiar theme (key fuerza remount) */}
    <video
      key={isDark ? "dark" : "light"}
      ref={videoRef}
      autoPlay={!reduced}
      muted
      loop
      playsInline
      preload="metadata"
      poster="hero-poster.jpg?v=4"
      disablePictureInPicture
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
      }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>

    {/* tinte sutil sobre el video para legibilidad del texto */}
    <div aria-hidden="true" style={{
      position: "absolute",
      inset: 0,
      background: "rgba(10, 22, 40, 0.35)",
      zIndex: 1,
      pointerEvents: "none",
    }} />

    {/* degradado vertical en el último cuarto · adaptativo al color de la sección siguiente */}
    <div aria-hidden="true" style={{
      position: "absolute",
      bottom: 0, left: 0, right: 0,
      height: "25%",
      background: "linear-gradient(to bottom, rgba(var(--bg-rgb), 0) 0%, rgba(var(--bg-rgb), 1) 100%)",
      zIndex: 2,
      pointerEvents: "none",
    }} />

    {/* contenido encima */}
    <div className="container" style={{ position: "relative", zIndex: 3, textAlign: "center" }}>
      <h1 className="it-display rise d-1" style={{
        color: "#fff",
        fontSize: "clamp(48px, 9vw, 96px)",
        margin: "0 auto",
        maxWidth: 1100,
        textShadow: "0 2px 16px rgba(0, 0, 0, 0.28), 0 12px 56px rgba(0, 0, 0, 0.2)",
      }}>
        <span style={{ display: "block" }}><span style={{ textTransform: "none" }}>IA</span> para liberarte,</span>
        <span style={{ display: "block" }}>no reemplazarte</span>
      </h1>
      <BodyLg className="rise d-2" style={{
        color: "#e6edf3",
        maxWidth: 720,
        margin: "24px auto 0",
        fontSize: 20,
        textShadow: "0 1px 12px rgba(0, 0, 0, 0.28), 0 6px 36px rgba(0, 0, 0, 0.2)",
      }}>
        Aprende hoy <strong style={{ fontWeight: 700, color: "#fff" }}>Inteligencia Artificial</strong> y retoma<br />
        el control de tu trabajo, tus finanzas y tu vida.
      </BodyLg>
      {/* tres CTAs intent-driven · liquid glass sobre el video
          (blur + saturate alto, inset highlight superior, sombra exterior sutil) */}
      <div
        className="rise d-3"
        style={{
          marginTop: 40,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {[
          "aprender ia desde cero",
          "construir mi proyecto",
          "aplicar ia en mi trabajo",
        ].map((label) => (
          <Button
            key={label}
            variant="outline"
            size="lg"
            style={{
              background: "rgba(255, 255, 255, 0.18)",
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.35)",
              borderBottomColor: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 24px rgba(0, 0, 0, 0.18)",
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  </section>
  );
};

Object.assign(window, { Nav, HeroDemo, Hero, Problema, Como, Compare });
