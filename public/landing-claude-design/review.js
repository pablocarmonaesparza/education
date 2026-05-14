// preview de tokens y estados de botón — diseño review

const TokensPreview = () => {
  const colors = [{
    name: "primary",
    v: "#1472FF",
    token: "--primary"
  }, {
    name: "primary-dark",
    v: "#0E5FCC",
    token: "--primary-dark"
  }, {
    name: "accent",
    v: "#22c55e",
    token: "--accent"
  }, {
    name: "accent-dark",
    v: "#16a34a",
    token: "--accent-dark"
  }, {
    name: "text-strong",
    v: "#111111",
    token: "--text-strong"
  }, {
    name: "text-main",
    v: "#4b4b4b",
    token: "--text-main"
  }, {
    name: "text-muted",
    v: "#777777",
    token: "--text-muted"
  }, {
    name: "border",
    v: "#e5e7eb",
    token: "--border"
  }, {
    name: "bg-soft",
    v: "#f9fafb",
    token: "--bg-soft"
  }, {
    name: "bg-darker",
    v: "#f3f4f6",
    token: "--bg-darker"
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 64,
      paddingBottom: 64,
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Headline, null, "design review \xB7 01"), /*#__PURE__*/React.createElement(Title, {
    style: {
      marginTop: 10
    }
  }, "tokens aplicados")), /*#__PURE__*/React.createElement(Caption, null, "paleta + tipograf\xEDa \xB7 espejo de ", /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "lib/design-tokens.ts"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 12,
      marginBottom: 48
    }
  }, colors.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    className: "card-flat",
    style: {
      border: "2px solid var(--border)",
      borderRadius: 10,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: c.v,
      height: 72,
      borderBottom: "1px solid var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--text-strong)"
    },
    className: "lower"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--text-muted)"
    }
  }, c.v), /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "var(--text-muted)"
    }
  }, c.token))))), /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      fontWeight: 700,
      color: "var(--text-strong)",
      display: "block",
      marginBottom: 16
    }
  }, "escala tipogr\xE1fica"), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0
    }
  }, [["display", "darker grotesque · 800 · lowercase", /*#__PURE__*/React.createElement(Display, {
    style: {
      fontSize: "clamp(40px, 6vw, 64px)"
    }
  }, "aprende ejecutando")], ["title", "darker grotesque · 800 · lowercase", /*#__PURE__*/React.createElement(Title, null, "tres pasos. cero teor\xEDa inflada.")], ["subtitle", "inter · 600 · lowercase", /*#__PURE__*/React.createElement(Subtitle, null, "100 lecciones interactivas para construir tu proyecto.")], ["headline", "inter · 700 · UPPERCASE", /*#__PURE__*/React.createElement(Headline, null, "c\xF3mo funciona itera")], ["body", "inter · 400", /*#__PURE__*/React.createElement(Body, null, "vendemos retenci\xF3n y ejecuci\xF3n, no informaci\xF3n. el formato son ejercicios cortos donde modificas archivos reales hasta que tu proyecto est\xE1 en vivo.")], ["caption", "inter · 400 · 13px", /*#__PURE__*/React.createElement(Caption, null, "fuente real pendiente")]].map(([name, meta, el], i, arr) => /*#__PURE__*/React.createElement("div", {
    key: name,
    style: {
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      gap: 24,
      padding: "20px 24px",
      alignItems: "center",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)"
    },
    className: "type-row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text-strong)"
    },
    className: "upper"
  }, name), /*#__PURE__*/React.createElement(Caption, {
    style: {
      display: "block",
      marginTop: 2
    }
  }, meta)), /*#__PURE__*/React.createElement("div", null, el))))));
};
const ButtonStates = () => {
  const [pressed, setPressed] = React.useState(null);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 24,
      paddingBottom: 64,
      background: "var(--bg-soft)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Headline, null, "design review \xB7 02"), /*#__PURE__*/React.createElement(Title, {
    style: {
      marginTop: 10
    }
  }, "bot\xF3n en sus 4 estados")), /*#__PURE__*/React.createElement(Caption, null, /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "<Button variant=\"primary\" />"), " \xB7 depth 3d como \xFAnica elevaci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "btn-states-grid",
    style: {
      display: "grid",
      gridTemplateColumns: "120px repeat(4, 1fr)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderBottom: "2px solid var(--text-strong)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      fontWeight: 700
    }
  }, "variant")), ["default", "hover", "active", "disabled"].map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      padding: 14,
      borderBottom: "2px solid var(--text-strong)",
      background: "#fff",
      borderLeft: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      fontWeight: 700
    }
  }, s))), [{
    variant: "primary",
    label: "empezar gratis"
  }, {
    variant: "outline",
    label: "ver demo"
  }, {
    variant: "ghost",
    label: "iniciar sesión"
  }, {
    variant: "accent",
    label: "completar"
  }].map((row, i, arr) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: row.variant
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      display: "flex",
      alignItems: "center",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--text-strong)"
    }
  }, row.variant)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderLeft: "1px solid var(--border)",
      background: "#fff",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: row.variant,
    size: "md"
  }, row.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderLeft: "1px solid var(--border)",
      background: "#fff",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: row.variant,
    size: "md",
    className: "force-hover"
  }, row.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderLeft: "1px solid var(--border)",
      background: "#fff",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: row.variant,
    size: "md",
    className: "force-active"
  }, row.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderLeft: "1px solid var(--border)",
      background: "#fff",
      borderBottom: i === arr.length - 1 ? 0 : "1px dashed var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: row.variant,
    size: "md",
    disabled: true
  }, row.label)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      fontWeight: 700,
      color: "var(--text-strong)"
    }
  }, "tama\xF1os"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "small"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "medium \xB7 48px"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg"
  }, "large \xB7 56px (hero)")), /*#__PURE__*/React.createElement(Caption, {
    style: {
      display: "block",
      marginTop: 14
    }
  }, "el touch target se sube a 48px en hero CTA p\xFAblico (vs 40px del DS general). cumple WCAG con margen.")));
};
const ReviewBanner = () => /*#__PURE__*/React.createElement("div", {
  style: {
    background: "var(--text-strong)",
    color: "#fff",
    padding: "10px 0",
    fontSize: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "container",
  style: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    background: "var(--accent)",
    color: "#052e16",
    padding: "3px 8px",
    borderRadius: 4,
    fontWeight: 700
  },
  className: "upper"
}, "design review"), /*#__PURE__*/React.createElement("span", {
  className: "lower"
}, "itera \xB7 landing p\xFAblica v1")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 16,
    color: "#cbd5e1"
  }
}, /*#__PURE__*/React.createElement("a", {
  href: "#tokens",
  className: "lower"
}, "tokens"), /*#__PURE__*/React.createElement("a", {
  href: "#buttons",
  className: "lower"
}, "bot\xF3n"), /*#__PURE__*/React.createElement("a", {
  href: "#home",
  className: "lower"
}, "home"))));
Object.assign(window, {
  TokensPreview,
  ButtonStates,
  ReviewBanner
});
