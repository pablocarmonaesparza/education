# Captación — pipeline $0 en DuckDB

Software propio de captación de clientes B2B para Itera, hecho con piezas **gratis y
limpias de términos**. Sin servidor, sin suscripciones: DuckDB es una base OLAP de
**archivo único** que lee JSON/CSV de registros públicos directo desde la URL.

```
Registros públicos  →  DuckDB (prospects.duckdb)  →  Claude califica  →  shortlist
 (DENUE / SECOP)        deduplica, filtra tamaño      (Haiku, centavos)   /admin
```

## Correr

```bash
./captacion/run.sh                       # esquema + Colombia (SECOP, sin token)
DENUE_TOKEN=xxxx ./captacion/run.sh      # + México (DENUE/INEGI)
node captacion/qualify.mjs 30            # califica 30 con Claude
duckdb captacion/prospects.duckdb -c "SELECT company_name, region, score, reason FROM prospects_calificados LIMIT 20;"
```

Token gratis de DENUE: https://www.inegi.org.mx/app/api/denue/v1/tokenVerify.aspx

## Fuentes (verificadas, gratis, oficiales)

| Fuente | País | Trae | Token | Nota |
|---|---|---|---|---|
| **SECOP II Procesos** (datos.gov.co) | CO | empresa + NIT + ciudad + monto de contrato (señal de presupuesto) | no | sin tamaño ni email |
| **DENUE / INEGI** | MX | nombre + giro + **estrato (tamaño)** + tel + (email a veces) + geo | sí (gratis) | email suele venir vacío |

## El eslabón débil (honesto)
Ningún registro público trae el **email de la persona compradora**. Estas fuentes dan
la **empresa** (+ tamaño/ubicación/identificador fiscal). El email se resuelve después:
ubicar a la persona con Sales Navigator (ya pagado) → armar email por patrón
(`nombre.apellido@dominio`) → verificar con Reoon (600/mes gratis). Esa pieza la cierra
la 2ª ronda de research.

## Calificación
`qualify.mjs` manda cada prospecto a Claude (Haiku) con el perfil de Itera y devuelve
`score`, `qualifies`, `size_ok` y una razón. La regla de "negocio pequeño" se aplica ahí.

## Integración con la app
`prospects.duckdb` es un archivo local. El shortlist (`prospects_calificados`) se puede
exportar a CSV e importar a `/admin/leads`, o leerse directo. DuckDB no es la base de la
app (eso es Postgres/Supabase); es el motor de **lote** para descubrir + calificar barato.
