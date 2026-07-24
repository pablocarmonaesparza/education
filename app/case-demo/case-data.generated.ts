// AUTO-GENERADO por scripts/simulador/generate-case-demo.mjs
// Fuente: docs/simulador/contrato_v0/cases_assembled/marketing_dirty_data_relaunch_v1.yaml
// NO editar a mano. Editar el YAML y correr: node scripts/simulador/generate-case-demo.mjs
//
// El demo /case-demo proviene de este archivo, que proviene del YAML ensamblado.

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export interface Slide {
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  /** Contenido del caso (caseContext del bloque). Puede incluir campos
   *  judge_internal (hint, example, issue, goodWhen) co-localizados; el shell
   *  los remueve con stripJudgeFields antes de pasarlos al renderer. */
  caseContext?: Record<string, unknown>;
}

export const CASE_ID = "marketing_dirty_data_relaunch";
export const CASE_VERSION = 2;

export const SLIDES: Slide[][] = [
  [
    {
      "blockId": "case_cover",
      "title": "Relaunch retention with the list as it came in",
      "body": "You work at **Aurora Retail**. Your manager asked you to **relaunch the retention campaign** to your regular customers before **Friday**. The list arrived with duplicates, people who unsubscribed, and emails that already bounce. You decide what gets cleaned, what you ask AI for, and what you hand your manager.",
      "caseContext": {
        "meta": {
          "profile": "Marketing",
          "level": "N1 · Fundamentals",
          "estimatedMinutes": 12,
          "timerSeconds": 600,
          "timerDefaultOn": false,
          "tools": [
            {
              "kind": "ai",
              "label": "AI"
            },
            {
              "kind": "data",
              "label": "Tables"
            },
            {
              "kind": "messaging",
              "label": "Messaging"
            },
            {
              "kind": "documents",
              "label": "Documents"
            }
          ]
        }
      }
    },
    {
      "blockId": "reading_message",
      "title": "Megan assigns you the relaunch",
      "body": "Read it all the way through. What she asks for here is what you deliver at the end.",
      "caseContext": {
        "message": {
          "channel": "email",
          "from": {
            "name": "Megan Rowe",
            "role": "Growth Lead · Aurora Retail"
          },
          "to": {
            "name": "You",
            "role": "Growth Analyst"
          },
          "timestamp": "Today, 9:40 AM",
          "subject": "We relaunch the retention campaign this week",
          "body": "Hi. This week we **relaunch the retention campaign** to our regular customers, and it closes **Friday**. The list I am sending you has problems, so the first job is to get it clean. Once you have it, send me a proposal with three things: the **segments** you will write to, the **base message** they receive, and the **metrics you will track** to know whether it worked. Any questions, let me know."
        }
      }
    },
    {
      "blockId": "reading_data_table",
      "title": "This is how the customer list arrived",
      "body": "A sample of the list, with the usual problems. In the next section you decide what to do with each customer.",
      "caseContext": {
        "table": {
          "caption": "Sample of the customer list (of 480)",
          "columns": [
            {
              "key": "nombre",
              "label": "Customer"
            },
            {
              "key": "ultima_compra",
              "label": "Last purchase"
            },
            {
              "key": "consentimiento",
              "label": "Consent status"
            },
            {
              "key": "entrega",
              "label": "Deliverability"
            },
            {
              "key": "valor",
              "label": "12-month spend (USD)"
            }
          ],
          "rows": [
            {
              "nombre": "Paula Reed",
              "ultima_compra": "Apr 22, 2026",
              "consentimiento": "Subscribed",
              "entrega": "OK",
              "valor": "$8,400"
            },
            {
              "nombre": "Renee Grant",
              "ultima_compra": "May 10, 2026",
              "consentimiento": "Privacy opt-out",
              "entrega": "OK",
              "valor": "$14,200"
            },
            {
              "nombre": "Brian Sloan",
              "ultima_compra": "Mar 15, 2026",
              "consentimiento": "Subscribed",
              "entrega": "Bounces",
              "valor": "$3,200"
            },
            {
              "nombre": "Lily Foster",
              "ultima_compra": "Feb 1, 2026",
              "consentimiento": "Unsubscribed",
              "entrega": "OK",
              "valor": "$5,100"
            }
          ]
        }
      }
    },
    {
      "blockId": "reading_kpi_cards",
      "title": "How the April campaign did",
      "body": "The numbers from the last retention send, the one on **Apr 18**. They are your baseline for what you propose.",
      "caseContext": {
        "kpis": [
          {
            "label": "Open rate",
            "value": "22%",
            "delta": {
              "direction": "flat",
              "label": "flat since the last send"
            }
          },
          {
            "label": "30-day repeat purchase",
            "value": "3.4%",
            "delta": {
              "direction": "flat",
              "label": "the number to beat",
              "goodWhen": "higher"
            }
          },
          {
            "label": "Complaints and unsubscribes",
            "value": "1.8%",
            "delta": {
              "direction": "flat",
              "label": "the number to protect",
              "goodWhen": "lower"
            }
          }
        ]
      }
    },
    {
      "blockId": "reading_message",
      "title": "Nicole, from Legal, already raised a flag",
      "body": "Before you touch anything, read what happened with the last send.",
      "caseContext": {
        "message": {
          "channel": "ticket",
          "from": {
            "name": "Nicole Barrett",
            "role": "Privacy Counsel · Aurora Retail"
          },
          "to": {
            "name": "Marketing"
          },
          "timestamp": "6 days ago",
          "subject": "Complaints from customers who had unsubscribed",
          "body": "The April send drew complaints from **customers who had already unsubscribed** and got the email anyway. Before the next send I need you to confirm two things: that you **excluded everyone who unsubscribed or has a privacy opt-out on file**, and that the email carries **a visible unsubscribe link**, which commercial email rules require. If anything is unclear, write to me."
        }
      }
    }
  ],
  [
    {
      "blockId": "categorize_rows",
      "title": "Decide what you do with each customer",
      "body": "Pick one action per customer. Some are clear from the data policy; others take your judgment. Hard rule: **anyone who unsubscribed or has a privacy opt-out on file is always excluded**.",
      "caseContext": {
        "actionStyle": "permission",
        "actions": [
          {
            "value": "usar",
            "label": "Use"
          },
          {
            "value": "anonimizar",
            "label": "Anonymize"
          },
          {
            "value": "excluir",
            "label": "Exclude"
          },
          {
            "value": "escalar",
            "label": "Escalate"
          }
        ],
        "rows": [
          {
            "id": "c1",
            "label": "Paula Reed · bought 5 weeks ago · opens often",
            "example": "Active customer, no issues",
            "hint": "Use"
          },
          {
            "id": "c2",
            "label": "Tom Ingram · no purchase in 6 months · still opens",
            "example": "Reactivation candidate",
            "hint": "Use"
          },
          {
            "id": "c3",
            "label": "Renee Grant · privacy opt-out on file · $14,200 USD over 12 months",
            "example": "Top spender on the list, and the opt-out still wins. The money is the pull; the hard rule is the answer.",
            "hint": "Exclude"
          },
          {
            "id": "c4",
            "label": "Brian Sloan · his email bounces",
            "example": "Bounces, invalid address",
            "hint": "Exclude"
          },
          {
            "id": "c5",
            "label": "Lily Foster · unsubscribed",
            "example": "Unsubscribed, source of Nicole's ticket",
            "hint": "Exclude"
          }
        ]
      }
    },
    {
      "blockId": "categorize_rows",
      "title": "Decide which columns you pass to AI",
      "body": "**Aurora Copilot**, the company assistant, will write the message. For each column, decide whether you pass it as is, transformed, or not at all. Whatever you type into the assistant leaves the protected list.",
      "caseContext": {
        "actionStyle": "neutral",
        "actions": [
          {
            "value": "va",
            "label": "Goes to the model"
          },
          {
            "value": "transformada",
            "label": "Goes transformed"
          },
          {
            "value": "no_va",
            "label": "Does not go"
          }
        ],
        "rows": [
          {
            "id": "f1",
            "label": "Customer name",
            "example": "Personal information, direct identifier",
            "hint": "Does not go, or anonymize"
          },
          {
            "id": "f2",
            "label": "Email",
            "example": "Personal identifier under state privacy law",
            "hint": "Does not go"
          },
          {
            "id": "f3",
            "label": "Last purchase (date)",
            "example": "Useful signal, does not identify anyone",
            "hint": "Goes"
          },
          {
            "id": "f5",
            "label": "Consent status",
            "example": "Already used to filter, does not belong in the copy",
            "hint": "Does not go"
          },
          {
            "id": "f6",
            "label": "12-month spend (USD)",
            "example": "Better as a range than as an exact amount",
            "hint": "Goes transformed"
          }
        ]
      }
    },
    {
      "blockId": "model_tradeoff_sliders",
      "title": "Weigh what matters most when you use AI with customer data",
      "body": "For customer data, how much weight goes to model autonomy, security, and cost? Move the three controls to match your judgment.",
      "caseContext": {
        "modelTradeoff": {
          "prompt": "For customer data, what matters most?",
          "sliderLabels": {
            "autonomy": "Model autonomy",
            "security": "Data security",
            "cost": "Cost"
          }
        }
      }
    },
    {
      "blockId": "ai_textfield_free",
      "title": "Tell Aurora Copilot which data it cannot use",
      "body": "Before you ask for the message, set the limit. In one or two sentences, tell it which columns it must not use and how to handle personal information. This is what you will review later, when you check whether it held the line.",
      "caseContext": {
        "placeholder": "Tell the assistant which data it must not use and how to handle personal information..."
      }
    },
    {
      "blockId": "reading_attachment",
      "title": "Aurora's data policy, in three rules",
      "body": "It is short. These three rules apply to this send. You will have to stand behind them if Legal asks.",
      "caseContext": {
        "attachments": [
          {
            "name": "Aurora_Retail_Data_Policy.pdf",
            "size": "2 pages",
            "kind": "pdf",
            "description": "Rule 1: if an email bounces twice, it is excluded. Rule 2: anyone with a privacy opt-out on file, or who unsubscribed, is always excluded. Rule 3: anyone who never confirmed their email gets at most one re-permission email."
          }
        ]
      }
    }
  ],
  [
    {
      "blockId": "reading_passive",
      "title": "What Aurora Copilot is and what it is not",
      "body": "**Aurora Copilot** is the company's approved language assistant. It runs on Aurora's infrastructure.\n\n**What it can do:** draft, summarize, and adjust the tone of whatever you paste in.\n\n**What it cannot do:** reach into the customer list on its own, or send email. It only sees what you type into the prompt.\n\nOne thing to know: it sometimes **invents figures** or adds details that look like customer data even though you never gave them to it. That is why everything it returns has to be checked."
    },
    {
      "blockId": "ai_textfield_guided",
      "title": "Set up the request for Aurora Copilot",
      "body": "You are going to generate the campaign's **base message**. Define the goal, who you are talking to, and the limits. Without those three decisions, the assistant improvises.",
      "caseContext": {
        "guided": {
          "entrega": "Write the base message for the retention campaign, with no invented figures and no personal customer data.",
          "objetivos": [
            "Win back customers who stopped buying",
            "Reinforce customers who keep buying",
            "Reactivate people who open but do not buy",
            "Announce a benefit for current customers"
          ],
          "audiencias": [
            "High-value active customers",
            "Customers who have not bought in months",
            "Customers who open but do not buy",
            "The whole list at once"
          ],
          "limites": [
            "Do not use names or emails in the copy",
            "Do not invent figures or results",
            "Leave it as a draft to review",
            "Include the unsubscribe link"
          ]
        }
      }
    },
    {
      "blockId": "ai_output_review",
      "title": "Aurora Copilot returned this draft",
      "body": "It is the first attempt. **Flag what you would not let through** before you ask for a fix. Look for figures you cannot stand behind, personal data that should not be there, and tone.",
      "caseContext": {
        "segments": [
          {
            "id": "s1",
            "text": "Hi, we have missed you at Aurora Retail. We know your last purchase was exactly 47 days ago.",
            "issue": "Exact personal detail that should never have gone to the model",
            "flagIfMarked": "dato_sensible"
          },
          {
            "id": "s2",
            "text": "Customers who come back spend 35% more on average.",
            "issue": "Invented figure with no source",
            "flagIfMarked": "claim_no_verificado"
          },
          {
            "id": "s3",
            "text": "We put together a selection for you and a benefit if you come back this week.",
            "issue": "Concrete offer, acceptable",
            "flagIfMarked": "frase_reutilizable"
          },
          {
            "id": "s4",
            "text": "If you no longer want these emails, you can unsubscribe here.",
            "issue": "Includes the unsubscribe link, correct",
            "flagIfMarked": "frase_reutilizable"
          }
        ]
      }
    },
    {
      "blockId": "ai_textfield_free",
      "title": "Ask for the fix",
      "body": "Write the next request for Aurora Copilot. Be specific: what comes out, what changes, what stays. This is where the draft becomes sendable.",
      "caseContext": {
        "placeholder": "Tell it what to fix in the previous draft..."
      }
    },
    {
      "blockId": "ai_output_review",
      "title": "This is the corrected version",
      "body": "Aurora Copilot applied your request. **Check that it actually fixed what you asked for** and flag whatever still does not convince you. Watch out: when it fixes things, it sometimes slips in something new.",
      "caseContext": {
        "segments": [
          {
            "id": "v1",
            "text": "Hi, at Aurora Retail we put something together for customers like you.",
            "issue": "Dropped the exact date, now speaks in general terms",
            "flagIfMarked": "frase_reutilizable"
          },
          {
            "id": "v2",
            "text": "A lot of customers come back for our new seasons.",
            "issue": "Dropped the invented 35%, now it is a line with no figure",
            "flagIfMarked": "frase_reutilizable"
          },
          {
            "id": "v3",
            "text": "We have a selection for you and a benefit if you come back this week.",
            "issue": "Kept, it is fine",
            "flagIfMarked": "frase_reutilizable"
          },
          {
            "id": "v4",
            "text": "Also, 92% of orders now arrive in under 48 hours.",
            "issue": "The model slipped in a new invented figure while fixing the old one",
            "flagIfMarked": "claim_no_verificado"
          }
        ]
      }
    }
  ],
  [
    {
      "blockId": "ai_output_review",
      "title": "Hunt the figures you cannot stand behind",
      "body": "The message is cleaner now, but **numbers** are still in there. Flag every figure you could not defend if Megan or Legal pushed back.",
      "caseContext": {
        "segments": [
          {
            "id": "r1",
            "text": "More than 80% of our customers buy again within three months.",
            "issue": "Statistic with no source",
            "flagIfMarked": "claim_no_verificado"
          },
          {
            "id": "r2",
            "text": "Your favorite category has 200 new products this season.",
            "issue": "Invented catalog figure",
            "flagIfMarked": "claim_no_verificado"
          },
          {
            "id": "r3",
            "text": "We have a selection for you and a benefit if you come back this week.",
            "issue": "Line with no figure, acceptable",
            "flagIfMarked": "frase_reutilizable"
          },
          {
            "id": "r4",
            "text": "If you no longer want these emails, you can unsubscribe here.",
            "issue": "Unsubscribe link, correct",
            "flagIfMarked": "frase_reutilizable"
          }
        ]
      }
    },
    {
      "blockId": "ai_comparison",
      "title": "Pick how the message closes",
      "body": "Four ways to close. Pick the one that would speak best to a customer who already knows you.",
      "caseContext": {
        "options": [
          {
            "id": "A",
            "title": "Closing 1",
            "body": "Come back this week and take the benefit. Shop here."
          },
          {
            "id": "B",
            "title": "Closing 2",
            "body": "If you want to see what is new, your benefit is here. Whenever you like."
          },
          {
            "id": "C",
            "title": "Closing 3",
            "body": "We are leaving the selection right here. If you like it, the benefit is waiting."
          },
          {
            "id": "D",
            "title": "Closing 4",
            "body": "Thanks for staying with us. Here is a selection and a benefit if you decide to come back."
          }
        ]
      }
    },
    {
      "blockId": "reading_message",
      "title": "Megan reviewed your draft",
      "body": "She replies over chat.",
      "caseContext": {
        "message": {
          "channel": "chat",
          "from": {
            "name": "Megan Rowe",
            "role": "Growth Lead"
          },
          "to": {
            "name": "You"
          },
          "timestamp": "10 minutes ago",
          "body": "This is coming along. Two things before you go further: confirm you **took out the people who unsubscribed** (that is what Nicole asked for, rule 2 of the policy) and check that the email keeps **the unsubscribe link** clearly visible. If those two are in, go ahead as far as I am concerned."
        }
      }
    },
    {
      "blockId": "categorize_rows",
      "title": "Last pass on the message, line by line",
      "body": "For each part of the email, decide whether you keep it, fix it, or cut it before sending.",
      "caseContext": {
        "actionStyle": "neutral",
        "actions": [
          {
            "value": "dejar",
            "label": "Keep"
          },
          {
            "value": "corregir",
            "label": "Fix"
          },
          {
            "value": "quitar",
            "label": "Cut"
          }
        ],
        "rows": [
          {
            "id": "m1",
            "label": "Subject: Something new for you at Aurora Retail",
            "example": "Clear subject, no false promise",
            "hint": "Keep"
          },
          {
            "id": "m2",
            "label": "More than 80% of customers buy again within three months",
            "example": "Invented figure you already flagged",
            "hint": "Cut"
          },
          {
            "id": "m3",
            "label": "We have a selection for you and a benefit this week",
            "example": "Concrete, honest offer",
            "hint": "Keep"
          },
          {
            "id": "m4",
            "label": "Greeting with the customer's full name",
            "example": "Better a general greeting, without the exact detail",
            "hint": "Fix"
          },
          {
            "id": "m5",
            "label": "Unsubscribe link",
            "example": "Legal asked for it, it has to be there",
            "hint": "Keep"
          }
        ]
      }
    },
    {
      "blockId": "ai_comparison",
      "title": "Pick the final version",
      "body": "Four versions of the full message, with your fixes in. Pick the one you would send Monday.",
      "caseContext": {
        "options": [
          {
            "id": "A",
            "title": "Version A",
            "body": "Hi, at Aurora Retail we put together a selection for you and a benefit if you come back this week. If you no longer want these emails, you can unsubscribe here."
          },
          {
            "id": "B",
            "title": "Version B",
            "body": "Thanks for staying with us at Aurora Retail. We have something new and a benefit if you decide to stop by. You can unsubscribe at this link whenever you want."
          },
          {
            "id": "C",
            "title": "Version C",
            "body": "At Aurora Retail we had you in mind: a selection and a benefit this week. If you would rather not get more emails, unsubscribe here."
          },
          {
            "id": "D",
            "title": "Version D",
            "body": "Your customer benefit is waiting this week at Aurora Retail. Come see the selection we put together. If you no longer want these emails, unsubscribe at this link."
          }
        ]
      }
    }
  ],
  [
    {
      "blockId": "ai_comparison",
      "title": "Pick which segment you send to first",
      "body": "Four ways to build the segment out of the customers you decided to use. Each one has a catch. Pick the one you take to Megan. It is the first deliverable: the **segments**.",
      "caseContext": {
        "options": [
          {
            "id": "A",
            "title": "High-value active customers",
            "body": "The ones who buy often and spend the most. The catch: they are already buying, so the risk is wearing them out with another email."
          },
          {
            "id": "B",
            "title": "Customers to reactivate",
            "body": "They open the emails but have not bought in months. The challenge is giving them a concrete reason to come back, not just saying you miss them."
          },
          {
            "id": "C",
            "title": "The whole clean list, no segmentation",
            "body": "Send to every usable customer. It is the fastest, but the same message does not speak to every group the same way."
          },
          {
            "id": "D",
            "title": "Only people who bought in the last month",
            "body": "The most recent ones. You will land for sure, but you leave out exactly the people you wanted to reactivate."
          }
        ]
      }
    },
    {
      "blockId": "ai_textfield_free",
      "title": "Write the base message you deliver",
      "body": "It is the second deliverable: the **base message** Megan asked for, the full text the segment you picked would receive. Write it the way you would send it, with the benefit and the unsubscribe link.",
      "caseContext": {
        "placeholder": "Write the full message for the segment you picked..."
      }
    },
    {
      "blockId": "categorize_rows",
      "title": "Define which metrics you will track",
      "body": "The third deliverable. From this list, mark which ones you will watch after the send and which tell you nothing for this case.",
      "caseContext": {
        "actionStyle": "neutral",
        "actions": [
          {
            "value": "monitorear",
            "label": "Track"
          },
          {
            "value": "ignorar",
            "label": "Ignore"
          }
        ],
        "rows": [
          {
            "id": "met1",
            "label": "30-day repeat purchase",
            "example": "The goal of the send, it has to beat 3.4%",
            "hint": "Track"
          },
          {
            "id": "met2",
            "label": "Complaints and unsubscribes",
            "example": "Legal's alarm, it must not go above 1.8%",
            "hint": "Track"
          },
          {
            "id": "met3",
            "label": "Bounce rate",
            "example": "Tells you whether the list came out clean",
            "hint": "Track"
          },
          {
            "id": "met4",
            "label": "Social media followers",
            "example": "Nothing to do with this send",
            "hint": "Ignore"
          },
          {
            "id": "met5",
            "label": "Total site clicks",
            "example": "Too general, does not measure retention",
            "hint": "Ignore"
          }
        ]
      }
    },
    {
      "blockId": "reading_passive",
      "title": "This is how the email lands for the customer",
      "body": "Preview of the final email, the way the segment you picked would receive it.\n\n---\n\n**Subject:** Something new for you at Aurora Retail\n\nHi, at Aurora Retail we put together a selection for you and a benefit if you come back this week.\n\n**[ See the selection ]**\n\n*If you no longer want these emails, you can unsubscribe here.*"
    },
    {
      "blockId": "tradeoff_decision_memo",
      "title": "Close with your recommendation for Megan",
      "body": "Pick what you do with the send and write the memo to Megan. This is the last one: the decision you will have to defend.",
      "caseContext": {
        "decisions": [
          {
            "id": "lanzar_lunes",
            "title": "Launch Monday",
            "detail": "Send the campaign to the whole segment on Monday, per the plan. Benefit: you hit the date Megan asked for. Cost: if anything was left unclean, the error reaches the whole list."
          },
          {
            "id": "piloto_controlado",
            "title": "Pilot with one segment",
            "detail": "Send to only part of the list this week and measure before expanding. Benefit: you catch problems small. Cost: you reach fewer customers up front."
          },
          {
            "id": "pausar_y_limpiar",
            "title": "Pause to finish cleaning",
            "detail": "Stop the send to close out the list cleanup. Benefit: you lower the data risk. Cost: you lose part of the week's window."
          },
          {
            "id": "pausar_y_escalar",
            "title": "Pause and escalate to Legal",
            "detail": "Take the open questions to Megan and Legal before sending. Benefit: formal cover. Cost: it depends on their response time."
          }
        ],
        "memoPlaceholder": "Write to Megan: what you decided, why, and what you protected in the list and in the data...",
        "memoAudience": "Megan Rowe · Growth Lead"
      }
    }
  ]
];
