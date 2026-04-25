#!/usr/bin/env bash
# lint-memory.sh — valida frontmatter de docs/memory/ + dashboard de actividad por dept
#
# uso: bash scripts/lint-memory.sh
# exit 0 si todo ok, exit 1 si hay errores
#
# valida en cada archivo de docs/memory/ (excepto INDEX.md):
#   - frontmatter delimitado por --- al inicio
#   - campo `type` con uno de: decision, aprendizaje, copy, negocio, experimento, metodologia, gotcha
#   - campo `dept` con lista de: ceo, cfo, cmo, cgo, cpo, cto, orq, shared
#   - campo `date` con formato YYYY-MM-DD válido
#
# imprime al final dashboard de "última actualización por dept" para alertar
# de departamentos silenciosos (>7 días sin update).

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MEMORY_DIR="$REPO_ROOT/docs/memory"

if [ ! -d "$MEMORY_DIR" ]; then
  echo "ERROR: $MEMORY_DIR no existe"
  exit 1
fi

VALID_TYPES="decision aprendizaje copy negocio experimento metodologia gotcha"
VALID_DEPTS="ceo cfo cmo cgo cpo cto orq shared"

errors=0
warnings=0
total=0

# ---------- validación por archivo ----------

for f in "$MEMORY_DIR"/*.md; do
  base=$(basename "$f")
  if [ "$base" = "INDEX.md" ]; then continue; fi
  total=$((total + 1))

  # ¿tiene frontmatter?
  first_line=$(head -1 "$f")
  if [ "$first_line" != "---" ]; then
    echo "ERROR: $base — no tiene frontmatter (primera línea: '$first_line')"
    errors=$((errors + 1))
    continue
  fi

  # extraer bloque frontmatter
  end_line=$(awk '/^---$/{c++; if(c==2){print NR; exit}}' "$f")
  if [ -z "$end_line" ]; then
    echo "ERROR: $base — frontmatter abierto pero sin cierre"
    errors=$((errors + 1))
    continue
  fi
  fm=$(sed -n "1,${end_line}p" "$f")

  # campo type
  type_val=$(echo "$fm" | grep -E "^type:" | sed -E 's/^type:[[:space:]]*//')
  if [ -z "$type_val" ]; then
    echo "ERROR: $base — falta campo 'type'"
    errors=$((errors + 1))
  else
    if ! echo " $VALID_TYPES " | grep -q " $type_val "; then
      echo "ERROR: $base — type='$type_val' inválido (válidos: $VALID_TYPES)"
      errors=$((errors + 1))
    fi
  fi

  # campo date YYYY-MM-DD
  date_val=$(echo "$fm" | grep -E "^date:" | sed -E 's/^date:[[:space:]]*//')
  if [ -z "$date_val" ]; then
    echo "ERROR: $base — falta campo 'date'"
    errors=$((errors + 1))
  else
    if ! echo "$date_val" | grep -qE "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"; then
      echo "ERROR: $base — date='$date_val' no tiene formato YYYY-MM-DD"
      errors=$((errors + 1))
    fi
  fi

  # campo dept (lista)
  dept_raw=$(echo "$fm" | grep -E "^dept:" | sed -E 's/^dept:[[:space:]]*//')
  if [ -z "$dept_raw" ]; then
    echo "ERROR: $base — falta campo 'dept'"
    errors=$((errors + 1))
    continue
  fi
  # quitar [ ] y dividir por coma
  dept_clean=$(echo "$dept_raw" | tr -d '[]' | tr ',' ' ')
  for d in $dept_clean; do
    d=$(echo "$d" | tr -d ' ')
    if [ -z "$d" ]; then continue; fi
    if ! echo " $VALID_DEPTS " | grep -q " $d "; then
      echo "ERROR: $base — dept='$d' inválido (válidos: $VALID_DEPTS)"
      errors=$((errors + 1))
    fi
  done
done

# ---------- dashboard de actividad por dept ----------

echo ""
echo "════════════════════════════════════════════════════"
echo "dashboard de actividad por departamento"
echo "════════════════════════════════════════════════════"

today_epoch=$(date +%s)

for dept in $VALID_DEPTS; do
  count=0
  latest_date=""
  latest_epoch=0

  for f in "$MEMORY_DIR"/*.md; do
    base=$(basename "$f")
    if [ "$base" = "INDEX.md" ]; then continue; fi
    end_line=$(awk '/^---$/{c++; if(c==2){print NR; exit}}' "$f" 2>/dev/null)
    if [ -z "$end_line" ]; then continue; fi
    fm=$(sed -n "1,${end_line}p" "$f")
    dept_raw=$(echo "$fm" | grep -E "^dept:" | sed -E 's/^dept:[[:space:]]*//' | tr -d '[]' | tr ',' ' ')
    if echo " $dept_raw " | grep -q " $dept "; then
      count=$((count + 1))
      d=$(echo "$fm" | grep -E "^date:" | sed -E 's/^date:[[:space:]]*//')
      if [ -n "$d" ]; then
        d_epoch=$(date -j -f "%Y-%m-%d" "$d" "+%s" 2>/dev/null || echo 0)
        if [ "$d_epoch" -gt "$latest_epoch" ]; then
          latest_epoch=$d_epoch
          latest_date=$d
        fi
      fi
    fi
  done

  if [ "$count" -eq 0 ]; then
    printf "  %-7s  %3s docs  última: ─          %s\n" "$dept" "$count" "(sin output)"
    warnings=$((warnings + 1))
  else
    days_ago=$(( (today_epoch - latest_epoch) / 86400 ))
    if [ "$days_ago" -gt 7 ]; then
      flag="⚠ silencioso ${days_ago}d"
      warnings=$((warnings + 1))
    else
      flag=""
    fi
    printf "  %-7s  %3s docs  última: %s  %s\n" "$dept" "$count" "$latest_date" "$flag"
  fi
done

echo "════════════════════════════════════════════════════"
echo "resumen: $total archivos, $errors errores, $warnings warnings de actividad"
echo ""

if [ "$errors" -gt 0 ]; then
  echo "FAIL — $errors errores. corregir antes de cerrar sesión."
  exit 1
fi

echo "OK — frontmatter válido en todos los archivos."
exit 0
