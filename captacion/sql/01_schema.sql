-- captacion/prospects.duckdb · esquema base
-- Pipeline de captación 100% gratis: registros públicos -> DuckDB -> Claude califica.
-- DuckDB es OLAP de archivo único: sin servidor, sin costo, traga JSON/CSV remoto directo.

INSTALL httpfs; LOAD httpfs;
INSTALL json;  LOAD json;

CREATE TABLE IF NOT EXISTS prospects (
  id             TEXT PRIMARY KEY,   -- '<source>:<nit/rfc o hash del nombre>'
  source         TEXT NOT NULL,      -- 'secop_co' | 'denue_mx'
  country        TEXT NOT NULL,      -- 'CO' | 'MX'
  company_name   TEXT,
  tax_id         TEXT,               -- NIT (CO) | CLEE/RFC (MX)
  industry       TEXT,               -- giro / categoría
  size_bucket    TEXT,               -- etiqueta de estrato (DENUE) o NULL
  size_min       INTEGER,            -- empleados estimados (rango)
  size_max       INTEGER,
  city           TEXT,
  region         TEXT,
  phone          TEXT,
  email          TEXT,
  website        TEXT,
  lat            DOUBLE,
  lon            DOUBLE,
  signal_value   DOUBLE,             -- señal de presupuesto/intent (ej. monto de contrato)
  signal_note    TEXT,               -- de dónde viene la señal
  discovered_at  TIMESTAMP DEFAULT now(),
  raw            JSON,
  -- calificación (la llena qualify.mjs con Claude) --
  score          INTEGER,            -- 0-100
  qualifies      BOOLEAN,            -- ¿es prospecto válido para Itera?
  size_ok        BOOLEAN,            -- ¿cae en "negocio pequeño"?
  reason         TEXT,               -- por qué (1 línea)
  scored_at      TIMESTAMP
);

-- Vistas de trabajo
CREATE OR REPLACE VIEW prospects_sin_calificar AS
  SELECT * FROM prospects WHERE scored_at IS NULL;

CREATE OR REPLACE VIEW prospects_calificados AS
  SELECT * FROM prospects
  WHERE qualifies IS TRUE AND coalesce(size_ok, TRUE) IS TRUE
  ORDER BY score DESC NULLS LAST, signal_value DESC NULLS LAST;
