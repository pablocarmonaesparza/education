export type DemoCaseLevel = "N1" | "N2" | "N3";

export type DemoSlideType =
  | "reading"
  | "data_table"
  | "ai_textfield"
  | "guided_prompt"
  | "output_review"
  | "decision"
  | "memo"
  | "agent_brief"
  | "permission_matrix"
  | "log_review"
  | "dashboard_pivot";

export type DemoSlide = {
  id: string;
  type: DemoSlideType;
  eyebrow: string;
  title: string;
  body: string;
  prompt?: string;
  rows?: Array<{ label: string; detail: string; recommended?: string }>;
  options?: string[];
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
  managerBrief: string;
  sections: DemoCaseSection[];
};

export const demoCases: DemoCase[] = [
  {
    id: "marketing-dirty-data-campaign",
    title: "Campaña urgente con datos incompletos",
    level: "N1",
    profile: "Marketing/Growth",
    minutes: 18,
    company: "Loop SaaS B2B",
    summary: "Tres ángulos de campaña para reactivar cuentas con bajo uso.",
    managerBrief:
      "Úsalo para medir si el equipo puede preparar una campaña con IA sin usar datos sensibles, prometer de más o perder claridad comercial.",
    sections: [
      section("Contexto", [
        reading("01.01", "Trabajas en el equipo de Marketing de Loop.", "Loop vende software B2B. Varias cuentas grandes usan menos el producto que antes y el equipo quiere recuperar actividad este mes."),
        reading("01.02", "Camila, la VP de Marketing, te pide ayuda.", "Necesita tres ángulos de campaña para reactivar esas cuentas. No quiere una campaña final; quiere opciones que pueda revisar hoy."),
        reading("01.03", "La entrega tiene una audiencia concreta.", "Tu respuesta es para Camila. Debe ser ejecutiva, útil y honesta sobre qué datos todavía necesitan validación."),
        reading("01.04", "El problema no es escribir bonito.", "El reto es usar IA sin mezclar datos personales, notas internas o promesas que no están comprobadas."),
        reading("01.05", "Tu trabajo empieza antes del prompt.", "Primero vas a entender el caso. Después decidirás qué datos usar, cómo pedir ayuda a la IA y qué sí vale la pena compartir."),
      ]),
      section("Datos", [
        reading("02.01", "Ahora mira los datos disponibles.", "El equipo reunió señales de uso, comentarios de clientes y notas internas. Algunos datos ayudan; otros sólo agregan riesgo."),
        data("02.02", "Clasifica qué puede entrar al prompt.", [
          ["Uso agregado del producto", "Señal útil sin identificar personas", "Usar"],
          ["Nombre y correo del cliente", "Identificador personal", "Excluir"],
          ["Comentario textual de cliente", "Puede revelar contexto sensible", "Anonimizar"],
        ]),
        reading("02.03", "El objetivo no es usar todo.", "Una buena decisión conserva señal comercial y reduce exposición. Más datos no siempre producen mejor trabajo."),
        data("02.04", "Decide qué hacer con señales mezcladas.", [
          ["Segmento de la cuenta", "Ayuda a ajustar el ángulo comercial", "Usar"],
          ["Nota interna del vendedor", "Puede contener juicio subjetivo", "Anonimizar"],
          ["Ticket con queja reciente", "Puede ser relevante, pero requiere cuidado", "Anonimizar"],
        ]),
        reading("02.05", "Ya tienes un set de datos más limpio.", "Con eso puedes pedir apoyo a IA sin regalarle información innecesaria ni contaminar la campaña desde el inicio."),
      ]),
      section("IA", [
        reading("03.01", "Ahora sí puedes pedir ayuda a la IA.", "No le vas a pedir una campaña terminada. Le vas a pedir opciones de trabajo con límites claros."),
        guided("03.02", "Construye el prompt con opciones guiadas.", "Elige objetivo, audiencia, límites y modelo. La selección debe reflejar la presión real del caso."),
        reading("03.03", "El modelo también es una decisión.", "Para este caso importa equilibrar inteligencia, seguridad y costo. No todo requiere el modelo más caro ni el más autónomo."),
        ai("03.04", "Revisa el prompt antes de enviarlo.", "El campo de IA debe sonar como una herramienta real de trabajo.", "Genera tres ángulos de campaña para reactivar cuentas con bajo uso usando sólo datos agregados. Marca supuestos y validaciones pendientes."),
        reading("03.05", "La IA devuelve borradores, no autoridad.", "Aunque la salida suene convincente, todavía tienes que revisar claims, tono y riesgos antes de compartir."),
      ]),
      section("Revisión", [
        reading("04.01", "La IA ya propuso tres ángulos.", "Dos suenan útiles. Uno incluye una promesa fuerte de resultado y otro usa un detalle demasiado parecido al comentario de un cliente."),
        review("04.02", "Marca claims antes de compartir.", [
          "Podemos recuperar 40% de cuentas en 30 días.",
          "La campaña debe mencionar clientes por nombre para personalizar.",
          "Propongo validar métricas antes de publicar promesas.",
        ]),
        reading("04.03", "La salida no es la decisión.", "Tu trabajo es separar lo que sirve como borrador de lo que necesita fuente, ajuste de tono o revisión humana."),
        review("04.04", "Detecta qué tono puede causar problema.", [
          "Activa tu cuenta antes de que pierdas resultados.",
          "Vimos patrones de bajo uso en cuentas similares.",
          "Podemos preparar una guía breve para recuperar valor.",
        ]),
        reading("04.05", "Ya tienes material revisado.", "Antes de decidir, piensa qué versión ayudaría a Camila a avanzar sin vender una certeza que todavía no existe."),
      ]),
      section("Decisión", [
        reading("05.01", "Camila necesita algo accionable.", "Si sólo le dices que faltan datos, no avanzas. Si le mandas todo tal cual, elevas riesgo."),
        decision("05.02", "Elige qué mandar a Camila.", "Hay presión por avanzar, pero no todos los ángulos están listos para salir.", ["Enviar tres opciones con riesgos visibles", "Enviar todo tal cual", "Pausar sin propuesta"]),
        reading("05.03", "La mejor decisión no es perfecta.", "Debe conservar velocidad y dejar visibles las validaciones pendientes."),
        decision("05.04", "Define el siguiente control.", "Antes de enviar la campaña a clientes, ¿qué control mínimo debe ocurrir?", ["Validar claims y tono con Marketing", "Enviar directo para no perder tiempo", "Pedir a Legal que escriba la campaña"]),
        reading("05.05", "Ya decidiste el camino.", "La última parte es comunicarlo de forma clara para que Camila sepa qué hacer después."),
      ]),
      section("Respuesta", [
        reading("06.01", "Tu respuesta debe ser breve.", "Camila no necesita una clase de IA. Necesita saber qué usar, qué revisar y qué no publicar todavía."),
        memo("06.02", "Escribe la recomendación final.", "Explica qué opción usarías, qué validarías y qué no publicarías todavía."),
        reading("06.03", "Buen cierre significa decisión + cuidado.", "Una respuesta fuerte recomienda una acción y muestra qué riesgo está controlando."),
        memo("06.04", "Ajusta la respuesta para manager.", "Hazla más ejecutiva: una recomendación, dos razones y una validación pendiente."),
        reading("06.05", "Caso terminado.", "La evidencia del caso permite saber si puedes usar IA con datos incompletos sin perder criterio operativo."),
      ]),
    ],
  },
  {
    id: "sales-agent-followup",
    title: "Seguimiento comercial con agente de ventas",
    level: "N3",
    profile: "Ventas",
    minutes: 30,
    company: "Aurora SaaS",
    summary: "Un agente prepara seguimiento comercial sin enviar solo.",
    managerBrief:
      "Úsalo para saber si alguien puede delegar seguimiento a un agente sin filtrar datos sensibles, inventar señales de compra o perder control humano.",
    sections: [
      section("Contexto", [
        reading("01.01", "Aurora quiere reactivar oportunidades frías.", "La VP de Ventas necesita recuperar conversaciones antes del cierre mensual. El equipo quiere usar un agente para preparar borradores."),
        reading("01.02", "La presión es comercial, no técnica.", "Hay poco tiempo para escribir seguimientos, pero un mensaje automático mal enviado puede romper una cuenta."),
        reading("01.03", "El agente no es un vendedor autónomo.", "En este caso debe preparar trabajo, no tomar decisiones comerciales ni contactar clientes sin revisión."),
        reading("01.04", "La audiencia es interna.", "Tu recomendación será para la VP de Ventas y para el equipo que revisará los borradores antes de enviarlos."),
        reading("01.05", "Vas a probar control operativo.", "Primero verás datos. Luego definirás permisos, revisarás una corrida y decidirás qué se puede lanzar."),
      ]),
      section("Datos", [
        reading("02.01", "El agente sólo debe leer lo necesario.", "Antes de automatizar, separa señales comerciales útiles de datos personales o notas ambiguas."),
        data("02.02", "Elige qué datos puede leer el agente.", [
          ["Etapa del CRM", "Señal comercial operativa", "Usar"],
          ["Correo personal", "Dato identificable", "Excluir"],
          ["Notas internas", "Puede incluir juicio subjetivo", "Anonimizar"],
        ]),
        reading("02.03", "El CRM no es permiso automático.", "Que un dato exista en el sistema no significa que deba entrar al agente."),
        data("02.04", "Clasifica señales de intención.", [
          ["Última reunión registrada", "Ayuda a ubicar el momento comercial", "Usar"],
          ["Transcripción completa", "Puede contener información sensible", "Anonimizar"],
          ["Comentario del account manager", "Puede mezclar opinión y hecho", "Anonimizar"],
        ]),
        reading("02.05", "Ya tienes el perímetro de datos.", "Con ese perímetro puedes escribir un brief de agente que acelere sin perder control."),
      ]),
      section("IA", [
        reading("03.01", "Ahora define el trabajo del agente.", "Un agente necesita tarea, acceso, límite de acción y condición de paro. Sin eso, sólo estás automatizando ambigüedad."),
        agent("03.02", "Escribe el brief del agente.", "Define tarea, acceso, acción máxima y condición de paro."),
        reading("03.03", "Los permisos son parte del criterio.", "El punto no es si el agente puede hacerlo. El punto es qué debe poder hacer sin aprobación."),
        permission("03.04", "Configura permisos.", ["Leer CRM", "Crear borrador", "Enviar a cliente", "Actualizar pipeline"]),
        reading("03.05", "La ejecución queda acotada.", "Si el agente respeta esos límites, puede acelerar el trabajo sin sustituir el juicio comercial."),
      ]),
      section("Revisión", [
        reading("04.01", "El agente ya corrió una vez.", "Ahora revisa el registro como si fueras responsable de autorizar el flujo."),
        logs("04.02", "Revisa la corrida del agente.", ["Incluyó correo en borrador", "Marcó alta intención sin fuente", "Dejó envío pendiente de aprobación"]),
        reading("04.03", "Los logs muestran criterio o falta de él.", "Un buen operador detecta cuándo el agente inventó intención o expuso datos que no debía."),
        review("04.04", "Detecta errores antes de autorizar.", ["Alta intención por una nota ambigua", "Mensaje en borrador pendiente", "Uso de email en el cuerpo"]),
        reading("04.05", "Ya sabes qué bloquear.", "La decisión final debe mantener velocidad comercial sin abrir un riesgo innecesario."),
      ]),
      section("Decisión", [
        reading("05.01", "La VP quiere una respuesta práctica.", "No basta decir que el agente tiene riesgos. Hay que decidir cómo usarlo de forma controlada."),
        decision("05.02", "Lanzar, pausar o escalar.", "El pipeline importa, pero el riesgo de enviar mal también.", ["Lanzar con revisión humana", "Pausar todo", "Enviar automático"]),
        reading("05.03", "La opción responsable conserva avance.", "Premium no significa lento. Significa que la automatización tiene límites claros."),
        decision("05.04", "Define el control mínimo.", "Antes de activar el flujo, ¿qué control debe quedar fijo?", ["Aprobación humana antes de envío", "Envío libre a cuentas frías", "Actualizar CRM sin registro"]),
        reading("05.05", "La decisión ya tiene consecuencias.", "Ahora toca explicarla para que el manager pueda operar el flujo sin dudas."),
      ]),
      section("Respuesta", [
        reading("06.01", "Cierra con una recomendación clara.", "La VP necesita saber qué autorizas, qué bloqueas y qué señal revisar después."),
        memo("06.02", "Explica la recomendación a la VP.", "Qué autorizas, qué bloqueas y qué debe revisar una persona."),
        reading("06.03", "No vendas el agente como magia.", "Describe el control operativo: borradores sí, envío automático no, revisión obligatoria si aparece intención sin fuente."),
        memo("06.04", "Convierte la decisión en política breve.", "Escribe una regla de uso que el equipo pueda aplicar mañana."),
        reading("06.05", "Caso terminado.", "La evidencia muestra si puedes trabajar con agentes sin perder responsabilidad comercial."),
      ]),
    ],
  },
  {
    id: "support-whatsapp-escalation",
    title: "Escalamiento de soporte con WhatsApp",
    level: "N2",
    profile: "Soporte",
    minutes: 24,
    company: "Loop Retail",
    summary: "Un cliente amenaza con publicar capturas si no recibe respuesta clara.",
    managerBrief:
      "Úsalo para revisar si una persona puede resumir conversaciones reales, detectar riesgo reputacional y preparar una respuesta sin exponer datos personales.",
    sections: makeStandardCase({
      context: "Un cliente molesto amenaza con publicar capturas por un cobro duplicado.",
      dataTitle: "Anonimiza conversación y capturas.",
      aiTitle: "Pide resumen accionable y respuesta segura.",
      reviewTitle: "Corrige promesas no confirmadas.",
      decisionTitle: "Responder, escalar o pedir más validación.",
      responseTitle: "Escribe una respuesta humana y verificable.",
    }),
  },
  {
    id: "finance-variance-claim",
    title: "Variación financiera con hojas de cálculo",
    level: "N2",
    profile: "Finanzas",
    minutes: 26,
    company: "Luma Payments",
    summary: "La dirección pide explicar una caída de margen antes del comité.",
    managerBrief:
      "Úsalo para saber si una persona puede usar IA sobre tablas financieras sin confundir correlación, causa y narrativa ejecutiva.",
    sections: makeStandardCase({
      context: "La CFO pide explicar una caída de margen antes del comité semanal.",
      dataTitle: "Lee señales de tabla sin inventar causa.",
      aiTitle: "Pide hipótesis separadas de evidencia.",
      reviewTitle: "Compara explicaciones rivales.",
      decisionTitle: "Decide qué subir al comité.",
      responseTitle: "Redacta un memo con certeza calibrada.",
    }),
  },
  {
    id: "legal-contract-triage",
    title: "Triage legal de contrato con IA",
    level: "N1",
    profile: "Legal",
    minutes: 22,
    company: "Contrato de distribución",
    summary: "Un contrato debe priorizarse antes de una firma urgente.",
    managerBrief:
      "Úsalo para medir si el equipo usa IA como apoyo de lectura, sin convertirla en autoridad legal ni compartir información fuera de límites.",
    sections: makeStandardCase({
      context: "Comercial quiere firmar hoy un contrato con cambios de última hora.",
      dataTitle: "Decide qué cláusulas pueden procesarse.",
      aiTitle: "Pide extracción de riesgos, no dictamen legal.",
      reviewTitle: "Detecta exceso de autoridad del modelo.",
      decisionTitle: "Prioriza revisar, escalar o bloquear firma.",
      responseTitle: "Escribe una nota de escalamiento.",
    }),
  },
];

export function findDemoCase(id: string) {
  return demoCases.find((demoCase) => demoCase.id === id) ?? null;
}

function section(name: DemoCaseSection["name"], slides: DemoSlide[]): DemoCaseSection {
  return { name, slides };
}

function reading(id: string, title: string, body: string): DemoSlide {
  return { id, type: "reading", eyebrow: "Lectura", title, body };
}

function data(id: string, title: string, rows: Array<[string, string, string]>): DemoSlide {
  return {
    id,
    type: "data_table",
    eyebrow: "Ejercicio",
    title,
    body: "Clasifica cada dato según lo que harías antes de usar IA.",
    rows: rows.map(([label, detail, recommended]) => ({ label, detail, recommended })),
  };
}

function ai(id: string, title: string, body: string, prompt: string): DemoSlide {
  return { id, type: "ai_textfield", eyebrow: "Ejercicio", title, body, prompt };
}

function guided(id: string, title: string, body: string): DemoSlide {
  return { id, type: "guided_prompt", eyebrow: "Ejercicio", title, body };
}

function review(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    type: "output_review",
    eyebrow: "Ejercicio",
    title,
    body: "Marca qué partes requieren corrección antes de usar la salida.",
    options,
  };
}

function decision(id: string, title: string, body: string, options: string[]): DemoSlide {
  return { id, type: "decision", eyebrow: "Decisión", title, body, options };
}

function memo(id: string, title: string, body: string): DemoSlide {
  return { id, type: "memo", eyebrow: "Respuesta", title, body };
}

function agent(id: string, title: string, body: string): DemoSlide {
  return { id, type: "agent_brief", eyebrow: "Ejercicio", title, body };
}

function permission(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    type: "permission_matrix",
    eyebrow: "Ejercicio",
    title,
    body: "Define qué puede hacer solo, qué requiere revisión y qué debe bloquearse.",
    options,
  };
}

function logs(id: string, title: string, options: string[]): DemoSlide {
  return {
    id,
    type: "log_review",
    eyebrow: "Ejercicio",
    title,
    body: "Lee eventos de una corrida y marca dónde se rompió el control.",
    options,
  };
}

function makeStandardCase(input: {
  context: string;
  dataTitle: string;
  aiTitle: string;
  reviewTitle: string;
  decisionTitle: string;
  responseTitle: string;
}): DemoCaseSection[] {
  return [
    section("Contexto", [
      reading("01.01", input.context, "Lee la presión del caso, quién espera respuesta y qué consecuencia tendría equivocarse."),
      reading("01.02", "Tu rol es operar con criterio.", "No estás demostrando que sabes usar una herramienta. Estás mostrando si puedes decidir qué ayuda pedirle a IA."),
      reading("01.03", "La audiencia importa.", "Tu trabajo terminará en una recomendación para un líder que necesita avanzar sin comprar riesgo innecesario."),
      reading("01.04", "La presión no justifica saltarte controles.", "El caso incluye urgencia porque así ocurre el trabajo real, pero la calidad depende de cómo acotas el uso de IA."),
      reading("01.05", "Primero entiende, después ejecuta.", "Vas a pasar por datos, IA, revisión, decisión y respuesta. Cada pantalla te pedirá una acción concreta."),
    ]),
    section("Datos", [
      reading("02.01", "Ahora revisa el material disponible.", "Algunos datos ayudan al modelo. Otros pueden exponer personas, contaminar la respuesta o crear una falsa seguridad."),
      data("02.02", input.dataTitle, [
        ["Dato agregado", "Ayuda sin identificar personas", "Usar"],
        ["Dato personal", "Puede exponer a alguien", "Excluir"],
        ["Nota interna", "Puede requerir contexto", "Anonimizar"],
      ]),
      reading("02.03", "No todo lo disponible debe usarse.", "La señal útil es la que ayuda a decidir sin revelar más de lo necesario."),
      data("02.04", "Clasifica señales secundarias.", [
        ["Resumen agregado", "Reduce exposición y conserva patrón", "Usar"],
        ["Captura completa", "Puede incluir datos fuera del caso", "Anonimizar"],
        ["Identificador directo", "No aporta a la decisión", "Excluir"],
      ]),
      reading("02.05", "Ya tienes límites de uso.", "Con los datos acotados, puedes pedir ayuda a IA sin abrir el caso completo ni regalar contexto sensible."),
    ]),
    section("IA", [
      reading("03.01", "La petición debe convertir criterio en instrucciones.", "Un buen prompt no es largo por sí mismo: define audiencia, límite, formato y validaciones."),
      ai("03.02", input.aiTitle, "Escribe una petición con audiencia, límites y salida esperada.", "Prepara una respuesta de trabajo separando hechos, supuestos y validaciones pendientes."),
      reading("03.03", "La configuración también comunica intención.", "Modelo, límites y formato deben reflejar el nivel de riesgo del caso."),
      guided("03.04", "Ajusta objetivo, audiencia y restricciones.", "La versión guiada enseña a razonar el prompt sin regalar la respuesta correcta."),
      reading("03.05", "La IA produce material de trabajo.", "Todavía falta revisar. Una salida convincente puede estar incompleta, exagerada o fuera de tono."),
    ]),
    section("Revisión", [
      reading("04.01", "La salida ya existe.", "Ahora separa lo útil de lo riesgoso antes de convertirlo en acción."),
      review("04.02", input.reviewTitle, ["Afirmación sin fuente", "Dato sensible visible", "Siguiente paso verificable"]),
      reading("04.03", "Validar no es frenar.", "Validar es decidir qué puede avanzar, qué necesita fuente y qué debe descartarse."),
      review("04.04", "Marca lo que requiere ajuste.", ["Tono demasiado seguro", "Supuesto presentado como hecho", "Validación humana explícita"]),
      reading("04.05", "La revisión deja una versión defendible.", "Ahora puedes decidir con menos ruido y con riesgos visibles."),
    ]),
    section("Decisión", [
      reading("05.01", "El manager necesita una acción.", "No basta con encontrar riesgos. El trabajo real exige decidir qué hacer con ellos."),
      decision("05.02", input.decisionTitle, "Escoge una acción con consecuencias visibles.", ["Avanzar con revisión", "Pausar y pedir datos", "Publicar o enviar tal cual"]),
      reading("05.03", "Tradeoff real.", "La buena respuesta no es perfecta: es responsable, útil y explícita sobre el riesgo."),
      decision("05.04", "Define el siguiente control.", "Elige el control mínimo para que esta decisión pueda ejecutarse.", ["Validación humana concreta", "Automatizar sin seguimiento", "Escalar todo sin propuesta"]),
      reading("05.05", "La decisión ya está tomada.", "La respuesta final debe explicar el porqué sin sonar defensiva ni técnica de más."),
    ]),
    section("Respuesta", [
      reading("06.01", "Cierra como alguien que opera.", "Tu respuesta debe conectar decisión, evidencia y siguiente paso."),
      memo("06.02", input.responseTitle, "Explica al manager qué harías, por qué y qué revisarías después."),
      reading("06.03", "Evita escribir una justificación larga.", "Un manager necesita una recomendación clara, no una explicación defensiva de todo el proceso."),
      memo("06.04", "Hazlo ejecutivo.", "Reescribe en una recomendación, dos razones y una validación pendiente."),
      reading("06.05", "Cierre del caso.", "La respuesta final conecta criterio operativo con acción de negocio."),
    ]),
  ];
}
