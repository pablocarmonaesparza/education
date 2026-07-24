/**
 * Stats de mercado VERIFICADAS para el funnel (landing + /demo).
 *
 * Fuente única: cualquier superficie que cite un número de mercado importa de
 * aquí — nunca hardcodear la cifra en el JSX. Reglas duras (audit W2-C):
 *
 *   1. Cero stats inventadas. Solo las de esta lista, verificadas contra el
 *      reporte original. Si quieres una nueva, primero se verifica y entra aquí.
 *   2. La figura SIEMPRE viaja con su fuente: visible (ts-caption-2
 *      text-tertiary) o como tooltip `title=`.
 *   3. Máximo 3 stats por superficie.
 *   4. NUNCA mezclar estas stats (hechos del mercado) con el stats band de
 *      hechos del producto de la landing — son bandas separadas a propósito:
 *      una habla del mundo, la otra de lo que Itera hace.
 */

export type MarketStat = {
  /** Identificador estable para referirse a la stat desde las superficies. */
  id: string;
  /** La cifra tal como se muestra ("57%", "3x", "$670K"). */
  figure: string;
  /** El claim en inglés de EEUU, sin punto final (los títulos no lo llevan). */
  claim: string;
  /** Fuente citable, con alcance del estudio cuando aporta credibilidad. */
  source: string;
  /** Año del reporte. */
  year: number;
};

export const MARKET_STATS = {
  KPMG_HIDE: {
    id: "KPMG_HIDE",
    figure: "57%",
    claim: "of employees hide their AI use from their employer",
    source: "KPMG & University of Melbourne, Trust in AI 2025 · 48,000 workers, 47 countries",
    year: 2025,
  },
  MCKINSEY_3X: {
    id: "MCKINSEY_3X",
    figure: "3x",
    claim: "Leaders underestimate how much AI their teams actually use — by about 3x",
    source: "McKinsey, Superagency in the Workplace, 2025",
    year: 2025,
  },
  IBM_COST: {
    id: "IBM_COST",
    figure: "$670K",
    claim: "Breaches involving shadow AI cost an average of $670K more",
    source: "IBM, Cost of a Data Breach Report 2025",
    year: 2025,
  },
  VERIZON_ACCOUNTS: {
    id: "VERIZON_ACCOUNTS",
    figure: "67%",
    claim: "of workers who use AI at work do it through personal, unapproved accounts",
    source: "Verizon Data Breach Investigations Report, 2026",
    year: 2026,
  },
  KPMG_POLICY: {
    id: "KPMG_POLICY",
    figure: "44%",
    claim: "of employees admit to using AI against company policy",
    source: "KPMG & University of Melbourne, Trust in AI 2025",
    year: 2025,
  },
} as const satisfies Record<string, MarketStat>;

/**
 * Variante del claim de IBM_COST para /demo (mismo reporte IBM 2025: shadow AI
 * aparece en el 20% de las brechas Y agrega ~$670K al costo de cada una). El
 * strip de /demo la usa porque conecta las DOS cifras del reporte en una frase;
 * la fuente sigue siendo MARKET_STATS.IBM_COST.source.
 */
export const IBM_COST_DEMO_CLAIM =
  "Shadow AI shows up in 1 in 5 breaches — and adds ~$670K to the cost of each one";
