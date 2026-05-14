// landing sections — itera (parte 2: testimonios, pricing, faq, cta cierre, footer)

const Testimonios = () => {
  const items = [
    {
      quote: "automaticé mis reportes con n8n + claude. recuperé 6 horas a la semana.",
      name: "[nombre real pendiente]",
      project: "marketing · pyme",
      avatar: "f1",
      featured: true,
      stat: "6 hs",
      statLabel: "por semana recuperadas",
    },
    {
      quote: "aprendí mcp y skills en 4 semanas. claude ahora trabaja con mis bases de datos.",
      name: "[nombre real pendiente]",
      project: "ops · agencia",
      avatar: "f2",
    },
    {
      quote: "venía de 3 cursos de IA abandonados. itera fue el primero que sí terminé y apliqué.",
      name: "[nombre real pendiente]",
      project: "founder · saas",
      avatar: "f3",
    },
  ];
  const Avatar = ({ kind, size = 48 }) => {
    const palettes = {
      f1: ["#1472FF", "#22c55e"],
      f2: ["#0E5FCC", "#fbbf24"],
      f3: ["#22c55e", "#1472FF"],
    }[kind];
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block", flexShrink: 0 }}>
        <rect width="48" height="48" rx="12" fill={palettes[0]} stroke="#0a1628" strokeWidth="2" />
        <circle cx="24" cy="24" r="10" fill={palettes[1]} stroke="#0a1628" strokeWidth="2" />
      </svg>
    );
  };
  const featured = items[0];
  const others = items.slice(1);
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
          <div style={{ maxWidth: 640 }}>
            <Headline>resultados reales</Headline>
            <Title style={{ marginTop: 12 }}><span style={{ textTransform: "none" }}>IA</span> aplicada al trabajo, no certificados</Title>
          </div>
          <Caption>Cada testimonio enlaza al caso real cuando esté publicado</Caption>
        </div>
        {/* bento asimétrico: 1 destacado grande + 2 chicos apilados */}
        <div className="testimonios-bento" style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr" }}>
          <Card variant="primary" style={{ display: "flex", flexDirection: "column", gap: 24, padding: 36 }}>
            <Tag variant="success"><Icon.spark style={{ width: 12, height: 12 }} />destacado</Tag>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 800,
              fontSize: "clamp(28px, 3.6vw, 44px)", lineHeight: 1.05,
              color: "var(--text-strong)", letterSpacing: "-0.025em",
              textTransform: "lowercase", textWrap: "balance",
            }}>"{featured.quote}"</div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20, marginTop: "auto", paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar kind={featured.avatar} size={56} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }} className="lower">{featured.name}</div>
                  <Caption style={{ display: "block" }}>{featured.project}</Caption>
                </div>
              </div>
              <div style={{
                background: "var(--accent)", color: "#052e16",
                border: "2px solid var(--accent-dark)", borderBottom: "5px solid var(--accent-dark)",
                padding: "10px 18px", borderRadius: 12, textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>{featured.stat}</div>
                <Caption style={{ color: "#052e16", fontWeight: 600 }}>{featured.statLabel}</Caption>
              </div>
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {others.map((t, i) => (
              <Card key={i} variant="neutral" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Body style={{ color: "var(--text-strong)", fontWeight: 500, fontSize: 15 }}>"{t.quote}"</Body>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 12 }}>
                  <Avatar kind={t.avatar} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }} className="lower">{t.name}</div>
                    <Caption style={{ display: "block" }}>{t.project}</Caption>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const features = [
    { label: "lecciones interactivas", gratis: "primeras 20 + fundamentos", pro: "las 100 completas", empresas: "todo de pro + privadas" },
    { label: "ruta personalizada", gratis: true, pro: true, empresas: true },
    { label: "ejercicios con tu propia IA", gratis: false, pro: true, empresas: true },
    { label: "lecciones nuevas (cada modelo nuevo)", gratis: false, pro: true, empresas: true },
    { label: "soporte", gratis: "comunidad", pro: "prioritario · ≤24h", empresas: "dedicado" },
    { label: "rutas privadas para tu equipo", gratis: false, pro: false, empresas: true },
    { label: "dashboard de finalización", gratis: false, pro: false, empresas: true },
    { label: "sso + factura anual", gratis: false, pro: false, empresas: true },
  ];
  const Cell = ({ v, highlight }) => {
    if (v === true) return <Icon.check style={{ color: highlight ? "var(--accent-dark)" : "var(--accent-dark)", margin: "0 auto", display: "block" }} />;
    if (v === false) return <span style={{ color: "var(--text-muted)", display: "block", textAlign: "center" }}>—</span>;
    return <span style={{ fontSize: 14, color: "var(--text-strong)", fontWeight: highlight ? 700 : 500 }} className="lower">{v}</span>;
  };
  return (
    <section id="pricing" className="section" style={{ background: "var(--bg-soft)" }}>
      <div className="container">
        <div style={{ marginBottom: 48, maxWidth: 720 }}>
          <Headline>pricing</Headline>
          <Title style={{ marginTop: 12 }}>precios honestos · en usd · sin asteriscos</Title>
          <Body style={{ marginTop: 14 }}>Cobramos por mes o por año. Cancelas cuando quieras. Siempre en USD vía Stripe.</Body>
        </div>
        <div className="card pricing-table" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr 1fr", minWidth: 760 }} className="pricing-grid">
            {/* header row */}
            <div style={{ padding: 24, background: "#fff", borderBottom: "2px solid var(--text-strong)" }}>
              <Caption className="upper" style={{ fontWeight: 700, color: "var(--text-strong)" }}>plan</Caption>
            </div>
            {[
              { name: "gratis", price: "$0", cad: "para siempre", hl: false, bg: "#fff" },
              { name: "pro", price: "$19", cad: "usd / mes", hl: true, bg: "var(--primary-soft)" },
              { name: "empresas", price: "custom", cad: "según equipo", hl: false, bg: "#fff" },
            ].map((p, i) => (
              <div key={i} style={{
                padding: 24, background: p.bg, borderBottom: "2px solid var(--text-strong)",
                borderLeft: "1px solid var(--border)", position: "relative",
              }}>
                {p.hl && (
                  <span style={{ position: "absolute", top: 12, right: 12 }}>
                    <Tag variant="success"><Icon.spark style={{ width: 12, height: 12 }} />popular</Tag>
                  </span>
                )}
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, color: "var(--text-strong)", textTransform: "lowercase", letterSpacing: "-0.025em", lineHeight: 1 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 6, rowGap: 2, marginTop: 10 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 36, lineHeight: 1, color: p.hl ? "var(--primary-dark)" : "var(--text-strong)", letterSpacing: "-0.03em" }} className="lower">{p.price}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }} className="lower">{p.cad}</span>
                </div>
              </div>
            ))}
            {/* feature rows */}
            {features.map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: "16px 24px", borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)", fontSize: 14, fontWeight: 500, color: "var(--text-main)" }} className="lower">{row.label}</div>
                <div style={{ padding: "16px 18px", borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)", borderLeft: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Cell v={row.gratis} />
                </div>
                <div style={{ padding: "16px 18px", borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)", borderLeft: "1px solid var(--border)", background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Cell v={row.pro} highlight />
                </div>
                <div style={{ padding: "16px 18px", borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)", borderLeft: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Cell v={row.empresas} />
                </div>
              </React.Fragment>
            ))}
            {/* CTA row */}
            <div style={{ padding: 20, borderTop: "2px solid var(--text-strong)", background: "var(--bg-soft)" }} />
            <div style={{ padding: 16, borderTop: "2px solid var(--text-strong)", borderLeft: "1px solid var(--border)", background: "#fff" }}>
              <Button variant="outline" size="md" style={{ width: "100%" }}>empezar gratis</Button>
            </div>
            <div style={{ padding: 16, borderTop: "2px solid var(--text-strong)", borderLeft: "1px solid var(--border)", background: "var(--primary-soft)" }}>
              <Button variant="primary" size="md" style={{ width: "100%" }}>comenzar pro</Button>
            </div>
            <div style={{ padding: 16, borderTop: "2px solid var(--text-strong)", borderLeft: "1px solid var(--border)", background: "#fff" }}>
              <Button variant="outline" size="md" style={{ width: "100%" }}>agendar demo</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// === EMPRESAS ===
const Empresas = () => {
  const useCases = [
    {
      icon: "users",
      title: "onboarding al stack IA para nuevos contratos",
      desc: "rutas con tus modelos, tus procesos y tus datos. de 6 semanas a 2.",
    },
    {
      icon: "rocket",
      title: "upskill de equipos no técnicos en IA",
      desc: "marketing, ops y ventas aprenden a aplicar IA en su día. dejan de adivinar qué se puede automatizar.",
    },
    {
      icon: "shield",
      title: "academia interna de IA",
      desc: "tu academia IA, sin construirla desde cero. métricas de finalización, no de inscripción.",
    },
  ];
  const logos = ["mercadolibre", "rappi", "platzi", "factus", "nubank", "kavak", "globant", "bitso"];
  return (
    <section id="empresas" className="section" style={{
      background: "#0a1628", color: "#fff",
      position: "relative", overflow: "hidden",
    }}>
      {/* grid sutil de fondo */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48, alignItems: "end", marginBottom: 48 }}>
          <div style={{ maxWidth: 720 }}>
            <span className="it-headline" style={{ color: "var(--accent)" }}>para empresas</span>
            <h2 className="it-title" style={{ marginTop: 12, color: "#fff" }}>
              tu equipo aprende <span style={{ textTransform: "none" }}>IA</span> aplicándola a lo que ya hacen
            </h2>
            <BodyLg style={{ color: "#cbd5e1", marginTop: 18, maxWidth: 600 }}>
              Rutas privadas con tu stack, tus procesos y tus casos reales. Métricas de finalización, no de inscripción. Factura local en LATAM.
            </BodyLg>
          </div>
        </div>

        {/* stat row impacto */}
        <div style={{
          display: "grid", gap: 0, gridTemplateColumns: "repeat(3, 1fr)",
          background: "rgba(255,255,255,0.04)",
          border: "2px solid rgba(255,255,255,0.18)", borderRadius: 16,
          marginBottom: 56, overflow: "hidden",
        }} className="empresas-stats">
          {[
            { v: "−60%", l: "tiempo de onboarding al stack IA", c: "var(--accent)" },
            { v: "94%", l: "completion rate (vs. 13% en cursos y capacitaciones tradicionales)", c: "var(--primary)" },
            { v: "100%", l: "rutas custom por industria + stack", c: "#fbbf24" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "28px 24px",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : 0,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{
                fontFamily: "var(--font-heading)", fontWeight: 800,
                fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1, color: s.c,
                letterSpacing: "-0.03em", textTransform: "lowercase",
              }}>{s.v}</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.4, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* casos de uso */}
        <div style={{
          display: "grid", gap: 20, gridTemplateColumns: "1fr",
          marginBottom: 48,
        }} className="empresas-cases">
          {useCases.map((u, i) => {
            const IconC = Icon[u.icon];
            return (
            <div key={i} style={{
              padding: 28,
              background: "rgba(255,255,255,0.03)",
              border: "2px solid rgba(255,255,255,0.18)",
              borderBottom: "5px solid rgba(255,255,255,0.28)",
              borderRadius: 14,
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--primary)", border: "2px solid var(--primary-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}>
                <IconC style={{ width: 22, height: 22 }} />
              </div>
              <div style={{
                fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 19,
                color: "#fff", letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>{u.title}</div>
              <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.55 }}>{u.desc}</div>
            </div>
            );
          })}
        </div>

        {/* logos en marquee */}
        <div style={{ marginBottom: 40 }}>
          <Caption style={{ color: "#94a3b8", display: "block", marginBottom: 16, textAlign: "center" }}>equipos en latam que están en pilot con itera (placeholder · nombres reales por confirmar)</Caption>
          <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)" }}>
            <div style={{ display: "flex", gap: 48, animation: "marquee 26s linear infinite", width: "max-content" }}>
              {[...logos, ...logos].map((l, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-heading)", fontWeight: 800,
                  fontSize: 22, color: "rgba(255,255,255,0.45)",
                  textTransform: "lowercase", letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12,
          padding: 32,
          background: "rgba(255,255,255,0.04)",
          border: "2px solid rgba(255,255,255,0.18)", borderRadius: 16,
          alignItems: "center",
        }}>
          <div style={{ flex: "1 1 320px", minWidth: 260 }}>
            <div style={{
              fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22,
              color: "#fff", textTransform: "lowercase", letterSpacing: "-0.02em",
            }}>¿queremos hablar?</div>
            <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6 }}>15 min. Te mostramos cómo se vería tu ruta privada.</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button variant="primary" size="lg">
              agendar demo
              <Icon.arrow />
            </Button>
            <Button variant="outline" size="lg" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}>
              ver brochure
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Faq = () => {
  const qs = [
    {
      q: "¿necesito saber programar para empezar?",
      a: "no. la mayoría de las lecciones aplican IA sin código (prompts, automatizaciones visuales, integraciones). si tu trabajo lo requiere, las secciones de api, mcp y vibe coding cubren código real.",
    },
    {
      q: "¿cuánto tiempo me toma terminar las 100 lecciones?",
      a: "depende de tu ritmo. el promedio interno es de 6 a 10 semanas dedicando 30–45 min al día. cada lección está diseñada para ≈10 minutos.",
    },
    {
      q: "¿qué pasa cuando termino la ruta?",
      a: "tienes IA aplicada a tu trabajo concreto: prompts probados, automatizaciones que corren, integraciones que funcionan. después puedes seguir con la ruta avanzada o saltar a otra sección.",
    },
    {
      q: "¿cómo es el formato exactamente?",
      a: "100% interactivo. respondes preguntas, completas prompts, configuras automatizaciones, modificas archivos reales. cero clases pasivas, cero teoría inflada. cada lección termina con algo aplicado.",
    },
    {
      q: "¿qué cubren las 10 secciones?",
      a: "fundamentos, asistentes (claude/chatgpt/gemini/perplexity), contenido (imagen/video/voz), automatización (n8n/claude code/mcp schedulers), bases de datos (supabase/notion/rag), api, mcp y skills, agentes, vibe coding e implementación.",
    },
    {
      q: "¿cómo se factura empresas?",
      a: "anual con factura local en méxico, colombia, argentina y chile. internacional vía stripe en usd. cobramos por usuario activo, no por asiento comprado.",
    },
    {
      q: "¿puedo cancelar pro en cualquier momento?",
      a: "sí. desde tu panel, sin pasos extra ni mail de retención. mantienes el acceso hasta el final del periodo pagado.",
    },
    {
      q: "¿qué hacen con mi data y mis prompts?",
      a: "tu data y tus prompts son tuyos. nada se usa para entrenar modelos de itera. puedes exportar todo cuando quieras.",
    },
  ];
  return (
    <section id="faq" className="section">
      <div className="container faq-grid" style={{ display: "grid", gap: 48 }}>
        <div>
          <Headline>preguntas frecuentes</Headline>
          <Title style={{ marginTop: 12 }}>todo lo que importa antes de empezar</Title>
          <Body style={{ marginTop: 16 }}>
            ¿No encuentras algo? Escríbenos a hola@itera.la y te respondemos personas reales.
          </Body>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {qs.map((item, i) => (
            <details key={i} className="faq-item">
              <summary>
                <span className="lower">{item.q}</span>
                <Icon.chev className="faq-chev" />
              </summary>
              <div style={{ paddingTop: 14 }}>
                <Body>{item.a}</Body>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaCierre = () => (
  <section className="section cta-section" style={{ background: "#0a1628", color: "#fff" }}>
    <div className="container" style={{ textAlign: "center" }}>
      <div style={{ marginBottom: 24 }}>
        <Mascota size={120} mood="win" />
      </div>
      <h2 className="it-display" style={{ color: "#fff", maxWidth: 880, margin: "0 auto" }}>
        la <span style={{ textTransform: "none" }}>IA</span> no se va a aplicar sola a tu trabajo
      </h2>
      <BodyLg style={{ color: "#cbd5e1", marginTop: 20, maxWidth: 540, margin: "20px auto 0" }}>
        Empieza gratis. Sin tarjeta. Cuando termines las primeras 20, decides si sigues con pro.
      </BodyLg>
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
        <Button variant="primary" size="lg">
          empezar gratis
          <Icon.arrow />
        </Button>
        <Button variant="outline" size="lg" style={{
          background: "transparent", color: "#fff", borderColor: "#cbd5e1",
        }}>
          ver demo (30 seg)
        </Button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ background: "var(--bg)" }}>
    <div className="container" style={{ padding: "48px 0", display: "grid", gap: 32, gridTemplateColumns: "1fr" }}>
      <div className="footer-grid" style={{ display: "grid", gap: 32, gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Mascota size={32} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: "var(--text-strong)" }}>itera</span>
          </div>
          <Caption style={{ display: "block", maxWidth: 320 }}>
            Micro-aprendizaje ejecutable. Aplica IA a tu trabajo, una lección a la vez.
          </Caption>
        </div>
        {[
          { h: "producto", links: ["cómo funciona", "pricing", "empresas", "blog"] },
          { h: "recursos", links: ["metodología", "lecciones", "changelog", "estado"] },
          { h: "compañía", links: ["sobre", "contacto", "privacidad", "términos"] },
        ].map((col, i) => (
          <div key={i}>
            <Caption className="upper" style={{ fontWeight: 700, color: "var(--text-strong)", display: "block", marginBottom: 12 }}>{col.h}</Caption>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {col.links.map(l => (
                <li key={l}><a href="#" style={{ fontSize: 14, color: "var(--text-main)", textTransform: "lowercase" }}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Caption>© 2026 itera · hecho en latam</Caption>
        <Caption>precios siempre en usd · stripe</Caption>
      </div>
    </div>
  </footer>
);

Object.assign(window, { Testimonios, Pricing, Faq, CtaCierre, Footer });
