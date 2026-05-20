---
type: copy
title: convención IA mayúsculas, nunca AI ni ia
date: 2026-05-05
tags: [copy, convencion, ia, idioma, design-system]
dept: [producto, marketing]
---

Convención de copy establecida por Pablo el 2026-05-05:

**Siempre escribimos `IA` en mayúsculas, nunca `AI` ni `ia`.**

Aplica a todo copy de Itera: landing, dashboard, casos, reportes, emails, documentación pública, ads, social, faq.

**Género en español:** "IA" es femenino (la inteligencia artificial).
- ✅ "la IA", "su propia IA", "aplicándola", "no se va a aplicar sola"
- ❌ "el AI", "su propio AI", "aplicándolo", "no se va a aplicar solo"

**Override del design system:** el DS de Itera fuerza `text-transform: lowercase` en `.it-display`, `.it-title`, `.it-subtitle` y la clase utility `.lower`. Para que "IA" salga en mayúsculas dentro de esos componentes, hay que wrappearlo:

```tsx
<Title>aprende <span style={{textTransform:"none"}}>IA</span></Title>
```

O crear una utility class `.case-keep { text-transform: none !important; }` en el DS si hay muchos casos. Por ahora el override inline es suficiente.

**Por qué:** literal de Pablo (2026-05-05): *"Vamos a hacer una convención general. Simpre que digamos AI ó IA, es con mayúsculas y vamos a poner IA siempre, nunca AI"*.

**Cuándo aplicar:**
- Antes de escribir copy para landing, casos, dashboard, reportes, faq, emails, ads, etc.
- Si encuentras "AI" o "ai" en el repo o en docs canónicos, cambialo a "IA" (excepto en código: nombres de variables, identificadores, valores enum, donde el cambio puede romper APIs).
- En casos o reportes donde el contenido menciona modelos de IA, "LLM" se mantiene como "LLM" (es otra sigla, no AI). Lo que cambia es solo "AI"/"ai" → "IA".

**Excepciones:**
- Identificadores de código (variables, function names, JSON keys, etc.) no se cambian — solo copy visible al usuario.
- Strings que sean nombres propios de servicios/APIs externas (ej: "Anthropic AI", "Google AI Studio") se mantienen como aparecen en la marca oficial.
- Documentación técnica interna que cite literal de un servicio externo se mantiene.

**Cuándo reabrir esta convención:**
Si Itera pivota a un mercado anglosajón (US/Europa) donde "AI" sea más natural, reabrir. Mientras el target sea LATAM hispanohablante, IA es el estándar.
