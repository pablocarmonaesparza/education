import type {
  ExerciseBlockId,
  ExerciseBlockProps,
} from "@/components/simulador/exercises/ExerciseBlockRenderer";

export type DemoCaseLevel = "N1" | "N2" | "N3";

export type DemoSlideKind = "reading" | "exercise";

export type DemoSlide = {
  id: string;
  kind: DemoSlideKind;
  eyebrow: string;
  title: string;
  body: string;
  exerciseBlockId?: ExerciseBlockId;
  exerciseProps?: ExerciseBlockProps;
};

export type DemoCaseSection = {
  name: "Contexto" | "Datos" | "IA" | "Revisión" | "Decisión" | "Respuesta";
  slides: DemoSlide[];
};

export type DemoCase = {
  id: string;
  title: string;
  level: DemoCaseLevel;
  profile: string;
  minutes: number;
  company: string;
  summary: string;
  freshness: string;
  tools: string[];
  managerBrief: string;
  sections: DemoCaseSection[];
};

export const demoCases: DemoCase[] = [
  {
    id: "marketing-dirty-data-campaign",
    title: "Meta Ads cambió una campaña con IA",
    level: "N1",
    profile: "Marketing/Growth",
    minutes: 18,
    company: "Loop SaaS B2B",
    summary: "Tres ángulos de campaña usando IA sin publicar claims ni variaciones inseguras.",
    freshness: "Basado en Advantage+ creative, generación de textos y automatización de Meta Ads.",
    tools: ["ChatGPT", "Claude", "Meta Ads", "Google Sheets"],
    managerBrief:
      "Mándalo a equipos que ya usan IA para copy o ads. Mide si distinguen velocidad creativa de publicación responsable, especialmente cuando Meta puede generar variaciones de texto, imagen o placement.",
    sections: [
      section("Contexto", [
        reading("01.01", "Loop quiere recuperar cuentas dormidas.", "El equipo de Marketing detectó que varias cuentas grandes bajaron su uso. Camila, VP de Marketing, quiere lanzar una campaña de reactivación esta semana."),
        reading("01.02", "La presión viene de performance.", "Meta Ads permite usar Advantage+ creative para generar variantes de texto, imagen y formato. El equipo quiere moverse rápido porque el CPA subió dos semanas seguidas."),
        reading("01.03", "No estás creando una campaña final.", "Tu trabajo es preparar tres ángulos de campaña para que Camila decida cuál probar. La campaña todavía no debe publicarse."),
        reading("01.04", "El riesgo está en lo que se automatiza.", "Si subes datos equivocados o dejas que la IA exagere, puedes terminar con claims sin fuente, precios incorrectos o mensajes demasiado personalizados."),
        reading("01.05", "La señal para el manager.", "Este caso muestra si alguien puede usar ChatGPT, Claude y Meta Ads como apoyo creativo sin perder control sobre datos, claims y validación humana."),
      ]),
      section("Datos", [
        reading("02.01", "Antes de pedirle algo a la IA, limpia el material.", "Marketing reunió datos de uso, feedback de clientes y notas de ventas. No todo debe entrar al prompt ni a Meta Ads."),
        data("02.02", "Clasifica datos para el prompt.", [
          ["Uso agregado por segmento", "Muestra patrón sin identificar cuentas concretas", "Usar"],
          ["Nombre y correo del champion", "Dato personal que no aporta al ángulo creativo", "Excluir"],
          ["Comentario textual de cliente", "Útil, pero puede revelar contexto sensible", "Anonimizar"],
        ]),
        reading("02.03", "Conserva señal, reduce exposición.", "Un buen input no es el más completo. Es el que permite razonar sin meter información que no necesitas."),
        data("02.04", "Clasifica datos para Meta Ads.", [
          ["Lista de cuentas con bajo uso", "Puede usarse sólo si está agregada o en audiencia permitida", "Agregar"],
          ["Oferta comercial no aprobada", "Puede generar promesa falsa si aparece en creatividad", "Excluir"],
          ["Tres objeciones frecuentes", "Sirven como insight si se redactan sin identificar clientes", "Anonimizar"],
        ]),
        reading("02.05", "Ya tienes un perímetro de trabajo.", "Ahora sí puedes pedir apoyo a IA: ángulos creativos, no promesas finales ni targeting sensible."),
      ]),
      section("IA", [
        reading("03.01", "El prompt debe acotar la creatividad.", "No buscas que la IA publique anuncios. Buscas que proponga opciones revisables para una audiencia ejecutiva."),
        guided("03.02", "Construye el prompt con opciones guiadas.", "Elige objetivo, audiencia, límites y modelo. El prompt generado debe explicar qué sí puede usar y qué debe dejar como supuesto."),
        reading("03.03", "El modelo también importa.", "Para generar ángulos puedes usar un modelo rápido, pero si el texto influye en inversión real conviene priorizar seguridad y claridad."),
        ai("03.04", "Redacta el prompt final.", "Usa el campo de IA como una herramienta real: pide tres ángulos, formato breve, límites de datos y validaciones antes de publicar.", "Ejemplo de intención: tres ángulos de campaña para reactivar cuentas con bajo uso, usando sólo datos agregados y señalando qué debe validar Marketing antes de Meta Ads."),
        reading("03.05", "La salida de IA es material de trabajo.", "Aunque suene lista para publicar, todavía debes revisar claims, tono y compatibilidad con la política de campaña."),
      ]),
      section("Revisión", [
        reading("04.01", "La IA propuso tres ángulos.", "Uno promete recuperar cuentas en 30 días, otro sugiere usar nombres de clientes y el tercero plantea una guía de reactivación con validaciones pendientes."),
        review("04.02", "Marca lo que no puede pasar directo.", [
          "Podemos recuperar 40% de cuentas en 30 días.",
          "Usa el nombre de cada champion para que el anuncio se sienta personal.",
          "Presenta tres opciones y valida claims antes de publicar.",
        ]),
        reading("04.03", "Meta puede optimizar, no verificar.", "La plataforma puede generar y probar variaciones, pero no sabe si tu claim comercial está aprobado o si el dato venía limpio."),
        review("04.04", "Detecta riesgo de creatividad automatizada.", [
          "Texto alternativo cambia una oferta de 20% a 30%.",
          "Imagen adaptada conserva el producto y no agrega promesas.",
          "Versión para Reels usa tono de urgencia excesiva.",
        ]),
        reading("04.05", "La revisión convierte velocidad en control.", "Ahora tienes que decidir qué versión puede avanzar y qué controles deben ocurrir antes de invertir presupuesto."),
      ]),
      section("Decisión", [
        reading("05.01", "Camila necesita una decisión.", "No basta decir que hay riesgos. Debes decidir qué mandar, qué bloquear y qué validar antes de publicar."),
        decision("05.02", "Elige qué mandar a Camila.", "Hay presión por avanzar, pero no todos los ángulos están listos para Meta Ads.", ["Enviar tres opciones con riesgos visibles", "Enviar todo tal cual", "Pausar sin propuesta"]),
        reading("05.03", "El tradeoff es velocidad contra confianza.", "La mejor decisión mantiene momentum sin convertir una hipótesis en promesa pública."),
        decision("05.04", "Define el control mínimo.", "Antes de cargar la campaña, ¿qué control debe pasar?", ["Validar claims y tono con Marketing", "Publicar y dejar que Meta optimice", "Pedir a Legal que escriba todo el copy"]),
        reading("05.05", "Ya tienes una decisión operable.", "La respuesta final debe ser breve, accionable y honesta sobre lo que falta validar."),
      ]),
      section("Respuesta", [
        reading("06.01", "Responde como alguien que opera.", "Camila necesita saber qué probar, por qué y qué no publicar todavía."),
        memo("06.02", "Escribe la recomendación final.", "Explica qué opción usarías, qué validarías y qué bloquearías antes de Meta Ads."),
        reading("06.03", "No conviertas el memo en clase.", "Un buen cierre dice acción, evidencia y control pendiente. Eso es lo que el manager puede usar."),
        memo("06.04", "Hazlo ejecutivo.", "Reescribe en una recomendación, dos razones y una validación pendiente."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes usar IA creativa en Marketing sin regalar control a la herramienta."),
      ]),
    ],
  },
  {
    id: "sales-agent-followup",
    title: "Agente de seguimiento en HubSpot",
    level: "N3",
    profile: "Ventas / RevOps",
    minutes: 30,
    company: "Aurora SaaS",
    summary: "Un agente prepara follow-ups y actualiza CRM sin enviar mensajes por su cuenta.",
    freshness: "Basado en HubSpot Breeze, Smart CRM, Smart Deal Progression y workspace agents.",
    tools: ["HubSpot Breeze", "ChatGPT", "Claude", "Gmail", "Slack"],
    managerBrief:
      "Mándalo a reps, RevOps o managers que quieren automatizar seguimiento comercial. Mide si saben delegar preparación a un agente sin permitir envío autónomo, señales inventadas ni updates opacos en CRM.",
    sections: [
      section("Contexto", [
        reading("01.01", "Aurora tiene oportunidades estancadas.", "El equipo comercial llega al cierre mensual con 38 oportunidades sin respuesta. La VP de Ventas quiere recuperar conversaciones sin pedir horas extra al equipo."),
        reading("01.02", "El equipo quiere usar un agente.", "HubSpot Breeze puede ayudar con contexto del CRM, progresión de deals y tareas de seguimiento. También quieren usar ChatGPT o Claude para mejorar borradores."),
        reading("01.03", "El agente no debe vender solo.", "Tu objetivo es diseñar un flujo donde el agente prepare trabajo, pero no contacte clientes ni cambie el pipeline sin control."),
        reading("01.04", "La presión es real.", "Si se automatiza demasiado, el cliente recibe un mensaje fuera de contexto. Si no se automatiza nada, el equipo pierde oportunidades."),
        reading("01.05", "La señal para el manager.", "Este caso muestra si alguien entiende permisos, datos, logs y revisión humana en un flujo con agente."),
      ]),
      section("Datos", [
        reading("02.01", "El agente sólo debe ver lo necesario.", "Antes de escribir el brief, decide qué datos comerciales puede usar para preparar seguimiento."),
        data("02.02", "Clasifica datos del CRM.", [
          ["Etapa del deal", "Señal operativa necesaria para priorizar", "Usar"],
          ["Correo personal del contacto", "Identificador que no debe aparecer en el prompt", "Excluir"],
          ["Notas del account manager", "Útiles, pero pueden mezclar hecho y opinión", "Anonimizar"],
        ]),
        reading("02.03", "No confundas contexto con permiso.", "Que HubSpot tenga datos no significa que el agente deba usarlos todos ni que pueda actuar con ellos."),
        data("02.04", "Clasifica señales de intención.", [
          ["Fecha de última reunión", "Ayuda a ubicar el momento comercial", "Usar"],
          ["Transcripción completa", "Puede incluir información sensible", "Anonimizar"],
          ["Score automático sin explicación", "Puede orientar, pero requiere fuente", "Agregar"],
        ]),
        reading("02.05", "Ya tienes el perímetro.", "Ahora puedes crear un brief de agente con acceso limitado, acción máxima y condición de paro."),
      ]),
      section("IA", [
        reading("03.01", "Define el trabajo del agente.", "Un agente necesita tarea, acceso, acción máxima y condición de paro. Sin eso, sólo estás automatizando ambigüedad."),
        agent("03.02", "Escribe el brief del agente.", "Configura una decisión a la vez: tarea, acceso permitido, acción máxima y cuándo debe detenerse."),
        reading("03.03", "Los permisos son la parte crítica.", "La diferencia entre ayuda y riesgo está en si el agente puede leer, redactar, enviar o actualizar sin revisión."),
        permission("03.04", "Configura permisos.", ["Leer CRM", "Crear borrador", "Enviar correo", "Actualizar etapa del deal"]),
        reading("03.05", "El flujo queda acotado.", "Si el agente prepara borradores y deja registro, acelera. Si envía o modifica pipeline sin revisión, rompe control."),
      ]),
      section("Revisión", [
        reading("04.01", "El agente ya corrió una vez.", "Ahora revisa el log como si fueras responsable de autorizar el flujo para todo el equipo."),
        logs("04.02", "Revisa la corrida del agente.", ["Marcó alta intención sin fuente", "Creó borrador pendiente de aprobación", "Actualizó etapa del deal automáticamente"]),
        reading("04.03", "El log cuenta la verdad del sistema.", "Un buen operador detecta cuándo el agente inventó intención, se saltó aprobación o usó información que no debía."),
        review("04.04", "Detecta errores antes de autorizar.", ["Follow-up menciona una objeción privada", "Borrador incluye pregunta útil y verificable", "CRM cambió sin nota de auditoría"]),
        reading("04.05", "Ya sabes qué bloquear.", "La decisión final debe mantener velocidad comercial sin abrir un riesgo de contacto incorrecto."),
      ]),
      section("Decisión", [
        reading("05.01", "La VP quiere una respuesta práctica.", "No basta decir que el agente tiene riesgos. Hay que decidir cómo usarlo mañana."),
        decision("05.02", "Lanzar, pausar o escalar.", "El pipeline importa, pero el riesgo de enviar mal también.", ["Lanzar con revisión humana", "Pausar todo", "Permitir envío automático"]),
        reading("05.03", "La opción responsable conserva avance.", "Premium no significa lento. Significa que la automatización tiene límites claros."),
        decision("05.04", "Define el control mínimo.", "Antes de activar el flujo, ¿qué control debe quedar fijo?", ["Aprobación humana antes de envío", "Envío libre a cuentas frías", "Actualizar CRM sin registro"]),
        reading("05.05", "La decisión ya tiene consecuencias.", "Ahora toca explicarla para que Ventas y RevOps la puedan operar sin dudas."),
      ]),
      section("Respuesta", [
        reading("06.01", "Cierra con una recomendación clara.", "La VP necesita saber qué autorizas, qué bloqueas y qué señal revisar después."),
        memo("06.02", "Explica la recomendación a la VP.", "Qué autorizas, qué bloqueas y qué debe revisar una persona."),
        reading("06.03", "No vendas el agente como magia.", "Describe la política operativa: preparación sí, envío automático no, cambio de etapa sólo con evidencia."),
        memo("06.04", "Convierte la decisión en política breve.", "Escribe una regla de uso que el equipo pueda aplicar mañana."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes trabajar con agentes sin perder responsabilidad comercial."),
      ]),
    ],
  },
  {
    id: "support-whatsapp-escalation",
    title: "Zendesk AI agent en WhatsApp",
    level: "N3",
    profile: "Soporte / CX",
    minutes: 26,
    company: "NubeFresh",
    summary: "Un agente atiende una queja en WhatsApp y debe escalar sin perder contexto.",
    freshness: "Basado en Zendesk AI Agents, Agent Builder, WhatsApp, voice agents y MCP.",
    tools: ["Zendesk AI Agents", "WhatsApp Business", "ChatGPT", "Gemini"],
    managerBrief:
      "Mándalo a equipos de soporte que quieren automatizar respuestas. Mide si pueden revisar logs, limitar acciones, cuidar datos y escalar a humano cuando el agente ya no debe resolver.",
    sections: [
      section("Contexto", [
        reading("01.01", "NubeFresh recibe una queja pública.", "Un cliente escribió por WhatsApp que le cobraron dos veces y amenaza con publicar capturas si no recibe respuesta clara hoy."),
        reading("01.02", "Soporte quiere usar un agente.", "Zendesk AI Agents puede operar en mensajería, email y voz, pero la conversación mezcla enojo, pagos y datos personales."),
        reading("01.03", "El objetivo no es cerrar a toda costa.", "El agente puede resumir, pedir datos mínimos y preparar una respuesta. No debe prometer reembolso ni pedir información sensible fuera de canal seguro."),
        reading("01.04", "La presión es reputacional.", "Responder lento puede escalar el enojo. Responder mal puede exponer datos o prometer algo que Finanzas no ha confirmado."),
        reading("01.05", "La señal para el manager.", "Este caso muestra si alguien puede usar agentes de soporte con criterio: resolver lo simple, escalar lo sensible y dejar evidencia."),
      ]),
      section("Datos", [
        reading("02.01", "Primero protege la conversación.", "Antes de pedir ayuda a IA, clasifica qué fragmentos puede usar el agente para entender el problema."),
        data("02.02", "Clasifica datos de WhatsApp.", [
          ["Últimos cuatro dígitos del pedido", "Puede ayudar a ubicar el caso sin exponer todo", "Usar"],
          ["Captura con tarjeta visible", "Dato sensible que no debe entrar al prompt", "Excluir"],
          ["Mensaje del cliente enojado", "Sirve para tono, pero debe resumirse", "Anonimizar"],
        ]),
        reading("02.03", "El canal no cambia la responsabilidad.", "WhatsApp acelera la atención, pero no autoriza al agente a manejar pagos o identidad sin controles."),
        data("02.04", "Clasifica datos de Zendesk.", [
          ["Historial de tickets resuelto", "Ayuda a entender patrón", "Agregar"],
          ["Dirección completa del cliente", "No aporta a la respuesta inicial", "Excluir"],
          ["Política de reembolso vigente", "Es fuente autorizada para orientar respuesta", "Usar"],
        ]),
        reading("02.05", "Ya separaste señal de exposición.", "Ahora puedes definir qué puede hacer el agente y qué debe escalar a una persona."),
      ]),
      section("IA", [
        reading("03.01", "El agente necesita límites de servicio.", "No basta decirle que responda amable. Debes definir qué puede resolver, qué puede pedir y cuándo se detiene."),
        agent("03.02", "Escribe el brief del agente.", "Configura tarea, acceso permitido, acción máxima y condición de paro para una conversación sensible."),
        reading("03.03", "Los permisos evitan una mala resolución.", "Un agente de soporte puede responder rápido, pero no debe prometer reembolso ni solicitar datos de pago."),
        permission("03.04", "Configura permisos.", ["Resumir conversación", "Pedir dato mínimo", "Prometer reembolso", "Escalar a humano"]),
        reading("03.05", "La automatización queda gobernada.", "La meta es continuidad: si escala, el humano debe recibir contexto limpio y útil."),
      ]),
      section("Revisión", [
        reading("04.01", "El agente respondió al cliente.", "Ahora revisa si actuó como sistema confiable o si cruzó una línea de riesgo."),
        logs("04.02", "Revisa el log de conversación.", ["Pidió foto de tarjeta completa", "Escaló con resumen de 4 líneas", "Prometió reembolso en 24 horas sin confirmación"]),
        reading("04.03", "El log debe revelar control.", "Un buen setup permite saber qué hizo el agente, qué fuente usó y por qué escaló."),
        review("04.04", "Marca errores en la respuesta.", ["Entiendo la frustración y revisaré con Finanzas", "Mándame una foto de tu tarjeta para validar", "Ya quedó aprobado tu reembolso"]),
        reading("04.05", "Ya puedes decidir el siguiente paso.", "La respuesta final debe proteger al cliente y evitar una promesa no verificada."),
      ]),
      section("Decisión", [
        reading("05.01", "Soporte necesita cerrar el incidente.", "El cliente sigue esperando. Debes decidir si el agente puede continuar o si un humano toma el caso."),
        decision("05.02", "Elige la acción correcta.", "Hay riesgo reputacional y datos sensibles.", ["Escalar con contexto limpio", "Dejar que el agente continúe", "Pedir más datos por WhatsApp"]),
        reading("05.03", "La mejor decisión conserva continuidad.", "Escalar no es fracasar. Es saber dónde termina la autonomía del agente."),
        decision("05.04", "Define el control posterior.", "Después de escalar, ¿qué debe revisar el equipo?", ["Fuente de reembolso y dato expuesto", "Sólo velocidad de respuesta", "Nada, el agente resolvió"]),
        reading("05.05", "Ya tienes una acción defendible.", "Ahora comunícala como política de soporte, no como opinión personal."),
      ]),
      section("Respuesta", [
        reading("06.01", "El manager necesita una regla clara.", "Debe saber cuándo dejar operar al agente y cuándo escalar."),
        memo("06.02", "Escribe la recomendación al líder de CX.", "Qué harías con este caso, qué bloquearías y qué ajustarías del agente."),
        reading("06.03", "Incluye evidencia, no sólo intuición.", "Menciona el dato sensible, la promesa no verificada y el punto de escalamiento."),
        memo("06.04", "Convierte esto en estándar operativo.", "Escribe una regla breve para futuras conversaciones sensibles."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes operar agentes de soporte sin sacrificar confianza."),
      ]),
    ],
  },
  {
    id: "finance-variance-claim",
    title: "CFO pide explicar margen con IA",
    level: "N2",
    profile: "Finanzas / Operaciones",
    minutes: 24,
    company: "Luma Payments",
    summary: "Un análisis de margen debe separar hipótesis, evidencia y causalidad antes del comité.",
    freshness: "Basado en Gemini/Sheets, Looker Studio y agentes financieros en suites empresariales.",
    tools: ["Gemini", "Claude", "Google Sheets", "Looker Studio"],
    managerBrief:
      "Mándalo a Finanzas, Ops o Revenue Operations. Mide si pueden usar IA sobre tablas y dashboards sin convertir correlaciones en causas ni presentar números no verificados.",
    sections: [
      section("Contexto", [
        reading("01.01", "Luma ve una caída de margen.", "La CFO necesita explicar por qué el margen bruto bajó 4.2 puntos antes del comité de las 17:00."),
        reading("01.02", "Hay datos, pero no una causa clara.", "El equipo tiene una hoja de costos, un dashboard de ingresos y notas de operaciones. Gemini puede resumir tablas, pero no puede inventar causalidad."),
        reading("01.03", "Tu audiencia es la CFO.", "Ella no quiere una historia bonita. Quiere hipótesis defendibles, evidencia y qué se debe validar antes de presentarlo al comité."),
        reading("01.04", "La presión puede sesgar el análisis.", "Si la IA suena segura, es fácil presentar correlación como causa. Ese es el riesgo central del caso."),
        reading("01.05", "La señal para el manager.", "Este caso muestra si alguien usa IA para acelerar análisis financiero sin perder rigor ejecutivo."),
      ]),
      section("Datos", [
        reading("02.01", "Primero decide qué entra al análisis.", "No todos los datos tienen la misma calidad ni sirven para explicar margen."),
        data("02.02", "Clasifica datos financieros.", [
          ["Costo por proveedor agregado", "Sirve para detectar variación sin exponer facturas", "Usar"],
          ["Factura individual con datos fiscales", "No hace falta para la primera hipótesis", "Excluir"],
          ["Nota de operaciones sobre retrasos", "Puede orientar, pero no prueba causalidad", "Anonimizar"],
        ]),
        reading("02.03", "El número necesita contexto.", "Una variación puede venir de mix de clientes, descuentos, costos o timing. La IA debe tratarlo como hipótesis."),
        data("02.04", "Clasifica señales del dashboard.", [
          ["Mix de producto por segmento", "Ayuda a explicar margen", "Usar"],
          ["Cambio de pricing no aprobado", "Debe verificarse antes de citarse", "Agregar"],
          ["Comentario de ventas sobre descuentos", "Útil, pero anecdótico", "Anonimizar"],
        ]),
        reading("02.05", "Ya tienes base para preguntar.", "Ahora puedes pedir a IA un análisis estructurado: hipótesis, evidencia y validación pendiente."),
      ]),
      section("IA", [
        reading("03.01", "El prompt debe impedir causalidad falsa.", "Pide hipótesis separadas de hechos. Si no, la IA tenderá a convertir patrones en explicación cerrada."),
        guided("03.02", "Configura el análisis guiado.", "Elige objetivo, audiencia, límites y modelo para producir un análisis financiero defendible."),
        reading("03.03", "El nivel de seguridad importa.", "Para cifras ejecutivas conviene priorizar validación y trazabilidad sobre velocidad."),
        ai("03.04", "Redacta el prompt de análisis.", "Pide a IA que identifique hipótesis, evidencia disponible, datos faltantes y riesgos de interpretación.", "Ejemplo de intención: explicar caída de margen separando hechos, hipótesis, supuestos y validaciones antes del comité."),
        reading("03.05", "La salida no es el reporte.", "Todavía debes revisar si la IA mezcló causa, correlación o números sin fuente."),
      ]),
      section("Revisión", [
        reading("04.01", "La IA generó una explicación.", "Dice que la caída se debe a descuentos enterprise, aunque sólo hay evidencia parcial."),
        review("04.02", "Marca afirmaciones problemáticas.", [
          "La causa principal fue descuento enterprise.",
          "El mix de producto cambió 12% según la tabla.",
          "Falta validar si costos de proveedor explican la variación.",
        ]),
        reading("04.03", "Un buen análisis calibra certeza.", "No todo hallazgo tiene el mismo peso. El comité necesita saber qué está probado y qué falta revisar."),
        review("04.04", "Detecta errores de reporte.", [
          "Presentar una hipótesis como conclusión.",
          "Separar variación observada de causa probable.",
          "Omitir fuente de los números usados.",
        ]),
        reading("04.05", "Ya tienes una versión defendible.", "Ahora decide qué sube al comité y qué se queda como trabajo pendiente."),
      ]),
      section("Decisión", [
        reading("05.01", "La CFO necesita un memo accionable.", "No puedes llegar sin respuesta, pero tampoco con una certeza falsa."),
        decision("05.02", "Decide qué presentar.", "El comité necesita claridad sin sobrerreaccionar.", ["Presentar hipótesis con evidencia y pendientes", "Afirmar una causa única", "Pausar el comité hasta tener todo"]),
        reading("05.03", "La decisión correcta conserva confianza.", "Una hipótesis bien acotada permite avanzar sin dañar credibilidad financiera."),
        decision("05.04", "Define el control mínimo.", "Antes de enviar el memo, ¿qué debe validarse?", ["Fuente de descuentos y costos", "Sólo redacción ejecutiva", "Nada si la IA suena segura"]),
        reading("05.05", "Ya tienes el enfoque.", "Ahora redacta como Finanzas: claro, breve y trazable."),
      ]),
      section("Respuesta", [
        reading("06.01", "El memo debe separar certeza y duda.", "La CFO necesita saber qué pasó, qué creemos y qué falta validar."),
        memo("06.02", "Escribe el memo para la CFO.", "Incluye hipótesis principal, evidencia disponible y validación pendiente."),
        reading("06.03", "Evita la narrativa cerrada.", "Un memo fuerte no oculta incertidumbre: la estructura para tomar mejores decisiones."),
        memo("06.04", "Hazlo comité-ready.", "Reescribe en tres bullets: hallazgo, hipótesis, siguiente validación."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes usar IA para análisis financiero sin perder rigor."),
      ]),
    ],
  },
  {
    id: "legal-contract-triage",
    title: "Claude revisa un contrato sensible",
    level: "N2",
    profile: "Legal / Compliance",
    minutes: 22,
    company: "Matriz de distribución LATAM",
    summary: "Un contrato urgente debe revisarse con IA sin compartir anexos sensibles ni delegar criterio legal.",
    freshness: "Basado en conectores empresariales de Claude/ChatGPT, Google Drive y revisión documental.",
    tools: ["Claude", "ChatGPT Enterprise", "Google Drive", "Microsoft Word"],
    managerBrief:
      "Mándalo a Legal, Compliance o equipos que revisan contratos con IA. Mide si pueden usar modelos como apoyo de lectura sin compartir información sensible ni convertir una salida en dictamen.",
    sections: [
      section("Contexto", [
        reading("01.01", "Comercial quiere firmar hoy.", "Un distribuidor regional mandó cambios de último minuto. El equipo comercial pide una revisión rápida para no perder la ventana de firma."),
        reading("01.02", "Hay documentos en Drive.", "El contrato, anexos de pricing y notas de negociación están en una carpeta compartida. Claude o ChatGPT pueden ayudar a resumir, pero no todo debe compartirse."),
        reading("01.03", "Tu audiencia es Legal.", "La respuesta será para la abogada responsable y para Comercial. Debe separar lectura asistida de decisión legal."),
        reading("01.04", "El riesgo es autoridad falsa.", "La IA puede sonar segura incluso cuando no conoce jurisdicción, historial de negociación o política interna."),
        reading("01.05", "La señal para el manager.", "Este caso muestra si alguien usa IA para acelerar triage legal sin exponer anexos sensibles ni delegar aprobación."),
      ]),
      section("Datos", [
        reading("02.01", "Primero decide qué documento puede entrar.", "No todo lo que está en la carpeta debe pasar al modelo."),
        data("02.02", "Clasifica documentos.", [
          ["Cláusula de terminación", "Texto contractual necesario para triage", "Usar"],
          ["Anexo con descuentos por cliente", "Información comercial sensible", "Anonimizar"],
          ["Correo con estrategia de negociación", "No debe entrar al modelo", "Excluir"],
        ]),
        reading("02.03", "Minimizar no es ocultar.", "Puedes pedir ayuda sobre cláusulas específicas sin entregar toda la carpeta ni la estrategia interna."),
        data("02.04", "Clasifica contexto adicional.", [
          ["Jurisdicción aplicable", "Necesaria para orientar revisión", "Usar"],
          ["Lista completa de clientes", "No aporta al análisis de cláusula", "Excluir"],
          ["Resumen de riesgo comercial", "Útil si se redacta sin nombres", "Anonimizar"],
        ]),
        reading("02.05", "Ya tienes un paquete seguro.", "Ahora puedes pedir extracción de riesgos, no dictamen final."),
      ]),
      section("IA", [
        reading("03.01", "El prompt debe limitar autoridad.", "No le pidas a la IA que apruebe el contrato. Pídele que identifique riesgos y preguntas para revisión humana."),
        guided("03.02", "Configura el prompt legal.", "Elige objetivo, audiencia, límites y modelo. El resultado debe dejar claro que es triage, no dictamen."),
        reading("03.03", "El modelo debe respetar confidencialidad.", "Si el material es sensible, importa más el entorno empresarial y el control de datos que la velocidad."),
        ai("03.04", "Redacta el prompt de triage.", "Pide extracción de riesgos, red flags y preguntas para Legal usando sólo el material permitido.", "Ejemplo de intención: revisar cláusulas específicas, marcar riesgos y preguntas para abogada responsable, sin aprobar ni sustituir criterio legal."),
        reading("03.05", "La salida es una lista de revisión.", "Todavía tienes que detectar exceso de autoridad, omisiones y lenguaje que Comercial podría malinterpretar."),
      ]),
      section("Revisión", [
        reading("04.01", "La IA entregó un resumen legal.", "El resumen identifica una cláusula de terminación, pero también afirma que el contrato es aceptable."),
        review("04.02", "Marca exceso de autoridad.", [
          "El contrato es aceptable para firma.",
          "La cláusula de terminación requiere revisión por jurisdicción.",
          "Falta validar si el anexo de descuentos puede compartirse.",
        ]),
        reading("04.03", "Legal necesita preguntas, no humo.", "Un output útil reduce tiempo de lectura y enfoca revisión humana. Un output riesgoso parece dictamen."),
        review("04.04", "Detecta riesgo de confidencialidad.", [
          "Copiar anexo completo en el prompt.",
          "Resumir pricing sin nombres ni clientes.",
          "Preguntar qué cláusulas requieren revisión humana.",
        ]),
        reading("04.05", "Ya puedes decidir cómo escalar.", "La decisión debe ayudar a Comercial sin reemplazar a Legal."),
      ]),
      section("Decisión", [
        reading("05.01", "Comercial quiere una respuesta hoy.", "Debes decidir qué mandar: un sí, una pausa o un triage útil para revisión rápida."),
        decision("05.02", "Elige la acción correcta.", "Hay presión por firmar, pero hay datos sensibles y autoridad legal.", ["Enviar triage con red flags", "Aprobar con base en IA", "Bloquear sin explicar"]),
        reading("05.03", "La mejor decisión mantiene el proceso.", "No se trata de frenar negocio; se trata de enviar a Legal exactamente lo que necesita revisar."),
        decision("05.04", "Define el control mínimo.", "Antes de firma, ¿qué debe ocurrir?", ["Revisión humana de cláusulas marcadas", "Aceptar resumen de IA", "Compartir anexos completos al modelo"]),
        reading("05.05", "Ya tienes el camino.", "Ahora redacta una respuesta que Comercial entienda y Legal pueda usar."),
      ]),
      section("Respuesta", [
        reading("06.01", "La respuesta debe evitar ambigüedad.", "Comercial necesita saber si puede avanzar, qué falta y quién decide."),
        memo("06.02", "Escribe la nota de escalamiento.", "Incluye red flags, material usado, material excluido y decisión recomendada."),
        reading("06.03", "No uses lenguaje de dictamen.", "Di qué encontró el triage y qué debe revisar Legal. No afirmes aprobación."),
        memo("06.04", "Hazla lista para enviar.", "Reescribe en un mensaje corto para Comercial y Legal."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes usar IA en revisión legal sin ceder autoridad ni confidencialidad."),
      ]),
    ],
  },
];

export function findDemoCase(id: string) {
  return demoCases.find((demoCase) => demoCase.id === id) ?? null;
}

function section(name: DemoCaseSection["name"], slides: DemoSlide[]): DemoCaseSection {
  return { name, slides };
}

function reading(id: string, title: string, body: string): DemoSlide {
  return { id, kind: "reading", eyebrow: "Lectura", title, body };
}

function data(id: string, title: string, rows: Array<[string, string, string]>): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Clasifica cada dato según lo que harías antes de usar IA.",
    exerciseBlockId: "data_table_triage",
    exerciseProps: {
      dataRows: rows.map(([field, detail], index) => ({
        id: `${id}-${index}`,
        field,
        example: detail,
        note: "Decide si aporta señal suficiente o si expone información de más.",
      })),
    },
  };
}

function ai(id: string, title: string, body: string, prompt: string): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body,
    exerciseBlockId: "ai_textfield_free",
    exerciseProps: { promptPlaceholder: prompt },
  };
}

function guided(id: string, title: string, body: string): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body,
    exerciseBlockId: "ai_textfield_guided",
  };
}

function review(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Marca qué partes requieren corrección antes de usar la salida.",
    exerciseBlockId: "ai_output_review",
    exerciseProps: {
      outputLines: options.map((text, index) => ({
        id: `${id}-${index}`,
        text,
        issue: inferReviewIssue(text),
      })),
    },
  };
}

function decision(id: string, title: string, body: string, options: string[]): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Decisión",
    title,
    body,
    exerciseBlockId: "tradeoff_decision_memo",
    exerciseProps: {
      decisionOptions: options.map((option, index) => ({
        id: `${id}-${index}`,
        title: option,
        detail: inferDecisionDetail(option),
      })),
      memoPlaceholder: "Explica la decisión, el riesgo que aceptas y qué validación debe ocurrir antes de avanzar.",
    },
  };
}

function memo(id: string, title: string, body: string): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Respuesta",
    title,
    body,
    exerciseBlockId: "tradeoff_decision_memo",
    exerciseProps: {
      memoPlaceholder: body,
    },
  };
}

function agent(id: string, title: string, body: string): DemoSlide {
  return { id, kind: "exercise", eyebrow: "Ejercicio", title, body, exerciseBlockId: "agent_brief_builder" };
}

function permission(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Define qué puede hacer solo, qué requiere revisión y qué debe bloquearse.",
    exerciseBlockId: "permission_matrix",
    exerciseProps: { permissionRows: options },
  };
}

function logs(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Lee eventos de una corrida y marca dónde se rompió el control.",
    exerciseBlockId: "run_log_review",
    exerciseProps: {
      runLogs: options.map((text, index) => ({
        id: `${id}-${index}`,
        text,
        severity: inferRisk(text),
      })),
    },
  };
}

function inferReviewIssue(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("correo") || lower.includes("tarjeta") || lower.includes("nombre")) return "Dato sensible";
  if (lower.includes("fuente") || lower.includes("%") || lower.includes("causa") || lower.includes("aprobado")) return "Requiere verificación";
  if (lower.includes("valid")) return "Usable con control";
  return "Revisar antes de usar";
}

function inferDecisionDetail(option: string) {
  const lower = option.toLowerCase();
  if (lower.includes("humana") || lower.includes("validar") || lower.includes("triage") || lower.includes("riesgos")) {
    return "Mantiene avance, pero deja controles explícitos antes de exponer el resultado.";
  }
  if (lower.includes("pausar") || lower.includes("escalar") || lower.includes("bloquear")) {
    return "Reduce riesgo cuando faltan fuentes, permisos o responsabilidad clara.";
  }
  return "Acelera la acción, pero puede abrir riesgo si no hay evidencia suficiente.";
}

function inferRisk(text: string): "ok" | "medium" | "high" {
  const lower = text.toLowerCase();
  if (lower.includes("automáticamente") || lower.includes("sin fuente") || lower.includes("tarjeta") || lower.includes("prometió") || lower.includes("privada")) {
    return "high";
  }
  if (lower.includes("pendiente") || lower.includes("aprobación") || lower.includes("resumen")) return "ok";
  return "medium";
}
