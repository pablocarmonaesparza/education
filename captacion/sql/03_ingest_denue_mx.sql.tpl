-- Ingesta MÉXICO · DENUE / INEGI (API oficial, gratis con token).
-- Plantilla: run.sh sustituye __TOKEN__, __ENTIDAD__, __ACT__, __ESTRATO__, __INI__, __FIN__.
-- Genera tu token gratis en: https://www.inegi.org.mx/app/api/denue/v1/tokenVerify.aspx
--
-- Endpoint BuscarAreaAct: filtra por entidad (estado), actividad (SCIAN) y ESTRATO de tamaño.
--   Estrato:  1=0-5  2=6-10  3=11-30  4=31-50  5=51-100  6=101-250  7=251+   (0=todos)
--   Tu target ~20-80 empleados = estratos 3, 4 y mitad del 5.
--   Entidad: 09=CDMX, 15=Edomex, 19=NL, 14=Jalisco ...  (0=todas)
--   ACT: prefijo SCIAN (ej. 51=información/medios, 54=servicios profesionales) o 0=todas.
-- Nota honesta: el campo Correo_e existe pero suele venir VACÍO — DENUE sirve para
-- descubrir + filtrar por tamaño + teléfono; el email se enriquece después.

INSTALL httpfs; LOAD httpfs; INSTALL json; LOAD json;

INSERT INTO prospects
  (id, source, country, company_name, tax_id, industry, size_bucket,
   city, region, phone, email, website, lat, lon, signal_note, raw)
WITH crudo AS (
  SELECT *
  FROM read_json_auto(
    'https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct/__ENTIDAD__/0/0/0/0/__ACT__/0/__INI__/__FIN__/0/__ESTRATO__/__TOKEN__'
  )
),
norm AS (
  SELECT
    'denue_mx:' || coalesce(try_cast(Id AS TEXT), md5(lower(Nombre))) AS id,
    trim(Nombre)               AS company_name,
    try_cast(Id AS TEXT)       AS tax_id,
    Clase_actividad            AS industry,
    Estrato                    AS size_bucket,
    Ubicacion                  AS city_raw,
    Telefono                   AS phone,
    nullif(trim(Correo_e), '') AS email,
    nullif(trim(Sitio_internet), '') AS website,
    try_cast(Latitud AS DOUBLE)  AS lat,
    try_cast(Longitud AS DOUBLE) AS lon
  FROM crudo
)
SELECT
  id, 'denue_mx', 'MX',
  company_name, tax_id, industry, size_bucket,
  city_raw, city_raw, phone, email, website, lat, lon,
  'DENUE/INEGI (estrato ' || coalesce(size_bucket,'?') || ')',
  to_json({nombre: company_name, estrato: size_bucket, tel: phone})
FROM norm
ON CONFLICT (id) DO NOTHING;
