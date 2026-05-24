/**
 * Datos demo para data_table_triage en /exercise-lab.
 *
 * IMPORTANTE: estas filas SOLO traen `field` + `example`. La `action` se
 * deja al usuario — la regla 2 del YAML canónico prohíbe prellenar
 * respuestas. El renderer debe arrancar con action=null por cada fila.
 *
 * Para casos productivos, el contenido viene del case_template (no de
 * este archivo). Este archivo es solo el seed del lab interno.
 */

export interface DataTableFieldSpec {
  /** ID estable, usado como field_id en el payload del registry. */
  id: string;
  /** Etiqueta humana del campo. */
  field: string;
  /** Ejemplo concreto del valor para que el usuario decida. */
  example: string;
  /** Hint opcional para guiar la decisión (regla "información laboral
   *  concreta antes de pedir respuesta" del YAML). */
  hint?: string;
}

export const labDataTableFields: DataTableFieldSpec[] = [
  {
    id: "contact",
    field: "Nombre del contacto",
    example: "Mariana Robles",
    hint: "PII directa — identifica a la persona.",
  },
  {
    id: "company",
    field: "Empresa",
    example: "Aurora Retail",
    hint: "Contexto de cuenta — útil para personalizar tono.",
  },
  {
    id: "email",
    field: "Correo",
    example: "mariana@aurora.example",
    hint: "PII + canal de contacto — sensible si se filtra a modelo externo.",
  },
  {
    id: "tickets",
    field: "Tickets recientes",
    example: "12 conversaciones",
    hint: "Histórico de interacción — puede contener PII embebida.",
  },
];
