# Migración redesign-v2 (Duolingo-craft) a todo el producto

> **ESTADO 2026-07-16: EJECUTADO** (Lote 0 completo + dashboards + ejercicios;
> gate adversarial PASS a la 3.ª ronda). Lo hecho: tokens v2 globales + dark
> navy derivado AA + Jakarta root + labio 3D en botones + 9 componentes
> modificados + 5 promovidos de la landing + espejo actualizado + AppSidebar/
> /team/StaffDashboard(stats band)/aprender(patrones del mock)/17 bloques +
> runtime. `.redesign-v2` quedó como pin-light de la landing. Los FAILs de los
> gates fueron todos de contraste dark (blanco sobre --accent claro #7a94ff,
> 2.80:1) — regla resultante: **sólidos con contenido blanco SIEMPRE sobre
> --accent-strong / .accent-bg, nunca --accent pelado**. Pendiente de lotes
> futuros: /reportes y /report (pasada de diseño consciente + print), /demo
> hermanado, /empresa, onboarding, admin (todos ya heredan tokens sin romperse
> — verificado).

> **ADENDA 2026-07-16 (tarde) — el labio NUNCA había renderizado + dashboard
> manager v2.** Feedback de Pablo: "los botones no tienen la profundidad
> Duolingo". Causa raíz: `shadow-[var(--shadow-lip)]` y TODOS los
> `shadow-[var(--shadow-*)]` (38 sitios, 20 archivos) renderizaban
> `box-shadow: none` — Tailwind resuelve un `var()` pelado dentro de
> `shadow-[...]` como COLOR de sombra, no como la sombra. Fix: la escala
> completa vive ahora en `tailwind.config.ts → theme.extend.boxShadow`
> (xs/sm/md/lg/xl/lip/lip-lg/lip-danger/card/float/float-lg → `var(--shadow-*)`);
> **regla: usar `shadow-lip`/`shadow-card`/etc., JAMÁS `shadow-[var(--…)]`**.
> Press hundido auténtico: el botón baja EXACTAMENTE la altura del labio
> (4px, lip-lg 5px), no 2px. Gate adversarial (3 lentes) sacó 2 bloqueantes
> reales, ya corregidos: par `--v2-red-strong` #d92643 (blanco 4.87:1 AA) +
> `--v2-red-lip` #a51e39 estable en ambos temas (en dark `--v2-red-dark` se
> invertía a MÁS CLARO que la cara) — **regla espejo: sólidos danger con
> blanco sobre --v2-red-strong, nunca --v2-red pelado**.
> Además: **/staff (inicio) reconstruido** según los mockups Claude Design
> 6a/7e que pasó Pablo — hero band con anillo de progreso + "N of M assessed"
> + chips + CTA blanco con labio, fila de 4 KPIs (adoption/practice+sparkline/
> readiness+dimensión débil/risk), chart de actividad de 8 semanas, tabla
> Individual performance (filtro All/Needs attention, acciones Open report/
> Remind mailto), Team skills con "· focus" + tile de sugerencia, y "Needs a
> push" priorizado. Datos 100% reales: `/api/dashboard` extendido
> (readiness_score, practice_completed_total/week, last_active_at por member;
> activity_by_week 8 semanas lunes-UTC, active_this_week en aggregate) y el
> mock de dev-bypass espejado (scores canónicos BAND_REPRESENTATIVE_SCORE —
> los literales viejos 85/60/35 producían bandas imposibles). Breakpoints con
> sidebar: tabla a `lg`, split 2-col e KPI×4 a `xl` (a `md`/`lg` quedaban
> exprimidos). Verificado en browser: claro, dark, 375px sin overflow.
> Onboarding /context: hint "o pulsa Enter" → "or press Enter" (resto de
> español) y "Finish later" alineado al eje del CTA.

Plan derivado de la auditoría 2026-07-16 (4 agentes: tokens+dark, componentes,
superficies, tipografía). Fuente del estilo: la landing aprobada
(`components/simulador/LandingPage.tsx` + scope `.redesign-v2` en
`app/(app)/simulador.css:536-627`). Auditoría completa en el output del workflow
`redesign-v2-audit` (sesión 46be8da8).

## Veredicto

**Es viable y la arquitectura ya estaba preparada**: cero hex hardcodeado en
superficies de producto, todo lee `var(--…)`. La promoción de tokens propaga
~70% del cambio a las 52 rutas de golpe. El 30% restante es Lote 0 (mecánica) +
pasadas por lote.

## Lo que la promoción de tokens NO hace sola (Lote 0)

1. **Jakarta al root**: hoy `--font-jakarta` solo se carga en `app/page.tsx`.
   Mover `Plus_Jakarta_Sans` a `app/layout.tsx`; matar Darker Grotesque
   (una regla en `globals.css:62-65`) e Inter (ya muerta de facto).
   La escala `ts-*` NO se re-snapea (validada con Jakarta en la landing);
   solo cambian pesos (500/600 → 700/800 en display) y tracking (tokenizar
   los 17 `tracking-[...]` arbitrarios de la landing).
2. **Labio 3D en botones** (la palanca máxima): `AppleButton` declara
   `shadow-none` + `font-medium` — restilizar AppleButton/AppleButtonLink/
   AppleSlideButton con `--shadow-lip`, `hover:brightness-110`, press hundido
   (`active:translate-y-[2px]`), `font-extrabold`. Nuevo token
   `--shadow-lip-danger` para tone danger.
3. **Bandas A/M/B**: v2 no las definía. Mapeo a la familia v2 con AA
   verificado (OJO: `--v2-green-dark` como texto de banda FALLA AA — usar
   `#067050`; valores completos en la auditoría, bloque "Bandas").
4. **Dark mode**: v2 era light-only. La auditoría derivó la paleta navy-dark
   completa desde la tinta ink (#171d33) con ratios calculados (canvas
   `#0b0e1c`, accent claro `#7a94ff` para texto/bordes + `#2e55ff` para
   sólidos — el #003aff pelado falla 3:1 sobre canvas oscuro). **Decisión:
   adoptarla** (el producto ya vive en dark por OS; forzar light sería
   regresión visible). Fallback si el QA la tira: forzar light en v1.
5. **`opengraph-image.tsx`** hardcodea el acento viejo #1472FF — va con la
   promoción.

## Componentes (34 en apple/)

- **Modificar (9)**: AppleButton, AppleSlideButton, AppleCard (receta
  `.card-apple` en css), AppleBadge (pesos/pill), AppleKpiCard (clase
  `.display` fija SF Pro — re-declarar), AppleIcon (stroke 1.5→2),
  AppleExercisePrimitives (rounded-xl/2xl fijos → tokens), AppleMessageCard,
  AppleModal (sombras viejas → card/float).
- **Heredan gratis (~22)**: inputs, tablas, switches, sidebar, skeleton, etc.
- **Nuevos (promover de la landing, mismo namespace apple/)**: AppleLogoMark,
  AppleCheckRow, AppleStatTile, AppleEyebrowChip, AppleBrowserFrame.
  ArrowIcon NO (duplica AppleIcon). La mascota queda one-off por ahora.
- **Espejo `/design/components`**: 5 secciones nuevas + specs v2 de botones +
  cargar Jakarta ahí.

## Conflictos resueltos (documentar en RULES_LEDGER al ejecutar)

- **"Cards sin contorno" vs cards v2 con borde+sombra**: gana v2 — la landing
  con cards bordeadas es diseño aprobado por Pablo, posterior a la regla.
  La regla vieja se deroga formalmente.
- **/empresa "sin contornos, dividers"**: misma derogación, se revisa en su
  lote con criterio v2.

## Lotes (ventanas ~5 días)

- **Lote 0 — mecánica**: Jakarta root + promoción de tokens (tabla lista en
  la auditoría) + dark v2 + bandas + botones con labio + AppleCard/Input +
  espejo + opengraph. Gate `/componente-hig` por componente tocado.
- **Lote 1 — venta**: PublicNav unificado (hoy `/` y `/demo` muestran DOS
  marcas distintas: LogoMark vs itera-logo-light.png) → /demo → /case-demo →
  /aprender-demo → /report/[id] (+retest print) → auth.
  *Quick win: /demo puede envolverse en `.redesign-v2` HOY sin esperar Lote 0.*
- **Lote 2 — empleado**: AppSidebar → CaseCard (propaga a 4 superficies) →
  /team → /casos → /aprender → runtime QA (17 bloques × estados; el chrome
  del runtime hereda limpio — acoplamiento bajo verificado) → /reportes →
  /perfil.
- **Lote 3 — manager + pago**: StaffDashboard (5 rutas de un tiro) →
  /staff/casos → /empresa → onboarding ×6 (billing tiene el único layout con
  px fijos del producto) → utilitarias → privacy/terms.
- **Lote 4 — admin** (heredan; pasada ligera al final).

## Gates por lote

typecheck + check:simulador + build + verificación en browser real (claro y
oscuro, 375px) + `/componente-hig` para componentes y `/verification-design`
para superficies. El runtime (Lote 2) presupuesta sesión de gate propia: es
lo que juega el cliente.
