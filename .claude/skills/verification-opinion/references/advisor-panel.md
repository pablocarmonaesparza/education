# Referencia — panel de asesores

Usa esta referencia cuando el output de verification-opinion necesite más rigor que la forma corta.

## Paquete de evidencia de la secretaria

Compacto y respaldado por fuentes:

- **Claim:** una frase.
- **Decisión:** qué está decidiendo Pablo.
- **Fuentes:** links o rutas de archivos locales revisados.
- **Hechos:** evidencia directamente soportada.
- **Inferencias:** conclusiones razonables a partir de los hechos.
- **Supuestos:** claims que aún necesitan estrés.
- **Incógnitas:** información faltante que cambiaría la respuesta.
- **Sensibilidad temporal:** por qué la respuesta puede caducar.

Incluye links cuando uses web; rutas cuando uses docs locales.

## Prompts de asesores (para subagentes)

**Contrarian:**
```text
Usando solo el paquete de la secretaria, encuentra cómo esto falla. No seas justo. No lo arregles todavía. Nombra los principales modos de falla, las primeras señales de alarma, y la creencia falsa más dañina.
```

**First Principles:**
```text
Reduce el claim a primitivos. ¿Qué debe ser verdad? ¿Qué supuestos vienen heredados de la convención? ¿Cuál es el recurso escaso? ¿Qué tradeoff no se puede escapar?
```

**Expansionista:**
```text
¿Qué falta? Busca casos de uso adyacentes, assets subutilizados, oportunidades de segundo orden, stakeholders ignorados, palancas ocultas, y la versión más grande de la idea.
```

**Outsider:**
```text
Asume cero contexto de industria. ¿Qué es poco claro, sospechoso, aburrido, demasiado jerga, o difícil de confiar? ¿Qué preguntaría primero un comprador o usuario inteligente?
```

**Executor:**
```text
Convierte esto en próximos movimientos. ¿Qué se puede testear ya? ¿Qué hay que decidir? ¿Quién es el owner? ¿Cuál es la ruta más corta a evidencia? ¿Qué criterios de aceptación prueban progreso?
```

## Rúbrica de revisión ciega

Enmascara autoría con etiquetas anónimas antes del cross-review. Por cada memo, evalúa cualitativamente:

- Disciplina de evidencia: ¿usa el paquete con precisión?
- Novedad: ¿aporta algo que los otros no?
- Relevancia para la decisión: ¿cambiaría el veredicto del chairman?
- Claridad de riesgo: ¿identifica una falla o tradeoff real?
- Accionabilidad: ¿Pablo puede hacer algo con esto?
- Sobrealcance: ¿dónde afirma más de lo que sabe?

Conserva el mejor insight sobreviviente de cada memo. Descarta lo ingenioso que no cambia la decisión.

## Lógica de decisión del chairman

En este orden:
1. ¿Se puede actuar el claim con seguridad ahora?
2. Si no, ¿un test pequeño reduce la incertidumbre rápido?
3. ¿Cuál es el costo de equivocarse?
4. ¿Cuál es el costo de esperar?
5. ¿Qué evidencia revertiría la decisión?
6. ¿Cuáles son los próximos 1 a 5 movimientos?

**Veredictos:**
- `go`: evidencia suficiente y downside bajo para proceder.
- `modify`: la dirección es correcta, pero el plan necesita un cambio concreto.
- `test first`: prometedor pero la incertidumbre es muy alta para compromiso total.
- `pause`: sin claridad suficiente, y testear ahora sería desperdicio o distracción.
- `reject`: la evidencia o la lógica dicen que es mala jugada.

## Disciplina de respuesta final

No entierres el veredicto. Empieza con el bottom line, luego respáldalo. Si Pablo necesita handoff, deja los próximos movimientos listos para pegar.
