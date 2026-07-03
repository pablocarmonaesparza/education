-- Ingesta COLOMBIA · SECOP II "Procesos de Contratación" (datos.gov.co, Socrata)
-- Fuente oficial, abierta (CC BY-SA), SIN token. ~8.7M registros.
-- Señal: empresas que GANARON contratos públicos = tienen presupuesto y están activas.
-- Nota honesta: SECOP no trae tamaño de empresa ni email. Eso lo resuelve Claude
-- (estima tamaño) y un paso posterior de enriquecimiento de contacto.

INSTALL httpfs; LOAD httpfs; INSTALL json; LOAD json;

INSERT INTO prospects
  (id, source, country, company_name, tax_id, region, city, signal_value, signal_note, raw)
WITH crudo AS (
  SELECT
    trim(nombre_del_proveedor)                              AS company_name,
    nullif(trim(nit_del_proveedor_adjudicado), 'No Definido') AS nit,
    nullif(trim(departamento_proveedor), 'No Definido')    AS region,
    nullif(trim(ciudad_proveedor), 'No Definido')          AS city,
    try_cast(valor_total_adjudicacion AS DOUBLE)           AS valor
  FROM read_json_auto(
    'https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=3000&$where=valor_total_adjudicacion%20%3E%201000000%20AND%20nombre_del_proveedor%20!=%20%27No%20Definido%27'
  )
  WHERE nombre_del_proveedor IS NOT NULL
    AND nombre_del_proveedor <> 'No Definido'
),
norm AS (
  SELECT
    'secop_co:' || coalesce(nit, 'name:' || md5(lower(company_name))) AS id,
    company_name, nit, region, city, valor
  FROM crudo
),
-- dedupe: un registro por empresa, conservando el contrato de mayor monto
dedup AS (
  SELECT
    id,
    arg_max(company_name, valor) AS company_name,
    arg_max(nit,          valor) AS nit,
    arg_max(region,       valor) AS region,
    arg_max(city,         valor) AS city,
    max(valor)                   AS valor
  FROM norm
  GROUP BY id
)
SELECT
  id, 'secop_co', 'CO',
  company_name, nit, region, city,
  valor,
  'Ganó contrato público (SECOP II)',
  to_json({company_name: company_name, nit: nit, valor: valor})
FROM dedup
ON CONFLICT (id) DO NOTHING;
