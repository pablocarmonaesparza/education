// app — orquesta todo + tweaks

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryHue": "azul-itera",
  "depthIntensity": "marcado",
  "heroDensity": "aireado",
  "showReview": false,
  "showMascotaWink": false,
  "theme": "auto"
} /*EDITMODE-END*/;
const App = () => {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);

  // aplica tweaks al :root
  React.useEffect(() => {
    const root = document.documentElement;
    // primary tone
    const tones = {
      "azul-itera": {
        primary: "#1472FF",
        dark: "#0E5FCC",
        soft: "#e8f0ff"
      },
      "azul-profundo": {
        primary: "#0E5FCC",
        dark: "#0a47a0",
        soft: "#e0ebff"
      },
      "indigo": {
        primary: "#4f46e5",
        dark: "#3730a3",
        soft: "#eef2ff"
      }
    };
    const t = tones[tweaks.primaryHue] || tones["azul-itera"];
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-dark", t.dark);
    root.style.setProperty("--primary-soft", t.soft);

    // depth intensity
    const depth = {
      "sutil": "3px",
      "marcado": "6px",
      "exagerado": "9px"
    }[tweaks.depthIntensity] || "6px";
    root.style.setProperty("--depth-bottom", depth);
    document.body.classList.toggle("depth-subtle", tweaks.depthIntensity === "sutil");
    document.body.classList.toggle("depth-strong", tweaks.depthIntensity === "exagerado");

    // hero density
    document.body.classList.toggle("hero-compact", tweaks.heroDensity === "compacto");

    // theme
    if (tweaks.theme === "auto") root.removeAttribute("data-theme");else root.setAttribute("data-theme", tweaks.theme);
  }, [tweaks]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, tweaks.showReview && /*#__PURE__*/React.createElement(ReviewBanner, null), /*#__PURE__*/React.createElement(Nav, null), tweaks.showReview && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("a", {
    id: "tokens"
  }), /*#__PURE__*/React.createElement(TokensPreview, null), /*#__PURE__*/React.createElement("a", {
    id: "buttons"
  }), /*#__PURE__*/React.createElement(ButtonStates, null), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--text-strong)",
      padding: "16px 0",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Caption, {
    className: "upper",
    style: {
      color: "#cbd5e1",
      fontWeight: 700
    }
  }, "\u2193 home p\xFAblica \u2193"))), /*#__PURE__*/React.createElement(HeroDemo, null), /*#__PURE__*/React.createElement("a", {
    id: "home"
  }), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Problema, null), /*#__PURE__*/React.createElement(Como, null), /*#__PURE__*/React.createElement(Compare, null), /*#__PURE__*/React.createElement(Testimonios, null), /*#__PURE__*/React.createElement(Pricing, null), /*#__PURE__*/React.createElement(Empresas, null), /*#__PURE__*/React.createElement(Faq, null), /*#__PURE__*/React.createElement(CtaCierre, null), /*#__PURE__*/React.createElement(Footer, null), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "brand"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "primary tone",
    value: tweaks.primaryHue,
    onChange: v => setTweak("primaryHue", v),
    options: [{
      value: "azul-itera",
      label: "azul itera"
    }, {
      value: "azul-profundo",
      label: "azul profundo"
    }, {
      value: "indigo",
      label: "indigo"
    }]
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "depth 3d"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "intensidad",
    value: tweaks.depthIntensity,
    options: ["sutil", "marcado", "exagerado"],
    onChange: v => setTweak("depthIntensity", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "hero"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "densidad",
    value: tweaks.heroDensity,
    options: ["aireado", "compacto"],
    onChange: v => setTweak("heroDensity", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "review"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "mostrar tokens & buttons",
    value: tweaks.showReview,
    onChange: v => setTweak("showReview", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "tema"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "modo",
    value: tweaks.theme,
    options: ["auto", "light", "dark"],
    onChange: v => setTweak("theme", v)
  })));
};
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
