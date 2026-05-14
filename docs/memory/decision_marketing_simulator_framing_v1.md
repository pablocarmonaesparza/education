---
type: decision
title: marketing input bajo framing simulator de criterio IA — síntesis R24 2026-05-09
date: 2026-05-09
tags: [simulator, criterio-ia, posicionamiento, pricing-band, latam, section-ai, wharton-vacancy, marketing-input]
dept: [marketing, ventas, producto]
---

> Memo escrito como **input para cuando Pablo decida mover producto**, no como ejecución.
>
> Per update 2026-05-09 de `decision_tesis_concentracion_plataforma.md`: "Estado vigente: exploración estratégica. Todavía no hay PRD, IA flow definitivo, schema, métricas cerradas, pricing impact o plan de migración. Siguiente trabajo correcto: entender el problema, categoría, comprador, evidencia esperada y competencia antes de mover producto real."
>
> Este memo cubre **competencia + categoría + banda pricing**. NO ejecuta posicionamiento ni outbound. Reemplaza marketing-side al SUPERSEDED `decision_marketing_post_research_2026_05_09.md` en cuanto al framing.

## Categoría declarable (R24 confirmado)

**"AI-native simulation × evidencia de criterio IA medible"** — cuadrante vacante.

Verificado homepage por homepage:
- Wharton Interactive: cerró marketplace 30-abr-2025
- Section AI: cursos + coach + dashboard, NO simulación
- Attensi: frontline retail/scripted
- Mursion: AI Roleplay como feature, no tesis
- Whatfix Mirror: AI Roleplay como feature, no tesis
- Forage: free job sims, modelo employer-funded, no enterprise readiness
- Cero competidores con UI español neutro LATAM

## Buyer probable (refinar con design partners F1)

R24 + ICP_v2 §3 (champion) cruzados, hipótesis vigente:
- **SMB + mid-market LATAM 50-500 empleados** (Section AI explícitamente no atiende <100 ppl + solo inglés)
- **Decision maker:** Head of Operations / CHRO / dueño-de-PyME / director de transformación digital
- **Champion individual:** Manager/Lead/Head con dolor "mi gente prueba IA sin método" (ICP_v2 §3 sigue válido como capa)
- **Geo prioritario:** MX/CO/AR/CL (4 países = ~80% del SOM según R21)

⚠️ El ICP_v2.md actual menciona "operación con cuenta LLM real" — eso es pre-pivote. La definición operacional del champion sigue válida; el filtro "output mejora 20-50% si supieran usar AI bien" requiere ajuste post-pivote a "criterio mejora si practica con escenarios".

## Evidencia que la empresa espera (per update 2026-05-08)

NO ROI duro inmediato, NO automatizaciones en producción. SÍ:
- Calidad de criterio (qué tan bien decide el empleado en escenario simulado)
- Errores comunes detectados (qué patrones se repiten)
- Mejora en decisiones a lo largo del tiempo
- Privacidad y manejo de riesgo (¿el empleado protege data sensible al usar IA?)
- Capacidad de usar IA con supervisión razonable
- Gaps por persona/equipo (dashboard org-level)

Comparable Section AI tiene dashboard de cohortes; Itera necesita algo análogo pero centrado en criterio, no en completion de curso.

## Banda pricing defensible (R24 + R21 cruzados)

**Rango Itera realista: $300-$1,200/seat/year** (anchor Section AI $750/seat/year teams).

Posicionamiento dentro de la banda:
- Banda inferior ($300-500/seat/year ≈ $25-42/mes): pricing-led, captura volumen LATAM
- Banda media ($500-900/seat/year ≈ $42-75/mes): paridad-con-anchor Section, justifica con simulación + LATAM
- Banda alta ($900-1,200/seat/year ≈ $75-100/mes): premium, requiere evidencia robusta de outcomes

**Mi T2 reframe previo ($29/$25/$19/mes = $228-348/year) caía en banda inferior.** Subestimado para framing simulator.

**NO cierro T2 hoy.** Estado producto = exploración. Pricing se cierra cuando hay PRD + design partners pagando.

## Posicionamiento heredable (input, no aprobado)

Cuando Pablo decida mover producto, las dos líneas que la data sostiene:

1. *"Lo que Wharton Interactive fue para business school clásica, Itera lo es para la era IA en español."* — captura el hueco de 12+ meses post-cierre.
2. *"Categoría: AI-native simulation con criterio IA medible — vacante en LATAM español."* — declara espacio.

Ambas son hipótesis para test contra design partners F1, no copy aprobado.

## Lane competitiva defensible

**SMB + mid-market LATAM en español** sin colisión con Section AI (su política explícita los excluye).

Esto significa:
- No pelearse contra Section AI por enterprise US/UK >100 ppl
- No pelearse contra Crehana/Platzi por catálogo broad tech
- No pelearse contra Coursera/Udemy por volumen
- Sí pelearse en: AI-native simulation × LATAM español × SMB-mid

## Lo que NO ejecuto hoy (pero queda mapeado)

- Reescribir `app/page.tsx` hero con framing simulator → espera PRD
- Crear `/empresa` landing → espera framing producto cerrado
- Outbound templates v3 con líneas Wharton-heir + categoría vacante → espera prioridad de Pablo
- Cerrar T2 pricing → espera exploración producto cerrada

## Lo que sí queda accionable independiente del framing

- **Brand risk `iteraprocess.com`** (Anthropic partner desde marzo) — sigue urgente, no depende de tesis simulator
- **Endeavor Outliers BA May 14-17** (en 5-6 días) — independiente
- **Validación empírica del problema con design partners** — el siguiente trabajo correcto per update 2026-05-09. Discovery scripts pueden empezar ya con framing simulator: *"¿qué evidencia te haría confiar que tu equipo decide bien usando IA?"*

## Cuándo aplicar

- Cuando Pablo decida mover producto: este memo es el punto de partida del framing marketing-side.
- En cualquier conversación de discovery con design partners: usar el problema vigente (escapar curso teórico, evidencia tangible) y la hipótesis vigente (simulador + readiness medible) como anchor.
- En decisiones de pricing futuras: la banda $300-$1,200/seat/year viene de comp Section AI verificado.
- En análisis de competencia futuro: cuadrante "AI-native simulation × criterio IA medible × LATAM español" sigue siendo el espacio reclamable hasta que entre alguien.

## Por qué este memo y no actualizar POSICIONAMIENTO.md directamente

POSICIONAMIENTO.md v2 lo edité hoy con framing pre-pivote. **No lo edito otra vez** hasta que producto cierre framing simulator. Esto evita que el doc oficial oscile mientras la tesis está en exploración. El memo vive aquí como input documentado.
