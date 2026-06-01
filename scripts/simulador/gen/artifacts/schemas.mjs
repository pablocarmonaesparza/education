// JSON Schemas de los artefactos intermedios del pipeline (para tool_use).
// La validacion fuerte de reglas la hacen los gates; estos schemas FUERZAN la
// forma para que cada paso reciba algo bien estructurado.

export const EXPECTED_ACTIONS = ["pilotar", "entrenar", "pausar", "escalar"];
export const LEVELS = ["N1 · Fundamentos", "N2 · Workflow", "N3 · Agentes"];
export const PROFILE_PACKS = [
  "marketing_growth",
  "sales_revops",
  "customer_success_support",
  "operations_automation",
  "finance_fpa",
  "legal_compliance_privacy",
];

// ---- P1: brief normalizado ----
export const BRIEF_SCHEMA = {
  name: "submit_normalized_brief",
  description:
    "Brief normalizado del caso: campos limpios y completos a partir del brief crudo.",
  schema: {
    type: "object",
    properties: {
      case_id: {
        type: "string",
        description: "slug en minusculas con guiones bajos, por ejemplo nova_finance_cobranza",
      },
      level: { type: "string", enum: LEVELS },
      profile: { type: "string", description: "etiqueta corta del area, por ejemplo Finanzas" },
      profile_pack: { type: "string", enum: PROFILE_PACKS },
      company: {
        type: "object",
        properties: {
          name: { type: "string" },
          industry: { type: "string" },
          market: { type: "string", description: "mercado o region, por ejemplo Latinoamerica" },
        },
        required: ["name", "industry", "market"],
      },
      participant_role: { type: "string", description: "puesto del participante" },
      moment_of_work: {
        type: "string",
        description: "la escena laboral concreta que detona el caso",
      },
      manager: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
        },
        required: ["name", "role"],
      },
      manager_signal: {
        type: "string",
        description: "la pregunta que el jefe necesita responder con este caso",
      },
      assignment_brief: {
        type: "string",
        description: "parrafo de 60 a 90 palabras que el jefe usa para asignar el caso",
      },
      business_metric: { type: "string" },
      risk_metric: { type: "string" },
      expected_signal: { type: "string" },
      expected_action: { type: "string", enum: EXPECTED_ACTIONS },
      alternatives: {
        type: "array",
        items: { type: "string", enum: EXPECTED_ACTIONS },
      },
      tools: {
        type: "array",
        items: { type: "string", enum: ["ai", "data", "messaging", "documents", "workflow"] },
      },
      ai_tool: {
        type: "object",
        properties: {
          name: { type: "string", description: "nombre de la herramienta de inteligencia artificial del caso" },
          can: { type: "array", items: { type: "string" } },
          cannot: { type: "array", items: { type: "string" } },
          is_chosen: { type: "boolean", description: "false si es instrumento dado, no elegible" },
        },
        required: ["name", "can", "cannot", "is_chosen"],
      },
      risks_and_controls: { type: "array", items: { type: "string" } },
      assumptions: {
        type: "array",
        items: { type: "string" },
        description: "supuestos que rellenaste de forma conservadora",
      },
      synthetic: { type: "boolean" },
    },
    required: [
      "case_id",
      "level",
      "profile",
      "profile_pack",
      "company",
      "participant_role",
      "moment_of_work",
      "manager",
      "manager_signal",
      "assignment_brief",
      "business_metric",
      "risk_metric",
      "expected_signal",
      "expected_action",
      "alternatives",
      "tools",
      "ai_tool",
      "synthetic",
    ],
  },
};

// ---- P2: biblia de continuidad ----
export const BIBLE_SCHEMA = {
  name: "submit_bible",
  description:
    "Biblia de continuidad: los hechos canonicos del caso. Ningun slide puede inventar fuera de esto.",
  schema: {
    type: "object",
    properties: {
      company: { type: "string" },
      participant_role: { type: "string" },
      people: {
        type: "array",
        description: "cada persona una vez; ninguna se llama igual que otra",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            function: { type: "string", enum: ["asigna", "revisa", "recibe", "asigna_y_recibe"] },
          },
          required: ["name", "role", "function"],
        },
      },
      message_recipient: {
        type: "string",
        description: "el destinatario del mensaje que arma el participante: SIEMPRE un segmento de clientes o usuarios, nunca una persona del equipo",
      },
      ai_tool: {
        type: "object",
        properties: {
          name: { type: "string" },
          can: { type: "array", items: { type: "string" } },
          cannot: { type: "array", items: { type: "string" } },
          is_chosen: { type: "boolean" },
        },
        required: ["name", "can", "cannot", "is_chosen"],
      },
      dataset: {
        type: "object",
        description: "la base de datos sucia del caso (sintetica)",
        properties: {
          fields: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
              },
              required: ["name", "description"],
            },
          },
          rows: {
            type: "array",
            description: "8 a 12 filas; mezcla de claras para usar, claras para excluir, y grises",
            items: { type: "object", additionalProperties: true },
          },
          rules: {
            type: "array",
            items: { type: "string" },
            description: "reglas de la politica de datos, visibles y citables",
          },
        },
        required: ["fields", "rows", "rules"],
      },
      manager_promises: {
        type: "array",
        items: { type: "string" },
        description: "lo que el jefe pide al inicio; TODO debe cerrarse en el caso",
      },
      key_dates: {
        type: "array",
        items: { type: "string" },
        description: "fechas absolutas (hoy, ultima campana, deadline)",
      },
      key_numbers: {
        type: "array",
        items: { type: "string" },
        description: "metricas base y umbrales canonicos",
      },
      segments: {
        type: "array",
        description: "segmentos candidatos para el envio, con su caveat",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            caveat: { type: "string" },
          },
          required: ["label", "caveat"],
        },
      },
    },
    required: [
      "company",
      "participant_role",
      "people",
      "message_recipient",
      "ai_tool",
      "dataset",
      "manager_promises",
      "key_dates",
      "key_numbers",
      "segments",
    ],
  },
};

// ---- P3: intents del blueprint (1 linea por slide) ----
export const BLUEPRINT_INTENTS_SCHEMA = {
  name: "submit_blueprint_intents",
  description: "Una intencion de una linea por cada slide (que mide o muestra).",
  schema: {
    type: "object",
    properties: {
      intents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            section: { type: "string" },
            slot: { type: "integer" },
            block_id: { type: "string" },
            intent: { type: "string", description: "una linea: que hace este slide en la historia" },
          },
          required: ["section", "slot", "block_id", "intent"],
        },
      },
    },
    required: ["intents"],
  },
};
