# 1 — brief del participante (caso 1 rendered)

> **lo que ve el participante.** texto literal que se le comparte como
> Google Doc / PDF antes de iniciar la sesión. lo lee al inicio (~3 min)
> y vuelve a referenciarlo durante la sesión.
>
> **datos sintéticos.** ningún dato proviene de cliente real. nombres,
> emails y empresas son ficticios.
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## bienvenida

gracias por participar. esto es un estudio breve de 30 minutos sobre
**cómo profesionales de marketing toman decisiones con IA bajo presión**.

no es una prueba personal. no hay "respuesta correcta única". no estás
siendo evaluado como persona — el caso es el que se evalúa.

vas a leer una situación de trabajo simulada, completar 5 pasos cortos
(~18 minutos) y después tendremos una conversación de ~12 minutos.

regla importante: **responde como lo harías de verdad en tu trabajo**, no
como crees que "deberíamos esperar".

---

## la situación

eres **Marketing Manager en Loop**, una SaaS B2B mid-market (120
empleados) que vende plataforma de atención al cliente con IA en LATAM
(México, Colombia, Chile).

tu equipo de growth es de 6 personas. reportas a **Camila**, VP of
Growth.

la cultura es ágil. hay GPT corporativo aprobado por IT. el gobierno
de IA es informal: no hay DPO interno, no hay playbook de PII, los
criterios viven en cada manager.

## qué está pasando

es **jueves 4:30 PM**. Camila te escribe por slack:

> *"hey, necesito 3 ángulos para LinkedIn ads + 1 email a la lista de
> prospects para mañana 9 AM. revisa el feedback que CS nos pasó hace 2
> meses, ahí está todo. enfócate en lo que más duele a los clientes que
> ya nos están pagando — quiero que el ángulo sea creíble, no marketing
> genérico. no me metas a legal hoy, ya están cerrados, los vemos lunes
> si hay algo. confío en tu criterio. — Camila"*

mañana arranca el **lanzamiento del Q2 2026**. la campaña que entregues
es la que sale por LinkedIn ads + email a 12,000 prospects.

tienes **16 horas** hasta el deadline.

---

## lo que tienes a tu disposición

1. **el brief de Camila** (arriba)
2. **un dataset CSV** con feedback de clientes que Customer Success
   recopiló hace 2 meses
3. **el modelo de Itera (LLM corporativo)** — el mismo que tu empresa
   tiene aprobado por IT; en este experimento, lo accedes a través del
   operador (te ayudará a interactuar con él durante el caso)

### sobre el dataset

el CSV tiene **60 filas** con feedback de clientes. cada fila tiene
estas columnas:

| campo | ejemplo |
|---|---|
| name | "Mariana López" |
| email | "mariana.lopez@aurorares.mx" |
| company | "Aurora Recursos" |
| complaint_or_praise | "el módulo de reportes se traba cuando paso de 200 clientes activos, perdí media hora ayer revisando una junta con mi CFO" |
| revenue_potential_usd | 24000 |
| signed_at | "2026-03-12" |

ejemplos de filas del dataset (vas a tener acceso a las 60 durante la
sesión):

- **Mariana López** · aurorares.mx · Aurora Recursos · "*el módulo de reportes se traba cuando paso de 200 clientes activos, perdí media hora ayer revisando una junta con mi CFO*" · $24,000 · 2026-03-12
- **Carlos Mendoza** · grpotec.cl · Grupo Tec · "*me encanta el auto-tag, pero el SLA tracker se rompió 3 veces este mes y nadie nos avisó, mi equipo está harto*" · $48,000 · 2026-02-28
- **Sofía Ramírez** · digitalup.co · DigitalUp · "*queremos integración con WhatsApp Business — sin eso no podemos escalar al canal donde están nuestros clientes en Colombia*" · $96,000 · 2026-04-01
- **José Aguilar** · ferrenorte.mx · Ferre Norte · "*el onboarding de mi equipo fue caótico, pero después de 2 semanas todos lo usan diario, ya no podríamos volver atrás*" · $18,000 · 2026-03-30
- **Camila Suárez** · nubeplus.co · NubePlus · "*ya pagué 6 meses y no veo cómo medir ROI, ¿hay forma de saber si vale la pena renovar antes del review?*" · $36,000 · 2026-04-15
- **Andrés Vega** · trafic.mx · Trafic Logística · "*el bot a veces responde cosas que no tienen sentido para nuestro contexto LATAM, mi cliente me preguntó si era humano*" · $62,000 · 2026-03-08
- **Lucía Núñez** · ventacenter.cl · VentaCenter · "*necesitamos reportes en español neutro, los que vienen de fábrica usan jerga gringa que mi equipo no entiende*" · $28,000 · 2026-04-22
- **Diego Castillo** · plenum.co · Plenum Group · "*el módulo de billing tiene un bug con SAT México, llevamos 2 meses esperando fix y se nos atrasan facturas*" · $54,000 · 2026-03-19

(el operador te comparte las 60 filas completas en la sesión.)

---

## los 5 pasos del caso

vas a completar 5 pasos en orden. cada uno toma 2-5 minutos.

### paso 1 — preparación de datos
qué decides hacer con cada uno de los 6 campos del CSV **antes** de
pasarlo al modelo.

### paso 2 — interacción con el modelo
redactas el prompt que le envías al modelo. el operador lo pasa al LLM
y te devuelve la respuesta. luego decides qué hacer con esa respuesta.

### paso 3 — revisión del output
el modelo devolvió 3 ángulos de campaña. revisas cada uno y marcas
problemas si hay.

### paso 4 — entrega a Camila
eliges cómo le entregas los ángulos finales a Camila por slack.

### paso 5 — respuesta a una propuesta de Camila
Camila te contesta con una pregunta de follow-up; le respondes.

---

## reglas durante la sesión

- responde como lo harías en tu trabajo real, no como crees que
  "queremos que respondas"
- si no sabes qué hacer en un paso, pídele al operador "siguiente paso"
  y déjalo en blanco — no es penalización, es señal
- el operador NO te va a guiar sobre qué decisión tomar. solo te
  ayuda con la logística (cómo enviar el prompt, dónde escribir, etc.)
- si tienes dudas sobre la mecánica del caso (no sobre las decisiones),
  pregúntale al operador en cualquier momento
- la sesión es grabada (audio + screen share) solo para análisis interno
  posterior; el grabación se elimina después de 90 días

## qué pasa después

- la sesión termina con ~12 minutos de conversación: te preguntamos
  qué te pareció, qué te resultó realista o no, si lo correrías con tu
  equipo, etc.
- 2 evaluadores externos (consultores marketing senior, no Itera) van
  a calificar tu sesión usando una rúbrica de 5 dimensiones
- recibes un **reporte personalizado** de tu sesión en ~2 semanas:
  bandas A/M/B por dimensión + 2-3 sugerencias concretas
- recibes el incentivo (gift card) al cierre de la sesión

## confidentiality note

por favor no compartas el caso ni tu reporte por **90 días** después
de la sesión. seguimos iterando y queremos que otros participantes
lleguen sin spoilers.

esto es un acuerdo simple, no NDA legal. si tu empresa requiere NDA
formal, dinos antes y lo coordinamos.

---

## antes de empezar

cuando estés listo:

- avísale al operador
- comparte pantalla
- abre el Google Form que el operador te va a compartir
- el operador inicia el cronómetro: tienes 18 minutos de tiempo
  estimado (no es estricto; si necesitas 22 está bien)

cualquier pregunta antes de iniciar — pregúntale al operador ahora.
