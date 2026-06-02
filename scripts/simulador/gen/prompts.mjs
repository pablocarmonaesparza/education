// Fragmentos de prompt compartidos por los pasos del generador.
// Las REGLAS DE COPY son las restricciones duras del producto (las de Pablo):
// las inyecta cada paso que escribe texto visible, y los gates las verifican.

export const COPY_RULES = `REGLAS DE COPY (obligatorias, el caso se rechaza si se rompen):
- JAMAS uses el guion largo (—). Usa punto, coma o parentesis.
- CERO siglas o acronimos en la prosa visible. Escribe "inteligencia artificial", no su sigla; escribe "datos personales", no su sigla en ingles; escribe "indicadores", "tablero", "gestor de clientes" en lugar de siglas. Las mayusculas tipo "IA" solo se permiten en etiquetas muy cortas o chips, nunca en oraciones.
- Espanol neutro de Latinoamerica, SIEMPRE acentuado (a, e, i, o, u con tilde, n con virgulilla, signos de apertura ¿ ¡). Nunca escribas sin acentos.
- En el body usa markdown: pon en **negritas** los datos criticos (fechas, numeros, decisiones).
- Toda opcion multiple tiene SIEMPRE 4 opciones, nunca 3.
- ANTI-SPOILER: el texto VISIBLE de cada opcion (titulo y cuerpo) DESCRIBE o ENCARNA la eleccion; NUNCA la evalua ni revela cual es correcta. Prohibido "cumple todo", "es el error", "no se debe", "la correcta", "la mejor opcion", "respuesta esperada/recomendada", o nombrar la falla en el titulo ("con presion", "con dato sensible", "promete monto", o adjetivos de tono con valencia como "cordial", "urgente", "insistente", "culposo"). REGLA CLAVE segun el tipo de comparacion: (a) si las opciones son VARIANTES DEL MISMO MENSAJE (elegir el mejor cierre o la version final), los titulos son ENUMERACION NEUTRAL ("Version 1/2/3/4", "Cierre 1/2/3/4"), porque cualquier etiqueta que describa el eje juzgado (tono, cumplimiento) telegrafia la respuesta; (b) si las opciones son SUJETOS distintos (segmentos, lotes, decisiones), el titulo puede nombrar el sujeto de forma factual ("Inactivos recientes", "Pausar y escalar"). El veredicto lo ponen los campos judge_internal, no el texto que ve el participante.
- ANTI-SPOILER (placeholders, memo, narrativa): (1) los placeholders de campos de texto son pistas de FORMATO ("Escribe aqui tu instruccion, en una o dos lineas"), NUNCA la respuesta ni la instruccion concreta ("no uses la direccion", "quita el monto"). (2) En el memo de decision final cada opcion muestra costo Y beneficio reales y balanceados; ninguna se describe como obviamente mejor (prohibido beneficio doble-positivo con costo trivial). (3) La narrativa y los prompts no revelan la respuesta ni delatan un distractor: prohibido "Si hiciste X bien, aqui no aparece Y", "uno que no se debe tocar", o nombrar la violacion en una opcion ("incluidos quienes pidieron baja").
- Nada de felicitaciones, gamificacion ni emojis dentro del caso. Tono corporativo claro y directo.
- Fechas absolutas (por ejemplo "viernes 5 de junio de 2026"), nunca "hace tres dias".
- Todos los datos son ficticios y sinteticos. Cero datos personales reales.`;

export const SCENARIO_RULES = `REGLAS DE COHERENCIA DEL CASO (una sola historia):
- Es UN solo trabajo de principio a fin, en UNA sola empresa.
- El destinatario del mensaje que construye el participante es SIEMPRE el mismo (un segmento de clientes o usuarios), NUNCA su jefe ni el mismo participante.
- El jefe asigna al inicio y recibe al final. Nunca es el destinatario del mensaje.
- Todo lo que el jefe pide al inicio se entrega dentro del caso, y todo lo que se entrega se anuncio.
- Nombres, numeros, empresas y fechas son consistentes entre todos los slides; ningun dato contradice a otro.
- La identidad de la herramienta de inteligencia artificial es fija y clara: que hace, que puede y que no puede.`;

export function systemPrompt(role) {
  return `Eres un autor experto de casos para un simulador corporativo de preparacion en inteligencia artificial, dirigido a equipos de empresas en Latinoamerica. Tu trabajo: ${role}.

${COPY_RULES}

${SCENARIO_RULES}

Mide criterio bajo presion (decisiones reales con tension), no conocimiento declarativo. Cada caso debe tener artefactos y datos concretos, y terminar en una accion observable.`;
}
