---
type: aprendizaje
title: las claves de api son de los clientes, no de claude para construir
date: 2026-06-01
tags: [llm, claves, generacion, juez, simulador]
dept: [desarrollo, producto]
---

Las claves de API de LLM (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc. en `.env.local`) son para los CLIENTES en PRODUCCIÓN, no para que Claude las use al construir. Claude ES el modelo: para generar casos, juzgar coherencia narrativa, evaluar una sesión, o cualquier paso de LLM durante el desarrollo, Claude lo hace él mismo, en su turno. Nunca tratar una llave muerta o ausente como bloqueo para construir o probar. El juez productivo (`lib/simulador/judge`) usa la llave del cliente en runtime de producción, y eso es correcto: es concern del cliente, no un bloqueo para Claude.

**Por qué:** Pablo tuvo que repetirlo varias veces porque Claude reincidía. Textual: "no me entiendo esta necedad de cargar los tokens cuando puedes hacerlo todo directamente aquí o igualmente mediante Codex CLI" y "Que no te voy a dar Claves de API para construir esto. Guárdalo en tu memoria, esos son para los clientes, no para ti; termina el trabajo." El motor de generación es dual-proveedor por código, pero durante el desarrollo el proveedor es Claude mismo.

**Cuándo aplicar:** Siempre que un paso necesite un LLM durante el desarrollo (generar un caso, correr el juez narrativo, evaluar una sesión, endurecer con más briefs). No pausar, no pedir llaves, no esperar créditos: hacerlo directamente. Generalización: no esperar recursos externos para hacer el trabajo. La llave solo importa en el runtime de producción del cliente.
