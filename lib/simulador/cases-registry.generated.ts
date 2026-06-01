// AUTO-GENERADO por scripts/simulador/generate-cases-registry.mjs
// Fuente: docs/simulador/contrato_v0/cases_assembled/*.yaml
// NO editar a mano. Correr: node scripts/simulador/generate-cases-registry.mjs

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export interface PlayableSlide {
  slideId: string;
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  caseContext?: Record<string, unknown>;
}
export interface PlayableSection {
  id: string;
  name: string;
  slides: PlayableSlide[];
}
export interface PlayableCase {
  caseId: string;
  version: number;
  meta: Record<string, unknown>;
  managerOutcome: Record<string, unknown>;
  sections: PlayableSection[];
  totalSlides: number;
}

export const PLAYABLE_CASES: Record<string, PlayableCase> = {
  "lumen_reactivacion_citas": {
    "caseId": "lumen_reactivacion_citas",
    "version": 1,
    "meta": {
      "level": "N1 · Fundamentos",
      "profile": "Cumplimiento",
      "profile_pack": "legal_compliance_privacy",
      "estimated_minutes": 12,
      "timer_seconds": 600,
      "timer_default_on": false,
      "tools": [
        "ai",
        "data",
        "messaging",
        "documents"
      ]
    },
    "managerOutcome": {
      "primary_question": "¿Puede esta persona limpiar una lista de pacientes con criterio de privacidad y armar una reactivación de citas responsable, sin exponer datos de salud?",
      "assignment_brief": "Asigna este caso cuando quieras saber si alguien de Cumplimiento puede dejar limpia una lista de pacientes (consentimiento, rebotes, duplicados, datos de salud), pedirle a la inteligencia artificial un mensaje útil sin filtrar información sensible, revisar lo que devuelve y decidir si lanzar, pilotar o pausar. El resultado te dice si puede operar campañas con criterio o necesita práctica antes de tocar datos reales de pacientes.",
      "business_metric": "reactivación de citas a 30 días",
      "risk_metric": "correos a pacientes que pidieron baja o uso de datos de salud sin transformar",
      "expected_signal": "distingue limpieza con criterio de atajo riesgoso",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Contexto",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Reactivar citas, con la lista como llegó.",
            "body": "Trabajas en **Lumen Salud**. Tu jefa te pidió **reactivar las citas** de pacientes inactivos antes del **viernes 5 de junio**. La lista llegó con duplicados, gente que pidió darse de baja, correos que ya rebotan y, en algunos registros, **datos de salud** mezclados. Tú decides qué se limpia, qué le pides a la inteligencia artificial y qué le entregas a tu jefa.",
            "caseContext": {
              "meta": {
                "profile": "Cumplimiento",
                "level": "N1 · Fundamentos",
                "estimatedMinutes": 12,
                "timerSeconds": 600,
                "timerDefaultOn": false,
                "tools": [
                  {
                    "kind": "ai",
                    "label": "Inteligencia artificial"
                  },
                  {
                    "kind": "data",
                    "label": "Tablas"
                  },
                  {
                    "kind": "messaging",
                    "label": "Mensajería"
                  },
                  {
                    "kind": "documents",
                    "label": "Documentos"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Renata te asigna la reactivación.",
            "body": "Léelo completo. Lo que pide aquí es lo que vas a entregar al final.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Renata Solís",
                  "role": "Directora de Operaciones Clínicas · Lumen Salud"
                },
                "to": {
                  "name": "Tú",
                  "role": "Coordinador de Cumplimiento"
                },
                "timestamp": "Hoy, 9:30",
                "subject": "Reactivamos citas esta semana",
                "body": "Hola. Esta semana **reactivamos las citas** de pacientes inactivos, y cierra el **viernes 5 de junio**. La lista que te paso viene con problemas, así que el primer trabajo es dejarla limpia y sin exponer datos de salud. Cuando la tengas, mándame una propuesta con tres cosas: los **segmentos** a los que les vas a escribir, el **mensaje base** que les llega, y las **métricas que vas a monitorear** para saber si funcionó."
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "La lista de pacientes, como llegó.",
            "body": "Ocho registros. Mira el **consentimiento**, la **entregabilidad** y si hay **condición de salud** anotada (ese dato no puede salir de aquí).",
            "caseContext": {
              "table": {
                "caption": "Lista de reactivación · 1 de junio de 2026",
                "columns": [
                  {
                    "key": "nombre",
                    "label": "Nombre"
                  },
                  {
                    "key": "ultima_cita",
                    "label": "Última cita"
                  },
                  {
                    "key": "consentimiento",
                    "label": "Consentimiento"
                  },
                  {
                    "key": "entregabilidad",
                    "label": "Entregabilidad"
                  },
                  {
                    "key": "condicion",
                    "label": "Condición anotada"
                  }
                ],
                "rows": [
                  {
                    "nombre": "Paula Restrepo",
                    "ultima_cita": "2026-03-10",
                    "consentimiento": "activo",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Tomás Iglesias",
                    "ultima_cita": "2025-12-02",
                    "consentimiento": "activo",
                    "entregabilidad": "ok",
                    "condicion": "diabetes"
                  },
                  {
                    "nombre": "Lucía Fonseca",
                    "ultima_cita": "2026-04-01",
                    "consentimiento": "revocado",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Bruno Salas",
                    "ultima_cita": "2026-02-18",
                    "consentimiento": "activo",
                    "entregabilidad": "rebota",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Mariela Cano",
                    "ultima_cita": "2026-01-20",
                    "consentimiento": "baja_solicitada",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Iván Duarte",
                    "ultima_cita": "2026-03-22",
                    "consentimiento": "activo",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Paula Restrepo",
                    "ultima_cita": "2026-03-10",
                    "consentimiento": "activo",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  },
                  {
                    "nombre": "Marcos Villa",
                    "ultima_cita": "2025-08-05",
                    "consentimiento": "nunca_confirmado",
                    "entregabilidad": "ok",
                    "condicion": "ninguna"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Cómo venía la reactivación en abril.",
            "body": "Estos son los números base. El de en medio es **el que hay que superar**.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Reactivación de citas a 30 días",
                  "value": "4.2%",
                  "delta": {
                    "direction": "flat",
                    "label": "el número a superar"
                  }
                },
                {
                  "label": "Quejas y bajas",
                  "value": "1.5%",
                  "delta": {
                    "direction": "flat",
                    "label": "el número a cuidar"
                  }
                },
                {
                  "label": "Rebote de correos",
                  "value": "2%",
                  "delta": {
                    "direction": "flat",
                    "label": "higiene de la lista"
                  }
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Óscar, de Privacidad, levanta una queja.",
            "body": "Léelo. Esto fija una regla que no se negocia.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Óscar Lévano",
                  "role": "Asesor de Privacidad · Lumen Salud"
                },
                "to": {
                  "name": "Tú",
                  "role": "Coordinador de Cumplimiento"
                },
                "timestamp": "Hoy, 9:50",
                "subject": "Cuidado con la lista de pacientes",
                "body": "Vi que vas a reactivar citas. Dos cosas que reviso siempre: quien **revocó** o pidió **baja** se excluye, sin excepción. Y la **condición de salud** de un paciente jamás sale en un correo ni se le pasa a la inteligencia artificial. Si algo de eso se va, es un problema serio."
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Datos",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Decide qué haces con cada paciente.",
            "body": "Por cada uno: **usar**, **excluir** o **escalar** si tienes duda. Recuerda la regla de Óscar.",
            "caseContext": {
              "actions": [
                {
                  "value": "usar",
                  "label": "Usar"
                },
                {
                  "value": "excluir",
                  "label": "Excluir"
                },
                {
                  "value": "escalar",
                  "label": "Escalar"
                }
              ],
              "rows": [
                {
                  "id": "p1",
                  "label": "Paula Restrepo · activo · entrega ok"
                },
                {
                  "id": "p3",
                  "label": "Lucía Fonseca · consentimiento revocado"
                },
                {
                  "id": "p4",
                  "label": "Bruno Salas · el correo rebota"
                },
                {
                  "id": "p5",
                  "label": "Mariela Cano · pidió baja"
                },
                {
                  "id": "p7",
                  "label": "Paula Restrepo · segundo registro igual"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "¿Qué campos puede ver la inteligencia artificial?",
            "body": "Para cada campo decide: **va al modelo**, **va transformado** o **no va**. La condición de salud no se negocia.",
            "caseContext": {
              "actions": [
                {
                  "value": "va",
                  "label": "Va al modelo"
                },
                {
                  "value": "transformado",
                  "label": "Va transformado"
                },
                {
                  "value": "no_va",
                  "label": "No va"
                }
              ],
              "rows": [
                {
                  "id": "c_nombre",
                  "label": "Nombre del paciente"
                },
                {
                  "id": "c_correo",
                  "label": "Correo electrónico"
                },
                {
                  "id": "c_condicion",
                  "label": "Condición de salud anotada"
                },
                {
                  "id": "c_ultima_cita",
                  "label": "Fecha de última cita"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Ajusta el modelo para datos de pacientes.",
            "body": "Mueve **autonomía**, **seguridad** y **costo** pensando en que son datos sensibles. No hay respuesta única, hay criterio.",
            "caseContext": {
              "modelTradeoff": {
                "prompt": "Para una lista de pacientes con datos de salud, ¿cuánta autonomía le das a la inteligencia artificial, cuánta seguridad exiges y cuánto costo aceptas?",
                "sliderLabels": {
                  "autonomy": "Autonomía",
                  "security": "Seguridad",
                  "cost": "Costo"
                }
              }
            }
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Escribe el límite de uso de datos.",
            "body": "En una o dos líneas, dile al **Asistente Lumen** qué **no** puede usar de esta lista. Esto va a guiar lo que le pidas después.",
            "caseContext": {
              "placeholder": "Por ejemplo: no uses la condición de salud ni el correo; trata el nombre de forma genérica."
            }
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "La política de datos de pacientes.",
            "body": "Tres reglas. Las vas a citar más adelante.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Política de datos de pacientes · Lumen Salud",
                  "kind": "pdf",
                  "description": "1) Quien revocó o pidió baja se excluye siempre. 2) Dos rebotes y se excluye. 3) La condición de salud nunca va al modelo ni al mensaje."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "IA",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Qué es y qué no es el Asistente Lumen.",
            "body": "El **Asistente Lumen** es la inteligencia artificial aprobada de la empresa. **Redacta** y **ajusta el tono** con lo que le pegas. **No** consulta la lista de pacientes y **no** envía nada. Puede **inventar cifras** o **reintroducir datos** que quitaste, así que todo lo que devuelve hay que validarlo."
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Arma el pedido al Asistente Lumen.",
            "body": "Define **objetivo**, **audiencia** y **límites** del mensaje que quieres. Sé claro con lo que no puede usar.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Invitar a reactivar una cita médica, con tono cálido y respetuoso.",
                  "Recordar que la consulta sigue disponible, sin presionar."
                ],
                "audiencias": [
                  "Pacientes inactivos con consentimiento activo.",
                  "Pacientes con cita vencida hace pocos meses."
                ],
                "limites": [
                  "No menciones ninguna condición de salud.",
                  "No incluyas el correo ni el nombre completo del paciente."
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Primer borrador del Asistente Lumen.",
            "body": "Léelo con cuidado y marca lo que esté mal. Fíjate en **datos sensibles**, **cifras inventadas** y **tono**.",
            "caseContext": {
              "segments": [
                {
                  "id": "r1",
                  "text": "Hola Tomás, vimos que tu control de diabetes quedó pendiente desde diciembre.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "r2",
                  "text": "El 90% de nuestros pacientes ya volvió a agendar este mes.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r3",
                  "text": "Agenda ya o perderás tu lugar para siempre.",
                  "flagIfMarked": "tono_agresivo"
                },
                {
                  "id": "r4",
                  "text": "Estamos para acompañarte cuando lo necesites.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Dile qué corregir.",
            "body": "Escríbele al **Asistente Lumen** qué cambiar del borrador anterior. Apunta a lo que marcaste.",
            "caseContext": {
              "placeholder": "Por ejemplo: quita cualquier dato de salud, no inventes cifras y baja el tono de urgencia."
            }
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Borrador revisado.",
            "body": "Revisa de nuevo. Aquí lo importante es que el cambio **refleje tu instrucción** y que ya no haya datos sensibles.",
            "caseContext": {
              "segments": [
                {
                  "id": "r5",
                  "text": "Hola, queríamos recordarte que tu consulta sigue disponible cuando quieras retomarla.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "r6",
                  "text": "Tu última cita fue hace unos meses; agendar de nuevo toma un minuto.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r7",
                  "text": "Sabemos que el 100% de los pacientes prefiere este horario.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Revisión",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Caza las cifras que no puedes probar.",
            "body": "Última pasada de revisión. Marca cualquier **número** que no salga de los datos del caso.",
            "caseContext": {
              "segments": [
                {
                  "id": "v1",
                  "text": "Nueve de cada diez pacientes vuelven en menos de una semana.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "v2",
                  "text": "Tu cita anterior fue en una fecha que tenemos registrada.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v3",
                  "text": "Somos la clínica número uno del país.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Elige el cierre del mensaje.",
            "body": "Cuatro versiones del cierre. Elige la que invita sin presionar y justifica en una línea.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Cálido",
                  "body": "Cuando quieras retomar tu consulta, aquí estamos para ayudarte a agendar."
                },
                {
                  "id": "B",
                  "title": "Urgente",
                  "body": "Agenda hoy mismo, los lugares se acaban rápido."
                },
                {
                  "id": "C",
                  "title": "Seco",
                  "body": "Ingrese al portal para reservar una cita."
                },
                {
                  "id": "D",
                  "title": "Culposo",
                  "body": "No dejes tu salud para después, ya pasó demasiado tiempo."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Renata responde con una condición.",
            "body": "Te escribe por chat antes de cerrar.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Renata Solís",
                  "role": "Directora de Operaciones Clínicas"
                },
                "to": {
                  "name": "Tú",
                  "role": "Coordinador de Cumplimiento"
                },
                "timestamp": "Hoy, 11:20",
                "subject": "Antes de lanzar",
                "body": "Bien. Antes de lanzar confírmame que excluiste a quien pidió baja, como marcó **Óscar** en su regla, y que el correo lleva un **enlace para darse de baja** visible."
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Checklist del mensaje final.",
            "body": "Por cada parte del correo: **dejar**, **corregir** o **quitar**.",
            "caseContext": {
              "actions": [
                {
                  "value": "dejar",
                  "label": "Dejar"
                },
                {
                  "value": "corregir",
                  "label": "Corregir"
                },
                {
                  "value": "quitar",
                  "label": "Quitar"
                }
              ],
              "rows": [
                {
                  "id": "k_asunto",
                  "label": "Asunto: retomar tu consulta"
                },
                {
                  "id": "k_saludo",
                  "label": "Saludo genérico, sin nombre completo"
                },
                {
                  "id": "k_condicion",
                  "label": "Mención de la condición de salud"
                },
                {
                  "id": "k_baja",
                  "label": "Enlace para darse de baja"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Elige la versión final.",
            "body": "Con el feedback de Renata, elige el mensaje que entregarías. Justifica en una línea.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Cumple todo",
                  "body": "Hola, tu consulta sigue disponible cuando quieras retomarla. Agendar toma un minuto. Si prefieres no recibir estos correos, puedes darte de baja aquí."
                },
                {
                  "id": "B",
                  "title": "Sin enlace de baja",
                  "body": "Hola, tu consulta sigue disponible. Agenda cuando quieras."
                },
                {
                  "id": "C",
                  "title": "Con dato de salud",
                  "body": "Hola, retomemos el seguimiento de tu condición; agenda tu cita."
                },
                {
                  "id": "D",
                  "title": "Con presión",
                  "body": "Hola, agenda ya antes de perder tu lugar; es importante."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Cierre",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Elige el segmento al que le escribes.",
            "body": "Tres segmentos posibles (y uno que no es de envío). Elige y di en una línea por qué.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Inactivos recientes",
                  "body": "Pacientes con consentimiento activo y entrega correcta. Caveat: cuida la frecuencia de correos."
                },
                {
                  "id": "B",
                  "title": "Cita vencida hace meses",
                  "body": "Reactivables claros. Caveat: que abran no significa que agenden."
                },
                {
                  "id": "C",
                  "title": "Sin confirmar",
                  "body": "Nunca confirmaron consentimiento. No es segmento de envío: elegirlo es el error."
                },
                {
                  "id": "D",
                  "title": "Todos juntos",
                  "body": "Mezclar incluye a quienes pidieron baja. No se debe."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Escribe el mensaje base.",
            "body": "Escribe el **mensaje base completo** para el segmento que elegiste. Sin datos de salud, sin cifras inventadas, con enlace de baja.",
            "caseContext": {
              "placeholder": "Escribe aquí el mensaje que recibiría el paciente."
            }
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Define qué métricas vas a monitorear.",
            "body": "Por cada métrica: **monitorear** o **ignorar**. Estas cierran la promesa a Renata.",
            "caseContext": {
              "actions": [
                {
                  "value": "monitorear",
                  "label": "Monitorear"
                },
                {
                  "value": "ignorar",
                  "label": "Ignorar"
                }
              ],
              "rows": [
                {
                  "id": "m_react",
                  "label": "Reactivación de citas a 30 días (superar 4.2%)"
                },
                {
                  "id": "m_baja",
                  "label": "Quejas y bajas (alarma sobre 1.5%)"
                },
                {
                  "id": "m_rebote",
                  "label": "Rebote de correos (higiene sobre 2%)"
                },
                {
                  "id": "m_clicks",
                  "label": "Color del botón del correo"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Vista previa del correo final.",
            "body": "Así quedaría el correo al segmento que elegiste, con el **enlace de baja** visible. Si excluiste bien, aquí no aparece nadie que pidió baja."
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Tu decisión, y por qué.",
            "body": "Es lo último: la decisión que vas a defender ante Renata, con su costo y su beneficio.",
            "caseContext": {
              "decisions": [
                {
                  "id": "lanzar_lunes",
                  "title": "Lanzar ya",
                  "detail": "Enviar a todo el segmento hoy. Beneficio: rapidez. Costo: si la limpieza falló, expones datos o escribes a quien pidió baja."
                },
                {
                  "id": "piloto_controlado",
                  "title": "Pilotar primero",
                  "detail": "Enviar a una parte y medir 24 horas. Beneficio: cazas problemas a tiempo. Costo: un día más."
                },
                {
                  "id": "pausar_y_limpiar",
                  "title": "Pausar y limpiar",
                  "detail": "Detener hasta cerrar la lista. Beneficio: cero riesgo. Costo: pierdes la ventana de la semana."
                },
                {
                  "id": "pausar_y_escalar",
                  "title": "Pausar y escalar a Óscar",
                  "detail": "Subir las dudas a Privacidad antes de enviar. Beneficio: respaldo formal. Costo: depende de su tiempo."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "marketing_dirty_data_relaunch": {
    "caseId": "marketing_dirty_data_relaunch",
    "version": 2,
    "meta": {
      "level": "N1 · Fundamentos",
      "profile": "Marketing",
      "profile_pack": "marketing_growth",
      "estimated_minutes": 12,
      "timer_seconds": 600,
      "timer_default_on": false,
      "tools": [
        "ai",
        "data",
        "messaging",
        "documents"
      ]
    },
    "managerOutcome": {
      "primary_question": "¿Puede esta persona limpiar una base de clientes con criterio de privacidad y armar un envío de retención responsable?",
      "assignment_brief": "Asigna este caso cuando quieras saber si alguien de Marketing puede dejar limpia una base de clientes (consentimiento, rebotes, duplicados), pedirle a la inteligencia artificial un mensaje útil sin filtrar datos personales, revisar lo que devuelve y decidir si lanzar, pilotar o pausar. El resultado te dice si puede operar campañas con criterio o necesita práctica antes de tocar datos reales.",
      "business_metric": "recompra a 30 días de la campaña de retención",
      "risk_metric": "correos a clientes que pidieron baja o uso de datos personales sin transformar",
      "expected_signal": "distingue limpieza con criterio de atajo riesgoso",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Contexto",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Relanzar la retención, con la base como llegó.",
            "body": "Trabajas en **Aurora Retail**. Tu jefa te pidió **relanzar la campaña de retención** a los clientes de siempre antes del **viernes**. La base llegó con duplicados, gente que pidió darse de baja y correos que ya rebotan. Tú decides qué se limpia, qué le pides a la inteligencia artificial y qué le entregas a tu jefa.",
            "caseContext": {
              "meta": {
                "profile": "Marketing",
                "level": "N1 · Fundamentos",
                "estimatedMinutes": 12,
                "timerSeconds": 600,
                "timerDefaultOn": false,
                "tools": [
                  {
                    "kind": "ai",
                    "label": "Inteligencia artificial"
                  },
                  {
                    "kind": "data",
                    "label": "Tablas"
                  },
                  {
                    "kind": "messaging",
                    "label": "Mensajería"
                  },
                  {
                    "kind": "documents",
                    "label": "Documentos"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Mariana te asigna el relanzamiento.",
            "body": "Léelo completo. Lo que pide aquí es lo que vas a entregar al final.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Mariana Robles",
                  "role": "Líder de Crecimiento · Aurora Retail"
                },
                "to": {
                  "name": "Tú",
                  "role": "Analista de Crecimiento"
                },
                "timestamp": "Hoy, 9:40",
                "subject": "Relanzamos la campaña de retención esta semana",
                "body": "Hola. Esta semana **relanzamos la campaña de retención** a nuestros clientes de siempre, y cierra el **viernes**. La base que te paso viene con problemas, así que el primer trabajo es dejarla limpia. Cuando la tengas, mándame una propuesta con tres cosas: los **segmentos** a los que les vas a escribir, el **mensaje base** que les llega, y las **métricas que vas a monitorear** para saber si funcionó. Cualquier duda me dices."
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Así llegó la base de clientes.",
            "body": "Una muestra de la base, con los problemas típicos. En la sección siguiente decides qué hacer con cada cliente.",
            "caseContext": {
              "table": {
                "caption": "Muestra de la base de clientes (de 480)",
                "columns": [
                  {
                    "key": "nombre",
                    "label": "Cliente"
                  },
                  {
                    "key": "ultima_compra",
                    "label": "Última compra"
                  },
                  {
                    "key": "consentimiento",
                    "label": "Consentimiento"
                  },
                  {
                    "key": "entrega",
                    "label": "Entrega"
                  },
                  {
                    "key": "valor",
                    "label": "Compras 12 meses"
                  }
                ],
                "rows": [
                  {
                    "nombre": "Paola Restrepo",
                    "ultima_compra": "22 abr 2026",
                    "consentimiento": "Activo",
                    "entrega": "Ok",
                    "valor": "$8,400"
                  },
                  {
                    "nombre": "Renata Gómez",
                    "ultima_compra": "10 may 2026",
                    "consentimiento": "Revocado",
                    "entrega": "Ok",
                    "valor": "$12,900"
                  },
                  {
                    "nombre": "Bruno Salas",
                    "ultima_compra": "15 mar 2026",
                    "consentimiento": "Activo",
                    "entrega": "Rebota",
                    "valor": "$3,200"
                  },
                  {
                    "nombre": "Lía Fonseca",
                    "ultima_compra": "01 feb 2026",
                    "consentimiento": "Pidió baja",
                    "entrega": "Ok",
                    "valor": "$5,100"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Cómo le fue a la campaña de abril.",
            "body": "Los números del último envío de retención, el del **18 de abril**. Son tu referencia para lo que vas a proponer.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Tasa de apertura",
                  "value": "22%",
                  "delta": {
                    "direction": "flat",
                    "label": "estable desde el último envío"
                  }
                },
                {
                  "label": "Recompra a 30 días",
                  "value": "3.4%",
                  "delta": {
                    "direction": "flat",
                    "label": "el número a superar"
                  }
                },
                {
                  "label": "Quejas y bajas",
                  "value": "1.8%",
                  "delta": {
                    "direction": "flat",
                    "label": "el número a cuidar"
                  }
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Daniela, de Legal, ya levantó una alerta.",
            "body": "Antes de tocar nada, lee lo que pasó con el envío anterior.",
            "caseContext": {
              "message": {
                "channel": "ticket",
                "from": {
                  "name": "Daniela Ruiz",
                  "role": "Coordinadora Legal · Aurora Retail"
                },
                "to": {
                  "name": "Marketing"
                },
                "timestamp": "Hace 6 días",
                "subject": "Quejas por correos a clientes que pidieron baja",
                "body": "En el envío de abril llegaron quejas de **clientes que ya habían pedido darse de baja** y aun así recibieron el correo. Antes del próximo envío necesito que confirmes dos cosas: que **excluiste a todos los que pidieron baja** y que el correo lleva **un enlace visible para darse de baja**. Si algo no queda claro, escríbeme."
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Datos",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Decide qué haces con cada cliente.",
            "body": "Por cada cliente elige una acción. Algunas son claras por la política de datos; otras piden tu criterio. Regla dura: **quien pidió baja o revocó el consentimiento se excluye siempre**.",
            "caseContext": {
              "actionStyle": "permission",
              "actions": [
                {
                  "value": "usar",
                  "label": "Usar"
                },
                {
                  "value": "anonimizar",
                  "label": "Anonimizar"
                },
                {
                  "value": "excluir",
                  "label": "Excluir"
                },
                {
                  "value": "escalar",
                  "label": "Escalar"
                }
              ],
              "rows": [
                {
                  "id": "c1",
                  "label": "Paola Restrepo · compró hace 5 semanas · abre seguido"
                },
                {
                  "id": "c2",
                  "label": "Tomás Iglesias · no compra hace 6 meses · sigue abriendo"
                },
                {
                  "id": "c3",
                  "label": "Renata Gómez · consentimiento revocado"
                },
                {
                  "id": "c4",
                  "label": "Bruno Salas · su correo rebota"
                },
                {
                  "id": "c5",
                  "label": "Lía Fonseca · pidió darse de baja"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Decide qué columnas le pasas a la inteligencia artificial.",
            "body": "El mensaje lo va a redactar **Aurora Copiloto**, el asistente de la empresa. Por cada columna decide si se la pasas tal cual, transformada, o no se la pasas. Lo que escribas en el asistente sale de la base protegida.",
            "caseContext": {
              "actionStyle": "neutral",
              "actions": [
                {
                  "value": "va",
                  "label": "Va al modelo"
                },
                {
                  "value": "transformada",
                  "label": "Va transformada"
                },
                {
                  "value": "no_va",
                  "label": "No va"
                }
              ],
              "rows": [
                {
                  "id": "f1",
                  "label": "Nombre del cliente"
                },
                {
                  "id": "f2",
                  "label": "Correo"
                },
                {
                  "id": "f3",
                  "label": "Última compra (fecha)"
                },
                {
                  "id": "f5",
                  "label": "Consentimiento"
                },
                {
                  "id": "f6",
                  "label": "Compras de los últimos 12 meses"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Pondera qué pesa más al usar IA con datos de clientes.",
            "body": "Para datos de clientes, ¿cuánto pesa la autonomía del modelo, la seguridad y el costo? Mueve los tres controles según tu criterio.",
            "caseContext": {
              "modelTradeoff": {
                "prompt": "Para datos de clientes, ¿qué pesa más?",
                "sliderLabels": {
                  "autonomy": "Autonomía del modelo",
                  "security": "Seguridad de los datos",
                  "cost": "Costo"
                }
              }
            }
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Escríbele a Aurora Copiloto qué datos NO puede usar.",
            "body": "Antes de pedirle el mensaje, déjale claro el límite. En una o dos frases, dile qué columnas no debe usar y cómo tratar lo personal. Esto es lo que revisarás después, cuando veas si lo respetó.",
            "caseContext": {
              "placeholder": "Dile al asistente qué datos no debe usar y cómo tratar lo personal..."
            }
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "La política de datos de Aurora, en tres reglas.",
            "body": "Es corta. Estas tres reglas aplican a este envío. Vas a tener que sostenerlas si Legal pregunta.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Politica_de_datos_Aurora_Retail.pdf",
                  "size": "2 páginas",
                  "kind": "pdf",
                  "description": "Regla 1: si un correo rebota dos veces, se excluye. Regla 2: quien revocó el consentimiento o pidió baja se excluye siempre. Regla 3: a quien nunca confirmó su correo, máximo se le manda un correo para pedir permiso otra vez."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "IA",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Qué es Aurora Copiloto y qué no.",
            "body": "**Aurora Copiloto** es el asistente de lenguaje aprobado de la empresa. Corre en la infraestructura de Aurora.\n\n**Lo que puede:** redactar, resumir y ajustar el tono de lo que le pegas.\n\n**Lo que no puede:** entrar a la base de clientes por su cuenta ni mandar correos. Solo ve lo que tú escribes en el prompt.\n\nUna cosa importante: a veces **inventa cifras** o mete datos que parecen del cliente aunque tú no se los diste. Por eso todo lo que devuelve hay que revisarlo."
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Arma el encargo para Aurora Copiloto.",
            "body": "Vas a generar el **mensaje base** de la campaña. Define el objetivo, a quién le hablas y los límites. Sin esas tres decisiones, el asistente improvisa.",
            "caseContext": {
              "guided": {
                "entrega": "Redacta el mensaje base de la campaña de retención, sin cifras inventadas y sin datos personales del cliente.",
                "objetivos": [
                  "Recuperar a clientes que dejaron de comprar",
                  "Reforzar a los clientes que siguen comprando",
                  "Reactivar a quienes abren pero no compran",
                  "Avisar de un beneficio para clientes actuales"
                ],
                "audiencias": [
                  "Clientes activos de alto valor",
                  "Clientes que no compran hace meses",
                  "Clientes que abren pero no compran",
                  "Toda la base junta"
                ],
                "limites": [
                  "No usar nombres ni correos en el texto",
                  "No inventar cifras ni resultados",
                  "Dejarlo como borrador para revisar",
                  "Incluir el enlace para darse de baja"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Aurora Copiloto devolvió este borrador.",
            "body": "Es el primer intento. **Marca lo que no dejarías pasar** antes de pedir una corrección. Fíjate en cifras que no puedes sostener, en datos personales que no debían aparecer y en el tono.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Hola, te extrañamos en Aurora Retail. Sabemos que tu última compra fue hace exactamente 47 días.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s2",
                  "text": "Los clientes que vuelven gastan un 35% más en promedio.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "s3",
                  "text": "Preparamos una selección pensada para ti y un beneficio si vuelves esta semana.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s4",
                  "text": "Si ya no quieres recibir estos correos, puedes darte de baja aquí.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Pídele la corrección.",
            "body": "Escribe el siguiente encargo para Aurora Copiloto. Sé concreto: qué quita, qué cambia, qué deja. Aquí es donde el borrador se vuelve enviable.",
            "caseContext": {
              "placeholder": "Dile qué corregir del borrador anterior..."
            }
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Esta es la versión corregida.",
            "body": "Aurora Copiloto aplicó tu encargo. **Revisa que de verdad arregló lo que pediste** y marca lo que aún no te convence. Ojo: al corregir, a veces vuelve a meter algo nuevo.",
            "caseContext": {
              "segments": [
                {
                  "id": "v1",
                  "text": "Hola, en Aurora Retail preparamos algo para clientes como tú.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v2",
                  "text": "Muchos clientes vuelven por nuestras temporadas nuevas.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v3",
                  "text": "Tenemos una selección para ti y un beneficio si vuelves esta semana.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v4",
                  "text": "Además, ahora el 92% de los pedidos llega en menos de 48 horas.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Revisión",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Caza las cifras que no puedes sostener.",
            "body": "El mensaje ya está más limpio, pero quedan **números**. Marca cada cifra que no podrías defender si Mariana o Legal te la cuestionan.",
            "caseContext": {
              "segments": [
                {
                  "id": "r1",
                  "text": "Más del 80% de nuestros clientes vuelve a comprar en tres meses.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r2",
                  "text": "Tu categoría favorita tiene 200 productos nuevos esta temporada.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r3",
                  "text": "Tenemos una selección para ti y un beneficio si vuelves esta semana.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "r4",
                  "text": "Si ya no quieres recibir estos correos, puedes darte de baja aquí.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Elige cómo cierra el mensaje.",
            "body": "Cuatro formas de cerrar, de la más directa a la más suave. Elige la que le hablaría mejor a un cliente que ya te conoce.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Directo",
                  "body": "Vuelve esta semana y aprovecha el beneficio. Compra aquí."
                },
                {
                  "id": "B",
                  "title": "Cercano",
                  "body": "Si quieres pasar a ver lo nuevo, aquí está tu beneficio. Cuando gustes."
                },
                {
                  "id": "C",
                  "title": "Suave",
                  "body": "Te dejamos la selección por aquí. Si te late, el beneficio te espera."
                },
                {
                  "id": "D",
                  "title": "Sobrio",
                  "body": "Gracias por seguir con nosotros. Aquí tienes una selección y un beneficio si decides volver."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Mariana revisó tu borrador.",
            "body": "Te responde por chat.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Mariana Robles",
                  "role": "Líder de Crecimiento"
                },
                "to": {
                  "name": "Tú"
                },
                "timestamp": "Hace 10 minutos",
                "body": "Va quedando bien. Dos cosas antes de que sigas: confirma que **sacaste a la gente que pidió baja** (es lo que pidió Daniela, la regla 2 de la política) y revisa que el correo deje **el enlace para darse de baja** bien visible. Si esas dos están, por mí avanza."
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Última revisión del mensaje, línea por línea.",
            "body": "Por cada parte del correo, decide si la dejas, la corriges o la quitas antes de mandar.",
            "caseContext": {
              "actionStyle": "neutral",
              "actions": [
                {
                  "value": "dejar",
                  "label": "Dejar"
                },
                {
                  "value": "corregir",
                  "label": "Corregir"
                },
                {
                  "value": "quitar",
                  "label": "Quitar"
                }
              ],
              "rows": [
                {
                  "id": "m1",
                  "label": "Asunto: Algo nuevo para ti en Aurora Retail"
                },
                {
                  "id": "m2",
                  "label": "Más del 80% de los clientes vuelve en tres meses"
                },
                {
                  "id": "m3",
                  "label": "Tenemos una selección para ti y un beneficio esta semana"
                },
                {
                  "id": "m4",
                  "label": "Saludo con el nombre completo del cliente"
                },
                {
                  "id": "m5",
                  "label": "Enlace para darse de baja"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Elige la versión final.",
            "body": "Tres versiones del mensaje completo, ya con tus correcciones. Elige la que mandarías el lunes.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Versión A",
                  "body": "Hola, en Aurora Retail preparamos una selección para ti y un beneficio si vuelves esta semana. Si ya no quieres estos correos, puedes darte de baja aquí."
                },
                {
                  "id": "B",
                  "title": "Versión B",
                  "body": "Gracias por seguir con nosotros en Aurora Retail. Tenemos algo nuevo y un beneficio si decides pasar. Puedes darte de baja en este enlace cuando quieras."
                },
                {
                  "id": "C",
                  "title": "Versión C",
                  "body": "En Aurora Retail pensamos en ti: una selección y un beneficio esta semana. Si prefieres no recibir más correos, te das de baja aquí."
                },
                {
                  "id": "D",
                  "title": "Versión D",
                  "body": "Tu beneficio de cliente te espera esta semana en Aurora Retail. Pásate a ver la selección que armamos. Si ya no quieres estos correos, te das de baja en este enlace."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Cierre",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Elige a qué segmento le mandas primero.",
            "body": "Cuatro formas de armar el segmento con los clientes que decidiste usar. Cada una tiene un pero. Elige cuál llevas a Mariana. Es el primer entregable: los **segmentos**.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Clientes activos de alto valor",
                  "body": "Los que compran seguido y gastan más. El pero: ya están comprando, el riesgo es cansarlos con otro correo."
                },
                {
                  "id": "B",
                  "title": "Clientes por reactivar",
                  "body": "Los que abren los correos pero no compran hace meses. El reto es darles una razón concreta para volver, no solo decir que los extrañas."
                },
                {
                  "id": "C",
                  "title": "Toda la base limpia, sin segmentar",
                  "body": "Mandarle a todos los clientes usables. Es lo más rápido, pero el mismo mensaje no le habla igual a cada grupo."
                },
                {
                  "id": "D",
                  "title": "Solo quienes compraron el último mes",
                  "body": "Los más recientes. Llegas seguro, pero te dejas fuera justo a los que querías reactivar."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Escribe el mensaje base que entregas.",
            "body": "Es el segundo entregable: el **mensaje base** que pide Mariana, el texto completo que recibiría el segmento que elegiste. Escríbelo como lo mandarías, con el beneficio y el enlace de baja.",
            "caseContext": {
              "placeholder": "Escribe el mensaje completo para el segmento elegido..."
            }
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Define qué métricas vas a monitorear.",
            "body": "El tercer entregable. De esta lista, marca cuáles vas a vigilar después del envío y cuáles no te dicen nada para este caso.",
            "caseContext": {
              "actionStyle": "neutral",
              "actions": [
                {
                  "value": "monitorear",
                  "label": "Monitorear"
                },
                {
                  "value": "ignorar",
                  "label": "Ignorar"
                }
              ],
              "rows": [
                {
                  "id": "met1",
                  "label": "Recompra a 30 días"
                },
                {
                  "id": "met2",
                  "label": "Quejas y bajas"
                },
                {
                  "id": "met3",
                  "label": "Tasa de rebote"
                },
                {
                  "id": "met4",
                  "label": "Seguidores en redes sociales"
                },
                {
                  "id": "met5",
                  "label": "Clics totales del sitio"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Así llega el correo al cliente.",
            "body": "Vista previa del correo final, como lo recibiría el segmento que elegiste. El sistema ya dejó fuera a los clientes que pidieron baja, como pidió Legal.\n\n---\n\n**Asunto:** Algo nuevo para ti en Aurora Retail\n\nHola, en Aurora Retail preparamos una selección para ti y un beneficio si vuelves esta semana.\n\n**[ Ver la selección ]**\n\n*Si ya no quieres recibir estos correos, puedes darte de baja aquí.*"
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Cierra con tu recomendación para Mariana.",
            "body": "Elige qué haces con el envío y escríbele el memo a Mariana. Es lo último: la decisión que vas a defender.",
            "caseContext": {
              "decisions": [
                {
                  "id": "lanzar_lunes",
                  "title": "Lanzar el lunes",
                  "detail": "Si la base quedó limpia, las cifras inventadas se fueron y el correo lleva el enlace de baja, mándalo según el plan."
                },
                {
                  "id": "piloto_controlado",
                  "title": "Piloto con un segmento",
                  "detail": "Si quieres bajar el riesgo, manda solo al segmento más seguro esta semana y mide antes de ampliar."
                },
                {
                  "id": "pausar_y_limpiar",
                  "title": "Pausar para terminar de limpiar",
                  "detail": "Si a la base le falta poco, pausa, termina de limpiarla y manda más tarde esta semana."
                },
                {
                  "id": "pausar_y_escalar",
                  "title": "Pausar y escalar a Legal",
                  "detail": "Si todavía hay clientes que pidieron baja, o el mensaje afirma algo que no puedes sostener, no mandes y avisa a Mariana y Legal."
                }
              ],
              "memoPlaceholder": "Escribe a Mariana: qué decidiste, por qué, y qué cuidaste de la base y de los datos...",
              "memoAudience": "Mariana Robles · Líder de Crecimiento"
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  }
};
