// app — orquesta todo + tweaks

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryHue": "azul-itera",
  "depthIntensity": "marcado",
  "heroDensity": "aireado",
  "showReview": false,
  "showMascotaWink": false,
  "theme": "auto"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(DEFAULTS);

  // aplica tweaks al :root
  React.useEffect(() => {
    const root = document.documentElement;
    // primary tone
    const tones = {
      "azul-itera":   { primary: "#1472FF", dark: "#0E5FCC", soft: "#e8f0ff" },
      "azul-profundo":{ primary: "#0E5FCC", dark: "#0a47a0", soft: "#e0ebff" },
      "indigo":       { primary: "#4f46e5", dark: "#3730a3", soft: "#eef2ff" },
    };
    const t = tones[tweaks.primaryHue] || tones["azul-itera"];
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-dark", t.dark);
    root.style.setProperty("--primary-soft", t.soft);

    // depth intensity
    const depth = { "sutil": "3px", "marcado": "6px", "exagerado": "9px" }[tweaks.depthIntensity] || "6px";
    root.style.setProperty("--depth-bottom", depth);
    document.body.classList.toggle("depth-subtle", tweaks.depthIntensity === "sutil");
    document.body.classList.toggle("depth-strong", tweaks.depthIntensity === "exagerado");

    // hero density
    document.body.classList.toggle("hero-compact", tweaks.heroDensity === "compacto");

    // theme
    if (tweaks.theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", tweaks.theme);
  }, [tweaks]);

  return (
    <>
      {tweaks.showReview && <ReviewBanner />}
      <Nav />
      {tweaks.showReview && (
        <>
          <a id="tokens" />
          <TokensPreview />
          <a id="buttons" />
          <ButtonStates />
          <div style={{ background: "var(--text-strong)", padding: "16px 0", textAlign: "center" }}>
            <Caption className="upper" style={{ color: "#cbd5e1", fontWeight: 700 }}>↓ home pública ↓</Caption>
          </div>
        </>
      )}
      <HeroDemo />
      <a id="home" />
      <Hero />
      <Problema />
      <Como />
      <Compare />
      <Testimonios />
      <Pricing />
      <Empresas />
      <Faq />
      <CtaCierre />
      <Footer />

      <TweaksPanel>
        <TweakSection label="brand" />
        <TweakSelect
          label="primary tone"
          value={tweaks.primaryHue}
          onChange={(v) => setTweak("primaryHue", v)}
          options={[
            { value: "azul-itera", label: "azul itera" },
            { value: "azul-profundo", label: "azul profundo" },
            { value: "indigo", label: "indigo" },
          ]}
        />
        <TweakSection label="depth 3d" />
        <TweakRadio
          label="intensidad"
          value={tweaks.depthIntensity}
          options={["sutil", "marcado", "exagerado"]}
          onChange={(v) => setTweak("depthIntensity", v)}
        />
        <TweakSection label="hero" />
        <TweakRadio
          label="densidad"
          value={tweaks.heroDensity}
          options={["aireado", "compacto"]}
          onChange={(v) => setTweak("heroDensity", v)}
        />
        <TweakSection label="review" />
        <TweakToggle
          label="mostrar tokens & buttons"
          value={tweaks.showReview}
          onChange={(v) => setTweak("showReview", v)}
        />
        <TweakSection label="tema" />
        <TweakRadio
          label="modo"
          value={tweaks.theme}
          options={["auto", "light", "dark"]}
          onChange={(v) => setTweak("theme", v)}
        />
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
