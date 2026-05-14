// landing sections — itera (parte 2: testimonios, pricing, faq, cta cierre, footer)

const Testimonios = () => {
  const items = [{
    quote: "automaticé mis reportes con n8n + claude. recuperé 6 horas a la semana.",
    name: "[nombre real pendiente]",
    project: "marketing · pyme",
    avatar: "f1",
    featured: true,
    stat: "6 hs",
    statLabel: "por semana recuperadas"
  }, {
    quote: "aprendí mcp y skills en 4 semanas. claude ahora trabaja con mis bases de datos.",
    name: "[nombre real pendiente]",
    project: "ops · agencia",
    avatar: "f2"
  }, {
    quote: "venía de 3 cursos de IA abandonados. itera fue el primero que sí terminé y apliqué.",
    name: "[nombre real pendiente]",
    project: "founder · saas",
    avatar: "f3"
  }];
  const Avatar = ({
    kind,
    size = 48
  }) => {
    const palettes = {
      f1: ["#1472FF", "#22c55e"],
      f2: ["#0E5FCC", "#fbbf24"],
      f3: ["#22c55e", "#1472FF"]
    }[kind];
    return /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 48 48",
      style: {
        display: "block",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("rect", {
      width: "48",
      height: "48",
      rx: "12",
      fill: palettes[0],
      stroke: "#0a1628",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "24",
      cy: "24",
      r: "10",
      fill: palettes[1],
      stroke: "#0a1628",
      strokeWidth: "2"
    }));
  };
  const featured = items[0];
  const others = items.slice(1);
  return /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640
    }
  }, /*#__PURE__*/React.createElement(Headline, null, "resultados reales"), /*#__PURE__*/React.createElement(Title, {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textTransform: "none"
    }
  }, "IA"), " aplicada al trabajo, no certificados")), /*#__PURE__*/React.createElement(Caption, null, "Cada testimonio enlaza al caso real cuando est\xE9 publicado")), /*#__PURE__*/React.createElement("div", {
    className: "testimonios-bento",
    style: {
      display: "grid",
      gap: 20,
      gridTemplateColumns: "1fr"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "primary",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      padding: 36
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    variant: "success"
  }, /*#__PURE__*/React.createElement(Icon.spark, {
    style: {
      width: 12,
      height: 12
    }
  }), "destacado"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: "clamp(28px, 3.6vw, 44px)",
      lineHeight: 1.05,
      color: "var(--text-strong)",
      letterSpacing: "-0.025em",
      textTransform: "lowercase",
      textWrap: "balance"
    }
  }, "\"", featured.quote, "\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 20,
      marginTop: "auto",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    kind: featured.avatar,
    size: 56
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15,
      color: "var(--text-strong)"
    },
    className: "lower"
  }, featured.name), /*#__PURE__*/React.createElement(Caption, {
    style: {
      display: "block"
    }
  }, featured.project))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--accent)",
      color: "#052e16",
      border: "2px solid var(--accent-dark)",
      borderBottom: "5px solid var(--accent-dark)",
      padding: "10px 18px",
      borderRadius: 12,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: 28,
      lineHeight: 1,
      letterSpacing: "-0.02em"
    }
  }, featured.stat), /*#__PURE__*/React.createElement(Caption, {
    style: {
      color: "#052e16",
      fontWeight: 600
    }
  }, featured.statLabel)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, others.map((t, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: "neutral",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Body, {
    style: {
      color: "var(--text-strong)",
      fontWeight: 500,
      fontSize: 15
    }
  }, "\"", t.quote, "\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: "auto",
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    kind: t.avatar,
    size: 36
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text-strong)"
    },
    className: "lower"
  }, t.name), /*#__PURE__*/React.createElement(Caption, {
    style: {
      display: "block"
    }
  }, t.project)))))))));
};
const Pricing = () => {
  const features = [{
    label: "lecciones interactivas",
    gratis: "primeras 20 + fundamentos",
    pro: "las 100 completas",
    empresas: "todo de pro + privadas"
  }, {
    label: "ruta personalizada",
    gratis: true,
    pro: true,
    empresas: true
  }, {
    label: "ejercicios con tu propia IA",
    gratis: false,
    pro: true,
    empresas: true
  }, {
    label: "lecciones nuevas (cada modelo nuevo)",
    gratis: false,
    pro: true,
    empresas: true
  }, {
    label: "soporte",
    gratis: "comunidad",
    pro: "prioritario · ≤24h",
    empresas: "dedicado"
  }, {
    label: "rutas privadas para tu equipo",
    gratis: false,
    pro: false,
    empresas: true
  }, {
    label: "dashboard de finalización",
    gratis: false,
    pro: false,
    empresas: true
  }, {
    label: "sso + factura anual",
    gratis: false,
    pro: false,
    empresas: true
  }];
  const Cell = ({
    v,
    highlight
  }) => {
    if (v === true) return /*#__PURE__*/React.createElement(Icon.check, {
      style: {
        color: highlight ? "var(--accent-dark)" : "var(--accent-dark)",
        margin: "0 auto",
        display: "block"
      }
    });
    if (v === false) return /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        display: "block",
        textAlign: "center"
      }
    }, "\u2014");
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: "var(--text-strong)",
        fontWeight: highlight ? 700 : 500
      },
      className: "lower"
    }, v);
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "pricing",
    className: "section",
    style: {
      background: "var(--bg-soft)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 48,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(Headline, null, "pricing"), /*#__PURE__*/React.createElement(Title, {
    style: {
      marginTop: 12
    }
  }, "precios honestos \xB7 en usd \xB7 sin asteriscos"), /*#__PURE__*/React.createElement(Body, {
    style: {
      marginTop: 14
    }
  }, "Cobramos por mes o por a\xF1o. Cancelas cuando quieras. Siempre en USD v\xEDa Stripe.")), /*#__PURE__*/React.createElement("div", {
    className: "card pricing-table",
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1.2fr 1fr",
      minWidth: 760
    },
    className: "pricing-grid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      background: "#fff",
      borderBottom: "2px solid var(--text-strong)"
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      fontWeight: 700,
      color: "var(--text-strong)"
    }
  }, "plan")), [{
    name: "gratis",
    price: "$0",
    cad: "para siempre",
    hl: false,
    bg: "#fff"
  }, {
    name: "pro",
    price: "$19",
    cad: "usd / mes",
    hl: true,
    bg: "var(--primary-soft)"
  }, {
    name: "empresas",
    price: "custom",
    cad: "según equipo",
    hl: false,
    bg: "#fff"
  }].map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: 24,
      background: p.bg,
      borderBottom: "2px solid var(--text-strong)",
      borderLeft: "1px solid var(--border)",
      position: "relative"
    }
  }, p.hl && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 12,
      right: 12
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    variant: "success"
  }, /*#__PURE__*/React.createElement(Icon.spark, {
    style: {
      width: 12,
      height: 12
    }
  }), "popular")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: 26,
      color: "var(--text-strong)",
      textTransform: "lowercase",
      letterSpacing: "-0.025em",
      lineHeight: 1
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      flexWrap: "wrap",
      columnGap: 6,
      rowGap: 2,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: 36,
      lineHeight: 1,
      color: p.hl ? "var(--primary-dark)" : "var(--text-strong)",
      letterSpacing: "-0.03em"
    },
    className: "lower"
  }, p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)",
      fontWeight: 600,
      whiteSpace: "nowrap"
    },
    className: "lower"
  }, p.cad)))), features.map((row, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 24px",
      borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-main)"
    },
    className: "lower"
  }, row.label), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px",
      borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    v: row.gratis
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px",
      borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)",
      borderLeft: "1px solid var(--border)",
      background: "var(--primary-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    v: row.pro,
    highlight: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px",
      borderBottom: i === features.length - 1 ? 0 : "1px solid var(--border)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    v: row.empresas
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      borderTop: "2px solid var(--text-strong)",
      background: "var(--bg-soft)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderTop: "2px solid var(--text-strong)",
      borderLeft: "1px solid var(--border)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    style: {
      width: "100%"
    }
  }, "empezar gratis")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderTop: "2px solid var(--text-strong)",
      borderLeft: "1px solid var(--border)",
      background: "var(--primary-soft)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    style: {
      width: "100%"
    }
  }, "comenzar pro")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderTop: "2px solid var(--text-strong)",
      borderLeft: "1px solid var(--border)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    style: {
      width: "100%"
    }
  }, "agendar demo"))))));
};

// === EMPRESAS ===
const Empresas = () => {
  const useCases = [{
    icon: "users",
    title: "onboarding al stack IA para nuevos contratos",
    desc: "rutas con tus modelos, tus procesos y tus datos. de 6 semanas a 2."
  }, {
    icon: "rocket",
    title: "upskill de equipos no técnicos en IA",
    desc: "marketing, ops y ventas aprenden a aplicar IA en su día. dejan de adivinar qué se puede automatizar."
  }, {
    icon: "shield",
    title: "academia interna de IA",
    desc: "tu academia IA, sin construirla desde cero. métricas de finalización, no de inscripción."
  }];
  const logos = ["mercadolibre", "rappi", "platzi", "factus", "nubank", "kavak", "globant", "bitso"];
  return /*#__PURE__*/React.createElement("section", {
    id: "empresas",
    className: "section",
    style: {
      background: "#0a1628",
      color: "#fff",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.06,
      pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
      backgroundSize: "48px 48px"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 48,
      alignItems: "end",
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "it-headline",
    style: {
      color: "var(--accent)"
    }
  }, "para empresas"), /*#__PURE__*/React.createElement("h2", {
    className: "it-title",
    style: {
      marginTop: 12,
      color: "#fff"
    }
  }, "tu equipo aprende ", /*#__PURE__*/React.createElement("span", {
    style: {
      textTransform: "none"
    }
  }, "IA"), " aplic\xE1ndola a lo que ya hacen"), /*#__PURE__*/React.createElement(BodyLg, {
    style: {
      color: "#cbd5e1",
      marginTop: 18,
      maxWidth: 600
    }
  }, "Rutas privadas con tu stack, tus procesos y tus casos reales. M\xE9tricas de finalizaci\xF3n, no de inscripci\xF3n. Factura local en LATAM."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 0,
      gridTemplateColumns: "repeat(3, 1fr)",
      background: "rgba(255,255,255,0.04)",
      border: "2px solid rgba(255,255,255,0.18)",
      borderRadius: 16,
      marginBottom: 56,
      overflow: "hidden"
    },
    className: "empresas-stats"
  }, [{
    v: "−60%",
    l: "tiempo de onboarding al stack IA",
    c: "var(--accent)"
  }, {
    v: "94%",
    l: "completion rate (vs. 13% en cursos y capacitaciones tradicionales)",
    c: "var(--primary)"
  }, {
    v: "100%",
    l: "rutas custom por industria + stack",
    c: "#fbbf24"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: "28px 24px",
      borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : 0,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: "clamp(36px, 5vw, 56px)",
      lineHeight: 1,
      color: s.c,
      letterSpacing: "-0.03em",
      textTransform: "lowercase"
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#cbd5e1",
      lineHeight: 1.4,
      fontWeight: 500
    }
  }, s.l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 20,
      gridTemplateColumns: "1fr",
      marginBottom: 48
    },
    className: "empresas-cases"
  }, useCases.map((u, i) => {
    const IconC = Icon[u.icon];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: 28,
        background: "rgba(255,255,255,0.03)",
        border: "2px solid rgba(255,255,255,0.18)",
        borderBottom: "5px solid rgba(255,255,255,0.28)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "var(--primary)",
        border: "2px solid var(--primary-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }
    }, /*#__PURE__*/React.createElement(IconC, {
      style: {
        width: 22,
        height: 22
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-heading)",
        fontWeight: 800,
        fontSize: 19,
        color: "#fff",
        letterSpacing: "-0.02em",
        lineHeight: 1.2
      }
    }, u.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "#cbd5e1",
        lineHeight: 1.55
      }
    }, u.desc));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    style: {
      color: "#94a3b8",
      display: "block",
      marginBottom: 16,
      textAlign: "center"
    }
  }, "equipos en latam que est\xE1n en pilot con itera (placeholder \xB7 nombres reales por confirmar)"), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 48,
      animation: "marquee 26s linear infinite",
      width: "max-content"
    }
  }, [...logos, ...logos].map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: 22,
      color: "rgba(255,255,255,0.45)",
      textTransform: "lowercase",
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
      padding: 32,
      background: "rgba(255,255,255,0.04)",
      border: "2px solid rgba(255,255,255,0.18)",
      borderRadius: 16,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 320px",
      minWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontWeight: 800,
      fontSize: 22,
      color: "#fff",
      textTransform: "lowercase",
      letterSpacing: "-0.02em"
    }
  }, "\xBFqueremos hablar?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "#cbd5e1",
      marginTop: 6
    }
  }, "15 min. Te mostramos c\xF3mo se ver\xEDa tu ruta privada.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg"
  }, "agendar demo", /*#__PURE__*/React.createElement(Icon.arrow, null)), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    style: {
      background: "transparent",
      color: "#fff",
      borderColor: "rgba(255,255,255,0.5)"
    }
  }, "ver brochure")))));
};
const Faq = () => {
  const qs = [{
    q: "¿necesito saber programar para empezar?",
    a: "no. la mayoría de las lecciones aplican IA sin código (prompts, automatizaciones visuales, integraciones). si tu trabajo lo requiere, las secciones de api, mcp y vibe coding cubren código real."
  }, {
    q: "¿cuánto tiempo me toma terminar las 100 lecciones?",
    a: "depende de tu ritmo. el promedio interno es de 6 a 10 semanas dedicando 30–45 min al día. cada lección está diseñada para ≈10 minutos."
  }, {
    q: "¿qué pasa cuando termino la ruta?",
    a: "tienes IA aplicada a tu trabajo concreto: prompts probados, automatizaciones que corren, integraciones que funcionan. después puedes seguir con la ruta avanzada o saltar a otra sección."
  }, {
    q: "¿cómo es el formato exactamente?",
    a: "100% interactivo. respondes preguntas, completas prompts, configuras automatizaciones, modificas archivos reales. cero clases pasivas, cero teoría inflada. cada lección termina con algo aplicado."
  }, {
    q: "¿qué cubren las 10 secciones?",
    a: "fundamentos, asistentes (claude/chatgpt/gemini/perplexity), contenido (imagen/video/voz), automatización (n8n/claude code/mcp schedulers), bases de datos (supabase/notion/rag), api, mcp y skills, agentes, vibe coding e implementación."
  }, {
    q: "¿cómo se factura empresas?",
    a: "anual con factura local en méxico, colombia, argentina y chile. internacional vía stripe en usd. cobramos por usuario activo, no por asiento comprado."
  }, {
    q: "¿puedo cancelar pro en cualquier momento?",
    a: "sí. desde tu panel, sin pasos extra ni mail de retención. mantienes el acceso hasta el final del periodo pagado."
  }, {
    q: "¿qué hacen con mi data y mis prompts?",
    a: "tu data y tus prompts son tuyos. nada se usa para entrenar modelos de itera. puedes exportar todo cuando quieras."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container faq-grid",
    style: {
      display: "grid",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Headline, null, "preguntas frecuentes"), /*#__PURE__*/React.createElement(Title, {
    style: {
      marginTop: 12
    }
  }, "todo lo que importa antes de empezar"), /*#__PURE__*/React.createElement(Body, {
    style: {
      marginTop: 16
    }
  }, "\xBFNo encuentras algo? Escr\xEDbenos a hola@itera.la y te respondemos personas reales.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, qs.map((item, i) => /*#__PURE__*/React.createElement("details", {
    key: i,
    className: "faq-item"
  }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("span", {
    className: "lower"
  }, item.q), /*#__PURE__*/React.createElement(Icon.chev, {
    className: "faq-chev"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(Body, null, item.a)))))));
};
const CtaCierre = () => /*#__PURE__*/React.createElement("section", {
  className: "section cta-section",
  style: {
    background: "#0a1628",
    color: "#fff"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "container",
  style: {
    textAlign: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 24
  }
}, /*#__PURE__*/React.createElement(Mascota, {
  size: 120,
  mood: "win"
})), /*#__PURE__*/React.createElement("h2", {
  className: "it-display",
  style: {
    color: "#fff",
    maxWidth: 880,
    margin: "0 auto"
  }
}, "la ", /*#__PURE__*/React.createElement("span", {
  style: {
    textTransform: "none"
  }
}, "IA"), " no se va a aplicar sola a tu trabajo"), /*#__PURE__*/React.createElement(BodyLg, {
  style: {
    color: "#cbd5e1",
    marginTop: 20,
    maxWidth: 540,
    margin: "20px auto 0"
  }
}, "Empieza gratis. Sin tarjeta. Cuando termines las primeras 20, decides si sigues con pro."), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 32,
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12
  }
}, /*#__PURE__*/React.createElement(Button, {
  variant: "primary",
  size: "lg"
}, "empezar gratis", /*#__PURE__*/React.createElement(Icon.arrow, null)), /*#__PURE__*/React.createElement(Button, {
  variant: "outline",
  size: "lg",
  style: {
    background: "transparent",
    color: "#fff",
    borderColor: "#cbd5e1"
  }
}, "ver demo (30 seg)"))));
const Footer = () => /*#__PURE__*/React.createElement("footer", {
  style: {
    background: "var(--bg)"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "container",
  style: {
    padding: "48px 0",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1fr"
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "footer-grid",
  style: {
    display: "grid",
    gap: 32,
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr"
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14
  }
}, /*#__PURE__*/React.createElement(Mascota, {
  size: 32
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: "var(--font-heading)",
    fontWeight: 800,
    fontSize: 22,
    color: "var(--text-strong)"
  }
}, "itera")), /*#__PURE__*/React.createElement(Caption, {
  style: {
    display: "block",
    maxWidth: 320
  }
}, "Micro-aprendizaje ejecutable. Aplica IA a tu trabajo, una lecci\xF3n a la vez.")), [{
  h: "producto",
  links: ["cómo funciona", "pricing", "empresas", "blog"]
}, {
  h: "recursos",
  links: ["metodología", "lecciones", "changelog", "estado"]
}, {
  h: "compañía",
  links: ["sobre", "contacto", "privacidad", "términos"]
}].map((col, i) => /*#__PURE__*/React.createElement("div", {
  key: i
}, /*#__PURE__*/React.createElement(Caption, {
  className: "upper",
  style: {
    fontWeight: 700,
    color: "var(--text-strong)",
    display: "block",
    marginBottom: 12
  }
}, col.h), /*#__PURE__*/React.createElement("ul", {
  style: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8
  }
}, col.links.map(l => /*#__PURE__*/React.createElement("li", {
  key: l
}, /*#__PURE__*/React.createElement("a", {
  href: "#",
  style: {
    fontSize: 14,
    color: "var(--text-main)",
    textTransform: "lowercase"
  }
}, l))))))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12
  }
}, /*#__PURE__*/React.createElement(Caption, null, "\xA9 2026 itera \xB7 hecho en latam"), /*#__PURE__*/React.createElement(Caption, null, "precios siempre en usd \xB7 stripe"))));
Object.assign(window, {
  Testimonios,
  Pricing,
  Faq,
  CtaCierre,
  Footer
});
