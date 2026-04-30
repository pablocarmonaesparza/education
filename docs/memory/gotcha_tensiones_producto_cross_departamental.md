---
type: gotcha
title: 3 tensiones de producto detectadas cross-departamental al cerrar ronda 10-preguntas
date: 2026-04-27
tags: [producto, cruces, decision-pendiente, cross-departamental, plg, b2b, pricing]
dept: [cpo, ceo]
---

Tras ronda de "10 preguntas" con CEO, CFO, CMO, CGO, CPO, CTO (2026-04-27), CPO detectó 3 tensiones de producto que ningún otro agente tomó. Son decisión de Pablo + CPO, ningún otro las puede resolver. Quedan abiertas hasta que Pablo conteste.

**Tensión 1: pitch ↔ producto.**
- Pitch público (lo que Pablo dice en sobremesa, lo que la gente entiende y emociona): "Duolingo de la IA".
- Producto real (lo que CFO/CMO/CEO identificaron como diferenciador): tutor privado AI con curriculum custom-per-company + fase operación con cuenta LLM del usuario.
- Comps de Duolingo: $7-15/mes mass market.
- Comps del producto real: Copilot/Glean/Notion AI a $30-50/seat/mes.
- **Decisión abierta:** ¿el producto debe SER Duolingo en mecánica (lección diaria 5min, racha, microcommits, content estandarizado) o solo VENDERSE como Duolingo (gancho memorable, producto realmente distinto adentro)?
- **Voto preliminar CPO:** segundo. Duolingo es solo gancho narrativo; mecánicamente el producto es tutor privado + ejecutor.

**Tensión 2: 500 individuos vs 50 empresas — arquitectura distinta.**
- CFO modela breakeven a 500 users a $20/mes (~$10k MRR).
- Target del mes que Pablo le dijo a CPO: ~10 "usuarios". Ambiguo: ¿10 individuos o 10 empresas?
- 500 individuos = self-serve checkout, single-tenant, perfil personal, sin admin panel.
- 50 empresas con 10 seats = multi-tenant, admin de empresa, invite flow, seat management, billing per company, reporting al admin.
- **Decisión abierta:** ¿el "1 cliente" del producto es individuo o empresa? Si empresa, multi-tenant + admin panel suben de prioridad fuerte.

**Tensión 3: PLG (product-led growth) vs B2B-only (admin desde día 1).**
- CGO le hizo pushback explícito a Pablo: "100% B2B 0% B2C es media verdad — Notion/Slack/Figma cierran B2B porque individuo prueba primero como champion".
- Pablo le dijo a CGO: "100% B2B 0% B2C". Pablo le dijo a CMO (implícito): B2B-first.
- CMO está construyendo TikTok orgánico personal de Pablo. Eso atrae individuos, no admins de empresa.
- **Decisión abierta:** ¿el producto tiene tier individual (free o pagado) que funciona de funnel para B2B? ¿O cierra la puerta a individuos completamente?
- **Voto preliminar CPO:** PLG. Matar B2C es regalar el TikTok de Pablo, que solo convierte si el producto acepta individuos. PLG individuo→empresa funciona en B2B SaaS moderno.

**Por qué importan al producto:**
- Las 3 cambian arquitectura, mecánica, copy y roadmap si se contestan distinto.
- Ninguna es marketing/growth/finance pura — todas son decisiones de QUÉ es el producto.
- Bloquean los entregables CPO (a) Hooked teardown, (c) Roadmap operación, especialmente (c) porque la fase operación se ve distinta para individuo vs empresa.

**Cuándo aplicar:**
- Toda decisión de scope/roadmap producto debe pasar por estas 3 antes de comprometerse a build.
- El Orquestador debe vigilar que los outputs de CFO (pricing reframe), CMO (positioning), CGO (GTM playbook) sean consistentes con la resolución de las 3.
- Si Pablo contesta solo 1, las otras 2 quedan abiertas y bloquean entregables específicos.
- Cuando Pablo conteste, marcar esta memoria como cerrada y registrar la decisión en `decision_*` correspondiente.
