---
type: metodologia
title: verificar opiniones de diseño de pablo contra el hig
date: 2026-06-05
tags: [hig, ux, diseno, feedback, proceso]
dept: [producto]
---

Siempre que Pablo dé una opinión de diseño (ej. "se ve muy abajo", "el botón muy claro", "esto no hace sentido", "las esquinas no empatan"), NO aplicarla a ciegas: primero complementarla y verificarla contra el HIG (Human Interface Guidelines). El proceso: (1) aterrizar su intuición en el principio de HIG que aplica — centrado óptico, jerarquía visual, ritmo/spacing, contraste, affordance, consistencia de radios/tokens, etc.; (2) medir/verificar empíricamente cuando se pueda — computed styles, posición vs. centro del viewport, contraste, radios reales (no adivinar); (3) explicarle qué dice el HIG y por qué su instinto es correcto o necesita matiz; (4) recién entonces aplicar el cambio, al nivel correcto (token / componente compartido / global / pantalla).

**Por qué:** Pablo lo pidió textual: "Siempre que te de una opinion de diseño complementalo y verificalo con el HIG, guarda esto en la memoria." No quiere que sus opiniones se ejecuten en automático; quiere que se aterricen en el principio de diseño y se validen con datos. Ejemplo de la sesión: dijo que el login "se veía muy abajo" → se midió (67px bajo el centro, porque centraba debajo del nav de 56px) → se aterrizó en el principio HIG de centrado en viewport completo + centrado óptico → se explicó y se arregló (nav en overlay, contenido a centro real, 0px de offset).

**Cuándo aplicar:** En cada turno de revisión de UI/diseño (la fase pantalla-por-pantalla), cada vez que Pablo dé una opinión o instrucción visual. Antes de tocar el código: nombrar el principio HIG, medir si aplica, explicar, y luego aplicar al nivel correcto.
