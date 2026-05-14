// preview de tokens y estados de botón — diseño review

const TokensPreview = () => {
  const colors = [
    { name: "primary", v: "#1472FF", token: "--primary" },
    { name: "primary-dark", v: "#0E5FCC", token: "--primary-dark" },
    { name: "accent", v: "#22c55e", token: "--accent" },
    { name: "accent-dark", v: "#16a34a", token: "--accent-dark" },
    { name: "text-strong", v: "#111111", token: "--text-strong" },
    { name: "text-main", v: "#4b4b4b", token: "--text-main" },
    { name: "text-muted", v: "#777777", token: "--text-muted" },
    { name: "border", v: "#e5e7eb", token: "--border" },
    { name: "bg-soft", v: "#f9fafb", token: "--bg-soft" },
    { name: "bg-darker", v: "#f3f4f6", token: "--bg-darker" },
  ];
  return (
    <section className="section" style={{ paddingTop: 64, paddingBottom: 64, background: "var(--bg)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
          <div>
            <Headline>design review · 01</Headline>
            <Title style={{ marginTop: 10 }}>tokens aplicados</Title>
          </div>
          <Caption>paleta + tipografía · espejo de <span className="mono">lib/design-tokens.ts</span></Caption>
        </div>

        {/* paleta */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 48 }}>
          {colors.map(c => (
            <div key={c.name} className="card-flat" style={{
              border: "2px solid var(--border)", borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{ background: c.v, height: 72, borderBottom: "1px solid var(--border)" }} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }} className="lower">{c.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.v}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.token}</div>
              </div>
            </div>
          ))}
        </div>

        {/* type scale */}
        <Caption className="upper" style={{ fontWeight: 700, color: "var(--text-strong)", display: "block", marginBottom: 16 }}>escala tipográfica</Caption>
        <div className="card" style={{ padding: 0 }}>
          {[
            ["display", "darker grotesque · 800 · lowercase", <Display style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>aprende ejecutando</Display>],
            ["title", "darker grotesque · 800 · lowercase", <Title>tres pasos. cero teoría inflada.</Title>],
            ["subtitle", "inter · 600 · lowercase", <Subtitle>100 lecciones interactivas para construir tu proyecto.</Subtitle>],
            ["headline", "inter · 700 · UPPERCASE", <Headline>cómo funciona itera</Headline>],
            ["body", "inter · 400", <Body>vendemos retención y ejecución, no información. el formato son ejercicios cortos donde modificas archivos reales hasta que tu proyecto está en vivo.</Body>],
            ["caption", "inter · 400 · 13px", <Caption>fuente real pendiente</Caption>],
          ].map(([name, meta, el], i, arr) => (
            <div key={name} style={{
              display: "grid", gridTemplateColumns: "180px 1fr", gap: 24,
              padding: "20px 24px", alignItems: "center",
              borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)",
            }} className="type-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-strong)" }} className="upper">{name}</div>
                <Caption style={{ display: "block", marginTop: 2 }}>{meta}</Caption>
              </div>
              <div>{el}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ButtonStates = () => {
  const [pressed, setPressed] = React.useState(null);
  return (
    <section className="section" style={{ paddingTop: 24, paddingBottom: 64, background: "var(--bg-soft)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
          <div>
            <Headline>design review · 02</Headline>
            <Title style={{ marginTop: 10 }}>botón en sus 4 estados</Title>
          </div>
          <Caption><span className="mono">{"<Button variant=\"primary\" />"}</span> · depth 3d como única elevación</Caption>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="btn-states-grid" style={{
            display: "grid", gridTemplateColumns: "120px repeat(4, 1fr)",
          }}>
            {/* header */}
            <div style={{ padding: 14, borderBottom: "2px solid var(--text-strong)", background: "#fff" }}><Caption className="upper" style={{ fontWeight: 700 }}>variant</Caption></div>
            {["default", "hover", "active", "disabled"].map(s => (
              <div key={s} style={{ padding: 14, borderBottom: "2px solid var(--text-strong)", background: "#fff", borderLeft: "1px solid var(--border)" }}>
                <Caption className="upper" style={{ fontWeight: 700 }}>{s}</Caption>
              </div>
            ))}

            {[
              { variant: "primary", label: "empezar gratis" },
              { variant: "outline", label: "ver demo" },
              { variant: "ghost", label: "iniciar sesión" },
              { variant: "accent", label: "completar" },
            ].map((row, i, arr) => (
              <React.Fragment key={row.variant}>
                <div style={{
                  padding: 18, display: "flex", alignItems: "center",
                  borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)",
                  background: "#fff",
                }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-strong)" }}>{row.variant}</span>
                </div>
                {/* default */}
                <div style={{ padding: 24, borderLeft: "1px solid var(--border)", background: "#fff", borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)" }}>
                  <Button variant={row.variant} size="md">{row.label}</Button>
                </div>
                {/* hover (simulate via class force) */}
                <div style={{ padding: 24, borderLeft: "1px solid var(--border)", background: "#fff", borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)" }}>
                  <Button variant={row.variant} size="md" className="force-hover">{row.label}</Button>
                </div>
                {/* active (simulate) */}
                <div style={{ padding: 24, borderLeft: "1px solid var(--border)", background: "#fff", borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)" }}>
                  <Button variant={row.variant} size="md" className="force-active">{row.label}</Button>
                </div>
                {/* disabled */}
                <div style={{ padding: 24, borderLeft: "1px solid var(--border)", background: "#fff", borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)" }}>
                  <Button variant={row.variant} size="md" disabled>{row.label}</Button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <Caption className="upper" style={{ fontWeight: 700, color: "var(--text-strong)" }}>tamaños</Caption>
          <Button variant="primary" size="sm">small</Button>
          <Button variant="primary" size="md">medium · 48px</Button>
          <Button variant="primary" size="lg">large · 56px (hero)</Button>
        </div>
        <Caption style={{ display: "block", marginTop: 14 }}>
          el touch target se sube a 48px en hero CTA público (vs 40px del DS general). cumple WCAG con margen.
        </Caption>
      </div>
    </section>
  );
};

const ReviewBanner = () => (
  <div style={{ background: "var(--text-strong)", color: "#fff", padding: "10px 0", fontSize: 12 }}>
    <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ background: "var(--accent)", color: "#052e16", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }} className="upper">design review</span>
        <span className="lower">itera · landing pública v1</span>
      </div>
      <div style={{ display: "flex", gap: 16, color: "#cbd5e1" }}>
        <a href="#tokens" className="lower">tokens</a>
        <a href="#buttons" className="lower">botón</a>
        <a href="#home" className="lower">home</a>
      </div>
    </div>
  </div>
);

Object.assign(window, { TokensPreview, ButtonStates, ReviewBanner });
