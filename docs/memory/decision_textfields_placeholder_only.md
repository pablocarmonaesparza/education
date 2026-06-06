---
type: decision
title: textfields sin label arriba, solo placeholder
date: 2026-06-05
tags: [diseno, componentes, onboarding, textfields]
dept: [producto]
---

Todos los textfields del sistema (AppleInput, AppleTextarea, AppleSelect) van SIN label arriba de la caja: la instrucción/pregunta vive en el placeholder. AppleInput/AppleTextarea convierten el prop `label` en `aria-label` (a11y) sin renderizar label visible; para AppleSelect se usa `aria-label` + `placeholder`. Aplica a TODO el sistema, incluidos cuestionarios — no meter `<label>` visibles "porque es un cuestionario".

**Por qué:** regla firme de Pablo desde el rediseño de auth ("que tanto en sign in/sign up como en todos los textfields desaparecieran los labels de arriba, dejando solo el placeholder"). Claude la rompió en el paso de contexto/brief del onboarding (metió `<label>` visibles argumentando que un cuestionario los necesita) y Pablo corrigió: "ya había platicado contigo de que no quería labels, solo la instrucción en los placeholders". La preferencia de Pablo manda sobre el argumento HIG de que el placeholder-como-label se pierde al teclear.

**Cuándo aplicar:** al construir o migrar cualquier pantalla con textfields/selects/textareas. Nunca un `<label>` visible arriba; la instrucción va en `placeholder` y la pregunta en `label`→`aria-label` (o `aria-label` directo para AppleSelect).
