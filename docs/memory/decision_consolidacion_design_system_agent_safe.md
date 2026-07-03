---
type: decision
title: consolidación agent-safe del design system (DEC-005..011)
date: 2026-06-07
tags: [diseno, design-system, hig, rutas, tokens, consistencia]
dept: [producto]
---

Limpieza documental + de código para que los docs de diseño dejen de contradecirse entre sí y con el código vivo. Disparada por una auditoría de Codex (10 inconsistencias, todas verificadas reales contra el repo) + 2 hallazgos extra. Las decisiones quedaron formalizadas como `DEC-005..011` en `docs/simulador/front/APPLE_HIG_RULES_FOR_ITERA.md` (§19) — esa es la fuente única; esto es el resumen para recall.

- **DEC-005** · `radius-md` (12px) universal en todo lo redondeado (inputs, botones, cards chicas). Supersede a DEC-004 (que decía botones `radius-sm` 8px). Ya vivía en `simulador.css`; ahora está escrito en el HIG.
- **DEC-006** · textfields solo placeholder (formaliza [[decision_textfields_placeholder_only]]); override de TF-01 y WRITE-05.
- **DEC-007** · runtime sin sidebar + shortcuts mínimos (`Enter`/`Esc`/`Cmd+Enter`; nada de `Cmd+K/S/M` ni palette). Implementado ocultando `AppSidebar` por ruta en `app/(app)/layout.tsx` (`isRuntime` para `/case` y `/jugar`).
- **DEC-008** · bandas verde/ámbar/rojo + letra A/M/B se quedan (revierte el "no semáforo" viejo del Product Vision).
- **DEC-009** · `--accent-strong: #0e5fcc` para fondos con texto blanco (botones/badges primary); resuelve el contraste de `#1472ff` (4.30:1 → AA 5:1) sin tocar la marca. `#1472ff` sigue para links/focus/bordes. La clase `.accent-bg` y los `bg-[var(--accent)] text-white` productivos apuntan a `accent-strong`.
- **DEC-010** · verificación con `npm run check:simulador` / `lint:simulador` / `build` (no `bun`).
- **DEC-011** · tokens de tipografía en `px` (escala única editable en `/design`); A11Y-05 se cumple con browser-zoom + test 200%, no exige `rem`.

Principio estructural que causó el drift y que ahora se aplica: **fuente única + punteros, no re-enunciar** (igual que [[metodologia_design_system_fuente_unica]] para componentes). HIG = reglas; `FRONT_CONTRACT.md` = rutas (tabla derivada del código, con columna **estado**); `/design/components` = espejo vivo. El checklist, los copy docs y `AGENTS.md` ahora APUNTAN a esas fuentes en vez de copiar.

**Rutas — hallazgo importante (verificado por grep, contradice la lectura por contenido):** `/case/[case_id]` (motor 5 pasos) está CONECTADO (lo linkean `CaseCard` y todos los catálogos); `/jugar/[case_id]` (motor nuevo 6 secciones) está HUÉRFANO (nadie lo linkea). `/dashboard` es el destino post-login vivo, coexiste con `/team` (empleado) y `/staff` (manager). NO se archivó nada: cuál motor gana y cómo consolidar las 3 entradas es decisión pendiente de Codex/producto, documentada en `FRONT_CONTRACT.md`. `/field-test/...` no existe en el árbol (el demo público es `/case-demo`).

**Por qué:** un agente que leyera estos docs antes fallaría o pelearía contra el sistema (HIG decía label-arriba pero el código es placeholder-only; checklist decía Lucide pero el código es 100% Tabler vía `AppleIcon`; HIG decía botones `radius-sm` pero el código usa `radius-md`; Product Vision prohibía sidebar en runtime pero el layout lo inyectaba). Ahora los docs reflejan el código y entre sí.

**Cuándo aplicar:** al tocar cualquier regla de diseño, ruta o token, leer primero el HIG (§19 `DEC-*`) y `FRONT_CONTRACT.md`. Al crear UI nueva, no re-enunciar reglas en docs nuevos: apuntar a la fuente. Antes de archivar una ruta "duplicada", grep de referencias entrantes (la clasificación por contenido engaña). Pendiente menor: barrido de `bg-[var(--accent)] text-white` en `app/exercise-lab/*` (dev-only) a `accent-strong` cuando se promuevan esos bloques.
