---
type: gotcha
title: `git commit` sin pathspec levanta archivos staged de otros agentes
date: 2026-04-23
tags: [git, coordinacion, agentes_paralelos]
dept: [cto]
---

En este repo hay múltiples agentes (backend, gamification, mailing, education, components…) trabajando en paralelo. Casi siempre hay archivos staged por otros que todavía no han hecho su commit. Si yo hago:

```
git add mi_archivo.tsx
git commit -m "..."
```

Git committea TODO lo que está en el index, no solo `mi_archivo.tsx` — y mi mensaje termina describiendo 15 files que no son míos. Pasó dos veces seguidas el 2026-04-23 (commit A de /componentes: 22 files ajenos; commit de /componentesPrueba: 11 files ajenos — ambos con mensaje que solo describía mi archivo).

**Regla adoptada:**

Usar siempre pathspec explícito en el commit:

```
git add <mi_archivo>
git commit -- <mi_archivo> -m "..."
```

Con `--` + pathspec, git toma snapshot del working tree solo para esos paths e ignora el resto del index. Es a prueba de cochinero. Para múltiples archivos: `git commit -- file1 file2 dir/file3 -m "..."`.

**Alternativa si hay mucho ruido en working tree:**

```
git stash push -u -- .        # guardar todo (incluido untracked)
# hacer mis cambios
git add <mi_archivo>
git commit -m "..."
git stash pop                  # restaurar lo ajeno
```

**Detectar el problema ANTES de commitear:**

```
git diff --cached --stat       # ver qué está realmente staged
```

Si lista más archivos de los que yo toqué, pathspec-explicit o stash antes.

**Cuándo aplica:** cualquier sesión donde `git status` muestre modificaciones o untracked que no sean mías. En este repo es casi siempre.
