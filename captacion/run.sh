#!/usr/bin/env bash
# captacion/run.sh — corre el pipeline de captación en DuckDB. Sin servidor, $0.
#   ./captacion/run.sh                 -> esquema + ingesta Colombia (SECOP, sin token)
#   DENUE_TOKEN=xxxx ./captacion/run.sh -> además ingesta México (DENUE)
# Variables opcionales para DENUE: DENUE_ENTIDAD (09=CDMX), DENUE_ACT (0=todas),
#   DENUE_ESTRATO (3=11-30, 4=31-50; 0=todas).
set -euo pipefail
cd "$(dirname "$0")/.."

DB="captacion/prospects.duckdb"
echo "==> Esquema ($DB)"
duckdb "$DB" < captacion/sql/01_schema.sql

echo "==> Ingesta Colombia · SECOP II (datos.gov.co, sin token)"
duckdb "$DB" < captacion/sql/02_ingest_secop_co.sql

if [[ -n "${DENUE_TOKEN:-}" ]]; then
  echo "==> Ingesta México · DENUE/INEGI"
  TPL="captacion/sql/03_ingest_denue_mx.sql.tpl"
  TMP="$(mktemp)"
  sed -e "s/__TOKEN__/${DENUE_TOKEN}/g" \
      -e "s/__ENTIDAD__/${DENUE_ENTIDAD:-09}/g" \
      -e "s/__ACT__/${DENUE_ACT:-0}/g" \
      -e "s/__ESTRATO__/${DENUE_ESTRATO:-0}/g" \
      -e "s/__INI__/1/g" -e "s/__FIN__/2000/g" \
      "$TPL" > "$TMP"
  duckdb "$DB" < "$TMP"
  rm -f "$TMP"
else
  echo "    (DENUE omitido — definí DENUE_TOKEN para incluir México)"
fi

echo "==> Conteo por fuente"
duckdb "$DB" -c "SELECT source, country, count(*) AS n, count(*) FILTER (WHERE scored_at IS NOT NULL) AS calificados FROM prospects GROUP BY 1,2 ORDER BY 1;"
echo "Listo. Califica con:  node captacion/qualify.mjs"
