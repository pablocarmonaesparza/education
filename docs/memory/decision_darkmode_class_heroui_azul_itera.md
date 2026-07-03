---
type: decision
title: dark mode por clase .dark (no media) y heroui en azul itera
date: 2026-06-12
tags: [design-system, tailwind, heroui, dark-mode]
dept: [producto, desarrollo]
---

Tailwind quedó en `darkMode: "class"` (antes `["media","class"]`, que en la práctica actuaba como `media`). Todo el sistema de theming conmuta por la clase `.dark` que next-themes pone en `<html>` (`attribute="class"` en `app/providers.tsx`): simulador.css, design tokens y ahora también las utilidades `dark:` de tailwind. Además el theme de HeroUI en `tailwind.config.ts` pasó de indigo/morado (#6366F1/#A855F7) a `primary: #1472FF` (azul Itera) en light y dark; `secondary` se eliminó porque ningún componente HeroUI del app recibe `color="secondary"`.

**Por qué:** las utilidades `dark:` seguían la preferencia del OS mientras el resto del sistema seguía la clase de next-themes — dos fuentes de verdad para el tema. Y el indigo de HeroUI se filtraba en componentes (Switch de /perfil) rompiendo la paleta monocromática azul+neutros del design system. Verificado en browser (2026-06-12): toggle Claro/Oscuro en /design/components conmuta correcto vía clase.

**Cuándo aplicar:** al agregar componentes HeroUI nuevos (heredan primary azul, no hay secondary), al escribir CSS con variantes dark (siempre asumir conmutación por `.dark`, nunca `@media (prefers-color-scheme)`), y si alguien propone volver a `darkMode: media`.
