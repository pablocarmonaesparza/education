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
  learningGoal?: string;
  caseReveal?: string;
  stakeholderPressure?: string;
  artifact?: string;
  evidenceExpected?: string;
  simulationConsequence?: string;
  managerSignal?: string;
  exerciseBlockId?: ExerciseBlockId;
  exerciseProps?: ExerciseBlockProps;
};

export type DemoCaseSection = {
  name: "Contexto" | "Datos" | "IA" | "Revisión" | "Decisión" | "Respuesta";
  slides: DemoSlide[];
  debrief: {
    protect: string;
    evidence: string;
    next: string;
  };
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
    title: "Agente de seguimiento comercial",
    level: "N3",
    profile: "Ventas / RevOps",
    minutes: 24,
    company: "Aurora SaaS",
    summary: "Diseña un piloto donde un agente acelera follow-up comercial sin tocar datos sensibles, enviar correos solo ni cambiar pipeline sin evidencia.",
    freshness: "Basado en HubSpot Breeze, Smart CRM, agentes de workspace, Gmail, Slack y revisión humana de borradores.",
    tools: ["HubSpot Breeze", "ChatGPT", "Claude", "Gmail", "Slack"],
    managerBrief:
      "Asigna este caso cuando quieras saber si alguien de Sales Ops o RevOps puede delegar seguimiento comercial a un agente sin perder control sobre datos, aprobaciones y confianza del cliente. El resultado te dirá si esa persona puede pilotar automatización en pipeline, si necesita práctica en límites de autonomía o si conviene pausar agentes hasta reforzar controles.",
    sections: [
      section("Contexto", [
        reading("01.01", "Aurora perdió velocidad comercial.", "El cierre mensual llega con 38 oportunidades calificadas sin respuesta reciente. La VP de Ventas quiere que un agente prepare seguimiento antes de la reunión de pipeline.", {
          learningGoal: "Ubicar el problema operativo antes de tocar herramientas.",
          caseReveal: "El cuello de botella no es escribir correos; es priorizar, preparar contexto y no enviar algo equivocado.",
          stakeholderPressure: "La VP quiere ver un piloto hoy, no una investigación de tres semanas.",
          managerSignal: "Detecta si la persona entiende el objetivo de negocio antes de automatizar.",
        }),
        reading("01.02", "El equipo quiere usar HubSpot Breeze.", "Breeze puede leer señales del CRM, sugerir próximos pasos y preparar tareas. ChatGPT o Claude pueden mejorar borradores, pero no conocen el contexto completo ni la política comercial.", {
          learningGoal: "Separar capacidad técnica de permiso operativo.",
          caseReveal: "Que una herramienta pueda leer o escribir no significa que deba hacerlo sin límites.",
          artifact: "CRM con etapas, últimos contactos, notas internas y valor estimado.",
          managerSignal: "Distingue herramienta útil de autonomía riesgosa.",
        }),
        reading("01.03", "El agente no debe vender solo.", "El piloto debe permitir que el agente prepare borradores y resúmenes. No puede contactar clientes, prometer descuentos ni mover etapas del pipeline por su cuenta.", {
          learningGoal: "Fijar la frontera de autonomía desde el inicio.",
          caseReveal: "El valor está en acelerar preparación, no en delegar responsabilidad comercial.",
          stakeholderPressure: "Los account executives piden que el agente envíe correos si tiene confianza alta.",
          managerSignal: "Reconoce qué acciones requieren aprobación humana.",
        }),
        reading("01.04", "La tensión es velocidad contra confianza.", "Si automatizas poco, el equipo seguirá lento. Si automatizas demasiado, un cliente enterprise puede recibir un mensaje fuera de contexto o con datos que no debían salir.", {
          learningGoal: "Entender el tradeoff que sostiene todo el caso.",
          caseReveal: "La decisión no es sí/no a agentes; es qué autonomía se puede permitir con evidencia.",
          stakeholderPressure: "RevOps quiere medir respuesta en menos de dos horas; Legal pidió minimizar datos.",
          managerSignal: "Mantiene presión comercial sin saltarse controles.",
        }),
        reading("01.05", "Tu entrega será una política de piloto.", "Al final tendrás que recomendar qué puede hacer el agente, qué queda bloqueado, qué se revisa por humano y qué señal medirá RevOps.", {
          learningGoal: "Preparar una decisión ejecutable, no una opinión.",
          caseReveal: "La salida útil es una regla operativa que Ventas pueda usar mañana.",
          managerSignal: "Convierte criterio técnico en acción manager-ready.",
        }),
      ], {
        protect: "El objetivo de negocio: recuperar seguimiento sin dañar confianza.",
        evidence: "Si entendiste quién presiona, qué herramienta se usa y qué acciones quedan fuera.",
        next: "Ahora decide qué datos puede ver el agente antes de escribir cualquier brief.",
      }),
      section("Datos", [
        reading("02.01", "El agente sólo debe ver lo necesario.", "Antes de delegar, acota el material. El CRM contiene señal comercial, datos personales, notas internas y campos que pueden sesgar al agente.", {
          learningGoal: "Aplicar minimización de datos al trabajo con agentes.",
          artifact: "Muestra de CRM: etapa, valor, contacto, notas internas, última actividad y competidor mencionado.",
          stakeholderPressure: "Ventas quiere personalización; Legal pidió no exponer datos innecesarios.",
          managerSignal: "Protege datos sin quitarle al agente la señal útil.",
        }),
        data("02.02", "Clasifica datos del CRM.", [
          ["Etapa del deal", "Señal operativa necesaria para priorizar seguimiento"],
          ["Correo y teléfono", "Identificadores personales que no aportan al razonamiento"],
          ["Valor estimado del deal", "Dato sensible; puede usarse en rangos para priorizar"],
          ["Notas internas del account executive", "Mezclan hechos, opiniones y estrategia comercial"],
        ], {
          learningGoal: "Decidir qué entra, qué se transforma y qué queda fuera.",
          evidenceExpected: "Acciones por campo: usar, anonimizar, agregar o excluir.",
          simulationConsequence: "El agente tendrá contexto suficiente para priorizar sin copiar identificadores ni notas internas al modelo.",
          managerSignal: "Muestra si puede conservar señal mientras reduce exposición.",
        }),
        reading("02.03", "Contexto no es permiso.", "HubSpot puede tener acceso a todo, pero el piloto no debe heredar todos los permisos del CRM. El agente sólo necesita señales para preparar, no datos para actuar externamente.", {
          learningGoal: "Distinguir acceso del sistema de acceso permitido para el caso.",
          caseReveal: "El error común es asumir que si el dato está en CRM, puede entrar al prompt.",
          managerSignal: "Evita sobreexposición por comodidad operativa.",
        }),
        data("02.04", "Clasifica señales de intención.", [
          ["Fecha de última reunión", "Ayuda a ubicar urgencia sin exponer contenido sensible"],
          ["Transcripción completa de la llamada", "Puede incluir información personal o estrategia de negociación"],
          ["Competidor mencionado", "Señal útil si se agrupa sin citar notas privadas"],
          ["Motivo de siguiente paso", "Útil si se resume como categoría, no como cita literal"],
        ], {
          learningGoal: "Preparar un dataset seguro para delegación.",
          evidenceExpected: "Decisiones de minimización sobre señales de intención.",
          simulationConsequence: "El brief del agente se construirá con categorías y rangos, no con datos crudos de clientes.",
          managerSignal: "Diferencia personalización legítima de exposición innecesaria.",
        }),
        reading("02.05", "Ya tienes un perímetro de trabajo.", "El agente puede usar etapa, última actividad y categorías agregadas. No debe usar correos, teléfonos, notas internas crudas ni transcripciones completas.", {
          learningGoal: "Cerrar la sección con un perímetro operable.",
          caseReveal: "La calidad del agente empieza antes del prompt: empieza en qué le permites ver.",
          managerSignal: "Define controles de datos que alguien más podría aplicar.",
        }),
      ], {
        protect: "La señal comercial útil sin exponer datos personales o estrategia interna.",
        evidence: "Tus clasificaciones muestran si sabes minimizar datos antes de usar IA.",
        next: "Ahora traduce ese perímetro en un brief de agente con autonomía limitada.",
      }),
      section("IA", [
        reading("03.01", "El brief define la autonomía.", "Un agente necesita tarea, acceso permitido, acción máxima y condición de paro. Si una de esas piezas falta, el sistema decidirá por defecto.", {
          learningGoal: "Convertir el perímetro de datos en instrucciones de agente.",
          caseReveal: "El brief es el contrato operativo del agente.",
          stakeholderPressure: "La VP pregunta si el agente puede mandar emails si la confianza supera 80%.",
          managerSignal: "Evita delegar ambigüedad.",
        }),
        agent("03.02", "Construye el brief del agente.", "Configura una decisión a la vez: tarea, acceso permitido, acción máxima y cuándo debe detenerse.", {
          learningGoal: "Delegar preparación comercial sin delegar responsabilidad.",
          evidenceExpected: "Tarea, acceso permitido, acción máxima y condición de paro.",
          simulationConsequence: "El agente queda autorizado para preparar trabajo y obligado a detenerse ante datos sensibles, baja fuente o impacto externo.",
          managerSignal: "Define límites de autonomía que el equipo puede auditar.",
        }),
        reading("03.03", "Los permisos son la parte crítica.", "La diferencia entre ayuda y riesgo está en si el agente puede leer, redactar, enviar o actualizar. Cada permiso debe tener una razón operativa.", {
          learningGoal: "Pasar de brief a permisos concretos.",
          caseReveal: "Enviar y actualizar pipeline son acciones externas: no son equivalentes a redactar un borrador.",
          managerSignal: "Sabe dónde colocar approval gates.",
        }),
        permission("03.04", "Configura permisos del piloto.", [
          "Leer etapa del deal y última actividad",
          "Leer notas internas completas",
          "Crear borrador de follow-up",
          "Enviar correo al cliente",
          "Actualizar etapa con registro",
        ], {
          learningGoal: "Asignar permitir, revisar o bloquear según riesgo.",
          evidenceExpected: "Matriz de permisos por acción.",
          simulationConsequence: "El piloto queda con borradores revisables, registro en CRM y bloqueo de acciones externas sin humano.",
          managerSignal: "Distingue preparación segura de ejecución riesgosa.",
        }),
        workflow("03.05", "Arma el flujo mínimo del piloto.", [
          "Seleccionar SQLs sin respuesta reciente",
          "Minimizar datos del CRM",
          "Generar borrador con IA",
          "Revisión del account executive",
          "Registrar resultado en HubSpot",
        ], {
          learningGoal: "Convertir permisos en flujo operable.",
          evidenceExpected: "Pasos activos que incluyan entrada, IA, revisión humana y salida medible.",
          simulationConsequence: "RevOps puede correr el piloto sin depender de memoria informal ni permiso tácito.",
          managerSignal: "Diseña automatización parcial con handoffs claros.",
        }),
      ], {
        protect: "La autonomía limitada: preparar sí, actuar externamente no.",
        evidence: "Tu brief, permisos y flujo muestran si sabes gobernar agentes.",
        next: "Ahora revisa una corrida realista del agente y detecta dónde se rompe el control.",
      }),
      section("Revisión", [
        reading("04.01", "El agente ya corrió un dry-run.", "Antes de autorizar el piloto, revisa el log. La corrida parece útil, pero hay señales mezcladas: algunos pasos siguieron el flujo y otros cruzaron límites.", {
          learningGoal: "Supervisar una automatización por evidencia, no por confianza.",
          artifact: "Log de dry-run con acciones, razones, errores y cambios sugeridos.",
          managerSignal: "Detecta fallas operativas antes de escalar.",
        }),
        logs("04.02", "Revisa la corrida del agente.", [
          "09:02 · Lead L-204: borrador creado, no enviado, owner AE asignado",
          "09:04 · Lead L-311: prompt incluyó correo y notas internas para personalización",
          "09:06 · Lead L-419: agente reintentó 6 veces por error de CRM",
          "09:10 · No se registró si el borrador redujo tiempo de respuesta",
        ], {
          learningGoal: "Marcar eventos que bloquearían el piloto.",
          evidenceExpected: "Flags sobre datos sensibles, loops, señales sin fuente y falta de métrica.",
          simulationConsequence: "El piloto no se autoriza completo; primero se corrigen logs, límites y medición.",
          managerSignal: "No confunde actividad del agente con control del sistema.",
        }),
        reading("04.03", "El log cuenta la verdad del sistema.", "Un agente puede sonar correcto en el output final y aun así haber usado datos indebidos, reintentado sin límite o movido el CRM sin explicación.", {
          learningGoal: "Entender por qué revisar logs importa más que leer sólo el borrador.",
          caseReveal: "El riesgo aparece en el proceso, no únicamente en el texto final.",
          managerSignal: "Supervisa sistemas agenticos, no sólo prompts.",
        }),
        review("04.04", "Revisa el borrador antes de autorizar.", [
          "Vi que mencionaste a CompetidorX en la llamada; podemos responder con un descuento especial.",
          "Te propongo tres horarios para retomar la conversación, sujeto a confirmación de tu AE.",
          "Tu empresa parece lista para renovar si aceleramos la decisión esta semana.",
          "Este borrador debe validarse por el account executive antes de enviarse.",
        ], {
          learningGoal: "Detectar información privada, inferencias y claims no verificados.",
          evidenceExpected: "Segmentos marcados antes de que el borrador salga a Gmail.",
          simulationConsequence: "El borrador queda como material interno; el AE revisa contexto y decide si se envía.",
          managerSignal: "Valida outputs plausibles sin asumir que todo lo generado sirve.",
        }),
        pivot("04.05", "Elige la señal que llevarías a RevOps.", [
          { métrica: "Tiempo a primer borrador", valor: "18 min", riesgo: "Bajo", uso: "Eficiencia" },
          { métrica: "Emails enviados sin aprobación", valor: "0", riesgo: "Bajo", uso: "Control" },
          { métrica: "Leads con datos sensibles en prompt", valor: "1 de 5", riesgo: "Alto", uso: "Bloqueo" },
        ], {
          learningGoal: "Separar actividad, riesgo e impacto.",
          evidenceExpected: "Señal de negocio elegida para comunicar al manager.",
          simulationConsequence: "La recomendación final deberá mencionar eficiencia potencial, bloqueo por datos y métrica faltante.",
          managerSignal: "Traduce logs a decisión ejecutiva.",
        }),
      ], {
        protect: "La evidencia operacional: logs, borradores y métricas.",
        evidence: "Tus flags muestran si detectas fallas antes de escalar agentes.",
        next: "Ahora decide qué piloto autorizarías y bajo qué controles.",
      }),
      section("Decisión", [
        reading("05.01", "La VP quiere una respuesta práctica.", "No basta decir que hay riesgos. Debes decidir qué parte se pilota, qué queda bloqueado y qué se mide desde el primer día.", {
          learningGoal: "Convertir revisión en acción operativa.",
          stakeholderPressure: "La VP acepta controles si puede recuperar velocidad esta semana.",
          managerSignal: "Decide sin refugiarse en análisis infinito.",
        }),
        decision("05.02", "Elige la configuración del piloto.", "El pipeline importa, pero una automatización que contacta mal a clientes enterprise destruye confianza.", [
          "Piloto con borradores y aprobación humana",
          "Pausar todo hasta rediseñar política",
          "Permitir envío automático con confianza alta",
        ], {
          learningGoal: "Elegir un tradeoff defendible.",
          evidenceExpected: "Decisión y memo corto sobre velocidad, control y riesgo aceptado.",
          simulationConsequence: "La opción con aprobación humana permite avanzar y reduce riesgo de contacto externo indebido.",
          managerSignal: "Sabe pilotar sin abrir autonomía peligrosa.",
        }),
        reading("05.03", "Una buena decisión conserva avance.", "Premium no significa lento. Significa que la automatización tiene límites claros, métricas y dueños.", {
          learningGoal: "Evitar el falso dilema entre bloquear todo o automatizar todo.",
          caseReveal: "El piloto útil tiene una acción permitida, una bloqueada y una métrica clara.",
          managerSignal: "Diseña control sin matar el caso de negocio.",
        }),
        permission("05.04", "Define los controles obligatorios.", [
          "Aprobación humana antes de enviar Gmail",
          "Registro de fuente para intención alta",
          "Límite de reintentos por error de CRM",
          "Cambio automático de etapa del deal",
          "Medición de tiempo de respuesta",
        ], {
          learningGoal: "Fijar controles que sobreviven al primer piloto.",
          evidenceExpected: "Permisos de control por acción crítica.",
          simulationConsequence: "RevOps puede auditar el piloto y detenerlo si reaparecen datos sensibles o loops.",
          managerSignal: "No deja governance como comentario decorativo.",
        }),
        decision("05.05", "Decide qué comunicarás mañana.", "La decisión final debe ser clara para Ventas, RevOps y Legal Ops.", [
          "Piloto de 10 SQLs con borradores, aprobación AE y medición diaria",
          "Agente libre para todas las cuentas medianas",
          "Sólo análisis interno sin emails ni métrica comercial",
        ], {
          learningGoal: "Cerrar una recomendación aplicable.",
          evidenceExpected: "Elección de alcance del piloto y justificación.",
          simulationConsequence: "El piloto queda acotado a un grupo medible y reversible.",
          managerSignal: "Pasa de criterio individual a regla de equipo.",
        }),
      ], {
        protect: "El equilibrio entre velocidad comercial, confianza y control.",
        evidence: "Tus decisiones muestran si puedes pilotar agentes sin sobredelegar.",
        next: "Ahora escribe el memo que el VP podría usar para aprobar o ajustar el piloto.",
      }),
      section("Respuesta", [
        reading("06.01", "Cierra como operador responsable.", "La VP necesita saber qué autorizas, qué bloqueas, quién revisa y qué métrica decidirá si el piloto escala.", {
          learningGoal: "Preparar una respuesta ejecutiva basada en evidencia.",
          caseReveal: "El memo no debe defender la IA; debe defender la decisión.",
          managerSignal: "Comunica acción, controles y medición.",
        }),
        memo("06.02", "Escribe el memo para la VP.", "Incluye decisión, controles obligatorios, métrica de éxito y condición para pausar.", {
          learningGoal: "Traducir criterio a recomendación manager-ready.",
          evidenceExpected: "Memo con decisión, control, métrica y condición de paro.",
          simulationConsequence: "El VP puede aprobar un piloto reversible en lugar de una automatización abierta.",
          managerSignal: "Convierte IA en acción defendible.",
        }),
        reading("06.03", "No vendas el agente como magia.", "Una recomendación fuerte no promete autonomía total. Define preparación sí, envío automático no, cambio de etapa sólo con evidencia y registro.", {
          learningGoal: "Evitar hype y dejar una política operativa.",
          caseReveal: "El criterio premium se ve en límites claros, no en entusiasmo por la herramienta.",
          managerSignal: "Mantiene responsabilidad humana en decisiones externas.",
        }),
        memo("06.04", "Convierte la decisión en regla de uso.", "Escribe una regla breve que cualquier AE pueda aplicar mañana sin preguntarte qué quiso decir el piloto.", {
          learningGoal: "Hacer transferible la decisión.",
          evidenceExpected: "Regla operativa breve y aplicable.",
          simulationConsequence: "El equipo recibe un estándar: el agente prepara, el humano aprueba, RevOps mide y detiene si hay riesgo.",
          managerSignal: "Produce una política que reduce ambigüedad del equipo.",
        }),
        reading("06.05", "Caso terminado.", "Tu evidencia muestra si puedes trabajar con agentes sin perder responsabilidad comercial: datos mínimos, permisos claros, logs revisados y decisión explicable.", {
          learningGoal: "Cerrar el loop simulación → evidencia → acción.",
          caseReveal: "La próxima re-simulación cambiará el canal y stakeholder para medir transferencia, no memoria.",
          managerSignal: "Permite decidir entre pilotar, entrenar, pausar o escalar.",
        }),
      ], {
        protect: "Una recomendación que el VP puede operar sin convertir al agente en vendedor autónomo.",
        evidence: "El memo y la regla final muestran si el criterio se volvió acción.",
        next: "El siguiente paso natural sería una re-simulación con otro canal y el mismo principio de control.",
      }),
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

type SlideLearningMeta = Pick<
  DemoSlide,
  "learningGoal" | "caseReveal" | "stakeholderPressure" | "artifact" | "evidenceExpected" | "simulationConsequence" | "managerSignal"
>;

function section(
  name: DemoCaseSection["name"],
  slides: DemoSlide[],
  debrief?: DemoCaseSection["debrief"],
): DemoCaseSection {
  return {
    name,
    slides,
    debrief: debrief ?? {
      protect: `La decisión central de ${name.toLowerCase()}.`,
      evidence: "La evidencia capturada en esta sección.",
      next: "La siguiente sección aumenta la presión del caso.",
    },
  };
}

function reading(id: string, title: string, body: string, meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "reading",
    eyebrow: "Lectura",
    title,
    body,
    learningGoal: meta.learningGoal ?? "Entender la situación antes de decidir.",
    caseReveal: meta.caseReveal,
    stakeholderPressure: meta.stakeholderPressure,
    artifact: meta.artifact,
    managerSignal: meta.managerSignal,
  };
}

function data(
  id: string,
  title: string,
  rows: Array<[string, string] | [string, string, string]>,
  meta: SlideLearningMeta = {},
): DemoSlide {
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
    learningGoal: meta.learningGoal ?? "Decidir qué datos puede usar la IA.",
    evidenceExpected: meta.evidenceExpected ?? "Clasificación concreta de datos.",
    simulationConsequence: meta.simulationConsequence ?? "El modelo sólo recibirá los datos que el participante deje pasar.",
    managerSignal: meta.managerSignal ?? "Muestra criterio de datos y privacidad.",
  };
}

function ai(id: string, title: string, body: string, prompt: string, meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body,
    exerciseBlockId: "ai_textfield_free",
    exerciseProps: { promptPlaceholder: prompt },
    learningGoal: meta.learningGoal ?? "Estructurar una petición abierta a un modelo.",
    evidenceExpected: meta.evidenceExpected ?? "Prompt con objetivo, límites y validación.",
    simulationConsequence: meta.simulationConsequence ?? "La calidad del output dependerá de la claridad del encargo.",
    managerSignal: meta.managerSignal ?? "Muestra claridad de ejecución con IA.",
  };
}

function guided(id: string, title: string, body: string, meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body,
    exerciseBlockId: "ai_textfield_guided",
    learningGoal: meta.learningGoal ?? "Construir un prompt a partir de decisiones discretas.",
    evidenceExpected: meta.evidenceExpected ?? "Objetivo, audiencia, límites, modelo y prompt generado.",
    simulationConsequence: meta.simulationConsequence ?? "El prompt reflejará las restricciones seleccionadas.",
    managerSignal: meta.managerSignal ?? "Muestra criterio granular antes de usar IA.",
  };
}

function review(id: string, title: string, options: string[], meta: SlideLearningMeta = {}): DemoSlide {
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
    learningGoal: meta.learningGoal ?? "Revisar una salida de IA antes de usarla.",
    evidenceExpected: meta.evidenceExpected ?? "Segmentos marcados como riesgosos o pendientes.",
    simulationConsequence: meta.simulationConsequence ?? "Los segmentos marcados se convierten en controles antes de avanzar.",
    managerSignal: meta.managerSignal ?? "Muestra validación y juicio.",
  };
}

function decision(id: string, title: string, body: string, options: string[], meta: SlideLearningMeta = {}): DemoSlide {
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
    learningGoal: meta.learningGoal ?? "Elegir una acción con ventajas y costos reales.",
    evidenceExpected: meta.evidenceExpected ?? "Decisión seleccionada y justificación breve.",
    simulationConsequence: meta.simulationConsequence ?? "La decisión elegida define qué puede avanzar y qué queda bloqueado.",
    managerSignal: meta.managerSignal ?? "Muestra juicio e impacto.",
  };
}

function memo(id: string, title: string, body: string, meta: SlideLearningMeta = {}): DemoSlide {
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
    learningGoal: meta.learningGoal ?? "Convertir la decisión en comunicación operable.",
    evidenceExpected: meta.evidenceExpected ?? "Memo claro con acción, razón y control.",
    simulationConsequence: meta.simulationConsequence ?? "El líder recibe una recomendación accionable.",
    managerSignal: meta.managerSignal ?? "Muestra impacto y claridad ejecutiva.",
  };
}

function agent(id: string, title: string, body: string, meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body,
    exerciseBlockId: "agent_brief_builder",
    learningGoal: meta.learningGoal ?? "Delegar una tarea a un agente sin perder control.",
    evidenceExpected: meta.evidenceExpected ?? "Brief con tarea, acceso, acción máxima y condición de paro.",
    simulationConsequence: meta.simulationConsequence ?? "El agente sólo podrá operar dentro del brief declarado.",
    managerSignal: meta.managerSignal ?? "Muestra criterio de autonomía y límites.",
  };
}

function permission(id: string, title: string, options: string[], meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Define qué puede hacer solo, qué requiere revisión y qué debe bloquearse.",
    exerciseBlockId: "permission_matrix",
    exerciseProps: { permissionRows: options },
    learningGoal: meta.learningGoal ?? "Definir permisos y gates de aprobación.",
    evidenceExpected: meta.evidenceExpected ?? "Matriz de permitir, revisar o bloquear.",
    simulationConsequence: meta.simulationConsequence ?? "Las acciones bloqueadas no se ejecutan automáticamente.",
    managerSignal: meta.managerSignal ?? "Muestra governance operacional.",
  };
}

function logs(id: string, title: string, options: string[], meta: SlideLearningMeta = {}): DemoSlide {
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
    learningGoal: meta.learningGoal ?? "Supervisar evidencia de una corrida automatizada.",
    evidenceExpected: meta.evidenceExpected ?? "Eventos marcados como riesgo o bloqueo.",
    simulationConsequence: meta.simulationConsequence ?? "Los eventos marcados alimentan la decisión de autorizar o pausar.",
    managerSignal: meta.managerSignal ?? "Muestra supervisión de agentes.",
  };
}

function workflow(id: string, title: string, steps: string[], meta: SlideLearningMeta = {}): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Activa los pasos que debe tener el flujo para que sea operable y auditable.",
    exerciseBlockId: "workflow_builder",
    exerciseProps: { workflowSteps: steps },
    learningGoal: meta.learningGoal ?? "Armar un flujo de IA con revisión humana.",
    evidenceExpected: meta.evidenceExpected ?? "Pasos seleccionados del workflow.",
    simulationConsequence: meta.simulationConsequence ?? "El flujo elegido define dónde entra IA, dónde revisa humano y dónde se mide impacto.",
    managerSignal: meta.managerSignal ?? "Muestra ejecución con IA en workflow real.",
  };
}

function pivot(
  id: string,
  title: string,
  rows: Array<Record<string, string>>,
  meta: SlideLearningMeta = {},
): DemoSlide {
  return {
    id,
    kind: "exercise",
    eyebrow: "Ejercicio",
    title,
    body: "Elige qué señal de negocio llevarías al manager antes de decidir.",
    exerciseBlockId: "dashboard_pivot",
    exerciseProps: {
      pivotRows: rows,
      pivotOptions: [
        { id: "valor", label: "Valor" },
        { id: "riesgo", label: "Riesgo" },
        { id: "uso", label: "Uso" },
      ],
    },
    learningGoal: meta.learningGoal ?? "Leer señales de negocio y riesgo.",
    evidenceExpected: meta.evidenceExpected ?? "Señal priorizada para el manager.",
    simulationConsequence: meta.simulationConsequence ?? "La señal elegida orienta la recomendación final.",
    managerSignal: meta.managerSignal ?? "Muestra impacto y criterio ejecutivo.",
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
