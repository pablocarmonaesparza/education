---
type: decision
title: pantallas limpias para review — sin overlays de dev
date: 2026-06-05
tags: [diseno, dev, review, nextjs]
dept: [producto]
---

Las pantallas que Pablo revisa NO deben tener overlays/indicadores de dev encima. El indicador de Next.js Dev Tools (el badge "N" flotante / "Open Next.js Dev Tools") va APAGADO con `devIndicators: false` en `next.config.js`. Tampoco se montan botones flotantes de dev (DevReturnButton u otros) sobre las superficies de producto.

**Por qué:** Pablo revisa el diseño en localhost y los overlays de dev (el badge de Next, botones flotantes) ensucian la vista y no son parte del producto. Lo pidió y Claude no lo recordó: "la pestaña y demás no debería estar ahí... acabamos de hablar de esto y deberías guardarlo en tu memoria para que no tenga que repetirlo a la menor provocación".

**Cuándo aplicar:** al preparar cualquier pantalla para review o al configurar el proyecto. Mantener `devIndicators: false`; no montar componentes de dev (badges, botones de retorno a /dev, etc.) en los layouts de producto. Las herramientas de dev viven en `/dev`, no encima de las pantallas.
