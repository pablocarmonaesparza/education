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
        reading("01.01", "Camila necesita tres ángulos para hoy.", "Loop quiere reactivar cuentas con bajo uso del producto. Los datos vienen mezclados con feedback de clientes, notas internas y señales de uso."),
        decision("01.02", "Define la audiencia real.", "Antes de pedirle algo al modelo, decide para quién es la entrega.", ["VP de Marketing", "Cliente final", "Equipo legal"]),
      ]),
      section("Datos", [
        data("02.01", "Clasifica qué puede entrar al prompt.", [
          ["Uso agregado del producto", "Señal útil sin identificar personas", "Usar"],
          ["Nombre y correo del cliente", "Identificador personal", "Excluir"],
          ["Comentario textual de cliente", "Puede revelar contexto sensible", "Anonimizar"],
        ]),
        reading("02.02", "El objetivo no es usar todo.", "La calidad del caso depende de preservar la señal comercial sin arrastrar datos que no hacen falta."),
      ]),
      section("IA", [
        guided("03.01", "Construye el prompt con opciones guiadas.", "Selecciona objetivo, audiencia, límites y modelo. El prompt se genera sin dejar el caso abierto a configuración libre."),
        ai("03.02", "Revisa el prompt antes de enviarlo.", "El campo de IA debe sonar como una herramienta real de trabajo.", "Genera tres ángulos de campaña para reactivar cuentas con bajo uso usando sólo datos agregados. Marca supuestos y validaciones pendientes."),
      ]),
      section("Revisión", [
        review("04.01", "Marca claims antes de compartir.", [
          "Podemos recuperar 40% de cuentas en 30 días.",
          "La campaña debe mencionar clientes por nombre para personalizar.",
          "Propongo validar métricas antes de publicar promesas.",
        ]),
        reading("04.02", "La salida no es la decisión.", "El participante debe detectar qué puede usarse como borrador y qué necesita fuente o revisión humana."),
      ]),
      section("Decisión", [
        decision("05.01", "Elige qué mandar a Camila.", "Hay presión por avanzar, pero no todos los ángulos están listos para salir.", ["Enviar tres opciones con riesgos visibles", "Enviar todo tal cual", "Pausar sin propuesta"]),
        reading("05.02", "Tradeoff esperado.", "La mejor decisión conserva velocidad, pero deja claro qué no está validado."),
      ]),
      section("Respuesta", [
        memo("06.01", "Escribe la recomendación final.", "Explica qué opción usarías, qué validarías y qué no publicarías todavía."),
        reading("06.02", "Cierre del caso.", "La respuesta debe orientar al manager: acción, evidencia y condición de salida."),
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
        decision("01.02", "Define el límite de autonomía.", "El agente puede acelerar trabajo, pero no debe enviar mensajes sin revisión.", ["Crear borradores", "Enviar automáticamente", "Actualizar contratos"]),
      ]),
      section("Datos", [
        data("02.01", "Elige qué datos puede leer el agente.", [
          ["Etapa del CRM", "Señal comercial operativa", "Usar"],
          ["Correo personal", "Dato identificable", "Excluir"],
          ["Notas internas", "Puede incluir juicio subjetivo", "Anonimizar"],
        ]),
        reading("02.02", "El CRM no es permiso automático.", "Que un dato exista en el sistema no significa que deba entrar al agente."),
      ]),
      section("IA", [
        agent("03.01", "Escribe el brief del agente.", "Define tarea, acceso, acción máxima y condición de paro."),
        permission("03.02", "Configura permisos.", ["Leer CRM", "Crear borrador", "Enviar a cliente", "Actualizar pipeline"]),
      ]),
      section("Revisión", [
        logs("04.01", "Revisa la corrida del agente.", ["Incluyó correo en borrador", "Marcó alta intención sin fuente", "Dejó envío pendiente de aprobación"]),
        review("04.02", "Detecta errores antes de autorizar.", ["Alta intención por una nota ambigua", "Mensaje en borrador pendiente", "Uso de email en el cuerpo"]),
      ]),
      section("Decisión", [
        decision("05.01", "Lanzar, pausar o escalar.", "El pipeline importa, pero el riesgo de enviar mal también.", ["Lanzar con revisión humana", "Pausar todo", "Enviar automático"]),
        reading("05.02", "Lo medible.", "Buscamos criterio para operar agentes en producción, no sólo saber escribir prompts."),
      ]),
      section("Respuesta", [
        memo("06.01", "Explica la recomendación a la VP.", "Qué autorizas, qué bloqueas y qué debe revisar una persona."),
        reading("06.02", "Cierre del caso.", "La evidencia queda lista para manager y para práctica posterior."),
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
      decision("01.02", "Elige la prioridad inicial.", "Antes de usar IA, decide qué debe protegerse.", ["Velocidad con control", "Máxima automatización", "Respuesta sin validar"]),
    ]),
    section("Datos", [
      data("02.01", input.dataTitle, [
        ["Dato agregado", "Ayuda sin identificar personas", "Usar"],
        ["Dato personal", "Puede exponer a alguien", "Excluir"],
        ["Nota interna", "Puede requerir contexto", "Anonimizar"],
      ]),
      reading("02.02", "Define límites de uso.", "El participante debe controlar qué entra al sistema antes de pedirle algo al modelo."),
    ]),
    section("IA", [
      ai("03.01", input.aiTitle, "Escribe una petición con audiencia, límites y salida esperada.", "Prepara una respuesta de trabajo separando hechos, supuestos y validaciones pendientes."),
      guided("03.02", "Ajusta objetivo, audiencia y restricciones.", "La versión guiada enseña a razonar el prompt sin regalar la respuesta correcta."),
    ]),
    section("Revisión", [
      review("04.01", input.reviewTitle, ["Afirmación sin fuente", "Dato sensible visible", "Siguiente paso verificable"]),
      reading("04.02", "No aceptar la primera salida.", "La evaluación mide si la persona valida antes de llevar la respuesta al trabajo real."),
    ]),
    section("Decisión", [
      decision("05.01", input.decisionTitle, "Escoge una acción con consecuencias visibles.", ["Avanzar con revisión", "Pausar y pedir datos", "Publicar o enviar tal cual"]),
      reading("05.02", "Tradeoff real.", "La buena respuesta no es perfecta: es responsable, útil y explícita sobre el riesgo."),
    ]),
    section("Respuesta", [
      memo("06.01", input.responseTitle, "Explica al manager qué harías, por qué y qué revisarías después."),
      reading("06.02", "Cierre del caso.", "La respuesta final conecta criterio operativo con acción de negocio."),
    ]),
  ];
}
