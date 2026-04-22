---
type: experimento
title: representación visual de how it works cuando el producto aún no existe
date: 2026-04-22
tags: [how_it_works, landing, remotion, demo]
---

La sección "cómo funciona" de la landing promete ejercicios interactivos (mcq, tap-match, fill-blank, etc.) pero el producto real todavía no está en ese estado completo al inicio. Pablo no está convencido de cómo representarlo visualmente. Considera dos opciones: (a) videos hechos con **Remotion** que simulen el formato de ejercicios, (b) **screenshots del demo** actual capturados y tratados con el mismo estilo visual. Decisión pendiente.

**Por qué:** literal de Pablo: *"si la sección de como funciona no me convence, ya que de inicio no va a ser así. Tal vez con Remotion haría unos videos o usaría screenshots del demo usando el mismo formato. No sé."* Tensión clásica entre copy aspiracional y producto inicial — la landing vende el futuro, el demo solo muestra el presente. Las imágenes actuales (`/images/how-it-works-{1,2,3}-{light,dark}.png`) son ilustraciones genéricas que no muestran el producto real.

**Cuándo aplicar:** antes de tocar `HowItWorksSection.tsx` o las imágenes asociadas:
- Preguntar a Pablo si ya decidió (Remotion vs screenshots vs mantener ilustraciones).
- Si sale **Remotion**: el stack ya está instalado (confirmar en `package.json`); la skill `anthropic-skills:tiktok-pipeline` tiene patrones de Remotion reutilizables (layouts, zooms, jump cuts, subtítulos word-by-word).
- Si sale **screenshots**: usar `/browse` o `/gstack` para capturar del `app/experimentLanding` o `app/demo` con el mismo frame/padding/crop para coherencia visual. Pre-commit: verificar que los screenshots no muestren contenido placeholder (lorem ipsum, datos de prueba).
