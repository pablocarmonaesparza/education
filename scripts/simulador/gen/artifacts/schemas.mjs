// JSON Schemas de los artefactos intermedios del pipeline (para tool_use).
// La validacion fuerte de reglas la hacen los gates; estos schemas FUERZAN la
// forma para que cada paso reciba algo bien estructurado.

// EXPECTED_ACTIONS son IDENTIFICADORES de BD (glosario §3: no se renombran; el
// display en ingles es Pilot/Coach/Pause/Escalate y vive en la capa de UI).
export const EXPECTED_ACTIONS = ["pilotar", "entrenar", "pausar", "escalar"];
export const LEVELS = ["N1 · Foundations", "N2 · Workflow", "N3 · Agents"];
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
    "Normalized case brief: clean, complete fields derived from the raw brief.",
  schema: {
    type: "object",
    properties: {
      case_id: {
        type: "string",
        description: "lowercase slug with underscores, e.g. harbor_finance_collections",
      },
      level: { type: "string", enum: LEVELS },
      profile: { type: "string", description: "short label for the area, e.g. Finance" },
      profile_pack: { type: "string", enum: PROFILE_PACKS },
      company: {
        type: "object",
        properties: {
          name: { type: "string" },
          industry: { type: "string" },
          market: { type: "string", description: "market or region, e.g. United States" },
        },
        required: ["name", "industry", "market"],
      },
      participant_role: { type: "string", description: "the participant's job title" },
      moment_of_work: {
        type: "string",
        description: "the concrete work scene that triggers the case",
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
        description: "the question the manager needs this case to answer",
      },
      assignment_brief: {
        type: "string",
        description: "60-90 word paragraph the manager uses to assign the case",
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
          name: { type: "string", description: "proper name of the case's AI tool" },
          can: { type: "array", items: { type: "string" } },
          cannot: { type: "array", items: { type: "string" } },
          is_chosen: { type: "boolean", description: "false if the tool is a given instrument, not a choice" },
        },
        required: ["name", "can", "cannot", "is_chosen"],
      },
      risks_and_controls: { type: "array", items: { type: "string" } },
      assumptions: {
        type: "array",
        items: { type: "string" },
        description: "assumptions you filled in conservatively",
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
    "Continuity bible: the canonical facts of the case. No slide may invent outside of this.",
  schema: {
    type: "object",
    properties: {
      company: { type: "string" },
      participant_role: { type: "string" },
      people: {
        type: "array",
        description: "each person appears once; no two people share a name",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            // identificadores internos: asigna=assigns, revisa=reviews,
            // recibe=receives, asigna_y_recibe=assigns_and_receives
            function: { type: "string", enum: ["asigna", "revisa", "recibe", "asigna_y_recibe"] },
          },
          required: ["name", "role", "function"],
        },
      },
      message_recipient: {
        type: "string",
        description: "the recipient of the message the participant builds: ALWAYS a segment of customers or users, never a member of the team",
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
        description: "the case's dirty dataset (synthetic)",
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
            description: "8 to 12 rows; a mix of clearly usable, clearly excluded, and gray-area records",
            items: { type: "object", additionalProperties: true },
          },
          rules: {
            type: "array",
            items: { type: "string" },
            description: "data policy rules, visible and quotable",
          },
        },
        required: ["fields", "rows", "rules"],
      },
      manager_promises: {
        type: "array",
        items: { type: "string" },
        description: "what the manager asks for at the start; ALL of it must be closed inside the case",
      },
      key_dates: {
        type: "array",
        items: { type: "string" },
        description: "absolute dates (today, last campaign, deadline)",
      },
      key_numbers: {
        type: "array",
        items: { type: "string" },
        description: "canonical baseline metrics and thresholds",
      },
      segments: {
        type: "array",
        description: "candidate segments for the send, each with its caveat",
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
  description: "A one-line intent for every slide (what it measures or shows).",
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
            intent: { type: "string", description: "one line: what this slide does in the story" },
          },
          required: ["section", "slot", "block_id", "intent"],
        },
      },
    },
    required: ["intents"],
  },
};
