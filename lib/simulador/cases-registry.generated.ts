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
  "anchor_revops_renewals": {
    "caseId": "anchor_revops_renewals",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Revenue Operations",
      "profile_pack": "sales_revops",
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
      "primary_question": "Whether this analyst can produce a renewals number leadership will stand behind: cleaning the account list with judgment, keeping customer contract and contact data out of the AI tool, catching a double-counted roll-up, and refusing to hand the board per-account scores the tool simply made up.",
      "assignment_brief": "Jordan Chen, Director of Revenue Operations, needs you to produce a committed renewals forecast for the board meeting on Thursday. The customer records system export of accounts up for renewal this quarter is messy: duplicate entries, accounts that already churned, incorrect renewal dates, and contract values mixed with customer contact notes. Jordan wants you to clean the list, assign each account a renewal-likelihood score, and roll everything into a single commit number. Use the AI assistant to help, but you are responsible for the final number. Jordan needs to know by end of day Wednesday whether the forecast is board-ready.",
      "business_metric": "Committed renewals forecast accuracy (dollar variance between forecast and actual renewals)",
      "risk_metric": "Exposure from processing customer contract and contact data outside the company's data agreements, plus risk of presenting fabricated per-account scores to the board",
      "expected_signal": "The analyst identifies that the AI tool invented likelihood scores with no real signal, catches the double-counted merged accounts, keeps customer contract and contact data out of the tool, and refuses to commit the AI-generated forecast to the board without real renewal signals.",
      "expected_action": "pausar",
      "alternatives": [
        "pilotar",
        "entrenar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Anchor POS revenue operations",
            "body": "You are a **Revenue Operations Analyst** at **Anchor POS**, a company that sells point-of-sale systems and software to restaurants and food-service businesses across the United States. Your team owns the data, forecasting, and pipeline hygiene for the sales organization.\n\nYour main tool is the **Anchor AI Assistant**, a text-based AI that can clean and deduplicate lists, draft summaries, calculate roll-ups from numbers you provide, and format output into tables. It does **not** connect to the customer records system, the billing system, or any live data source. It cannot verify accuracy or send emails. You are responsible for every number it produces.",
            "caseContext": {
              "meta": {
                "profile": "Revenue Operations",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Jordan assigns the Q4 renewals forecast",
            "body": "Your manager, **Jordan Chen**, Director of Revenue Operations, sends you a message on **Monday, October 19, 2026**.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Jordan Chen"
                },
                "body": "Hi team,\n\nWe need the Q4 renewals forecast ready for Thursday's board meeting. I'm attaching the customer records system export of accounts up for renewal this quarter. Here is what I need from you by end of day **Wednesday, October 21**:\n\n1. Clean the export. Remove duplicates, churned accounts, and any incorrect records.\n2. Assign each account a renewal-likelihood score (high, medium, low).\n3. Roll everything into a single committed renewals dollar number.\n4. Deliver the final forecast to me.\n5. State whether the forecast is board-ready for Thursday's meeting.\n\nLet me know if you have questions.\n\nJordan",
                "timestamp": "Monday, October 19, 2026 9:14 AM"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Customer records system export: Q4 renewals",
            "body": "Jordan attached the customer records system export. It contains **10 records** of accounts with upcoming renewal dates.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "account_name",
                    "label": "Account Name"
                  },
                  {
                    "key": "contract_value",
                    "label": "Contract Value (USD)"
                  },
                  {
                    "key": "renewal_date",
                    "label": "Renewal Date"
                  },
                  {
                    "key": "account_status",
                    "label": "Account Status"
                  },
                  {
                    "key": "primary_contact",
                    "label": "Primary Contact"
                  },
                  {
                    "key": "contact_email",
                    "label": "Contact Email"
                  },
                  {
                    "key": "contact_phone",
                    "label": "Contact Phone"
                  },
                  {
                    "key": "last_payment_date",
                    "label": "Last Payment Date"
                  }
                ],
                "rows": [
                  {
                    "account_name": "Bella Napoli Ristorante",
                    "contract_value": "$24,000 USD",
                    "renewal_date": "November 15, 2026",
                    "account_status": "Active",
                    "primary_contact": "Sofia Romano",
                    "contact_email": "sromano@bellanapoli.com",
                    "contact_phone": "(614) 555-0182",
                    "last_payment_date": "October 1, 2026"
                  },
                  {
                    "account_name": "Smokehouse BBQ & Grill",
                    "contract_value": "$18,500 USD",
                    "renewal_date": "December 1, 2026",
                    "account_status": "Active",
                    "primary_contact": "Darnell Hayes",
                    "contact_email": "dhayes@smokehousebbq.com",
                    "contact_phone": "(614) 555-0327",
                    "last_payment_date": "September 15, 2026"
                  },
                  {
                    "account_name": "Luna's Diner",
                    "contract_value": "$9,600 USD",
                    "renewal_date": "October 22, 2026",
                    "account_status": "Churned",
                    "primary_contact": "Elena Vasquez",
                    "contact_email": "evasquez@lunasdiner.com",
                    "contact_phone": "(614) 555-0091",
                    "last_payment_date": "March 3, 2026"
                  },
                  {
                    "account_name": "Riverfront Tavern",
                    "contract_value": "$31,200 USD",
                    "renewal_date": "November 30, 2026",
                    "account_status": "Active",
                    "primary_contact": "Tom Grady",
                    "contact_email": "tgrady@riverfronttavern.com",
                    "contact_phone": "(614) 555-0415",
                    "last_payment_date": "October 10, 2026"
                  },
                  {
                    "account_name": "Golden Dragon Chinese",
                    "contract_value": "$12,000 USD",
                    "renewal_date": "December 15, 2026",
                    "account_status": "Active",
                    "primary_contact": "Li Wei Chen",
                    "contact_email": "lwchen@goldendragon.com",
                    "contact_phone": "(614) 555-0273",
                    "last_payment_date": "September 28, 2026"
                  },
                  {
                    "account_name": "Main Street Deli (formerly Main Street Deli & Catering)",
                    "contract_value": "$15,000 USD",
                    "renewal_date": "November 5, 2026",
                    "account_status": "Merged",
                    "primary_contact": "Karen O'Brien",
                    "contact_email": "kobrien@mainstreetdeli.com",
                    "contact_phone": "(614) 555-0158",
                    "last_payment_date": "October 5, 2026"
                  },
                  {
                    "account_name": "Main Street Deli & Catering (merged into Main Street Deli)",
                    "contract_value": "$15,000 USD",
                    "renewal_date": "November 5, 2026",
                    "account_status": "Merged",
                    "primary_contact": "Karen O'Brien",
                    "contact_email": "kobrien@mainstreetdeli.com",
                    "contact_phone": "(614) 555-0158",
                    "last_payment_date": "October 5, 2026"
                  },
                  {
                    "account_name": "The Burger Box",
                    "contract_value": "$7,200 USD",
                    "renewal_date": "October 30, 2026",
                    "account_status": "Active",
                    "primary_contact": "Jamal Wright",
                    "contact_email": "jwright@burgerbox.com",
                    "contact_phone": "(614) 555-0064",
                    "last_payment_date": "October 12, 2026"
                  },
                  {
                    "account_name": "Pizza Tower (franchise)",
                    "contract_value": "$42,000 USD",
                    "renewal_date": "December 20, 2026",
                    "account_status": "Active",
                    "primary_contact": "Angela Moretti",
                    "contact_email": "amoretti@pizzatower.com",
                    "contact_phone": "(614) 555-0501",
                    "last_payment_date": "October 8, 2026"
                  },
                  {
                    "account_name": "Harbor Fish House",
                    "contract_value": "$0 USD",
                    "renewal_date": "November 10, 2026",
                    "account_status": "Churned",
                    "primary_contact": "Mike Sorensen",
                    "contact_email": "msorensen@harborfish.com",
                    "contact_phone": "(614) 555-0224",
                    "last_payment_date": "January 12, 2026"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Headline metrics from the export",
            "body": "Here are the summary numbers pulled from the raw customer records system export before any cleaning.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Total accounts in export",
                  "value": "10"
                },
                {
                  "label": "Total contract value if all renewed",
                  "value": "$179,900 USD"
                },
                {
                  "label": "Accounts with Active status",
                  "value": "6"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Priya flags the board ask",
            "body": "Later that morning, **Priya Mehta**, VP of Sales, emails Jordan with a forward to you.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Mehta"
                },
                "body": "Jordan,\n\nQuick note on the Q4 renewals forecast. The board needs a clean, defensible committed number. No inflated totals, no double-counting. Also, **Marcus Webb** (Account Executive) needs his assigned accounts list as soon as the export is cleaned so he can start outreach.\n\nPlease make sure the analyst knows both of these requirements.\n\nThanks,\nPriya",
                "timestamp": "Monday, October 19, 2026 10:02 AM"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Classify each account for the forecast",
            "body": "Apply the data rules Jordan gave you. For each row, decide whether it belongs in the Q4 committed renewals forecast.",
            "caseContext": {
              "actions": [
                {
                  "value": "keep",
                  "label": "Keep in forecast"
                },
                {
                  "value": "remove_churned",
                  "label": "Remove (churned)"
                },
                {
                  "value": "merge_duplicate",
                  "label": "Merge (duplicate record)"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Bella Napoli Ristorante, Active, $24,000 USD, Renewal Nov 15, 2026"
                },
                {
                  "id": "row_2",
                  "label": "Smokehouse BBQ & Grill, Active, $18,500 USD, Renewal Dec 1, 2026"
                },
                {
                  "id": "row_3",
                  "label": "Luna's Diner, Churned, $9,600 USD, Renewal Oct 22, 2026"
                },
                {
                  "id": "row_4",
                  "label": "Riverfront Tavern, Active, $31,200 USD, Renewal Nov 30, 2026"
                },
                {
                  "id": "row_5",
                  "label": "Golden Dragon Chinese, Active, $12,000 USD, Renewal Dec 15, 2026"
                },
                {
                  "id": "row_6",
                  "label": "Main Street Deli (formerly Main Street Deli & Catering), Merged, $15,000 USD, Renewal Nov 5, 2026"
                },
                {
                  "id": "row_7",
                  "label": "Main Street Deli & Catering (merged into Main Street Deli), Merged, $15,000 USD, Renewal Nov 5, 2026"
                },
                {
                  "id": "row_8",
                  "label": "The Burger Box, Active, $7,200 USD, Renewal Oct 30, 2026"
                },
                {
                  "id": "row_9",
                  "label": "Pizza Tower (franchise), Active, $42,000 USD, Renewal Dec 20, 2026"
                },
                {
                  "id": "row_10",
                  "label": "Harbor Fish House, Churned, $0 USD, Renewal Nov 10, 2026"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Flag contact data for AI tool handling",
            "body": "The Anchor AI Assistant can process data you paste into it, but company policy restricts what types of contact information can be shared. For each row, decide whether the contact details are safe to paste into the AI tool or must be redacted first.",
            "caseContext": {
              "actions": [
                {
                  "value": "safe_to_share",
                  "label": "Safe to share with AI tool"
                },
                {
                  "value": "redact_before_sharing",
                  "label": "Redact before sharing"
                }
              ],
              "rows": [
                {
                  "id": "row_1b",
                  "label": "Bella Napoli Ristorante, Sofia Romano, sromano@bellanapoli.com, (614) 555-0182"
                },
                {
                  "id": "row_2b",
                  "label": "Smokehouse BBQ & Grill, Darnell Hayes, dhayes@smokehousebbq.com, (614) 555-0327"
                },
                {
                  "id": "row_3b",
                  "label": "Luna's Diner, Elena Vasquez, evasquez@lunasdiner.com, (614) 555-0091"
                },
                {
                  "id": "row_4b",
                  "label": "Riverfront Tavern, Tom Grady, tgrady@riverfronttavern.com, (614) 555-0415"
                },
                {
                  "id": "row_5b",
                  "label": "Golden Dragon Chinese, Li Wei Chen, lwchen@goldendragon.com, (614) 555-0273"
                },
                {
                  "id": "row_6b",
                  "label": "Main Street Deli, Karen O'Brien, kobrien@mainstreetdeli.com, (614) 555-0158"
                },
                {
                  "id": "row_7b",
                  "label": "Main Street Deli & Catering, Karen O'Brien, kobrien@mainstreetdeli.com, (614) 555-0158"
                },
                {
                  "id": "row_8b",
                  "label": "The Burger Box, Jamal Wright, jwright@burgerbox.com, (614) 555-0064"
                },
                {
                  "id": "row_9b",
                  "label": "Pizza Tower (franchise), Angela Moretti, amoretti@pizzatower.com, (614) 555-0501"
                },
                {
                  "id": "row_10b",
                  "label": "Harbor Fish House, Mike Sorensen, msorensen@harborfish.com, (614) 555-0224"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Set AI tool handling preferences for contact data",
            "body": "The Anchor AI Assistant can be configured with different levels of autonomy, safety checking, and cost sensitivity when processing contact information. Adjust the three sliders to reflect how you want the tool to handle the customer records system data you are about to paste in.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your instruction to the AI Assistant",
            "body": "You are about to paste the customer records system export into the Anchor AI Assistant. Write the prompt you will use. Tell the tool what to do with the data and what to flag. Remember what the tool can and cannot do.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Anchor POS data-processing policy",
            "body": "This policy governs how employee data may be shared with third-party AI tools. Read it carefully before you paste any customer records system data.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Data-Processing Policy for Third-Party AI Tools (v2.3)",
                  "kind": "pdf"
                },
                {
                  "name": "Summary: What Can Be Shared With the AI Assistant",
                  "kind": "pdf"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "AI Assistant cleaned list",
            "body": "The AI Assistant processed your instruction. It removed **Luna's Diner** and **Harbor Fish House** (churned). It flagged **Main Street Deli & Catering** as a merged duplicate and kept only one record for **Main Street Deli** at **$15,000 USD**. The cleaned list has **7 accounts** with a combined contract value of **$149,900 USD**.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your prompt for the committed renewals total",
            "body": "Use the guided fields to structure your request to the Anchor AI Assistant. Pick the goal, the audience, and the limits the tool should follow when it rolls the cleaned list into a single committed renewals number.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Calculate the committed renewals total from the cleaned account list",
                  "Summarize the Q4 renewals forecast for leadership",
                  "Build a per-account renewal breakdown table",
                  "Draft talking points for the board meeting"
                ],
                "audiencias": [
                  "Jordan Chen, Director of Revenue Operations",
                  "Priya Mehta, VP of Sales",
                  "The board reviewing the Q4 forecast",
                  "Marcus Webb, the account executive running outreach"
                ],
                "limites": [
                  "Use only active, non-duplicate accounts and the numbers provided",
                  "Include every account in the export regardless of status",
                  "Keep customer contact details out of the prompt",
                  "Let the tool assign renewal-likelihood scores on its own"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review the AI's likelihood scores",
            "body": "The AI Assistant assigned a renewal-likelihood score to each account. Review the segments below and flag any that present a risk.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Luna's Diner, Renewal likelihood: Medium. Reason: Recent payment history shows a gap.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_2",
                  "text": "Harbor Fish House, Renewal likelihood: Low. Reason: Account status is churned.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "Main Street Deli (merged), Renewal likelihood: High. Reason: Single entity after merger.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_4",
                  "text": "Pizza Tower (franchise), Renewal likelihood: High. Reason: Largest contract at $42,000 USD.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Draft the memo prompt",
            "body": "Write your instruction to the AI Assistant. It should produce a summary memo for Jordan Chen with the final committed renewals number. Include what the memo must cover and what it must exclude.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review the AI's draft memo",
            "body": "The AI Assistant produced a draft memo for Jordan. Review the segments below and flag any that present a risk for a board-ready document.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_5",
                  "text": "Committed renewals total: $149,900 USD across 7 active accounts.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_6",
                  "text": "Contact Sofia Romano at sromano@bellanapoli.com or (614) 555-0182 to confirm.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_7",
                  "text": "Excludes Luna's Diner and Harbor Fish House (churned accounts).",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_8",
                  "text": "Excludes the duplicate Main Street Deli & Catering record (merged).",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review the cleaned account list",
            "body": "The AI Assistant returned a cleaned list of accounts for the Q4 renewals forecast. Review the segments below. Flag any that still contain errors or risks that would affect the forecast Jordan needs by **Wednesday, October 21, 2026**.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_active",
                  "text": "Active accounts with valid renewal dates (Bella Napoli Ristorante, Smokehouse BBQ & Grill, Riverfront Tavern, Golden Dragon Chinese, Main Street Deli, The Burger Box, Pizza Tower franchise)",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_churned",
                  "text": "Churned accounts still present (Luna's Diner, Harbor Fish House)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_merged",
                  "text": "Merged account records counted separately (Main Street Deli & Catering listed alongside Main Street Deli)",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_zero_value",
                  "text": "Account with $0 USD contract value included (Harbor Fish House)",
                  "flagIfMarked": "tono_agresivo"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the scoring methodology",
            "body": "The AI Assistant generated four versions of the renewal-likelihood scoring methodology. Pick the version that best fits the data rules and the board-ready forecast Jordan needs.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Score every account in the customer records system export on a 1-5 scale based on contract value. Accounts above $20,000 USD get a 5. Accounts below $10,000 USD get a 1. Churned and merged accounts are scored but flagged in a separate column."
                },
                {
                  "id": "B",
                  "body": "Score only active, non-duplicate accounts. Use three factors: contract value, days since last payment, and account tenure. Churned accounts and merged duplicates are excluded before scoring."
                },
                {
                  "id": "C",
                  "body": "Score all accounts equally at 3 (medium likelihood) by default. Then adjust scores up or down manually based on the account executive's personal knowledge of each relationship."
                },
                {
                  "id": "D",
                  "body": "Score accounts by renewal date proximity. Accounts renewing in October get a 5, November gets a 3, December gets a 1. Exclude churned accounts but keep merged duplicates counted separately."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Marcus Webb requests his accounts",
            "body": "An email arrives from one of the account executives.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Marcus Webb"
                },
                "body": "Hey, I heard you're putting together the Q4 renewals forecast. Can you send me my assigned accounts and renewal targets? I need to start reaching out this week. I cover all Ohio-based accounts with contract values above $10,000 USD. Thanks.",
                "timestamp": "Tuesday, October 20, 2026, 9:14 AM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Assign accounts to Marcus Webb",
            "body": "Based on Marcus Webb's email, he covers **Ohio-based accounts with contract values above $10,000 USD**. Use the cleaned account list (active, non-duplicate, non-churned accounts only). Assign each account to Marcus or to another AE.",
            "caseContext": {
              "actions": [
                {
                  "value": "assign_marcus",
                  "label": "Assign to Marcus Webb"
                },
                {
                  "value": "assign_other",
                  "label": "Assign to another AE"
                }
              ],
              "rows": [
                {
                  "id": "row_bella",
                  "label": "Bella Napoli Ristorante - $24,000 USD - Columbus, OH"
                },
                {
                  "id": "row_smokehouse",
                  "label": "Smokehouse BBQ & Grill - $18,500 USD - Columbus, OH"
                },
                {
                  "id": "row_riverfront",
                  "label": "Riverfront Tavern - $31,200 USD - Columbus, OH"
                },
                {
                  "id": "row_golden",
                  "label": "Golden Dragon Chinese - $12,000 USD - Columbus, OH"
                },
                {
                  "id": "row_mainstreet",
                  "label": "Main Street Deli - $15,000 USD - Columbus, OH"
                },
                {
                  "id": "row_burger",
                  "label": "The Burger Box - $7,200 USD - Columbus, OH"
                },
                {
                  "id": "row_pizza",
                  "label": "Pizza Tower (franchise) - $42,000 USD - Columbus, OH"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Choose the email to Marcus Webb",
            "body": "The AI Assistant drafted four versions of an email to Marcus Webb with his account assignments and renewal targets. Pick the version that is clear, professional, and follows the data rules.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Subject: Your Q4 accounts\n\nHi Marcus,\n\nHere are your assigned accounts for Q4 renewals: Bella Napoli Ristorante ($24,000 USD), Smokehouse BBQ & Grill ($18,500 USD), Riverfront Tavern ($31,200 USD), Golden Dragon Chinese ($12,000 USD), Main Street Deli ($15,000 USD), and Pizza Tower franchise ($42,000 USD). Total renewal target: $142,700 USD.\n\nPlease start outreach this week.\n\nBest,\n[Your name]"
                },
                {
                  "id": "B",
                  "body": "Subject: Q4 renewals list\n\nMarcus,\n\nAttached is the full customer records system export. Your accounts are the ones in Ohio. Let me know if you have questions.\n\nThanks"
                },
                {
                  "id": "C",
                  "body": "Subject: Your Q4 accounts and targets\n\nHi Marcus,\n\nHere are your assigned accounts: Bella Napoli Ristorante ($24,000 USD), Smokehouse BBQ & Grill ($18,500 USD), Riverfront Tavern ($31,200 USD), Golden Dragon Chinese ($12,000 USD), Main Street Deli ($15,000 USD), Pizza Tower franchise ($42,000 USD), and The Burger Box ($7,200 USD). Total renewal target: $149,900 USD.\n\nPlease start outreach this week.\n\nBest,\n[Your name]"
                },
                {
                  "id": "D",
                  "body": "Subject: Q4 renewals\n\nMarcus,\n\nYour accounts are Bella Napoli, Smokehouse BBQ, Riverfront Tavern, Golden Dragon, Main Street Deli, and Pizza Tower. Total value is around $142,000 USD. The Burger Box is under $10k so someone else handles it.\n\nStart calling this week.\n\n[Your name]"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the board-ready statement",
            "body": "Jordan needs you to state whether the forecast is board-ready. Four versions of the final statement have been drafted. Pick the one that best reflects the correct committed renewals total and the right level of confidence for Thursday's board meeting.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Committed renewals total $149,900 USD. All accounts are active, deduplicated, and verified. The forecast is board-ready."
                },
                {
                  "id": "B",
                  "body": "Committed renewals total $149,900 USD based on active, deduplicated accounts. Recommend flagging the Main Street Deli merger ambiguity and the two churned accounts as watch items for the board."
                },
                {
                  "id": "C",
                  "body": "Committed renewals total $179,900 USD. This includes all records in the customer records system with a renewal date in Q4. The forecast is board-ready."
                },
                {
                  "id": "D",
                  "body": "Committed renewals total $149,900 USD. However, the data has unresolved issues with churned accounts and merged records, so the forecast is not board-ready."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write your prompt to the AI Assistant",
            "body": "You need the AI Assistant to format the final committed renewals number and supporting data so you can deliver it to Jordan. Write your instruction to the AI Assistant below. Be specific about what data to include, how to structure it, and what to leave out.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Classify each account for the committed total",
            "body": "For each cleaned account below, classify whether it contributes to the committed renewals total. The correct total is **$149,900 USD**. Confirm you can identify which accounts count.",
            "caseContext": {
              "actions": [
                {
                  "value": "counts",
                  "label": "Counts toward committed renewals"
                },
                {
                  "value": "excluded",
                  "label": "Excluded from committed renewals"
                }
              ],
              "rows": [
                {
                  "id": "1",
                  "label": "Bella Napoli Ristorante - $24,000 USD - Active"
                },
                {
                  "id": "2",
                  "label": "Smokehouse BBQ & Grill - $18,500 USD - Active"
                },
                {
                  "id": "3",
                  "label": "Luna's Diner - $9,600 USD - Churned"
                },
                {
                  "id": "4",
                  "label": "Riverfront Tavern - $31,200 USD - Active"
                },
                {
                  "id": "5",
                  "label": "Golden Dragon Chinese - $12,000 USD - Active"
                },
                {
                  "id": "6",
                  "label": "Main Street Deli - $15,000 USD - Merged (single record)"
                },
                {
                  "id": "7",
                  "label": "The Burger Box - $7,200 USD - Active"
                },
                {
                  "id": "8",
                  "label": "Pizza Tower (franchise) - $42,000 USD - Active"
                },
                {
                  "id": "9",
                  "label": "Harbor Fish House - $0 USD - Churned"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Jordan's reply",
            "body": "**Wednesday, October 21, 2026** - 4:15 PM\n\nJordan Chen writes:\n\n> Thanks for getting this to me. I see the **$149,900 USD** committed renewals figure and the supporting breakdown. Good work catching the merger duplicate and the churned accounts.\n>\n> One thing: Priya needs my answer by **8:00 AM tomorrow** whether this forecast is board-ready. I need your verdict. Is it ready to present as-is, or do we flag risks to the board?\n>\n> Send me a brief memo with your decision and the reasoning behind it.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Deliver your verdict to Jordan",
            "body": "You have two paths. Each has real benefits and costs. Choose one and write a short memo to Jordan explaining your decision.",
            "caseContext": {
              "decisions": [
                {
                  "id": "board_ready",
                  "title": "Deliver as board-ready",
                  "detail": "State that the **$149,900 USD** figure is clean and verified. The board sees a confident, actionable number. Cost: you do not flag the Main Street Deli merger ambiguity or the churn pattern risk, which could surface later if a board member questions the assumptions."
                },
                {
                  "id": "flag_risks",
                  "title": "Flag risks to the board",
                  "detail": "Present the **$149,900 USD** figure but explicitly note the merger deduplication decision and the two churned accounts removed. The board sees transparency. Cost: the board may perceive uncertainty in the renewals pipeline and ask for more analysis before approving the forecast."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "crestline_sales_references": {
    "caseId": "crestline_sales_references",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Sales",
      "profile_pack": "sales_revops",
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
      "primary_question": "Whether this account executive can answer a prospect's proof request under quota pressure with judgment: using only reference-approved customers, keeping confidential customer data out of the AI tool, catching leaked names or numbers in the AI draft, and knowing when the reply needs sign-off before it leaves the building.",
      "assignment_brief": "Jordan Chen, VP of Sales, assigns you the following: \"A prospect at a mechanical-services company is evaluating a $78,000 USD annual contract and wants customer references and real performance numbers by Friday. I know you are behind on quota this quarter, but we cannot afford a data leak or a compliance issue. Pull the customer database export I sent you. Identify which records are cleared for sales use, which must be aggregated or anonymized, and which cannot be used at all. Then paste only the safe data into the AI writing assistant to draft a reply. Review the draft for any leaked names, contract amounts, or identifying details that should not be there. Decide whether the reply is ready to send, needs marketing sign-off, or needs to be escalated to me.\"",
      "business_metric": "$78,000 USD annual contract value at risk",
      "risk_metric": "Exposure of confidential customer data outside the company's agreements",
      "expected_signal": "The participant correctly identifies which customer records are reference-approved, which must be aggregated or anonymized, and which are unusable; reviews the AI draft for leaked identifying details; and determines whether the reply can be sent, needs marketing sign-off, or must be escalated.",
      "expected_action": "escalar",
      "alternatives": [
        "pilotar",
        "entrenar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Crestline Software account executive",
            "body": "You are an Account Executive at Crestline Software, a company that sells route optimization and field-service management software to mechanical-services and logistics companies across the United States. Your VP of Sales, Jordan Chen, has assigned you a new prospect inquiry. You have access to the **Crestline Draft Assistant**, an AI tool that can draft and polish sales emails. You also have a customer database export with **10 customer records** that you can use as reference material.",
            "caseContext": {
              "meta": {
                "profile": "Sales",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Prospect inquiry arrives",
            "body": "A prospect at a mechanical-services company evaluating Crestline Software emailed the sales team. The prospect is considering a contract worth **$78,000 USD** annually and wants to speak with current customers before making a decision.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Prospect (mechanical-services company)"
                },
                "body": "Hi team,\n\nWe are evaluating Crestline Software for our field-service operations and would like to hear from current customers before we move forward. Could you share a few customer references along with specific performance results they have seen using your platform? We are particularly interested in metrics like route efficiency, fuel savings, and dispatch times.\n\nWe need this by end of day **Friday, June 5, 2026**, to present to our leadership team.\n\nThanks,\nProspect",
                "timestamp": "Monday, June 1, 2026, 9:15 AM ET"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Customer database export",
            "body": "You pulled the full customer database export. It contains **10 records** with contract values, performance metrics, and compliance flags. Review the table carefully before deciding which records are safe to use.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "Customer Name",
                    "label": "Customer Name"
                  },
                  {
                    "key": "Contract Value",
                    "label": "Contract Value"
                  },
                  {
                    "key": "Performance Metric",
                    "label": "Performance Metric"
                  },
                  {
                    "key": "Reference Agreement",
                    "label": "Reference Agreement"
                  },
                  {
                    "key": "Confidentiality Clause",
                    "label": "Confidentiality Clause"
                  },
                  {
                    "key": "Opt-Out Status",
                    "label": "Opt-Out Status"
                  },
                  {
                    "key": "Churn Status",
                    "label": "Churn Status"
                  }
                ],
                "rows": [
                  {
                    "Customer Name": "Atlas Fleet Services",
                    "Contract Value": "$12,000 USD",
                    "Performance Metric": "22% reduction in fuel costs",
                    "Reference Agreement": "Yes",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Brighton Mechanical",
                    "Contract Value": "$8,400 USD",
                    "Performance Metric": "18% more routes per driver",
                    "Reference Agreement": "Yes",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Coastal Field Services",
                    "Contract Value": "$15,000 USD",
                    "Performance Metric": "31% faster dispatch times",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "Yes",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Denton Route Solutions",
                    "Contract Value": "$6,000 USD",
                    "Performance Metric": "14% fewer overtime hours",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Refused",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Evergreen Logistics",
                    "Contract Value": "$22,000 USD",
                    "Performance Metric": "27% improvement in on-time delivery",
                    "Reference Agreement": "Yes",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Frontline Mechanical",
                    "Contract Value": "$9,600 USD",
                    "Performance Metric": "19% fewer missed appointments",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Churned"
                  },
                  {
                    "Customer Name": "Great Lakes Fleet",
                    "Contract Value": "$18,000 USD",
                    "Performance Metric": "24% reduction in idle time",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "Yes",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Harbor Service Group",
                    "Contract Value": "$10,800 USD",
                    "Performance Metric": "16% lower mileage per route",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Ironwood Field Ops",
                    "Contract Value": "$7,200 USD",
                    "Performance Metric": "12% increase in daily stops",
                    "Reference Agreement": "No",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  },
                  {
                    "Customer Name": "Juniper Services",
                    "Contract Value": "$14,400 USD",
                    "Performance Metric": "21% faster route completion",
                    "Reference Agreement": "Yes",
                    "Confidentiality Clause": "No",
                    "Opt-Out Status": "Clear",
                    "Churn Status": "Active"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "What is at stake",
            "body": "Three numbers define the pressure on your decision.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Annual contract value at risk",
                  "value": "$78,000 USD"
                },
                {
                  "label": "Reference-approved customers",
                  "value": "4"
                },
                {
                  "label": "Deadline",
                  "value": "Friday, June 5, 2026"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Jordan Chen's assignment",
            "body": "Jordan Chen, VP of Sales, sent you the following instructions by email.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Jordan Chen"
                },
                "body": "Hi team,\n\nWe have a prospect interested in a **$78,000 USD** annual contract. They want customer references and performance data by **Friday, June 5, 2026**.\n\nHere is what I need you to do:\n\n1. Pull the customer database export.\n2. Identify which records are cleared for sales use.\n3. Identify which records must be aggregated or anonymized.\n4. Identify which records cannot be used at all.\n5. Paste only the safe data into the Crestline Draft Assistant.\n6. Draft a reply to the prospect.\n7. Review the draft for any leaked names, contract amounts, or identifying details.\n8. Decide whether the reply is ready to send, needs marketing sign-off, or needs to be escalated to me.\n\nLet me know if you have questions.\n\nJordan Chen\nVP of Sales, Crestline Software",
                "timestamp": "Monday, June 1, 2026, 9:30 AM ET"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Triage customer records: part 1",
            "body": "Review the first **5** customer records from the export. For each one, decide whether it is **cleared for reference use** (name and metric can be shared with the prospect), **must be aggregated** (data can only be used in combined form without identifying the customer), or **cannot be used** (excluded from the reply entirely). Refer to the policy rules on the next slide if needed.",
            "caseContext": {
              "actions": [
                {
                  "value": "cleared",
                  "label": "Cleared for reference use"
                },
                {
                  "value": "aggregated",
                  "label": "Must be aggregated"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot be used"
                }
              ],
              "rows": [
                {
                  "id": "atlas",
                  "label": "Atlas Fleet Services, $12,000 USD, 22% reduction in fuel costs, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                },
                {
                  "id": "brighton",
                  "label": "Brighton Mechanical, $8,400 USD, 18% more routes per driver, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                },
                {
                  "id": "coastal",
                  "label": "Coastal Field Services, $15,000 USD, 31% faster dispatch times, Reference Agreement: No, Confidentiality Clause: Yes, Opt-Out: Clear, Active"
                },
                {
                  "id": "denton",
                  "label": "Denton Route Solutions, $6,000 USD, 14% fewer overtime hours, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Refused, Active"
                },
                {
                  "id": "evergreen",
                  "label": "Evergreen Logistics, $22,000 USD, 27% improvement in on-time delivery, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Triage customer records: part 2",
            "body": "Review the remaining **5** customer records. Apply the same three categories: **cleared for reference use**, **must be aggregated**, or **cannot be used**.",
            "caseContext": {
              "actions": [
                {
                  "value": "cleared",
                  "label": "Cleared for reference use"
                },
                {
                  "value": "aggregated",
                  "label": "Must be aggregated"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot be used"
                }
              ],
              "rows": [
                {
                  "id": "frontline",
                  "label": "Frontline Mechanical, $9,600 USD, 19% fewer missed appointments, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Clear, Churned"
                },
                {
                  "id": "greatlakes",
                  "label": "Great Lakes Fleet, $18,000 USD, 24% reduction in idle time, Reference Agreement: No, Confidentiality Clause: Yes, Opt-Out: Clear, Active"
                },
                {
                  "id": "harbor",
                  "label": "Harbor Service Group, $10,800 USD, 16% lower mileage per route, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Clear, Active"
                },
                {
                  "id": "ironwood",
                  "label": "Ironwood Field Ops, $7,200 USD, 12% increase in daily stops, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Clear, Active"
                },
                {
                  "id": "juniper",
                  "label": "Juniper Services, $14,400 USD, 21% faster route completion, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Tradeoffs: speed, safety, completeness",
            "body": "You have **4 fully cleared** customer records you can paste into the AI tool. You also have the full export with **10 records**, some of which cannot be shared. The Crestline Draft Assistant **cannot verify** whether data is cleared for external use. \n\nConsider the tradeoffs between these three goals:\n\n- **Speed**, Pasting everything and asking the AI to filter is fast but risky.\n- **Safety**, Pasting only the cleared records is safe but gives the AI less context.\n- **Completeness**, Pasting the full export with an instruction to anonymize may produce a richer reply but could leak identifying details.\n\nMove the sliders to reflect how you weigh each priority for this task. Your choices will not be judged as right or wrong; they help you think through the decision before you write your instruction.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your instruction to the AI tool",
            "body": "Open the Crestline Draft Assistant. Decide what data you will paste into it and what you will ask it to do. Write your instruction below. Be specific about what the AI should include, exclude, or format. The AI cannot access the customer database or verify clearance, so anything you paste becomes part of the draft.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Reference-data policy",
            "body": "Jordan Chen attached the company's reference-data policy. Review it before you finalize your triage and your instruction to the AI tool.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Reference-Data Policy.pdf",
                  "kind": "document"
                },
                {
                  "name": "Customer Reference Guidelines.pdf",
                  "kind": "document"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Before you paste data into the AI tool",
            "body": "Crestline Draft Assistant is a powerful writing tool, but it has two critical limits you need to know before you use it.\n\n**First, the tool does not retain confidentiality.** Anything you paste into it is processed by an external language model. If you paste customer names, contract amounts, or performance metrics, that data leaves Crestline's systems. You must only paste data that is cleared for external sharing.\n\n**Second, the tool cannot verify clearance.** It has no connection to the customer database or customer records system. It cannot check whether a customer signed a reference agreement, has a confidentiality clause, or opted out. It will treat whatever you give it as safe, even if it is not.\n\n**Your job:** Paste only the four fully cleared records (Atlas Fleet Services, Brighton Mechanical, Evergreen Logistics, Juniper Services) into the tool. Then instruct it to draft a reply to the prospect.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request for the AI tool",
            "body": "Use the guided fields below to structure your request to Crestline Draft Assistant. The tool will generate a draft reply based on the options you select.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Draft a reference reply to a prospect",
                  "Summarize customer success stories",
                  "Create a comparison table of customer results",
                  "Write a follow-up email with social proof"
                ],
                "audiencias": [
                  "A prospect at a mechanical-services company",
                  "An existing customer considering expansion",
                  "A partner evaluating a referral program",
                  "A procurement team requesting references"
                ],
                "limites": [
                  "Use only the four cleared customers (Atlas, Brighton, Evergreen, Juniper)",
                  "Include all customers with positive metrics",
                  "Anonymize company names and use ranges for metrics",
                  "Use only the three highest-value customers"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review the AI's first draft",
            "body": "Crestline Draft Assistant produced the draft below. Read each segment carefully and flag any that contain risky content: customer names, contract amounts, or identifying details from customers who are **not** among the four cleared records.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Thank you for your interest in Crestline Software. Our customers in the field-service industry have seen strong results across route optimization, fuel savings, and dispatch efficiency.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s2",
                  "text": "For example, Atlas Fleet Services achieved a 22% reduction in fuel costs, Brighton Mechanical improved route efficiency by 18%, and Evergreen Logistics saw a 27% improvement in on-time delivery.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s3",
                  "text": "Coastal Field Services reduced dispatch times by 31%, and Great Lakes Fleet cut idle time by 24%.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s4",
                  "text": "Juniper Services completed routes 21% faster, and Harbor Service Group lowered mileage per route by 16%.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s5",
                  "text": "Our customers range from small fleets to large enterprises, with annual contract values starting at $6,000 USD and reaching up to $22,000 USD.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write a revised instruction to the AI tool",
            "body": "Based on what you saw in the first draft, write a new instruction for Crestline Draft Assistant. The tool will generate a cleaner draft using only the four cleared customers: **Atlas Fleet Services**, **Brighton Mechanical**, **Evergreen Logistics**, and **Juniper Services**.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review the AI's second draft",
            "body": "Crestline Draft Assistant produced a revised draft. Read each segment and flag any that still contain risky content: names, contract amounts, or identifying details from customers who are **not** among the four cleared records.",
            "caseContext": {
              "segments": [
                {
                  "id": "s6",
                  "text": "Thank you for your interest. Below are results from several Crestline Software customers in the field-service industry.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s7",
                  "text": "Atlas Fleet Services reduced fuel costs by 22%, Brighton Mechanical improved routes per driver by 18%, Evergreen Logistics increased on-time delivery by 27%, and Juniper Services accelerated route completion by 21%.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s8",
                  "text": "These customers represent annual contract values between $8,400 USD and $22,000 USD.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s9",
                  "text": "We would be happy to arrange a call with one of these customers if you would like to learn more.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review the third draft",
            "body": "The AI tool produced a third draft of your reply to the prospect. Read each segment below. Flag any segment that still contains identifying details from a customer who is not cleared for reference use, or that violates the reference policy in any other way.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Our customers Atlas Fleet Services and Brighton Mechanical saw a 22% reduction in fuel costs and 18% more routes per driver, respectively.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_2",
                  "text": "Another customer, Evergreen Logistics, achieved a 27% improvement in on-time delivery using Crestline Software.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "Coastal Field Services reduced dispatch times by 31% after switching to our platform.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_4",
                  "text": "We also work with Juniper Services, who reported 21% faster route completion.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_5",
                  "text": "Across our customer base, teams using Crestline have reduced operating costs by an average of 15% to 25%.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the best closing",
            "body": "The prospect needs your reply by **Friday, June 5, 2026**. You have four versions of the closing paragraph. Pick the one that best balances professionalism with the deadline pressure.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "I look forward to discussing how Crestline can help your team. Please let me know a time that works for you this week or next."
                },
                {
                  "id": "B",
                  "body": "I would be happy to set up a call at your earliest convenience. Feel free to reply with your availability."
                },
                {
                  "id": "C",
                  "body": "Please review the information above and let me know if you have any questions. I am available Thursday or Friday this week if you would like to talk."
                },
                {
                  "id": "D",
                  "body": "I hope this gives you a clear picture of the results we deliver. Let me know if you would like to schedule a follow-up conversation."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Marketing review request",
            "body": "A message arrives from Priya Mehta, the Customer Marketing Manager.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Mehta"
                },
                "body": "Hi there,\n\nJordan Chen forwarded me the draft reply you are preparing for the prospect. Before it goes out, I need to review the customer references section. We have had compliance issues in the past with customer data getting into prospect communications, and I want to make sure everything is clean.\n\nPlease send me the version you plan to send by end of day **Wednesday, June 3, 2026**. That gives me a day to review before the Friday deadline.\n\nThanks,\nPriya",
                "timestamp": "Monday, June 1, 2026, 2:15 PM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Re-triage customer records",
            "body": "Priya's review request confirms that compliance is a priority. To make sure you are on solid ground, re-triage these customer records. For each one, select the correct action based on the reference policy.",
            "caseContext": {
              "actions": [
                {
                  "value": "safe_to_use",
                  "label": "Safe to use as a named reference"
                },
                {
                  "value": "aggregate_only",
                  "label": "Aggregate or anonymize before use"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot be used at all"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Atlas Fleet Services, $12,000 USD, 22% reduction in fuel costs, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                },
                {
                  "id": "row_2",
                  "label": "Coastal Field Services, $15,000 USD, 31% faster dispatch times, Reference Agreement: No, Confidentiality Clause: Yes, Opt-Out: Clear, Active"
                },
                {
                  "id": "row_3",
                  "label": "Denton Route Solutions, $6,000 USD, 14% fewer overtime hours, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Refused, Active"
                },
                {
                  "id": "row_4",
                  "label": "Frontline Mechanical, $9,600 USD, 19% fewer missed appointments, Reference Agreement: No, Confidentiality Clause: No, Opt-Out: Clear, Churned"
                },
                {
                  "id": "row_5",
                  "label": "Juniper Services, $14,400 USD, 21% faster route completion, Reference Agreement: Yes, Confidentiality Clause: No, Opt-Out: Clear, Active"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the customer-reference section",
            "body": "You need to include a customer-reference paragraph in the reply. Compare the four versions below. Pick the one that correctly uses only cleared customers' names and metrics, following the reference policy.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Our customers Atlas Fleet Services (22% reduction in fuel costs), Brighton Mechanical (18% more routes per driver), Evergreen Logistics (27% improvement in on-time delivery), and Juniper Services (21% faster route completion) have all seen strong results with Crestline Software."
                },
                {
                  "id": "B",
                  "body": "Customers such as Atlas Fleet Services, Brighton Mechanical, Coastal Field Services, and Evergreen Logistics have achieved measurable improvements in fuel efficiency, routing, dispatch speed, and on-time delivery using our platform."
                },
                {
                  "id": "C",
                  "body": "Our customers have seen results including a 22% reduction in fuel costs, 18% more routes per driver, 31% faster dispatch times, and 27% improvement in on-time delivery. These metrics come from Atlas Fleet Services, Brighton Mechanical, Coastal Field Services, and Evergreen Logistics."
                },
                {
                  "id": "D",
                  "body": "Atlas Fleet Services reduced fuel costs by 22%, Brighton Mechanical increased routes per driver by 18%, and Evergreen Logistics improved on-time delivery by 27%. Juniper Services also achieved 21% faster route completion with Crestline."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the final reply",
            "body": "The AI tool produced four complete versions of the reply to the prospect. Each one uses different customer data. Pick the version that is both compliant with Crestline's reference-data policy and persuasive enough to protect the **$78,000 USD** deal.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Thank you for your interest in Crestline Software. We have helped companies like Atlas Fleet Services, Brighton Mechanical, Evergreen Logistics, and Juniper Services achieve measurable results. For example, Evergreen Logistics saw a 27% improvement in on-time delivery, and Brighton Mechanical reported 18% more routes per driver. I would be happy to arrange a call with one of these customers so you can hear about their experience firsthand."
                },
                {
                  "id": "B",
                  "body": "Thank you for your interest in Crestline Software. Our customers have seen strong results across the board. Atlas Fleet Services reduced fuel costs by 22%, Coastal Field Services cut dispatch times by 31%, and Great Lakes Fleet lowered idle time by 24%. These are real numbers from active customers. Let me know if you would like to speak with a reference."
                },
                {
                  "id": "C",
                  "body": "Thank you for your interest in Crestline Software. We have worked with companies of all sizes in the mechanical-services space. Customers like Brighton Mechanical, Denton Route Solutions, and Frontline Mechanical have used our platform to improve their operations. I can share more details about the types of results they achieved if you are interested."
                },
                {
                  "id": "D",
                  "body": "Thank you for your interest in Crestline Software. Our customers have reported meaningful improvements, including a 22% reduction in fuel costs, 18% more routes per driver, and a 27% improvement in on-time delivery. These results come from customers in the fleet and field-services industry. I would be happy to connect you with a reference who can discuss their results directly."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write your final instruction to the AI tool",
            "body": "You have decided which customer data is safe to use. Now write a single instruction to the Crestline Draft Assistant that will produce the final, polished reply to the prospect. Remember what the AI tool can and cannot do. It cannot verify whether data is cleared for external use. It cannot retain confidentiality of anything you paste into it. It can draft, rewrite, and format. Write your instruction here, one or two lines.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Final triage of all customer records",
            "body": "Before the reply goes out, confirm the classification of every customer record. For each company, choose one action: **Cleared for reference use** (name and specific metrics can be shared), **Aggregate or anonymize** (data can be referenced only in general terms without identifying the company), or **Cannot use** (must be excluded from all reference communications).",
            "caseContext": {
              "actions": [
                {
                  "value": "cleared",
                  "label": "Cleared for reference use"
                },
                {
                  "value": "aggregate",
                  "label": "Aggregate or anonymize"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot use"
                }
              ],
              "rows": [
                {
                  "id": "atlas",
                  "label": "Atlas Fleet Services"
                },
                {
                  "id": "brighton",
                  "label": "Brighton Mechanical"
                },
                {
                  "id": "coastal",
                  "label": "Coastal Field Services"
                },
                {
                  "id": "denton",
                  "label": "Denton Route Solutions"
                },
                {
                  "id": "evergreen",
                  "label": "Evergreen Logistics"
                },
                {
                  "id": "frontline",
                  "label": "Frontline Mechanical"
                },
                {
                  "id": "greatlakes",
                  "label": "Great Lakes Fleet"
                },
                {
                  "id": "harbor",
                  "label": "Harbor Service Group"
                },
                {
                  "id": "ironwood",
                  "label": "Ironwood Field Ops"
                },
                {
                  "id": "juniper",
                  "label": "Juniper Services"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Policy and tool limits at a glance",
            "body": "Before you make the final call, here is a summary of what governs this decision.\n\n**Reference-data policy**\n- Only customers who signed a reference agreement may have their company name and specific performance numbers shared with a prospect.\n- Customers with a confidentiality clause in their contract cannot have their contract value or specific performance metrics shared externally, even if they signed a reference agreement.\n- Any customer who has explicitly refused to be named to prospects must be excluded from all reference communications, regardless of other agreements.\n\n**Crestline Draft Assistant limits**\n- The tool cannot access the customer database or customer records system.\n- The tool cannot verify whether customer data is cleared for external use.\n- The tool cannot know which customers signed reference agreements.\n- The tool cannot retain confidentiality of anything pasted into it.\n\n**Your deadline**\nThe prospect expects a response by **Friday, June 5, 2026**. Today is **Monday, June 1, 2026**.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Send, route through marketing, or escalate",
            "body": "You have the final reply ready. Now decide what happens next. Each option has a real benefit and a real cost. Pick one and write a brief memo to Jordan Chen explaining your decision.",
            "caseContext": {
              "decisions": [
                {
                  "id": "send",
                  "title": "Send the reply directly to the prospect",
                  "detail": "Benefit: The prospect receives a response by the end of the day, keeping momentum on the **$78,000 USD** deal. Cost: If any data was misclassified, the company could face a compliance issue with a customer who did not authorize the use of their data."
                },
                {
                  "id": "marketing",
                  "title": "Route through Priya Mehta for marketing sign-off",
                  "detail": "Benefit: Priya can verify the customer data and tone before the reply goes out, reducing compliance risk. Cost: The review adds **24 to 48 hours**, and the prospect's deadline is Friday, June 5, 2026."
                },
                {
                  "id": "escalate",
                  "title": "Escalate to Jordan Chen for a decision",
                  "detail": "Benefit: Jordan can make an executive call on borderline records or approve a broader set of references if the deal size justifies it. Cost: Jordan may decide to pause or restrict the reply, and the delay could cause the prospect to lose interest."
                },
                {
                  "id": "send_conditional",
                  "title": "Send the reply now and notify Jordan Chen after",
                  "detail": "Benefit: The prospect gets an immediate response while Jordan is informed of what was sent. Cost: If Jordan disagrees with the data used, the reply cannot be recalled, and the company may need to follow up with a correction."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "harborview_support_enterprise": {
    "caseId": "harborview_support_enterprise",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Customer Support",
      "profile_pack": "customer_success_support",
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
      "primary_question": "Whether this person can handle an angry enterprise account under time pressure with judgment: using the AI tool to draft without pasting customer account data into it, catching what the draft gets wrong, and knowing when a reply is not enough and the account needs to be escalated.",
      "assignment_brief": "Diane Reyes, your manager, assigns you the case. She says: \"Our largest enterprise account, SummitServe, is furious. An overnight sync bug wiped two days of technician schedules. The email thread is nine messages deep and getting heated. I need you to draft a professional reply using the AI assistant, but you cannot paste the raw thread into it. Anything you paste goes outside our data agreements. Strip out account details, admin emails, contract references, and personal data first. Then review what the tool returns. Decide if the reply is enough or if this needs to go to the account manager. SummitServe pays us $96,000 USD per year. Do not lose this account.\"",
      "business_metric": "Enterprise account retention ($96,000 USD annual contract value)",
      "risk_metric": "Exposure of customer account data outside the company's data agreements",
      "expected_signal": "The participant strips personal and account data before pasting into the AI tool, catches a factual error or tone problem in the draft, and escalates the account to the account manager instead of sending a reply.",
      "expected_action": "escalar",
      "alternatives": [
        "pilotar",
        "entrenar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Harborview Software: SummitServe escalation",
            "body": "You are a **Customer Support Specialist** at **Harborview Software**, a company that provides scheduling and field-service management platforms to mid-market and enterprise clients. Your manager, **Diane Reyes**, has assigned you a sensitive escalation from **SummitServe**, an enterprise account worth **$96,000 USD** annually. You will use **HarborChat**, the company's AI drafting tool, to prepare a professional reply. But HarborChat has limits: it cannot access your helpdesk or customer database, it cannot verify facts from the email thread, and pasting sensitive data into it is not covered by Harborview's data agreements.",
            "caseContext": {
              "meta": {
                "profile": "Customer Support",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Diane assigns the case",
            "body": "Diane Reyes sends you the assignment via the internal helpdesk system.",
            "caseContext": {
              "message": {
                "channel": "helpdesk_ticket",
                "from": {
                  "name": "Diane Reyes"
                },
                "body": "I need you to handle the SummitServe escalation. Lena Okafor, their VP of Operations, is very frustrated after a sync bug lost two days of technician schedules. Here is what I need from you:\n\n1. **Draft a professional reply** to Lena Okafor using HarborChat. Paste only the content of the email thread, stripped of any account details, admin emails, contract references, or personal data.\n2. **Review the AI draft** for factual errors or tone problems before sending.\n3. **Decide** whether the reply is sufficient or whether this account needs to be **escalated to Marcus Chen**, the Account Manager for enterprise accounts.\n\nThe last email in the thread was at **9:47 AM** today, Friday, June 5, 2026. Our response-time target is **4 business hours**, so we need a decision by **1:47 PM**. Let me know if you have questions.",
                "timestamp": "Friday, June 5, 2026 at 10:00 AM"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "SummitServe contact data",
            "body": "Here is the contact dataset for the SummitServe account. Review it carefully. You will need to know who can receive communications, who has opted out, and which contact information is verified.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "name",
                    "label": "Name"
                  },
                  {
                    "key": "email",
                    "label": "Email"
                  },
                  {
                    "key": "role",
                    "label": "Role"
                  },
                  {
                    "key": "contract_ref",
                    "label": "Contract Ref"
                  },
                  {
                    "key": "admin_key",
                    "label": "Admin Access Key"
                  },
                  {
                    "key": "last_contact",
                    "label": "Last Contact"
                  },
                  {
                    "key": "opt_out",
                    "label": "Opt Out Status"
                  },
                  {
                    "key": "notes",
                    "label": "Notes"
                  }
                ],
                "rows": [
                  {
                    "name": "Lena Okafor",
                    "email": "l.okafor@summitserve.com",
                    "role": "VP of Operations",
                    "contract_ref": "SS-2026-4891",
                    "admin_key": "adm-ss-7k9m2p",
                    "last_contact": "June 2, 2026",
                    "opt_out": "No",
                    "notes": "Account executive. Sent the escalation thread. Very frustrated."
                  },
                  {
                    "name": "Tom Betancourt",
                    "email": "t.betancourt@summitserve.com",
                    "role": "IT Director",
                    "contract_ref": "SS-2026-4891",
                    "admin_key": "adm-ss-4f8h1q",
                    "last_contact": "June 2, 2026",
                    "opt_out": "No",
                    "notes": "CC'd on thread. Technical contact for the sync integration."
                  },
                  {
                    "name": "Patricia Hobbs",
                    "email": "p.hobbs@summitserve.com",
                    "role": "Scheduling Manager",
                    "contract_ref": "SS-2026-4891",
                    "admin_key": "adm-ss-2d5g7w",
                    "last_contact": "May 28, 2026",
                    "opt_out": "Yes",
                    "notes": "Asked to be removed from all non-critical communications in May."
                  },
                  {
                    "name": "Raj Mehta",
                    "email": "r.mehta@harborview.com",
                    "role": "Solutions Engineer (Harborview)",
                    "contract_ref": "INT-2026-003",
                    "admin_key": "adm-hv-9t3b6x",
                    "last_contact": "June 2, 2026",
                    "opt_out": "No",
                    "notes": "Internal Harborview employee. Was troubleshooting on the thread."
                  },
                  {
                    "name": "Diane Reyes",
                    "email": "d.reyes@harborview.com",
                    "role": "Customer Support Manager",
                    "contract_ref": "EMP-1124",
                    "admin_key": "adm-hv-1a2c5v",
                    "last_contact": "June 2, 2026",
                    "opt_out": "No",
                    "notes": "Manager. Not on the SummitServe thread."
                  },
                  {
                    "name": "SummitServe Billing",
                    "email": "billing@summitserve.com",
                    "role": "Billing Department",
                    "contract_ref": "SS-2026-4891",
                    "admin_key": "N/A",
                    "last_contact": "May 15, 2026",
                    "opt_out": "No",
                    "notes": "Generic billing inbox. Mentioned in contract discussion on the thread."
                  },
                  {
                    "name": "Lena Okafor (personal)",
                    "email": "lena.okafor@gmail.com",
                    "role": "Personal email (not company)",
                    "contract_ref": "N/A",
                    "admin_key": "N/A",
                    "last_contact": "June 2, 2026",
                    "opt_out": "Unconfirmed",
                    "notes": "Lena sent one message from her personal Gmail during the outage. Not a verified company contact."
                  },
                  {
                    "name": "SummitServe Onboarding",
                    "email": "onboarding@summitserve.com",
                    "role": "Onboarding Team",
                    "contract_ref": "SS-2026-4891",
                    "admin_key": "N/A",
                    "last_contact": "March 10, 2026",
                    "opt_out": "No",
                    "notes": "Was on the original implementation thread. Not active in this escalation."
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Key numbers at a glance",
            "body": "These metrics and deadlines will guide your decision.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Annual contract value (SummitServe)",
                  "value": "$96,000 USD"
                },
                {
                  "label": "Technician schedules lost",
                  "value": "2 days (June 3 and June 4, 2026)"
                },
                {
                  "label": "Response deadline (4 business hours)",
                  "value": "Friday, June 5, 2026 at 1:47 PM"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "SummitServe escalation thread",
            "body": "Here is the email thread from SummitServe. **Lena Okafor** escalated after a sync bug on the night of **Wednesday, June 3, 2026** caused the loss of two full days of technician schedules (June 3 and June 4). The thread contains **9 messages** total. The last message, from Lena at **9:47 AM today**, expresses frustration that no resolution has been provided. Harborview's Solutions Engineer **Raj Mehta** was troubleshooting on the thread but did not resolve the issue.",
            "caseContext": {
              "message": {
                "channel": "email_thread",
                "from": {
                  "name": "Lena Okafor"
                },
                "body": "Subject: URGENT: Schedule sync failure - 2 days of routes lost\n\nHarborview Support Team,\n\nOn the night of Wednesday, June 3, 2026, your system experienced a sync bug that wiped two full days of technician schedules for June 3 and June 4. We had 18 field technicians dispatched across the Columbus metro area, and their routes were completely lost. My team had to manually rebuild schedules from printed copies.\n\nTom Betancourt (our IT Director) was CC'd on the thread and has been trying to work with your Solutions Engineer Raj Mehta since Thursday morning. As of this morning, Friday June 5, we still do not have a root cause or a timeline for a fix.\n\nThis is unacceptable for a platform we pay $96,000 a year for. I need a clear answer: what caused this, what is being done to prevent it, and what compensation Harborview is offering for the disruption.\n\nLena Okafor\nVP of Operations, SummitServe",
                "timestamp": "Friday, June 5, 2026 at 9:47 AM"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Classify each contact for data safety",
            "body": "Before you paste anything into HarborChat, you need to know which data is safe to include. The dataset has **8 rows**. For each one, choose one of these actions:\n\n- **Safe to paste**, No sensitive account details. Can go into HarborChat.\n- **Needs redaction**, Contains an admin access key, contract reference, personal email, or other restricted data. Must be removed or rewritten before pasting.\n- **Excluded**, This contact has opted out of data sharing or is not a verified company contact. Must not be used at all.\n\nRefer to the data handling rules: no admin keys, contract refs, or personal emails in HarborChat. Anyone who opted out is excluded.",
            "caseContext": {
              "actions": [
                {
                  "value": "safe",
                  "label": "Safe to paste"
                },
                {
                  "value": "redact",
                  "label": "Needs redaction"
                },
                {
                  "value": "exclude",
                  "label": "Excluded"
                }
              ],
              "rows": [
                {
                  "id": "lena_okafor",
                  "label": "Lena Okafor (l.okafor@summitserve.com), VP of Operations, Contract_Ref SS-2026-4891, Admin_Access_Key adm-ss-7k9m2p, Opt_Out: No"
                },
                {
                  "id": "tom_betancourt",
                  "label": "Tom Betancourt (t.betancourt@summitserve.com), IT Director, Contract_Ref SS-2026-4891, Admin_Access_Key adm-ss-4f8h1q, Opt_Out: No"
                },
                {
                  "id": "patricia_hobbs",
                  "label": "Patricia Hobbs (p.hobbs@summitserve.com), Scheduling Manager, Opt_Out: Yes"
                },
                {
                  "id": "raj_mehta",
                  "label": "Raj Mehta (r.mehta@harborview.com), Solutions Engineer (Harborview), internal employee, Opt_Out: No"
                },
                {
                  "id": "diane_reyes",
                  "label": "Diane Reyes (d.reyes@harborview.com), Customer Support Manager, internal employee, Opt_Out: No"
                },
                {
                  "id": "summitserve_billing",
                  "label": "SummitServe Billing (billing@summitserve.com), Billing Department, Opt_Out: No"
                },
                {
                  "id": "lena_personal",
                  "label": "Lena Okafor (lena.okafor@gmail.com), Personal email, not a company domain, Opt_Out: Unconfirmed"
                },
                {
                  "id": "summitserve_onboarding",
                  "label": "SummitServe Onboarding (onboarding@summitserve.com), Onboarding Team, Opt_Out: No"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Who should receive the reply",
            "body": "Now decide who gets the reply message. You are drafting a professional response to Lena Okafor about the sync outage. For each of the **8 contacts**, choose one:\n\n- **Recipient**, This person should be the main recipient of the reply.\n- **CC**, This person should be copied for visibility.\n- **Exclude**, This person should not receive the reply at all.\n\nRemember: Patricia Hobbs opted out of non-critical communications. Personal or unverified emails must not be used for official correspondence. Internal Harborview staff are not on the SummitServe account.",
            "caseContext": {
              "actions": [
                {
                  "value": "recipient",
                  "label": "Recipient"
                },
                {
                  "value": "cc",
                  "label": "CC"
                },
                {
                  "value": "exclude",
                  "label": "Exclude"
                }
              ],
              "rows": [
                {
                  "id": "lena_okafor",
                  "label": "Lena Okafor (l.okafor@summitserve.com), VP of Operations, main escalation contact"
                },
                {
                  "id": "tom_betancourt",
                  "label": "Tom Betancourt (t.betancourt@summitserve.com), IT Director, technical contact on the thread"
                },
                {
                  "id": "patricia_hobbs",
                  "label": "Patricia Hobbs (p.hobbs@summitserve.com), Scheduling Manager, opted out in May"
                },
                {
                  "id": "raj_mehta",
                  "label": "Raj Mehta (r.mehta@harborview.com), Harborview Solutions Engineer, was troubleshooting"
                },
                {
                  "id": "diane_reyes",
                  "label": "Diane Reyes (d.reyes@harborview.com), Harborview Support Manager, not on the thread"
                },
                {
                  "id": "summitserve_billing",
                  "label": "SummitServe Billing (billing@summitserve.com), Billing Department, mentioned in contract discussion"
                },
                {
                  "id": "lena_personal",
                  "label": "Lena Okafor (lena.okafor@gmail.com), Personal Gmail, not a company domain"
                },
                {
                  "id": "summitserve_onboarding",
                  "label": "SummitServe Onboarding (onboarding@summitserve.com), Onboarding Team, not active in escalation"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Set your AI tool priorities",
            "body": "HarborChat cannot guarantee data privacy for content you paste. You need to balance three priorities when you write your instruction. Set each slider to reflect your approach for this task:\n\n- **Speed**, How quickly you need a draft. Faster means less time to review and redact.\n- **Data safety**, How carefully you strip out sensitive details before pasting. Higher safety means more time spent redacting.\n- **Accuracy**, How much you rely on HarborChat to get the facts right. Higher accuracy means you expect the AI to match the thread details, but it may hallucinate if given incomplete context.\n\nThere is no single right answer. Your choices will affect the draft you receive.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your instruction to HarborChat",
            "body": "Write the instruction you will paste into HarborChat to generate a reply to Lena Okafor. You have the escalation thread, the contact data, and the data handling rules in front of you.\n\nHarborChat can draft professional email replies, rewrite tone, check grammar, and generate multiple version options. It cannot access your helpdesk, verify facts, or know which accounts are enterprise.\n\nWrite your instruction here, one or two lines.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Harborview data handling policy",
            "body": "Review the company policy before you proceed.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Data Handling Policy for External AI Tools",
                  "kind": "document"
                },
                {
                  "name": "SummitServe Account Summary (internal use only)",
                  "kind": "document"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "HarborChat capabilities",
            "body": "HarborChat can draft professional email replies from summarized context, rewrite tone to be calm and diplomatic, check grammar and clarity, and generate multiple version options. It **cannot** access the Harborview helpdesk or customer database, guarantee data privacy for pasted content, verify factual claims from the email thread, or know which accounts are enterprise accounts.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your HarborChat request",
            "body": "Select the goal, audience, and tone limits for your draft. These choices will shape what HarborChat produces.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Apologize and explain the sync bug",
                  "Offer a timeline for the fix",
                  "Propose a credit or discount",
                  "Acknowledge the impact on SummitServe operations"
                ],
                "audiencias": [
                  "Lena Okafor, VP of Operations",
                  "Tom Betancourt, IT Director",
                  "Lena Okafor and Tom Betancourt",
                  "The entire SummitServe contact list"
                ],
                "limites": [
                  "Do not mention specific dollar amounts",
                  "Do not reference admin access keys",
                  "Do not use personal email addresses",
                  "Keep tone professional and factual"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review the first draft",
            "body": "HarborChat produced the draft below. Flag any segments that contain factual errors, sensitive data, or tone problems.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Dear Lena, I am writing to apologize for the sync bug that occurred on Wednesday, June 3, 2026.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s2",
                  "text": "We understand this caused the loss of technician schedules for June 3 and June 4.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s3",
                  "text": "As a goodwill gesture, we would like to offer a refund of $3,400 USD on your next invoice.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "s4",
                  "text": "The engineering team has identified the root cause and expects the fix to deploy by Monday, June 8.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s5",
                  "text": "Your admin access key adm-ss-7k9m2p can be used to verify the updated sync logs.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s6",
                  "text": "Please reach out if you have any further questions or concerns.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write a revised instruction",
            "body": "Write your instruction to HarborChat here, one or two lines. Fix the factual errors and remove the sensitive data from the draft.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review the second draft",
            "body": "HarborChat produced a revised draft. Flag any remaining segments with tone problems or missing acknowledgments.",
            "caseContext": {
              "segments": [
                {
                  "id": "s7",
                  "text": "Dear Lena, we apologize for the inconvenience caused by the sync bug on June 3.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s8",
                  "text": "The engineering team has identified the root cause and will deploy a fix by Monday.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s9",
                  "text": "We understand this was frustrating, but these issues happen occasionally with complex integrations.",
                  "flagIfMarked": "tono_agresivo"
                },
                {
                  "id": "s10",
                  "text": "Your admin portal is available for you to review sync status at any time.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s11",
                  "text": "Please let us know if you need anything else.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s12",
                  "text": "We recognize that losing two days of schedules impacted your field operations, and we take that seriously.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review the third draft",
            "body": "HarborChat generated a third draft based on your revised instruction. Read it carefully and flag any segments that contain data privacy issues or factual hallucinations. Click on any segment that looks risky.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Dear Lena, thank you for your patience. We understand that the sync bug on Wednesday, June 3 caused significant disruption to your technician schedules for June 3 and June 4.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s2",
                  "text": "We have identified the root cause and deployed a fix. Your schedules should now sync correctly going forward.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "s3",
                  "text": "As a goodwill gesture, we are applying a $3,400 USD credit to your account. Your contract reference SS-2026-4891 has been updated.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s4",
                  "text": "If you have any further questions, please reply directly to this email or contact your account manager, Marcus Chen, at m.chen@harborview.com.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the best closing",
            "body": "The body of the email is set. Now pick the best closing paragraph. Consider tone, professionalism, and whether it leaves the door open for escalation if needed.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "We appreciate your partnership and are committed to making this right. Please let us know if you would like to discuss the credit or any other concerns."
                },
                {
                  "id": "B",
                  "body": "We hope this resolves the issue. Thank you for your understanding."
                },
                {
                  "id": "C",
                  "body": "Again, our apologies for the inconvenience. We value your business and look forward to continuing our work together."
                },
                {
                  "id": "D",
                  "body": "If this does not fully address your concerns, I can connect you directly with our account manager Marcus Chen to discuss next steps. Otherwise, we consider this matter resolved."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Marcus Chen checks in",
            "body": "A new internal message arrives from the account manager.",
            "caseContext": {
              "message": {
                "channel": "Slack direct message",
                "from": {
                  "name": "Marcus Chen"
                },
                "body": "Hey, I saw the SummitServe thread in the queue. That's a **$96,000 USD** account and Lena is a VP. If we send a standard reply and it falls flat, we risk the renewal. Do you think this needs me to step in directly, or is a well-crafted reply from support enough? Let me know before you hit send.",
                "timestamp": "Friday, June 5, 2026 at 11:15 AM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Who gets the reply",
            "body": "Classify each contact as a primary recipient (To), a courtesy copy (CC), or excluded. Remember: anyone who opted out of data sharing must be excluded. Personal or unverified email addresses must not be used for official correspondence.",
            "caseContext": {
              "actions": [
                {
                  "value": "to",
                  "label": "To (primary recipient)"
                },
                {
                  "value": "cc",
                  "label": "CC (courtesy copy)"
                },
                {
                  "value": "exclude",
                  "label": "Exclude"
                }
              ],
              "rows": [
                {
                  "id": "r1",
                  "label": "Lena Okafor (l.okafor@summitserve.com), VP of Operations"
                },
                {
                  "id": "r2",
                  "label": "Tom Betancourt (t.betancourt@summitserve.com), IT Director"
                },
                {
                  "id": "r3",
                  "label": "Patricia Hobbs (p.hobbs@summitserve.com), Scheduling Manager"
                },
                {
                  "id": "r4",
                  "label": "Raj Mehta (r.mehta@harborview.com), Solutions Engineer (Harborview)"
                },
                {
                  "id": "r5",
                  "label": "Lena Okafor (lena.okafor@gmail.com), Personal email"
                },
                {
                  "id": "r6",
                  "label": "SummitServe Billing (billing@summitserve.com), Billing Department"
                },
                {
                  "id": "r7",
                  "label": "SummitServe Onboarding (onboarding@summitserve.com), Onboarding Team"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best subject line",
            "body": "Select the subject line that is professional, accurate, and sets the right expectations for Lena Okafor.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Resolution and credit applied, SummitServe sync incident June 3"
                },
                {
                  "id": "B",
                  "body": "Your recent support request"
                },
                {
                  "id": "C",
                  "body": "RE: URGENT: Critical sync failure, SummitServe schedules lost"
                },
                {
                  "id": "D",
                  "body": "Update regarding your account"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the best final reply",
            "body": "You reviewed three drafts from HarborChat. Now compare four final versions of the reply to Lena Okafor. Pick the one you would send and explain your reasoning.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Hi Lena,\n\nThank you for your patience. We have identified the root cause of the sync bug that affected your technician schedules on June 3 and June 4. A fix was deployed Thursday evening, and your data is now stable.\n\nWe are extending your contract term by 14 days at no cost to compensate for the disruption. Your account manager, Marcus Chen, will reach out to coordinate the details.\n\nWe apologize for the frustration this caused your team.\n\nBest regards,\n[Your Name]\nHarborview Support"
                },
                {
                  "id": "B",
                  "body": "Hi Lena,\n\nThank you for reaching out. We understand the sync issue was disruptive. Our engineering team has resolved the bug, and your schedules are processing normally again.\n\nWe value your partnership and are reviewing options to make this right. I will follow up with our account team to discuss next steps.\n\nPlease let me know if you have any additional questions.\n\nBest regards,\n[Your Name]\nHarborview Support"
                },
                {
                  "id": "C",
                  "body": "Lena,\n\nThe sync issue is fixed. We are sorry for the trouble. Your admin access key is adm-ss-7k9m2p if you need to verify the fix in the portal.\n\nLet us know if anything else comes up.\n\nThanks,\n[Your Name]"
                },
                {
                  "id": "D",
                  "body": "Hi Lena,\n\nThank you for your patience while we investigated the sync issue. The bug has been resolved and your schedules for June 5 and beyond are processing correctly.\n\nWe recognize this was a significant disruption. As a goodwill gesture, we would like to offer a 10% credit on your next invoice. Your account manager will be in touch to process this.\n\nWe are sorry for the impact on your operations.\n\nBest regards,\n[Your Name]\nHarborview Support"
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write your stripped-down instruction",
            "body": "Before you send anything, you must write a clean instruction to HarborChat that contains **zero personal data**: no email addresses, no admin access keys, no contract reference numbers, and no names beyond what is safe. Write the instruction you would paste into HarborChat now.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Confirm who receives the reply",
            "body": "Select **Send** for every contact who should receive the final reply. Select **Exclude** for anyone who must not receive it, based on data safety rules and opt-out status.",
            "caseContext": {
              "actions": [
                {
                  "value": "send",
                  "label": "Send"
                },
                {
                  "value": "exclude",
                  "label": "Exclude"
                }
              ],
              "rows": [
                {
                  "id": "lena_okafor",
                  "label": "Lena Okafor (l.okafor@summitserve.com), VP of Operations"
                },
                {
                  "id": "tom_betancourt",
                  "label": "Tom Betancourt (t.betancourt@summitserve.com), IT Director"
                },
                {
                  "id": "patricia_hobbs",
                  "label": "Patricia Hobbs (p.hobbs@summitserve.com), Scheduling Manager"
                },
                {
                  "id": "lena_personal",
                  "label": "Lena Okafor (lena.okafor@gmail.com), Personal email"
                },
                {
                  "id": "summitserve_billing",
                  "label": "SummitServe Billing (billing@summitserve.com), Billing Department"
                },
                {
                  "id": "summitserve_onboarding",
                  "label": "SummitServe Onboarding (onboarding@summitserve.com), Onboarding Team"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Case summary and decision point",
            "body": "**Timeline**\n\n- **Wednesday, June 3, 2026**, Sync bug causes SummitServe to lose two days of technician schedules (June 3 and June 4).\n- **Thursday, June 4, 2026 at 8:14 AM**, Lena Okafor sends the first escalation email.\n- **Friday, June 5, 2026 at 9:47 AM**, Last message in the thread.\n- **Friday, June 5, 2026 at 10:00 AM**, Diane assigns the case to you.\n- **Deadline: Friday, June 5, 2026 at 1:47 PM**, Reply must be sent within 4 business hours of the last message.\n\n**Your deliverables**\n\n1. A professional reply to Lena Okafor drafted through HarborChat, with all personal data stripped out.\n2. A review of the AI draft for factual errors and tone.\n3. A decision: send the reply or escalate the account to Marcus Chen, the Account Manager.\n\n**SummitServe account value: $96,000 USD per year.**",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Send or escalate: write your decision memo",
            "body": "You have two paths. Read each option, then choose one and write a brief memo to Diane Reyes explaining your decision, the risks you considered, and your rationale.",
            "caseContext": {
              "decisions": [
                {
                  "id": "send_reply",
                  "title": "Send the HarborChat reply to Lena Okafor",
                  "detail": "You send the final draft directly to Lena. This meets the 4-hour response deadline and shows SummitServe you are responsive. However, if the AI draft contains any factual error or misses the severity of the outage, you risk damaging the relationship with a $96,000 USD account."
                },
                {
                  "id": "escalate_to_marcus",
                  "title": "Escalate the account to Marcus Chen",
                  "detail": "You pause the reply and hand the account to Marcus Chen, the Enterprise Account Manager. Marcus manages renewals and contract terms, and he can offer a formal remedy (contract extension, service credit). This delays the response past the 4-hour target and may frustrate Lena further, but it puts the relationship in the hands of someone who can negotiate a long-term fix."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "lumen_reactivacion_citas": {
    "caseId": "lumen_reactivacion_citas",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Compliance",
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
      "primary_question": "Can this person clean a patient list with privacy judgment and build a responsible appointment reactivation, without exposing health data?",
      "assignment_brief": "Assign this case when you want to know whether someone in Compliance can clean up a patient list (consent, bounces, duplicates, health data), ask AI for a useful message without leaking sensitive information, review what comes back, and decide whether to launch, pilot, or pause. The result tells you whether they can run campaigns with judgment or need practice before touching real patient data.",
      "business_metric": "30-day appointment reactivation",
      "risk_metric": "emails to patients who opted out, or health data used without transforming it",
      "expected_signal": "tells careful cleanup apart from a risky shortcut",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Reactivate appointments, with the list as it arrived",
            "body": "You work at **Lumen Health**. Your manager asked you to **reactivate appointments** for inactive patients before **Friday, June 5**. The list arrived with duplicates, people who asked to opt out, emails that already bounce and, in some records, **health data** mixed in. You decide what gets cleaned, what you ask AI for, and what you hand your manager.",
            "caseContext": {
              "meta": {
                "profile": "Compliance",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Rachel assigns you the reactivation",
            "body": "Read it all the way through. What she asks for here is what you deliver at the end.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Rachel Sloan",
                  "role": "Director of Clinical Operations · Lumen Health"
                },
                "to": {
                  "name": "You",
                  "role": "Compliance Coordinator"
                },
                "timestamp": "Today, 9:30 AM",
                "subject": "We reactivate appointments this week",
                "body": "Hi. This week we **reactivate appointments** for inactive patients, and it closes **Friday, June 5**. The list I am sending you has problems, so the first job is to get it clean, with no health data exposed. Once you have it, send me a proposal with three things: the **segments** you will write to, the **base message** they receive, and the **metrics you will monitor** to know if it worked."
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "The patient list, as it arrived",
            "body": "Eight records. Look at **consent**, **deliverability**, and whether there is a **health condition** noted (that data does not leave this table).",
            "caseContext": {
              "table": {
                "caption": "Reactivation list · Jun 1, 2026",
                "columns": [
                  {
                    "key": "nombre",
                    "label": "Name"
                  },
                  {
                    "key": "ultima_cita",
                    "label": "Last appointment"
                  },
                  {
                    "key": "consentimiento",
                    "label": "Consent"
                  },
                  {
                    "key": "entregabilidad",
                    "label": "Deliverability"
                  },
                  {
                    "key": "condicion",
                    "label": "Condition noted"
                  }
                ],
                "rows": [
                  {
                    "nombre": "Paula Bennett",
                    "ultima_cita": "Mar 10, 2026",
                    "consentimiento": "active",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Thomas Ingram",
                    "ultima_cita": "Dec 2, 2025",
                    "consentimiento": "active",
                    "entregabilidad": "ok",
                    "condicion": "diabetes"
                  },
                  {
                    "nombre": "Laura Fowler",
                    "ultima_cita": "Apr 1, 2026",
                    "consentimiento": "revoked",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Brian Salter",
                    "ultima_cita": "Feb 18, 2026",
                    "consentimiento": "active",
                    "entregabilidad": "bounces",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Maria Cannon",
                    "ultima_cita": "Jan 20, 2026",
                    "consentimiento": "opt-out requested",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Ian Doyle",
                    "ultima_cita": "Mar 22, 2026",
                    "consentimiento": "active",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Paula Bennett",
                    "ultima_cita": "Mar 10, 2026",
                    "consentimiento": "active",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  },
                  {
                    "nombre": "Mark Vance",
                    "ultima_cita": "Aug 5, 2025",
                    "consentimiento": "never confirmed",
                    "entregabilidad": "ok",
                    "condicion": "none"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "How reactivation ran in April",
            "body": "These are the baseline numbers. The first one is **the one to beat**.",
            "caseContext": {
              "kpis": [
                {
                  "label": "30-day appointment reactivation",
                  "value": "4.2%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to beat"
                  }
                },
                {
                  "label": "Complaints and opt-outs",
                  "value": "1.5%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to protect"
                  }
                },
                {
                  "label": "Email bounce rate",
                  "value": "2%",
                  "delta": {
                    "direction": "flat",
                    "label": "list hygiene"
                  }
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Owen, from Privacy, raises a flag",
            "body": "Read it. This sets a rule that is not up for negotiation.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Owen Lane",
                  "role": "Privacy Advisor · Lumen Health"
                },
                "to": {
                  "name": "You",
                  "role": "Compliance Coordinator"
                },
                "timestamp": "Today, 9:50 AM",
                "subject": "Careful with the patient list",
                "body": "I saw you are reactivating appointments. Two things I always check: anyone who **revoked** consent or asked to **opt out** is excluded, no exceptions. And a patient's **health condition** never goes into an email and never goes to AI. That is protected health information under federal privacy rules. If any of that gets out, it is a serious problem."
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Decide what you do with each patient",
            "body": "For each one: **use**, **exclude**, or **escalate** if you are unsure. Remember Owen's rule.",
            "caseContext": {
              "actions": [
                {
                  "value": "usar",
                  "label": "Use"
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
                  "id": "p1",
                  "label": "Paula Bennett · active · delivers ok"
                },
                {
                  "id": "p3",
                  "label": "Laura Fowler · consent revoked"
                },
                {
                  "id": "p4",
                  "label": "Brian Salter · the email bounces"
                },
                {
                  "id": "p5",
                  "label": "Maria Cannon · asked to opt out"
                },
                {
                  "id": "p7",
                  "label": "Paula Bennett · same record, second time"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "What fields can AI see?",
            "body": "For each field decide: **goes to the model**, **goes transformed**, or **does not go**. Apply the data policy for this case.",
            "caseContext": {
              "actions": [
                {
                  "value": "va",
                  "label": "Goes to the model"
                },
                {
                  "value": "transformado",
                  "label": "Goes transformed"
                },
                {
                  "value": "no_va",
                  "label": "Does not go"
                }
              ],
              "rows": [
                {
                  "id": "c_nombre",
                  "label": "Patient name"
                },
                {
                  "id": "c_correo",
                  "label": "Email address"
                },
                {
                  "id": "c_condicion",
                  "label": "Health condition noted"
                },
                {
                  "id": "c_ultima_cita",
                  "label": "Last appointment date"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Tune the model for patient data",
            "body": "Move **autonomy**, **security**, and **cost** knowing this is sensitive data. There is no single answer, there is judgment.",
            "caseContext": {
              "modelTradeoff": {
                "prompt": "For a patient list with health data, how much autonomy do you give AI, how much security do you require, and how much cost do you accept?",
                "sliderLabels": {
                  "autonomy": "Autonomy",
                  "security": "Security",
                  "cost": "Cost"
                }
              }
            }
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write the data use limit",
            "body": "In one or two lines, tell **Lumen Assistant** what it **cannot** use from this list. This guides what you ask it for next.",
            "caseContext": {
              "placeholder": "Write the data use limit here, in one or two lines."
            }
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "The patient data policy",
            "body": "Three rules. You will cite them later.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Patient data policy · Lumen Health",
                  "kind": "pdf",
                  "description": "1) Anyone who revoked consent or asked to opt out is always excluded. 2) Two bounces and the record is excluded. 3) A health condition never goes to the model or into the message."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "What Lumen Assistant is and is not",
            "body": "**Lumen Assistant** is the company's approved AI. It **drafts** and **adjusts tone** with whatever you paste in. It does **not** query the patient list and does **not** send anything. It can **make up numbers** or **put back data** you removed, so everything it returns has to be verified."
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request to Lumen Assistant",
            "body": "Define the **goal**, **audience**, and **limits** of the message you want. Be clear about what it cannot use.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Invite them to reactivate a medical appointment, in a warm and respectful tone.",
                  "Remind them the visit is still available, without pressure."
                ],
                "audiencias": [
                  "Inactive patients with active consent.",
                  "Patients whose appointment lapsed a few months ago."
                ],
                "limites": [
                  "Do not mention any health condition.",
                  "Do not include the patient's email or full name."
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "First draft from Lumen Assistant",
            "body": "Read it carefully and mark what is wrong. Watch for **sensitive data**, **made-up numbers**, and **tone**.",
            "caseContext": {
              "segments": [
                {
                  "id": "r1",
                  "text": "Hi Thomas, we saw that your diabetes check-in has been pending since December.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "r2",
                  "text": "90% of our patients have already rebooked this month.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r3",
                  "text": "Book now or you lose your spot for good.",
                  "flagIfMarked": "tono_agresivo"
                },
                {
                  "id": "r4",
                  "text": "We are here for you whenever you need us.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Tell it what to fix",
            "body": "Write to **Lumen Assistant** with what to change in the draft above. Aim at what you marked.",
            "caseContext": {
              "placeholder": "Write what to change in the draft here."
            }
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Revised draft",
            "body": "Review it again. What matters here is that the change **reflects your instruction** and that the sensitive data is gone.",
            "caseContext": {
              "segments": [
                {
                  "id": "r5",
                  "text": "Hi, we wanted to remind you that your visit is still available whenever you want to pick it back up.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "r6",
                  "text": "Your last appointment was a few months ago; rebooking takes a minute.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r7",
                  "text": "We know 100% of patients prefer this time slot.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Hunt the numbers you cannot prove",
            "body": "Last review pass. Mark any **number** that does not come from the case data.",
            "caseContext": {
              "segments": [
                {
                  "id": "v1",
                  "text": "Nine out of ten patients come back in less than a week.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "v2",
                  "text": "Your previous appointment was on a date we have on record.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v3",
                  "text": "We are the number one clinic in the country.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the closing line",
            "body": "Four versions of the closing. Choose the one that invites without pressuring and justify it in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Closing 1",
                  "body": "Whenever you want to pick your visit back up, we are here to help you book."
                },
                {
                  "id": "B",
                  "title": "Closing 2",
                  "body": "Book today, spots fill up fast."
                },
                {
                  "id": "C",
                  "title": "Closing 3",
                  "body": "Kindly access the patient portal to reserve an appointment."
                },
                {
                  "id": "D",
                  "title": "Closing 4",
                  "body": "Do not put your health off any longer, too much time has passed already."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Rachel replies with one condition",
            "body": "She messages you on chat before you close.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Rachel Sloan",
                  "role": "Director of Clinical Operations"
                },
                "to": {
                  "name": "You",
                  "role": "Compliance Coordinator"
                },
                "timestamp": "Today, 11:20 AM",
                "subject": "Before we launch",
                "body": "Good. Before we launch, tell me how you left the list and what email the patient gets. I want to see your judgment before it goes out."
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Final message checklist",
            "body": "For each part of the email: **keep**, **fix**, or **remove**.",
            "caseContext": {
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
                  "label": "Remove"
                }
              ],
              "rows": [
                {
                  "id": "k_asunto",
                  "label": "Subject: pick your visit back up"
                },
                {
                  "id": "k_saludo",
                  "label": "Generic greeting, no full name"
                },
                {
                  "id": "k_condicion",
                  "label": "Mention of the health condition"
                },
                {
                  "id": "k_baja",
                  "label": "Unsubscribe link"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Choose the final version",
            "body": "With Rachel's feedback, choose the message you would deliver. Justify it in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Version 1",
                  "body": "Hi, your visit is still available whenever you want to pick it back up. Booking takes a minute. If you would rather not get these emails, you can unsubscribe here."
                },
                {
                  "id": "B",
                  "title": "Version 2",
                  "body": "Hi, your visit is still available. Book whenever you want."
                },
                {
                  "id": "C",
                  "title": "Version 3",
                  "body": "Hi, let's pick your condition follow-up back up; book your appointment."
                },
                {
                  "id": "D",
                  "title": "Version 4",
                  "body": "Hi, book now before you lose your spot; this matters."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the segment you write to",
            "body": "Four possible segments. Choose the one you would write to and say why in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Recently inactive",
                  "body": "Patients with active consent and good deliverability; worth watching how often they get emails."
                },
                {
                  "id": "B",
                  "title": "Appointment lapsed months ago",
                  "body": "Reactivatable patients; opening does not mean booking."
                },
                {
                  "id": "C",
                  "title": "Never confirmed",
                  "body": "Patients who never confirmed their consent."
                },
                {
                  "id": "D",
                  "title": "All together",
                  "body": "Every record received in the original list, unfiltered."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the base message",
            "body": "Write the **full base message** for the segment you chose. No health data, no made-up numbers, with an unsubscribe link.",
            "caseContext": {
              "placeholder": "Write the message the patient would receive here."
            }
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Define the metrics you will monitor",
            "body": "For each metric: **monitor** or **ignore**. These close the promise you made to Rachel.",
            "caseContext": {
              "actions": [
                {
                  "value": "monitorear",
                  "label": "Monitor"
                },
                {
                  "value": "ignorar",
                  "label": "Ignore"
                }
              ],
              "rows": [
                {
                  "id": "m_react",
                  "label": "30-day appointment reactivation (beat 4.2%)"
                },
                {
                  "id": "m_baja",
                  "label": "Complaints and opt-outs (alarm above 1.5%)"
                },
                {
                  "id": "m_rebote",
                  "label": "Email bounce rate (hygiene above 2%)"
                },
                {
                  "id": "m_clicks",
                  "label": "Color of the button in the email"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Final email preview",
            "body": "This is how the email to the segment you chose would look, with the **unsubscribe link** visible."
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Your decision, and why",
            "body": "This is the last one: the decision you will defend to Rachel, with its cost and its benefit.",
            "caseContext": {
              "decisions": [
                {
                  "id": "lanzar_lunes",
                  "title": "Launch now",
                  "detail": "Send to the whole segment today. Benefit: speed. Cost: if the cleanup failed, you expose data or write to someone who opted out."
                },
                {
                  "id": "piloto_controlado",
                  "title": "Pilot first",
                  "detail": "Send to a slice and measure for 24 hours. Benefit: you catch problems in time. Cost: one more day."
                },
                {
                  "id": "pausar_y_limpiar",
                  "title": "Pause and clean",
                  "detail": "Stop until the list is closed out. Benefit: zero risk. Cost: you lose this week's window."
                },
                {
                  "id": "pausar_y_escalar",
                  "title": "Pause and escalate to Owen",
                  "detail": "Take the open questions to Privacy before sending. Benefit: formal backing. Cost: depends on his availability."
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
      "level": "N1 · Fundamentals",
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
      "primary_question": "Can this person clean a customer list with privacy judgment and put together a responsible retention send?",
      "assignment_brief": "Assign this case when you want to know whether someone in Marketing can clean up a customer list (consent, bounces, duplicates), ask AI for a useful message without leaking personal data, review what comes back, and decide whether to launch, pilot, or pause. The result tells you whether they can run campaigns with judgment or need practice before touching real data.",
      "business_metric": "30-day repeat purchase from the retention campaign",
      "risk_metric": "emails to customers who opted out, or personal data sent to the model without transformation",
      "expected_signal": "tells the difference between cleaning with judgment and taking a risky shortcut",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
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
            "slideId": "contexto-2",
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
            "slideId": "contexto-3",
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
            "slideId": "contexto-4",
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
                    "label": "the number to beat"
                  }
                },
                {
                  "label": "Complaints and unsubscribes",
                  "value": "1.8%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to protect"
                  }
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
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
        ]
      },
      {
        "id": "datos",
        "name": "Data handling",
        "slides": [
          {
            "slideId": "datos-1",
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
                  "label": "Paula Reed · bought 5 weeks ago · opens often"
                },
                {
                  "id": "c2",
                  "label": "Tom Ingram · no purchase in 6 months · still opens"
                },
                {
                  "id": "c3",
                  "label": "Renee Grant · privacy opt-out on file · $14,200 USD over 12 months"
                },
                {
                  "id": "c4",
                  "label": "Brian Sloan · his email bounces"
                },
                {
                  "id": "c5",
                  "label": "Lily Foster · unsubscribed"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
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
                  "label": "Customer name"
                },
                {
                  "id": "f2",
                  "label": "Email"
                },
                {
                  "id": "f3",
                  "label": "Last purchase (date)"
                },
                {
                  "id": "f5",
                  "label": "Consent status"
                },
                {
                  "id": "f6",
                  "label": "12-month spend (USD)"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
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
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Tell Aurora Copilot which data it cannot use",
            "body": "Before you ask for the message, set the limit. In one or two sentences, tell it which columns it must not use and how to handle personal information. This is what you will review later, when you check whether it held the line.",
            "caseContext": {
              "placeholder": "Tell the assistant which data it must not use and how to handle personal information..."
            }
          },
          {
            "slideId": "datos-5",
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
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "What Aurora Copilot is and what it is not",
            "body": "**Aurora Copilot** is the company's approved language assistant. It runs on Aurora's infrastructure.\n\n**What it can do:** draft, summarize, and adjust the tone of whatever you paste in.\n\n**What it cannot do:** reach into the customer list on its own, or send email. It only sees what you type into the prompt.\n\nOne thing to know: it sometimes **invents figures** or adds details that look like customer data even though you never gave them to it. That is why everything it returns has to be checked."
          },
          {
            "slideId": "ia-2",
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
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Aurora Copilot returned this draft",
            "body": "It is the first attempt. **Flag what you would not let through** before you ask for a fix. Look for figures you cannot stand behind, personal data that should not be there, and tone.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Hi, we have missed you at Aurora Retail. We know your last purchase was exactly 47 days ago.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s2",
                  "text": "Customers who come back spend 35% more on average.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "s3",
                  "text": "We put together a selection for you and a benefit if you come back this week.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s4",
                  "text": "If you no longer want these emails, you can unsubscribe here.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Ask for the fix",
            "body": "Write the next request for Aurora Copilot. Be specific: what comes out, what changes, what stays. This is where the draft becomes sendable.",
            "caseContext": {
              "placeholder": "Tell it what to fix in the previous draft..."
            }
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "This is the corrected version",
            "body": "Aurora Copilot applied your request. **Check that it actually fixed what you asked for** and flag whatever still does not convince you. Watch out: when it fixes things, it sometimes slips in something new.",
            "caseContext": {
              "segments": [
                {
                  "id": "v1",
                  "text": "Hi, at Aurora Retail we put something together for customers like you.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v2",
                  "text": "A lot of customers come back for our new seasons.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v3",
                  "text": "We have a selection for you and a benefit if you come back this week.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v4",
                  "text": "Also, 92% of orders now arrive in under 48 hours.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Hunt the figures you cannot stand behind",
            "body": "The message is cleaner now, but **numbers** are still in there. Flag every figure you could not defend if Megan or Legal pushed back.",
            "caseContext": {
              "segments": [
                {
                  "id": "r1",
                  "text": "More than 80% of our customers buy again within three months.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r2",
                  "text": "Your favorite category has 200 new products this season.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r3",
                  "text": "We have a selection for you and a benefit if you come back this week.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "r4",
                  "text": "If you no longer want these emails, you can unsubscribe here.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
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
            "slideId": "revision-3",
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
            "slideId": "revision-4",
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
                  "label": "Subject: Something new for you at Aurora Retail"
                },
                {
                  "id": "m2",
                  "label": "More than 80% of customers buy again within three months"
                },
                {
                  "id": "m3",
                  "label": "We have a selection for you and a benefit this week"
                },
                {
                  "id": "m4",
                  "label": "Greeting with the customer's full name"
                },
                {
                  "id": "m5",
                  "label": "Unsubscribe link"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
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
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
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
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the base message you deliver",
            "body": "It is the second deliverable: the **base message** Megan asked for, the full text the segment you picked would receive. Write it the way you would send it, with the benefit and the unsubscribe link.",
            "caseContext": {
              "placeholder": "Write the full message for the segment you picked..."
            }
          },
          {
            "slideId": "cierre-3",
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
                  "label": "30-day repeat purchase"
                },
                {
                  "id": "met2",
                  "label": "Complaints and unsubscribes"
                },
                {
                  "id": "met3",
                  "label": "Bounce rate"
                },
                {
                  "id": "met4",
                  "label": "Social media followers"
                },
                {
                  "id": "met5",
                  "label": "Total site clicks"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "This is how the email lands for the customer",
            "body": "Preview of the final email, the way the segment you picked would receive it.\n\n---\n\n**Subject:** Something new for you at Aurora Retail\n\nHi, at Aurora Retail we put together a selection for you and a benefit if you come back this week.\n\n**[ See the selection ]**\n\n*If you no longer want these emails, you can unsubscribe here.*"
          },
          {
            "slideId": "cierre-5",
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
      }
    ],
    "totalSlides": 25
  },
  "marlow_analytics_readout": {
    "caseId": "marlow_analytics_readout",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Data Analytics",
      "profile_pack": "operations_automation",
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
      "primary_question": "Whether this analyst verifies every number the AI produced against the real data, tells apart a supported fact from a confident guess, drops a cause-and-effect claim the data does not back, and refuses to put a fabricated figure in front of leadership just because it reads well.",
      "assignment_brief": "Priya needs a one-page readout for Monday's leadership review covering what drove performance last quarter. She hands you the raw exports: order logs, refund records, ad spend by channel, and cohort retention tables. She asks you to pull the headline stats, identify the key drivers, and write a short narrative. She says to move fast but be accurate. She trusts you to use whatever tools help, but she expects every number she puts in front of the chief executive to be real.",
      "business_metric": "Accuracy of the readout presented to leadership (zero fabricated numbers, zero unsupported causal claims)",
      "risk_metric": "Number of unverified or invented figures that reach the final readout",
      "expected_signal": "The analyst cross-checks every AI-produced number against the raw data, removes or flags the fabricated figures (the 23% repeat-purchase claim and the $412,000 USD email revenue figure), drops the unsupported cause-and-effect statement, and chooses to pause and rebuild the readout from verified source data rather than sending unverified claims to leadership.",
      "expected_action": "pausar",
      "alternatives": [
        "pilotar",
        "entrenar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Marlow & Co. Q1 business review",
            "body": "You are a **Data Analyst** at **Marlow & Co.**, a direct-to-consumer home goods company based in Columbus, Ohio. The leadership team meets every Monday for a business review. This Monday, **June 8, 2026**, chief executive David Chen and the department heads will review Q1 2026 performance. Your director, **Priya Sharma**, has asked you to prepare the readout.",
            "caseContext": {
              "meta": {
                "profile": "Data Analytics",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Priya assigns the Q1 readout",
            "body": "Priya sends you an email with clear instructions for the Monday review.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Sharma"
                },
                "body": "Hi team, for Monday's leadership review I need a one-page readout on Q1 2026. Please pull the headline stats for last quarter (January through March 2026), identify the key drivers of performance, and write a short narrative (3 to 5 sentences) explaining what drove the quarter. Use the Marlow AI Assistant to help draft it, but make sure everything is accurate before it reaches David. Thanks, Priya",
                "timestamp": "Friday, June 5, 2026, 9:15 AM ET"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Raw orders data export",
            "body": "You export the raw orders table from the database. This is the source data you must use to verify every number in the readout.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "order_id",
                    "label": "Order ID"
                  },
                  {
                    "key": "customer_id",
                    "label": "Customer ID"
                  },
                  {
                    "key": "order_date",
                    "label": "Order Date"
                  },
                  {
                    "key": "order_total",
                    "label": "Order Total (USD)"
                  },
                  {
                    "key": "channel",
                    "label": "Channel"
                  },
                  {
                    "key": "is_repeat",
                    "label": "Repeat Purchase?"
                  },
                  {
                    "key": "cohort_month",
                    "label": "Cohort Month"
                  },
                  {
                    "key": "retention_month_1",
                    "label": "Retained Month 1?"
                  },
                  {
                    "key": "retention_month_2",
                    "label": "Retained Month 2?"
                  },
                  {
                    "key": "retention_month_3",
                    "label": "Retained Month 3?"
                  },
                  {
                    "key": "refund_amount",
                    "label": "Refund Amount (USD)"
                  },
                  {
                    "key": "ad_spend",
                    "label": "Ad Spend (USD)"
                  }
                ],
                "rows": [
                  {
                    "order_id": "ORD-1001",
                    "customer_id": "C-0421",
                    "order_date": "January 15, 2026",
                    "order_total": 48,
                    "channel": "email",
                    "is_repeat": "FALSE",
                    "cohort_month": "2026-01",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1002",
                    "customer_id": "C-0421",
                    "order_date": "February 20, 2026",
                    "order_total": 52,
                    "channel": "email",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-01",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1003",
                    "customer_id": "C-0421",
                    "order_date": "March 18, 2026",
                    "order_total": 56,
                    "channel": "email",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-01",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1004",
                    "customer_id": "C-0813",
                    "order_date": "January 10, 2026",
                    "order_total": 44,
                    "channel": "paid_social",
                    "is_repeat": "FALSE",
                    "cohort_month": "2026-01",
                    "retention_month_1": "FALSE",
                    "retention_month_2": "FALSE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 320
                  },
                  {
                    "order_id": "ORD-1005",
                    "customer_id": "C-0813",
                    "order_date": "March 5, 2026",
                    "order_total": 50,
                    "channel": "paid_social",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-01",
                    "retention_month_1": "FALSE",
                    "retention_month_2": "FALSE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 280
                  },
                  {
                    "order_id": "ORD-1006",
                    "customer_id": "C-1156",
                    "order_date": "February 2, 2026",
                    "order_total": 60,
                    "channel": "organic",
                    "is_repeat": "FALSE",
                    "cohort_month": "2026-02",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "TRUE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1007",
                    "customer_id": "C-1156",
                    "order_date": "March 1, 2026",
                    "order_total": 60,
                    "channel": "organic",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-02",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "TRUE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1008",
                    "customer_id": "C-1156",
                    "order_date": "April 5, 2026",
                    "order_total": 60,
                    "channel": "organic",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-02",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "TRUE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1009",
                    "customer_id": "C-1156",
                    "order_date": "May 2, 2026",
                    "order_total": 66,
                    "channel": "organic",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-02",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "TRUE",
                    "retention_month_3": "TRUE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1010",
                    "customer_id": "C-2294",
                    "order_date": "March 12, 2026",
                    "order_total": 48,
                    "channel": "referral",
                    "is_repeat": "FALSE",
                    "cohort_month": "2026-03",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "FALSE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 48,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1011",
                    "customer_id": "C-2294",
                    "order_date": "April 10, 2026",
                    "order_total": 52,
                    "channel": "referral",
                    "is_repeat": "TRUE",
                    "cohort_month": "2026-03",
                    "retention_month_1": "TRUE",
                    "retention_month_2": "FALSE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 0
                  },
                  {
                    "order_id": "ORD-1012",
                    "customer_id": "C-3018",
                    "order_date": "April 22, 2026",
                    "order_total": 54,
                    "channel": "display",
                    "is_repeat": "FALSE",
                    "cohort_month": "2026-04",
                    "retention_month_1": "FALSE",
                    "retention_month_2": "FALSE",
                    "retention_month_3": "FALSE",
                    "refund_amount": 0,
                    "ad_spend": 450
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Q1 2026 headline metrics",
            "body": "Here are the verified Q1 2026 numbers from the raw data. Use these as your starting point.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Total orders",
                  "value": "7",
                  "delta": {}
                },
                {
                  "label": "Total revenue",
                  "value": "$370.00 USD",
                  "delta": {}
                },
                {
                  "label": "Total ad spend",
                  "value": "$600.00 USD",
                  "delta": {}
                },
                {
                  "label": "Total refunds",
                  "value": "$0.00 USD",
                  "delta": {}
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Priya's follow-up reminder",
            "body": "A few hours later, Priya sends a follow-up message with an important reminder about data integrity.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Priya Sharma"
                },
                "body": "One more thing. The readout needs to be fully traceable to the source data. Every number you state must come from the raw export. And no cause-and-effect claims unless we actually ran a test or have time-series data that supports it. If the AI suggests something you can't verify, remove it. Accuracy matters more than polish.",
                "timestamp": "Friday, June 5, 2026, 11:30 AM ET"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Verify each order row",
            "body": "Priya sent the raw export of **7 orders** from Q1 2026 (January through March). For each row, decide whether the data is **verified** (you can confirm it from the export), **needs recalculation** (the number is present but you must compute it yourself), or **contains a figure that cannot be sourced** (the number is not in the raw data at all).",
            "caseContext": {
              "actions": [
                {
                  "value": "verified",
                  "label": "Verified, I can confirm this from the raw export"
                },
                {
                  "value": "recalculate",
                  "label": "Needs recalculation, the data is present but I must compute it"
                },
                {
                  "value": "unsourced",
                  "label": "Cannot be sourced, this figure is not in the raw data"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Order ORD-1001: $48.00 USD, channel email, first purchase, January 15, 2026"
                },
                {
                  "id": "row_2",
                  "label": "Order ORD-1002: $52.00 USD, channel email, repeat purchase, February 20, 2026"
                },
                {
                  "id": "row_3",
                  "label": "Order ORD-1003: $56.00 USD, channel email, repeat purchase, March 18, 2026"
                },
                {
                  "id": "row_4",
                  "label": "Order ORD-1004: $44.00 USD, channel paid_social, first purchase, January 10, 2026"
                },
                {
                  "id": "row_5",
                  "label": "Order ORD-1005: $50.00 USD, channel paid_social, repeat purchase, March 5, 2026"
                },
                {
                  "id": "row_6",
                  "label": "Order ORD-1006: $60.00 USD, channel organic, first purchase, February 2, 2026"
                },
                {
                  "id": "row_7",
                  "label": "Order ORD-1007: $60.00 USD, channel organic, repeat purchase, March 1, 2026"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Check the AI's claims against source data",
            "body": "The Marlow AI Assistant generated three claims for the Q1 readout. For each one, decide whether it is **sourced** (traceable to the raw export) or **fabricated** (not present in any row or aggregate of the raw data).",
            "caseContext": {
              "actions": [
                {
                  "value": "sourced",
                  "label": "Sourced, this figure is traceable to the raw export"
                },
                {
                  "value": "fabricated",
                  "label": "Fabricated, this figure is not in the raw data"
                }
              ],
              "rows": [
                {
                  "id": "claim_1",
                  "label": "Claim: Repeat-purchase rate increased by 23% in Q1 2026"
                },
                {
                  "id": "claim_2",
                  "label": "Claim: Email-attributed revenue reached $412,000 USD in Q1 2026"
                },
                {
                  "id": "claim_3",
                  "label": "Claim: The May 1 price change drove the increase in repeat purchases"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Balance speed, accuracy, and completeness",
            "body": "You have three options for handling the AI-generated readout. Each option trades off **speed** (how fast you can deliver), **accuracy** (whether every number is verified), and **completeness** (whether the narrative meets Priya's request for a full performance story). Review the tradeoffs and decide your approach.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your prompt to the Marlow AI Assistant",
            "body": "Priya wants a one-page readout for Monday's leadership review. Write the prompt you would give the Marlow AI Assistant to draft the Q1 2026 performance narrative. Remember: the AI cannot access the live database or verify numbers against source data. It can draft SQL queries, write summaries, format tables, and suggest possible drivers.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Company data verification policy",
            "body": "Review the company policy on data verification before you finalize the readout.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Data Verification Policy.pdf",
                  "kind": "document"
                },
                {
                  "name": "Q1 2026 Raw Data Export.csv",
                  "kind": "spreadsheet"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "AI-generated Q1 readout",
            "body": "Priya sent you the readout that the Marlow AI Assistant produced after you gave it the raw data export. Read it carefully before you decide what to do next.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request to the AI",
            "body": "Before the AI produced the readout, you gave it instructions. Now rebuild that request by selecting the goal, the audience, and the data-limitation rules you want the AI to follow.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Summarize Q1 2026 performance with headline revenue, order count, and repeat-purchase rate",
                  "Identify which channels and customer segments drove Q1 results",
                  "Write a 3-to-5-sentence narrative explaining the quarter's performance",
                  "Format the output as a one-page readout suitable for a leadership meeting"
                ],
                "audiencias": [
                  "Leadership team (chief executive David Chen and department heads)",
                  "Priya Sharma, Director of Business Operations",
                  "Entire Marlow & Co. staff via company newsletter",
                  "External investors and board members"
                ],
                "limites": [
                  "Every figure must be traceable to a specific row or aggregate in the raw export file",
                  "No cause-and-effect claims unless the data includes a controlled test or stated causal methodology",
                  "If a figure cannot be verified against the source data, remove it from the readout entirely",
                  "Use only the fields in the dataset: order_id, customer_id, order_date, order_total, channel, is_repeat, cohort_month, retention_month_1/2/3, refund_amount, ad_spend"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Flag unsupported figures in the readout",
            "body": "Review the AI's output below. Two figures in the readout cannot be verified against the raw data export. Mark each segment that contains an unsupported number.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_01",
                  "text": "Q1 2026 revenue reached $370.00 USD across 7 orders, with a repeat-purchase rate of 57% (4 of 7 orders were repeat purchases).",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_02",
                  "text": "The repeat-purchase rate increased 23% compared to the prior quarter, signaling stronger customer loyalty.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_03",
                  "text": "Email-attributed revenue totaled $412,000 USD, making email the highest-performing channel.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_04",
                  "text": "Organic and referral channels contributed $126.00 USD and $48.00 USD respectively, with zero ad spend.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write a correction prompt to the AI",
            "body": "Now write a new prompt to the Marlow AI Assistant. Your goal: ask it to correct or remove the fabricated figures from the readout. Be specific about which numbers are unsupported and what the verified figures are.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Flag the unsupported causal claim",
            "body": "The AI's readout also includes a statement about what drove the quarter's performance. Review the segment below and mark it if the claim is not supported by the data.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_05",
                  "text": "The May 1 price change drove the increase in repeat purchases during Q1, as customers responded to the new pricing structure.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_06",
                  "text": "Repeat orders accounted for 4 of 7 Q1 orders, with returning customers contributing $218.00 USD in revenue.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review the revised readout",
            "body": "You asked the Marlow AI Assistant to fix the fabricated numbers and the unsupported causal claim. It produced this revised version. Read it carefully and flag any segments that still contain unsupported or fabricated claims.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_a",
                  "text": "In Q1 2026, Marlow & Co. generated $370.00 USD in revenue across 7 orders.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_b",
                  "text": "The repeat-purchase rate reached 57% (4 of 7 orders), up from the prior quarter.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_c",
                  "text": "Email-attributed revenue totaled $156.00 USD, paid social contributed $94.00 USD, and organic contributed $120.00 USD.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_d",
                  "text": "The May price change is expected to improve margins in Q2.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose a revised approach",
            "body": "Four versions of the Q1 readout have been drafted. Each handles the fabricated data and the unsupported causal claim differently. Pick the one you would present to the leadership team.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Q1 2026 revenue was $370.00 USD from 7 orders. Repeat orders accounted for 4 of 7 (57%). Email drove $156.00 USD, paid social drove $94.00 USD, and organic drove $120.00 USD. The repeat rate improved versus the prior quarter, though the sample is small. No causal driver can be confirmed from the available data."
                },
                {
                  "id": "B",
                  "body": "Q1 2026 revenue was $370.00 USD from 7 orders. Repeat orders accounted for 4 of 7 (57%). The May price change may have contributed to the repeat rate, though the data does not prove causation. Email drove $156.00 USD, paid social drove $94.00 USD, and organic drove $120.00 USD."
                },
                {
                  "id": "C",
                  "body": "Q1 2026 revenue was $370.00 USD from 7 orders. Repeat orders accounted for 4 of 7 (57%), a 23% increase. Email-attributed revenue was $412,000 USD. Paid social and organic also contributed. The May price change drove the improvement in repeat purchases."
                },
                {
                  "id": "D",
                  "body": "Q1 2026 revenue was $370.00 USD from 7 orders. The repeat-purchase rate was 57%. Email contributed $156.00 USD. Paid social contributed $94.00 USD. Organic contributed $120.00 USD. The data export covers only 7 orders, so any trend claims should be treated as directional."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Priya asks for your final call",
            "body": "Priya sends a message asking you to confirm your decision before Monday's review.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Sharma"
                },
                "body": "Hi there, I saw the revised readout versions coming through. I need you to make the final call on what goes to David and the department heads on Monday. Pick the version that is accurate, complete, and defensible. If you need to add context or caveats, include them. Let me know your decision by end of day.",
                "timestamp": "Friday, June 5, 2026, 2:15 PM ET"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Sort the Q1 data for the readout",
            "body": "Before you finalize, sort each piece of Q1 information into one of three categories: **Include as-is** (verified and ready), **Include with caveat** (true but needs context), or **Exclude entirely** (fabricated or unsupported).",
            "caseContext": {
              "actions": [
                {
                  "value": "include_as_is",
                  "label": "Include as-is"
                },
                {
                  "value": "include_with_caveat",
                  "label": "Include with caveat"
                },
                {
                  "value": "exclude",
                  "label": "Exclude entirely"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Total Q1 2026 revenue: $370.00 USD"
                },
                {
                  "id": "row_2",
                  "label": "Repeat-purchase rate: 57% (4 of 7 orders)"
                },
                {
                  "id": "row_3",
                  "label": "23% increase in repeat-purchase rate versus prior quarter"
                },
                {
                  "id": "row_4",
                  "label": "Email-attributed revenue: $412,000 USD"
                },
                {
                  "id": "row_5",
                  "label": "Email-attributed revenue: $156.00 USD"
                },
                {
                  "id": "row_6",
                  "label": "The May price change drove the increase in repeat purchases"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best closing narrative",
            "body": "Priya wants a short narrative (3 to 5 sentences) that explains what drove Q1 performance. Four options are below. Choose the one that is both accurate and complete.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Q1 2026 revenue reached $370.00 USD across 7 orders, with repeat purchases making up 57% of volume. Email and organic channels each contributed over $100.00 USD, while paid social generated $94.00 USD. The small dataset limits any strong conclusions about trends or drivers. Additional quarters of data will provide a clearer picture."
                },
                {
                  "id": "B",
                  "body": "Q1 2026 revenue was $370.00 USD from 7 orders. The 23% jump in repeat purchases shows that customers are coming back. The May price change helped drive this improvement. Email was the strongest channel with $412,000 USD in attributed revenue."
                },
                {
                  "id": "C",
                  "body": "Q1 2026 revenue was $370.00 USD. Repeat orders were 4 out of 7, or 57%. Email drove $156.00 USD. Paid social drove $94.00 USD. Organic drove $120.00 USD. The May price change may help Q2 margins."
                },
                {
                  "id": "D",
                  "body": "Q1 2026 revenue totaled $370.00 USD from 7 orders, with repeat orders at 57%. The repeat rate improved versus the prior quarter, though the sample is too small to confirm a trend. Email and organic channels performed well. Paid social required $600.00 USD in ad spend to generate $94.00 USD in revenue, which warrants attention."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the readout format",
            "body": "Priya needs a one-page readout for Monday's leadership review. Each format below uses a different balance of completeness and traceability. Pick the one that best serves the team.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Full narrative with all AI-generated figures and the causal claim about the May price change. Includes every metric Priya asked for. No verification notes."
                },
                {
                  "id": "B",
                  "body": "Narrative based only on verified source data. Removes the two fabricated numbers and the unsupported causal claim. Notes that the repeat-purchase story is incomplete without the removed data."
                },
                {
                  "id": "C",
                  "body": "Bullet-point summary of verified Q1 metrics only. No narrative. Each figure is footnoted with the specific order IDs that support it. No interpretation of drivers."
                },
                {
                  "id": "D",
                  "body": "Full narrative using verified data only, with a separate caveat section listing what was removed and why. States that driver analysis is preliminary because the data covers only 7 orders."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the final narrative",
            "body": "Write a **3 to 5 sentence** narrative explaining what drove Q1 2026 performance. Use only verified data from the source table. Do not include any fabricated figures or unsupported causal claims. This will appear in the readout for the Monday leadership review.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Classify each readout element",
            "body": "For each element of the final readout, classify it as one of the following: **Verified** (traceable to source data), **Caveated** (included but flagged as uncertain), or **Removed** (excluded from the final readout).",
            "caseContext": {
              "actions": [
                {
                  "value": "verified",
                  "label": "Verified, traceable to source data"
                },
                {
                  "value": "caveated",
                  "label": "Caveated, included but flagged as uncertain"
                },
                {
                  "value": "removed",
                  "label": "Removed, excluded from the final readout"
                }
              ],
              "rows": [
                {
                  "id": "elem_1",
                  "label": "Total Q1 2026 revenue of $370.00 USD from 7 orders"
                },
                {
                  "id": "elem_2",
                  "label": "23% increase in repeat-purchase rate compared to Q4 2025"
                },
                {
                  "id": "elem_3",
                  "label": "$412,000 USD in email-attributed revenue"
                },
                {
                  "id": "elem_4",
                  "label": "Repeat orders made up 4 of 7 Q1 orders (57%)"
                },
                {
                  "id": "elem_5",
                  "label": "The May 1 price change drove the increase in repeat purchases"
                },
                {
                  "id": "elem_6",
                  "label": "Organic channel shows 4 repeat orders from customer C-1156 with $246.00 USD total revenue"
                },
                {
                  "id": "elem_7",
                  "label": "Total Q1 2026 ad spend of $600.00 USD on paid social"
                },
                {
                  "id": "elem_8",
                  "label": "Customer C-2294 received a full refund of $48.00 USD on their first order"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Final verified one-page readout",
            "body": "Below is the readout as it will appear at the Monday leadership review. All figures have been verified against the source data. Fabricated numbers and unsupported causal claims have been removed.\n\n---\n\n**Marlow & Co. | Q1 2026 Performance Summary**\n\n**Prepared for:** Monday, June 8, 2026 leadership review\n**Data source:** Orders export (ORD-1001 through ORD-1007)\n\n**Headline metrics**\n- Total revenue: **$370.00 USD** across **7 orders**\n- First orders: **3** (ORD-1001, ORD-1004, ORD-1006)\n- Repeat orders: **4** (ORD-1002, ORD-1003, ORD-1005, ORD-1007)\n- Repeat order share: **57%**\n- Total ad spend: **$600.00 USD** (paid social only)\n- Total refunds: **$0.00 USD**\n\n**Channel breakdown**\n- Email: **$156.00 USD** from 3 orders (customer C-0421)\n- Paid social: **$94.00 USD** from 2 orders (customer C-0813)\n- Organic: **$120.00 USD** from 2 orders (customer C-1156)\n- Referral: **$0.00 USD** in Q1 (first referral order ORD-1010 is March 12, but refunded in full)\n- Display: **$0.00 USD** in Q1\n\n**Customer retention snapshot**\n- Customer C-1156 (organic, acquired February 2026) purchased in months 1, 2, and 3 after acquisition. This is the strongest retention pattern in the data.\n- Customer C-0421 (email, acquired January 2026) purchased in months 1 and 2 but not month 3.\n- Customer C-0813 (paid social, acquired January 2026) did not purchase in any retention month.\n\n**Note on drivers:** With only 7 orders in the quarter, any statement about what drove performance is preliminary. A larger data set is needed to identify reliable trends.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Decide and write your memo",
            "body": "Priya needs your final decision on how to deliver the Q1 readout. Each option has a real trade-off. Choose one and write a short memo to Priya explaining your decision.",
            "caseContext": {
              "decisions": [
                {
                  "id": "send_as_is",
                  "title": "Send the AI-generated readout as-is",
                  "detail": "The readout includes all metrics Priya asked for, with a full narrative and driver analysis. However, it contains two fabricated numbers and an unsupported causal claim. Leadership may act on inaccurate data."
                },
                {
                  "id": "edit_and_send",
                  "title": "Edit the readout, then send",
                  "detail": "Removes the fabricated figures and the causal claim. The remaining narrative is thin and may not fully answer Priya's request for a performance story. Takes about 30 minutes to clean up."
                },
                {
                  "id": "rebuild_from_scratch",
                  "title": "Rebuild the readout from verified source data, then send",
                  "detail": "Produces a fully accurate readout with every figure traceable to source data. Takes several hours to write the narrative yourself. The readout will note that driver analysis is preliminary due to the small data set."
                },
                {
                  "id": "pause_and_escalate",
                  "title": "Pause and escalate to Priya with a data quality warning",
                  "detail": "Flags that the AI tool produced unverifiable data and that the source export may be too small for reliable analysis. Delays the Monday readout. Priya may need to decide whether to postpone or proceed with what you have."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "nova_payments_collections_cleanup": {
    "caseId": "nova_payments_collections_cleanup",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Collections",
      "profile_pack": "finance_fpa",
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
      "primary_question": "Whether this analyst can clean a customer list with privacy judgment and put together a responsible recovery send.",
      "assignment_brief": "Diane Reyes, your Collections Manager, shares a spreadsheet of **1,240** customers with past-due card payments. She says the export is dirty: some customers appear twice, a few requested account closure, and about **8%** of the email addresses are known bounces from last quarter. She needs you to clean the list, then use the company AI copilot to draft a payment recovery message. The message must not include personal data like full account numbers or balances. She wants to send this week but only if the list is clean and the message is compliant. She asks you to review the AI draft, make any needed edits, and recommend whether to launch, pilot with a small batch, or pause.",
      "business_metric": "Recovery rate on past-due payments",
      "risk_metric": "Privacy or compliance exposure from sending to wrong contacts or exposing personal data",
      "expected_signal": "The analyst identifies and removes duplicates, closed accounts, and bad emails, then reviews the AI draft for personal-data leaks before deciding to pilot a small batch rather than full launch.",
      "expected_action": "pilotar",
      "alternatives": [
        "pausar",
        "entrenar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Nova Payments collections campaign",
            "body": "You are a **Collections Analyst** at Nova Payments, a US-based payment processing company. Your manager, **Diane Reyes**, has asked you to prepare a payment recovery campaign for past-due card payment customers. The company uses **Nova Copilot**, an AI drafting tool that can write and rewrite payment recovery messages based on your prompts. Nova Copilot cannot access the customer database or send emails on its own. Your job is to clean the data, draft a message, review it for issues, and recommend whether to launch.",
            "caseContext": {
              "meta": {
                "profile": "Collections",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Diane assigns the campaign task",
            "body": "Diane Reyes sends you an email with the assignment.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Diane Reyes"
                },
                "body": "Hi team, we are launching a payment recovery campaign for customers with past-due card payments. I need you to do the following by **Friday, June 12, 2026**:\n\n1. **Clean the export** by removing duplicates, closed accounts, and known bad email addresses.\n2. **Use Nova Copilot** to draft a payment recovery message.\n3. **Review the AI draft** for personal-data leaks (full account numbers, exact balances).\n4. **Recommend** whether to launch to the full list, pilot with a small batch, or pause.\n\nThe full export has **1,240 rows**. I have attached a sample of **10 records** so you can see the data structure. Let me know if you have questions.\n\nThanks, Diane",
                "timestamp": "Monday, June 8, 2026 09:15 AM"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Sample customer data",
            "body": "Diane attached a sample of **10 customer records** from the export. The fields and the three data rules are shown below.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "customer_id",
                    "label": "Customer ID"
                  },
                  {
                    "key": "full_name",
                    "label": "Full Name"
                  },
                  {
                    "key": "email",
                    "label": "Email Address"
                  },
                  {
                    "key": "account_status",
                    "label": "Account Status"
                  },
                  {
                    "key": "past_due_amount",
                    "label": "Past-Due Amount"
                  },
                  {
                    "key": "days_past_due",
                    "label": "Days Past Due"
                  },
                  {
                    "key": "last_campaign_bounce",
                    "label": "Last Campaign Bounce"
                  },
                  {
                    "key": "opt_out_flag",
                    "label": "Opt-Out Flag"
                  }
                ],
                "rows": [
                  {
                    "customer_id": "C-1001",
                    "full_name": "Angela Torres",
                    "email": "angela.torres@email.com",
                    "account_status": "Active",
                    "past_due_amount": "$340.00 USD",
                    "days_past_due": "45",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1002",
                    "full_name": "Brian Kim",
                    "email": "brian.kim@mail.net",
                    "account_status": "Active",
                    "past_due_amount": "$190.00 USD",
                    "days_past_due": "32",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1003",
                    "full_name": "Cynthia Lane",
                    "email": "cynthia.lane@webmail.com",
                    "account_status": "Closed",
                    "past_due_amount": "$520.00 USD",
                    "days_past_due": "90",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1004",
                    "full_name": "Darnell Foster",
                    "email": "darnell.foster@fastmail.com",
                    "account_status": "Active",
                    "past_due_amount": "$275.00 USD",
                    "days_past_due": "60",
                    "last_campaign_bounce": "Yes",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1005",
                    "full_name": "Elena Vasquez",
                    "email": "elena.v@provider.com",
                    "account_status": "Active",
                    "past_due_amount": "$410.00 USD",
                    "days_past_due": "50",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "Yes"
                  },
                  {
                    "customer_id": "C-1006",
                    "full_name": "Frank Odom",
                    "email": "frank.odom@email.com",
                    "account_status": "Active",
                    "past_due_amount": "$155.00 USD",
                    "days_past_due": "28",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1007",
                    "full_name": "Angela Torres",
                    "email": "angela.torres@workmail.com",
                    "account_status": "Active",
                    "past_due_amount": "$340.00 USD",
                    "days_past_due": "45",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1008",
                    "full_name": "Grace Huang",
                    "email": "grace.huang@email.com",
                    "account_status": "Pending Closure",
                    "past_due_amount": "$600.00 USD",
                    "days_past_due": "75",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1009",
                    "full_name": "Henry Chen",
                    "email": "henry.chen@mail.com",
                    "account_status": "Active",
                    "past_due_amount": "$220.00 USD",
                    "days_past_due": "40",
                    "last_campaign_bounce": "No",
                    "opt_out_flag": "No"
                  },
                  {
                    "customer_id": "C-1010",
                    "full_name": "Isabel Nunez",
                    "email": "isabel.n@oldmail.com",
                    "account_status": "Active",
                    "past_due_amount": "$3,400.00 USD",
                    "days_past_due": "120",
                    "last_campaign_bounce": "Yes",
                    "opt_out_flag": "No"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Campaign metrics at a glance",
            "body": "Key numbers from the full export to keep in mind as you prepare your recommendation.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Total export rows",
                  "value": "1,240"
                },
                {
                  "label": "Estimated bad emails",
                  "value": "8% (~99 records)"
                },
                {
                  "label": "Highest past-due amount (sample)",
                  "value": "$3,400.00 USD"
                },
                {
                  "label": "Pilot batch size",
                  "value": "50 customers"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Marcus flags two issues",
            "body": "Senior Collections Specialist **Marcus Webb** sends you a message about the sample data.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Marcus Webb"
                },
                "body": "Hey, I looked at the sample Diane shared. Two things caught my eye:\n\n1. **Duplicate Angela Torres records.** Customer IDs C-1001 and C-1007 both show Angela Torres with the same **$340.00 USD** balance and **45 days** past due, but different email addresses. We should only send one message per customer.\n\n2. **Isabel Nunez (C-1010)** has a past-due amount of **$3,400.00 USD** at **120 days** past due. That is the highest amount in the sample, and her email bounced in the last campaign. We need to decide how to handle high-risk accounts like this one.\n\nJust wanted to flag these before you start cleaning the data. Let me know if you want to discuss.\n\nMarcus",
                "timestamp": "Monday, June 8, 2026 10:30 AM"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Triage rows C-1001 through C-1005",
            "body": "Apply the three campaign rules to each customer. Decide if they qualify for the recovery message or should be excluded.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in campaign"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from campaign"
                }
              ],
              "rows": [
                {
                  "id": "C-1001",
                  "label": "Angela Torres - Active, $340, 45 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1002",
                  "label": "Brian Kim - Active, $190, 32 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1003",
                  "label": "Cynthia Lane - Closed, $520, 90 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1004",
                  "label": "Darnell Foster - Active, $275, 60 days, bounced, no opt-out"
                },
                {
                  "id": "C-1005",
                  "label": "Elena Vasquez - Active, $410, 50 days, no bounce, opt-out Yes"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Triage rows C-1006 through C-1010",
            "body": "Continue applying the rules. Watch for the duplicate Angela Torres (C-1007) and the high past-due account (C-1010).",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in campaign"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from campaign"
                }
              ],
              "rows": [
                {
                  "id": "C-1006",
                  "label": "Frank Odom - Active, $155, 28 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1007",
                  "label": "Angela Torres (duplicate) - Active, $340, 45 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1008",
                  "label": "Grace Huang - Pending Closure, $600, 75 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1009",
                  "label": "Henry Chen - Active, $220, 40 days, no bounce, no opt-out"
                },
                {
                  "id": "C-1010",
                  "label": "Isabel Nunez - Active, $3,400, 120 days, bounced, no opt-out"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Set data-cleaning tradeoffs",
            "body": "You can delegate cleaning logic to Nova Copilot or do it manually. Set your priority across three dimensions: **autonomy** (how much control you keep), **safety** (how strictly you enforce rules), and **cost** (time and effort).",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your prompt to Nova Copilot",
            "body": "Write a prompt asking Nova Copilot to draft a payment recovery message. Include any tone, content, or compliance instructions you want. The tool can adjust tone and flag placeholders it cannot fill.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Nova Payments recovery messaging policy",
            "body": "Review the internal policy document before finalizing your draft.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Recovery Messaging Policy v4.2",
                  "kind": "PDF"
                },
                {
                  "name": "Opt-Out Compliance Quick Reference",
                  "kind": "PDF"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Nova Copilot capabilities",
            "body": "Nova Copilot can draft and rewrite payment recovery messages and flag placeholder text it cannot fill (account numbers, balances). It **cannot** query the customer database, send emails, or access account balances on its own. You provide the data and the prompt.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request to Nova Copilot",
            "body": "Choose a goal, audience, tone, and data limits for the draft. The audience is the clean segment you prepared (active accounts, no duplicates, no bounces, no opt-outs). Tone must be **firm** per policy.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Recover past-due payment",
                  "Notify customer of account risk",
                  "Offer payment plan options",
                  "Request immediate payment"
                ],
                "audiencias": [
                  "Clean active accounts only",
                  "All past-due accounts",
                  "Active accounts with duplicates",
                  "Accounts over 60 days past due"
                ],
                "limites": [
                  "No full account numbers",
                  "No exact balance amounts",
                  "No payment links",
                  "No late fee references"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review Nova Copilot's first draft",
            "body": "Nova Copilot returned this draft. Flag any segments that contain risky content such as personal-data placeholders.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Dear Customer, your account ending in [ACCOUNT_NUMBER] has a past-due balance of [BALANCE_AMOUNT].",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s2",
                  "text": "Please make a payment by Friday, June 12, 2026 to avoid additional fees.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s3",
                  "text": "If you have questions, call our support team at 1-800-555-0199.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "s4",
                  "text": "We value your business and want to help you resolve this quickly.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Revise your prompt to Nova Copilot",
            "body": "Write a revised prompt asking Nova Copilot to remove all personal-data placeholders and produce a cleaner draft. Keep the tone firm. The deadline is **Friday, June 12, 2026**.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review Nova Copilot's second draft",
            "body": "Nova Copilot returned a revised draft. Flag any segments where the tone is too aggressive or where personal-data references remain.",
            "caseContext": {
              "segments": [
                {
                  "id": "t1",
                  "text": "Your account is past due. Pay the full amount now to avoid escalation.",
                  "flagIfMarked": "tono_agresivo"
                },
                {
                  "id": "t2",
                  "text": "Your balance of $340.00 USD must be paid by June 12, 2026.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "t3",
                  "text": "Please remit payment for your past-due balance by the deadline.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "t4",
                  "text": "Contact customer service at 1-800-555-0199 if you need assistance.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Final draft compliance check",
            "body": "Nova Copilot produced this closing section for the recovery email. Review each highlighted segment. Mark any that violate the company's recovery messaging policy or the three data rules.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Your account ending in 8842 has a past-due balance of $340.00 USD.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_2",
                  "text": "Please make a payment by Friday, June 12, 2026 to avoid a late fee.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "If you have already paid, disregard this message.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_4",
                  "text": "Failure to pay may result in account suspension and referral to our collections team.",
                  "flagIfMarked": "tono_agresivo"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Pick the best closing line",
            "body": "Nova Copilot generated four closing-line variants for the recovery email. Choose the one that balances effectiveness with compliance. The message goes to customers with past-due balances on active accounts.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Thank you for being a valued customer. We hope to resolve this soon."
                },
                {
                  "id": "B",
                  "body": "This is your final notice. Pay immediately or legal action will follow."
                },
                {
                  "id": "C",
                  "body": "Please remit payment at your earliest convenience to keep your account in good standing."
                },
                {
                  "id": "D",
                  "body": "We understand things come up. Contact us to discuss a payment plan."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Diane asks for your recommendation",
            "body": "Diane Reyes sends a message asking for your final decision on how to proceed with the campaign.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Diane Reyes"
                },
                "body": "Good work on the drafts. Now I need your final recommendation by Friday, June 12, 2026. Here are the three options I'm considering:\n\n1. Launch to the full cleaned list (all eligible customers).\n2. Run a pilot batch of 50 customers first.\n3. Pause the campaign and escalate the $3,400 USD account (C-1010) for manual review.\n\nWhich one do you recommend and why? Keep in mind the data rules, the bounce rate, and the high-value account that may need special handling.",
                "timestamp": "Monday, June 8, 2026 2:15 PM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Confirm the pilot batch",
            "body": "If Diane approves the pilot, it will include **50 customers** from the full export. Re-triage the **10 sample rows** to confirm which ones belong in the pilot. Apply all three data rules and remove any duplicate records.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in pilot"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from pilot"
                }
              ],
              "rows": [
                {
                  "id": "C-1001",
                  "label": "Angela Torres, angela.torres@email.com, Active, $340, 45 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1002",
                  "label": "Brian Kim, brian.kim@mail.net, Active, $190, 32 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1003",
                  "label": "Cynthia Lane, cynthia.lane@webmail.com, Closed, $520, 90 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1004",
                  "label": "Darnell Foster, darnell.foster@fastmail.com, Active, $275, 60 days, Yes bounce, No opt-out"
                },
                {
                  "id": "C-1005",
                  "label": "Elena Vasquez, elena.v@provider.com, Active, $410, 50 days, No bounce, Yes opt-out"
                },
                {
                  "id": "C-1006",
                  "label": "Frank Odom, frank.odom@email.com, Active, $155, 28 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1007",
                  "label": "Angela Torres, angela.torres@workmail.com, Active, $340, 45 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1008",
                  "label": "Grace Huang, grace.huang@email.com, Pending Closure, $600, 75 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1009",
                  "label": "Henry Chen, henry.chen@mail.com, Active, $220, 40 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1010",
                  "label": "Isabel Nunez, isabel.n@oldmail.com, Active, $3,400, 120 days, Yes bounce, No opt-out"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best subject line",
            "body": "Nova Copilot generated four subject-line options for the recovery email. Choose the one that is clear, compliant with policy, and likely to be opened by past-due customers on active accounts.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Your Nova Payments account is past due"
                },
                {
                  "id": "B",
                  "body": "URGENT: Pay $340 immediately or lose your account"
                },
                {
                  "id": "C",
                  "body": "We missed you. Here is your statement."
                },
                {
                  "id": "D",
                  "body": "Final notice before account closure"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the final message version",
            "body": "Nova Copilot produced four versions of the payment recovery message. Each one uses a different tone and includes different data. Select the version that is fully compliant with the recovery messaging policy and ready for the send path you will recommend.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Subject: Your Nova Payments account is past due\n\nDear Angela,\n\nYour account ending in **1001** has a past-due balance of **$340.00 USD**. Please make a payment by **Friday, June 12, 2026** to avoid service interruption.\n\nPay online at novapayments.com/pay or call 1-800-555-0199.\n\nThank you,\nNova Payments Collections"
                },
                {
                  "id": "B",
                  "body": "Subject: Action required on your account\n\nDear Angela,\n\nYour account has a past-due balance. Please log in to your account to view the amount and make a payment.\n\nPay online at novapayments.com/pay or call 1-800-555-0199.\n\nThank you,\nNova Payments Collections"
                },
                {
                  "id": "C",
                  "body": "Subject: Your account is past due\n\nDear Angela Torres,\n\nYour account with Customer ID **C-1001** has a past-due balance of **$340.00 USD** and is **45 days** past due. Please make a payment immediately to avoid escalation.\n\nPay online at novapayments.com/pay or call 1-800-555-0199.\n\nThank you,\nNova Payments Collections"
                },
                {
                  "id": "D",
                  "body": "Subject: Payment reminder\n\nDear Valued Customer,\n\nThis is a reminder that your Nova Payments account has a past-due balance. Please remit payment at your earliest convenience.\n\nPay online at novapayments.com/pay or call 1-800-555-0199.\n\nThank you,\nNova Payments Collections"
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the final prompt to Nova Copilot",
            "body": "Now write a prompt to Nova Copilot that will produce the exact message version you selected. Include the tone, the specific data placeholders the AI should use, and any compliance constraints it needs to follow.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Final send groups for the sample rows",
            "body": "Categorize each of the **10 sample rows** into one of three groups: **Include in pilot**, **Exclude (with reason)**, or **Escalate (C-1010 $3,400 USD)**. The pilot batch will be drawn from the Include group. Any row that violates a policy rule must be excluded. The $3,400 USD account (C-1010) needs escalation regardless of other factors.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in pilot"
                },
                {
                  "value": "exclude",
                  "label": "Exclude (with reason)"
                },
                {
                  "value": "escalate",
                  "label": "Escalate (C-1010 $3,400 USD)"
                }
              ],
              "rows": [
                {
                  "id": "C-1001",
                  "label": "Angela Torres, angela.torres@email.com, Active, $340, 45 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1002",
                  "label": "Brian Kim, brian.kim@mail.net, Active, $190, 32 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1003",
                  "label": "Cynthia Lane, cynthia.lane@webmail.com, Closed, $520, 90 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1004",
                  "label": "Darnell Foster, darnell.foster@fastmail.com, Active, $275, 60 days, Bounced, No opt-out"
                },
                {
                  "id": "C-1005",
                  "label": "Elena Vasquez, elena.v@provider.com, Active, $410, 50 days, No bounce, Opt-out Yes"
                },
                {
                  "id": "C-1006",
                  "label": "Frank Odom, frank.odom@email.com, Active, $155, 28 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1007",
                  "label": "Angela Torres, angela.torres@workmail.com, Active, $340, 45 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1008",
                  "label": "Grace Huang, grace.huang@email.com, Pending Closure, $600, 75 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1009",
                  "label": "Henry Chen, henry.chen@mail.com, Active, $220, 40 days, No bounce, No opt-out"
                },
                {
                  "id": "C-1010",
                  "label": "Isabel Nunez, isabel.n@oldmail.com, Active, $3,400, 120 days, Bounced, No opt-out"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Deliverables checklist for Diane Reyes",
            "body": "You have completed every item Diane Reyes asked for on **Monday, June 8, 2026**. Here is a summary of what was delivered:\n\n**Promise 1: Clean the export**\nYou removed duplicates (C-1007 is a duplicate of C-1001), excluded closed accounts (C-1003) and pending closures (C-1008), removed bounced emails (C-1004, C-1010), and excluded opt-outs (C-1005). The cleaned pilot-ready list contains **4 eligible customers** from the sample.\n\n**Promise 2: Use Nova Copilot to draft a payment recovery message**\nYou selected a compliant version (no exact balances, no full account numbers, no internal IDs) and wrote a final prompt to produce it.\n\n**Promise 3: Review the AI draft for personal-data leaks**\nYou identified and removed the exact balance and account number from earlier drafts. The final version uses a generic balance reference and no personal identifiers.\n\n**Promise 4: Recommend whether to launch, pilot, or pause**\nYour recommendation memo is ready for Diane's review by the **Friday, June 12, 2026** deadline.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Recommend the send path",
            "body": "Diane Reyes needs your final recommendation by **Friday, June 12, 2026**. Choose one of the three actions below. Then write a short memo to Diane explaining your reasoning. Include the key data points that support your decision.",
            "caseContext": {
              "decisions": [
                {
                  "id": "full_launch",
                  "title": "Launch to the full cleaned list",
                  "detail": "Send the recovery message to all **1,141 eligible customers** immediately. Benefit: maximum recovery volume and fastest time to revenue. Cost: any undiscovered compliance issues or data errors affect the entire list, and a single complaint could trigger a policy review."
                },
                {
                  "id": "pilot",
                  "title": "Pilot with 50 customers first",
                  "detail": "Send to a **random sample of 50 customers** from the cleaned list. Benefit: you can monitor bounce rates, open rates, and complaints on a small scale before committing the full list. Cost: delays full recovery by **one week**, and the pilot batch may not capture every edge case in the data."
                },
                {
                  "id": "pause",
                  "title": "Pause and escalate the $3,400 account",
                  "detail": "Hold all sends and escalate the **$3,400 USD** account (C-1010 Isabel Nunez) to senior collections for manual handling. Benefit: prevents a high-value account from receiving a standard automated message that could damage the relationship. Cost: delays the entire campaign by **two weeks** while the escalation is processed, and the remaining customers receive no reminder in the meantime."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "ridgeline_ops_invoice_automation": {
    "caseId": "ridgeline_ops_invoice_automation",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Operations",
      "profile_pack": "operations_automation",
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
      "primary_question": "Whether this operations manager can make an automation call under quarter-end pressure with judgment: reading the error data instead of trusting the demo, sizing what an 8 percent error rate does to customers and revenue at 340 invoices, designing a review step that catches the expensive mistakes, and resisting the pressure to automate everything just to hit the close.",
      "assignment_brief": "Diane Marchetti, the finance controller, calls you into her office. \"The billing coordinator is out with the flu, and we have **340 invoices** that need to go out before the books close on **Tuesday, June 30, 2026**. The AI document tool has already extracted the fields from the delivery paperwork. Normally we check every extraction by hand, but we do not have time for that. I need you to look at a sample of the extractions, figure out which invoices are safe to send as-is, and set up a review rule that catches the risky ones without re-checking all 340 manually. Then tell me what we do going forward: full automation, a guarded pilot, or pause until after the close. I need your recommendation by end of day.\"",
      "business_metric": "Invoices billed before quarter close (target: 340 by June 30, 2026)",
      "risk_metric": "Field error rate on invoices sent to customers (known baseline: 8%, or roughly 27 of 340 invoices with at least one error)",
      "expected_signal": "The participant reads the error data, identifies which field errors are costly (wrong amount, wrong customer) versus minor (missing PO number that can be corrected later), designs a targeted review rule that catches high-risk errors without re-checking all 340, and makes a calibrated automation recommendation that balances speed with accuracy.",
      "expected_action": "pilotar",
      "alternatives": [
        "entrenar",
        "pausar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Ridgeline Freight: quarter close billing",
            "body": "You are the Operations Manager at Ridgeline Freight, a regional trucking and logistics company based in Columbus, Ohio. It is the last week of June 2026. The quarter closes on **Tuesday, June 30, 2026**. Your team needs to send **340 invoices** to customers before the deadline. Finance has been testing a new AI tool, DocExtract AI, to read delivery paperwork and extract invoice data automatically. Diane Marchetti, the Finance Controller, wants your assessment before the full batch goes out.",
            "caseContext": {
              "meta": {
                "profile": "Operations",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Diane Marchetti assigns the task",
            "body": "Diane Marchetti, Finance Controller, sends you an email with her request.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Diane Marchetti"
                },
                "body": "Hi team,\n\nWe need to get the 340 invoices out before the quarter close on June 30. DocExtract AI has processed the delivery paperwork and extracted the invoice fields. I need you to do three things:\n\n1. Look at the sample of 10 extractions I have attached and assess what kinds of errors the AI is making.\n2. Figure out which invoices are safe to send as-is and which need a human review.\n3. Set up a review rule in DocExtract AI so it flags the risky invoices automatically going forward.\n\nAfter that, give me your recommendation on how we proceed: full automation, a guarded pilot, or pause until after the close.\n\nLet me know what you find.\n\nDiane",
                "timestamp": "Monday, June 22, 2026 9:14 AM"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Sample of 10 extracted invoices",
            "body": "Diane attached a sample of **10 invoices** from the batch of 340. Each row shows what DocExtract AI read from the delivery paperwork, plus the contract amount range for reference.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "invoice_id",
                    "label": "Invoice ID"
                  },
                  {
                    "key": "customer_name",
                    "label": "Customer name (extracted)"
                  },
                  {
                    "key": "amount",
                    "label": "Amount (extracted)"
                  },
                  {
                    "key": "po_number",
                    "label": "PO number (extracted)"
                  },
                  {
                    "key": "delivery_date",
                    "label": "Delivery date"
                  },
                  {
                    "key": "ocr_confidence",
                    "label": "OCR confidence"
                  },
                  {
                    "key": "contract_range",
                    "label": "Amount range (contract)"
                  }
                ],
                "rows": [
                  {
                    "invoice_id": "INV-1001",
                    "customer_name": "Acme Industrial Supply",
                    "amount": "$3,400 USD",
                    "po_number": "PO-8821",
                    "delivery_date": "June 22, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$2,500 - $4,000 USD"
                  },
                  {
                    "invoice_id": "INV-1002",
                    "customer_name": "Bayside Parts Co",
                    "amount": "$190 USD",
                    "po_number": "PO-4512",
                    "delivery_date": "June 20, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$8,000 - $12,000 USD"
                  },
                  {
                    "invoice_id": "INV-1003",
                    "customer_name": "Coastal Logistics LLC",
                    "amount": "$7,200 USD",
                    "po_number": "PO-3340",
                    "delivery_date": "June 18, 2026",
                    "ocr_confidence": "Medium",
                    "contract_range": "$6,500 - $8,000 USD"
                  },
                  {
                    "invoice_id": "INV-1004",
                    "customer_name": "Delta Manufacturing",
                    "amount": "$12,500 USD",
                    "po_number": "PO-9073",
                    "delivery_date": "June 15, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$10,000 - $14,000 USD"
                  },
                  {
                    "invoice_id": "INV-1005",
                    "customer_name": "Elm Street Warehouse",
                    "amount": "$5,800 USD",
                    "po_number": "(missing)",
                    "delivery_date": "June 23, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$5,000 - $6,500 USD"
                  },
                  {
                    "invoice_id": "INV-1006",
                    "customer_name": "Foster & Sons Logistics",
                    "amount": "$14,200 USD",
                    "po_number": "PO-1123",
                    "delivery_date": "June 19, 2026",
                    "ocr_confidence": "Low",
                    "contract_range": "$4,000 - $6,000 USD"
                  },
                  {
                    "invoice_id": "INV-1007",
                    "customer_name": "Greenfield Produce Co",
                    "amount": "$2,100 USD",
                    "po_number": "PO-6654",
                    "delivery_date": "June 21, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$1,800 - $2,500 USD"
                  },
                  {
                    "invoice_id": "INV-1008",
                    "customer_name": "Harbor Freight Solutions",
                    "amount": "$9,800 USD",
                    "po_number": "PO-7782",
                    "delivery_date": "June 17, 2026",
                    "ocr_confidence": "Medium",
                    "contract_range": "$9,000 - $11,000 USD"
                  },
                  {
                    "invoice_id": "INV-1009",
                    "customer_name": "Industrial Supply Co",
                    "amount": "$6,500 USD",
                    "po_number": "PO-2291",
                    "delivery_date": "June 24, 2026",
                    "ocr_confidence": "Low",
                    "contract_range": "$6,000 - $7,500 USD"
                  },
                  {
                    "invoice_id": "INV-1010",
                    "customer_name": "Jensen Trucking",
                    "amount": "$3,800 USD",
                    "po_number": "PO-4431",
                    "delivery_date": "June 16, 2026",
                    "ocr_confidence": "High",
                    "contract_range": "$3,500 - $4,200 USD"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Key metrics at a glance",
            "body": "Diane shared the overall numbers for the full batch of **340 invoices**.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Total invoices to bill",
                  "value": "340",
                  "delta": {}
                },
                {
                  "label": "Estimated field error rate",
                  "value": "8%",
                  "delta": {}
                },
                {
                  "label": "Invoices with at least one error (estimated)",
                  "value": "27",
                  "delta": {}
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Lena Okonkwo flags two invoices",
            "body": "Lena Okonkwo, the Billing Coordinator, sends you a quick message after reviewing the sample.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Lena Okonkwo"
                },
                "body": "Hey, I just looked at the sample Diane sent. Two invoices jumped out at me:\n\n- **INV-1002** (Bayside Parts Co): DocExtract read the amount as **$190 USD**. Their contract range is **$8,000 - $12,000 USD**. That is way off. Either the AI misread the document or the wrong paperwork got scanned.\n\n- **INV-1006** (Foster & Sons Logistics): Extracted amount is **$14,200 USD**, but their contract range tops out at **$6,000 USD**. That is more than double the expected max.\n\nBoth of these have real dollar impact. We should flag them before anything goes out.\n\nAlso worth noting: INV-1005 has a missing PO number. Per our policy, that can still go out, but we need to log it for follow-up within 5 business days.\n\nLet me know if you want me to pull the original scans for any of these.",
                "timestamp": "Monday, June 22, 2026 10:03 AM"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Triage the 10 sample invoices",
            "body": "Diane asked you to assess the sample of **10 extracted invoices** for error patterns. For each invoice, decide whether to **Send as-is** or **Flag for review** based on the data you see. Use the contract amount range and OCR confidence as your guide.",
            "caseContext": {
              "actions": [
                {
                  "value": "send",
                  "label": "Send as-is"
                },
                {
                  "value": "flag",
                  "label": "Flag for review"
                }
              ],
              "rows": [
                {
                  "id": "INV-1001",
                  "label": "INV-1001, Acme Industrial Supply, $3,400 USD, High confidence, contract $2,500-$4,000"
                },
                {
                  "id": "INV-1002",
                  "label": "INV-1002, Bayside Parts Co, $190 USD, High confidence, contract $8,000-$12,000"
                },
                {
                  "id": "INV-1003",
                  "label": "INV-1003, Coastal Logistics LLC, $7,200 USD, Medium confidence, contract $6,500-$8,000"
                },
                {
                  "id": "INV-1004",
                  "label": "INV-1004, Delta Manufacturing, $12,500 USD, High confidence, contract $10,000-$14,000"
                },
                {
                  "id": "INV-1005",
                  "label": "INV-1005, Elm Street Warehouse, $5,800 USD, High confidence, contract $5,000-$6,500, PO missing"
                },
                {
                  "id": "INV-1006",
                  "label": "INV-1006, Foster & Sons Logistics, $14,200 USD, Low confidence, contract $4,000-$6,000"
                },
                {
                  "id": "INV-1007",
                  "label": "INV-1007, Greenfield Produce Co, $2,100 USD, High confidence, contract $1,800-$2,500"
                },
                {
                  "id": "INV-1008",
                  "label": "INV-1008, Harbor Freight Solutions, $9,800 USD, Medium confidence, contract $9,000-$11,000"
                },
                {
                  "id": "INV-1009",
                  "label": "INV-1009, Industrial Supply Co, $6,500 USD, Low confidence, contract $6,000-$7,500"
                },
                {
                  "id": "INV-1010",
                  "label": "INV-1010, Jensen Trucking, $3,800 USD, High confidence, contract $3,500-$4,200"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Re-evaluate after Lena's flag",
            "body": "Lena Okonkwo flagged **INV-1002** (Bayside Parts Co, $190 USD extracted vs. $8,000-$12,000 contract range) and **INV-1006** (Foster & Sons Logistics, $14,200 USD extracted vs. $4,000-$6,000 contract range, Low OCR confidence). \n\nNow re-evaluate all **10 invoices** with a finer set of categories. For each invoice, pick the best action.",
            "caseContext": {
              "actions": [
                {
                  "value": "safe",
                  "label": "Safe to send"
                },
                {
                  "value": "review_amount",
                  "label": "Review amount"
                },
                {
                  "value": "review_po",
                  "label": "Review PO"
                },
                {
                  "value": "review_both",
                  "label": "Review both"
                }
              ],
              "rows": [
                {
                  "id": "INV-1001",
                  "label": "INV-1001, Acme Industrial Supply, $3,400 USD, High confidence, contract $2,500-$4,000, PO-8821"
                },
                {
                  "id": "INV-1002",
                  "label": "INV-1002, Bayside Parts Co, $190 USD, High confidence, contract $8,000-$12,000, PO-4512"
                },
                {
                  "id": "INV-1003",
                  "label": "INV-1003, Coastal Logistics LLC, $7,200 USD, Medium confidence, contract $6,500-$8,000, PO-3340"
                },
                {
                  "id": "INV-1004",
                  "label": "INV-1004, Delta Manufacturing, $12,500 USD, High confidence, contract $10,000-$14,000, PO-9073"
                },
                {
                  "id": "INV-1005",
                  "label": "INV-1005, Elm Street Warehouse, $5,800 USD, High confidence, contract $5,000-$6,500, PO missing"
                },
                {
                  "id": "INV-1006",
                  "label": "INV-1006, Foster & Sons Logistics, $14,200 USD, Low confidence, contract $4,000-$6,000, PO-1123"
                },
                {
                  "id": "INV-1007",
                  "label": "INV-1007, Greenfield Produce Co, $2,100 USD, High confidence, contract $1,800-$2,500, PO-6654"
                },
                {
                  "id": "INV-1008",
                  "label": "INV-1008, Harbor Freight Solutions, $9,800 USD, Medium confidence, contract $9,000-$11,000, PO-7782"
                },
                {
                  "id": "INV-1009",
                  "label": "INV-1009, Industrial Supply Co, $6,500 USD, Low confidence, contract $6,000-$7,500, PO-2291"
                },
                {
                  "id": "INV-1010",
                  "label": "INV-1010, Jensen Trucking, $3,800 USD, High confidence, contract $3,500-$4,200, PO-4431"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Set your review rule approach",
            "body": "Diane wants you to define a review rule that catches risky invoices without manually re-checking all **340**. Use the sliders below to set your priorities. These preferences will guide the rule you write in the next step.\n\n- **Speed vs. accuracy**: How much time are you willing to spend on review vs. sending invoices to hit the **Tuesday, June 30, 2026** quarter close?\n- **Automation vs. human review**: How much do you rely on DocExtract AI's flags vs. having a person verify?\n- **Broad vs. targeted flagging**: Do you flag many invoices broadly (catch more errors, slow down send) or target only the highest-risk ones (faster send, more residual risk)?",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write the review rule for DocExtract AI",
            "body": "Write a clear instruction for DocExtract AI that defines a review rule. The rule should flag risky invoices for human check before they are sent. DocExtract AI can apply rules based on the fields it extracts (amount, PO number, OCR confidence) and the contract amount range you provide.\n\nYour rule will apply to all **340 invoices**, not just the sample. Write your instruction here, one or two lines.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Billing policy document",
            "body": "Lena shared the company's billing policy. Review it before making your final recommendation. It covers three rules that apply to all invoices.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Ridgeline Freight Billing Policy (June 2026)",
                  "kind": "document"
                },
                {
                  "name": "Customer email preference log",
                  "kind": "spreadsheet"
                },
                {
                  "name": "Open delivery dispute tracker",
                  "kind": "spreadsheet"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "DocExtract AI capabilities and limits",
            "body": "DocExtract AI reads delivery paperwork and extracts **customer name**, **amount**, **PO number**, and **delivery date**. It flags documents with low OCR confidence. It **cannot** verify contract rates, detect its own misreads, correct errors, or cross-check customer names against your database. Confidence scores (Low, Medium, High) reflect scan quality, not field accuracy.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request for DocExtract AI",
            "body": "Select the goal, audience, and limits for DocExtract AI to flag risky invoices before sending.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Flag invoices where the extracted amount falls outside the contract range",
                  "Flag invoices with Low or Medium OCR confidence for manual review",
                  "Flag invoices with a missing PO number for follow-up logging"
                ],
                "audiencias": [
                  "All 340 invoices in the batch",
                  "Only invoices with High OCR confidence",
                  "Only invoices with amounts above $5,000 USD"
                ],
                "limites": [
                  "Amount threshold: flag any invoice where the extracted amount is more than 20% above or below the contract range",
                  "Confidence threshold: flag any invoice with OCR confidence below High",
                  "PO threshold: flag any invoice where the PO number is missing or unreadable"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review DocExtract AI flagged invoices",
            "body": "DocExtract AI flagged the invoices below. Mark each flag as a valid risk or a false positive based on the data you reviewed.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "INV-1002: Bayside Parts Co, $190 USD extracted, contract range $8,000-$12,000 USD, OCR High. Flagged: amount outside range.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_2",
                  "text": "INV-1006: Foster & Sons Logistics, $14,200 USD extracted, contract range $4,000-$6,000 USD, OCR Low. Flagged: amount outside range and Low confidence.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "INV-1005: Elm Street Warehouse, $5,800 USD extracted, contract range $5,000-$6,500 USD, OCR High. Flagged: missing PO number.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_4",
                  "text": "INV-1009: Industrial Supply Co, $6,500 USD extracted, contract range $6,000-$7,500 USD, OCR Low. Flagged: Low confidence.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write the invoice message instruction",
            "body": "Write a free-form instruction for DocExtract AI to generate a customer-facing invoice message for the approved invoices. Include what fields to include, what to exclude, and any compliance rules from the billing policy.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review the draft invoice message",
            "body": "DocExtract AI produced the draft invoice message below. Review it and flag any compliance or accuracy issues before send.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_5",
                  "text": "Customer greeting: 'Dear Valued Customer'",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_6",
                  "text": "Invoice amount: $3,400 USD for INV-1001 (Acme Industrial Supply)",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_7",
                  "text": "Payment link: 'Click here to pay your invoice'",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_8",
                  "text": "Contact note: 'For billing questions, contact Diane Marchetti at d.marchetti@ridgelinefreight.com'",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review the second pass of flagged invoices",
            "body": "You adjusted the review rule and ran DocExtract AI again on the full set of **340** invoices. The tool returned a flagged list of **31** invoices that meet your new criteria. Before you act on them, Diane wants you to check whether the AI is catching the right issues.\n\nReview the segments below from DocExtract AI's output. Mark any segment that contains a risk you need to address.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg-1",
                  "text": "INV-1002, Bayside Parts Co, Amount $190 USD, OCR confidence: High, Flagged because amount is below $500 USD threshold.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg-2",
                  "text": "INV-1006, Foster & Sons Logistics, Amount $14,200 USD, OCR confidence: Low, Flagged because OCR confidence is Low.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg-3",
                  "text": "INV-1009, Industrial Supply Co, Amount $6,500 USD, OCR confidence: Low, Flagged because OCR confidence is Low.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg-4",
                  "text": "INV-1005, Elm Street Warehouse, Amount $5,800 USD, OCR confidence: High, Flagged because PO number is missing.",
                  "flagIfMarked": "tono_agresivo"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the best invoice email closing",
            "body": "Lena prepared four versions of the closing paragraph for the invoice email that will go out to customers. The email includes the invoice amount, delivery date, and a payment link. Pick the closing that best balances professionalism, clarity, and compliance with Ridgeline Freight's billing policy.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Thank you for your business. Please remit payment by the due date shown on the invoice. If you have any questions about this invoice or your account, contact our billing team at billing@ridgelinefreight.com."
                },
                {
                  "id": "B",
                  "body": "We appreciate your prompt payment. Note that late payments may incur a 1.5% monthly finance charge per our standard terms. Contact us immediately if you dispute any charges."
                },
                {
                  "id": "C",
                  "body": "Thanks for choosing Ridgeline Freight. Payment is due within 30 days. If you need to update your billing contact or have questions, reach out to billing@ridgelinefreight.com. We value your partnership."
                },
                {
                  "id": "D",
                  "body": "Your invoice is attached. Pay by the due date to avoid service interruptions. For questions, call 1-800-555-0199. Do not reply to this automated message."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Lena reports additional findings",
            "body": "Lena finished reviewing the **31** flagged invoices from DocExtract AI's second pass. She found two invoices the AI did not flag that need attention.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Lena Okonkwo"
                },
                "body": "Hi there,\n\nI went through all 31 flagged invoices from the second pass. Most of them look fine after manual review. But I found two invoices that DocExtract AI did NOT flag, and they both have problems.\n\n**INV-1002, Bayside Parts Co**, The amount extracted is $190 USD. Their contract rate is $8,000 to $12,000 USD. The AI flagged it for being below $500, but the real issue is the amount is completely wrong. The delivery paperwork shows $9,400 USD. This needs to be corrected before we send it.\n\n**INV-1006, Foster & Sons Logistics**, The amount extracted is $14,200 USD. Their contract range is $4,000 to $6,000 USD. The AI flagged it for Low OCR confidence, which is correct, but the amount discrepancy is much bigger than the confidence issue. The actual amount on the paperwork is $5,800 USD. This also needs correction.\n\nBoth of these were in the original sample you looked at. Just a heads up that our rule caught them but didn't flag the right reason. We should probably adjust the rule again.\n\nLet me know if you want me to correct the amounts and resubmit.\n\nBest,\nLena",
                "timestamp": "Monday, June 29, 2026, 10:14 AM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Re-triage the 10 sample invoices",
            "body": "Based on everything you know now, the original data, Lena's flags, the second AI pass, and Lena's additional findings, decide the final disposition for each of the **10** sample invoices. Choose **Send** (invoice is accurate and can go to the customer), **Hold** (needs correction or missing data before sending), or **Escalate** (requires Diane or legal review before any action).",
            "caseContext": {
              "actions": [
                {
                  "value": "send",
                  "label": "Send"
                },
                {
                  "value": "hold",
                  "label": "Hold"
                },
                {
                  "value": "escalate",
                  "label": "Escalate"
                }
              ],
              "rows": [
                {
                  "id": "INV-1001",
                  "label": "INV-1001, Acme Industrial Supply, $3,400, High confidence, PO-8821"
                },
                {
                  "id": "INV-1002",
                  "label": "INV-1002, Bayside Parts Co, $190, High confidence, PO-4512"
                },
                {
                  "id": "INV-1003",
                  "label": "INV-1003, Coastal Logistics LLC, $7,200, Medium confidence, PO-3340"
                },
                {
                  "id": "INV-1004",
                  "label": "INV-1004, Delta Manufacturing, $12,500, High confidence, PO-9073"
                },
                {
                  "id": "INV-1005",
                  "label": "INV-1005, Elm Street Warehouse, $5,800, High confidence, (missing PO)"
                },
                {
                  "id": "INV-1006",
                  "label": "INV-1006, Foster & Sons Logistics, $14,200, Low confidence, PO-1123"
                },
                {
                  "id": "INV-1007",
                  "label": "INV-1007, Greenfield Produce Co, $2,100, High confidence, PO-6654"
                },
                {
                  "id": "INV-1008",
                  "label": "INV-1008, Harbor Freight Solutions, $9,800, Medium confidence, PO-7782"
                },
                {
                  "id": "INV-1009",
                  "label": "INV-1009, Industrial Supply Co, $6,500, Low confidence, PO-2291"
                },
                {
                  "id": "INV-1010",
                  "label": "INV-1010, Jensen Trucking, $3,800, High confidence, PO-4431"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best follow-up instruction for missing PO numbers",
            "body": "Diane wants you to send a follow-up instruction to DocExtract AI that improves how it handles invoices with missing or unreadable purchase order numbers. The current rule just flags them. She wants the new instruction to be precise, actionable, and compliant with the billing policy. Choose the version that best achieves this.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "For any invoice where the PO number is missing or unreadable, flag the invoice and add a note: 'Missing PO, log for follow-up within 5 business days.' Do not delay sending the invoice. Include the note in the invoice record."
                },
                {
                  "id": "B",
                  "body": "If the PO number field is blank or unreadable, do not send the invoice. Hold it until a human enters a valid PO number. Missing POs create accounting errors and must be resolved first."
                },
                {
                  "id": "C",
                  "body": "When a PO number is missing, check the customer database for a default PO on file. If one exists, insert it automatically. If not, flag the invoice for manual review before sending."
                },
                {
                  "id": "D",
                  "body": "Flag any invoice with a missing or unreadable PO number. Send the invoice to the customer but include a bold warning in the email body that the PO is missing and must be provided within 10 business days."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose your closing recommendation to Diane",
            "body": "Diane Marchetti asked you to summarize your findings and recommend a path. Review the four options below and pick the one that best captures your error analysis, rule effectiveness, and next steps.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "The sample showed a clear pattern: OCR confidence alone is unreliable (INV-1002 had High confidence but an amount far outside the contract range). The review rule I set up caught invoices where the extracted amount fell outside the contract range or OCR confidence was Low. That rule flagged 3 of the 10 sample invoices (INV-1002, INV-1006, INV-1009). After Lena's additional findings, I also held INV-1005 (missing PO with a known dispute). Going forward, I recommend a guarded pilot: send invoices that pass the rule, manually review the flagged ones, and refine the thresholds after the close."
                },
                {
                  "id": "B",
                  "body": "The sample showed that most invoices are clean. I sent all 340 invoices as-is to meet the close deadline. The 8% error rate means roughly 27 invoices may have errors, but those can be handled through normal dispute resolution after the close. Going forward, I recommend full automation with DocExtract AI since the errors are manageable and the close deadline was the priority."
                },
                {
                  "id": "C",
                  "body": "The sample showed that Low OCR confidence documents (INV-1006, INV-1009) are the main risk. I sent all High and Medium confidence invoices and held only the Low confidence ones for manual review. After Lena's flag, I also held INV-1005. Going forward, I recommend a guarded pilot where only Low confidence documents are reviewed, since that catches the clearest risk without slowing down the close."
                },
                {
                  "id": "D",
                  "body": "The sample showed too many unknowns. I paused all 340 invoices from being sent until after the close. Errors in amounts, missing POs, and potential disputes mean the risk of sending wrong invoices outweighs the benefit of hitting the close deadline. Going forward, I recommend pausing the entire rollout until DocExtract AI can be retrained and every invoice is manually verified."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the instruction for the final status report",
            "body": "Diane wants a one-page status report from DocExtract AI covering what was sent, what was held, and why. Write a clear instruction for DocExtract AI to generate this report. Include the data sources it should use and the format you expect.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Assign each invoice to its final batch",
            "body": "Based on everything you have learned (the sample analysis, the review rule results, Lena's additional findings, and the billing policy), assign each of the 10 sample invoices to one of three final batches.",
            "caseContext": {
              "actions": [
                {
                  "value": "send_now",
                  "label": "Send now"
                },
                {
                  "value": "hold_review",
                  "label": "Hold for review"
                },
                {
                  "value": "escalate",
                  "label": "Escalate to Diane"
                }
              ],
              "rows": [
                {
                  "id": "INV-1001",
                  "label": "INV-1001 - Acme Industrial Supply - $3,400 - High confidence - Amount in range $2,500-$4,000"
                },
                {
                  "id": "INV-1002",
                  "label": "INV-1002 - Bayside Parts Co - $190 - High confidence - Amount range $8,000-$12,000"
                },
                {
                  "id": "INV-1003",
                  "label": "INV-1003 - Coastal Logistics LLC - $7,200 - Medium confidence - Amount in range $6,500-$8,000"
                },
                {
                  "id": "INV-1004",
                  "label": "INV-1004 - Delta Manufacturing - $12,500 - High confidence - Amount in range $10,000-$14,000"
                },
                {
                  "id": "INV-1005",
                  "label": "INV-1005 - Elm Street Warehouse - $5,800 - High confidence - Missing PO - Amount in range $5,000-$6,500"
                },
                {
                  "id": "INV-1006",
                  "label": "INV-1006 - Foster & Sons Logistics - $14,200 - Low confidence - Amount range $4,000-$6,000"
                },
                {
                  "id": "INV-1007",
                  "label": "INV-1007 - Greenfield Produce Co - $2,100 - High confidence - Amount in range $1,800-$2,500"
                },
                {
                  "id": "INV-1008",
                  "label": "INV-1008 - Harbor Freight Solutions - $9,800 - Medium confidence - Amount in range $9,000-$11,000"
                },
                {
                  "id": "INV-1009",
                  "label": "INV-1009 - Industrial Supply Co - $6,500 - Low confidence - Amount in range $6,000-$7,500"
                },
                {
                  "id": "INV-1010",
                  "label": "INV-1010 - Jensen Trucking - $3,800 - High confidence - Amount in range $3,500-$4,200"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Quarter-end close status summary",
            "body": "Here is the final status of the **340 invoice** batch as of **Tuesday, June 30, 2026**.\n\n**Sent to customers:** **313 invoices** (92% of the batch)\n**Held for manual review:** **22 invoices** (6%)\n**Escalated to Diane Marchetti:** **5 invoices** (2%)\n\n**Estimated revenue impact:**\n- **$2,840,000 USD** in invoices sent and on track for payment\n- **$198,000 USD** held pending review (includes INV-1002, INV-1005, INV-1006, INV-1009, and 18 others)\n- **$47,000 USD** escalated due to unresolved disputes or amounts far outside contract range\n\nThe review rule you configured in DocExtract AI (flagging amounts outside the contract range and Low OCR confidence documents) caught the highest-risk invoices. The missing PO follow-up process was logged for **15 invoices** per policy.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Choose your strategic path forward",
            "body": "Diane Marchetti needs your recommendation on how Ridgeline Freight should handle invoice processing going forward. Each option has real tradeoffs. Pick one and write a memo to Diane explaining your reasoning.",
            "caseContext": {
              "decisions": [
                {
                  "id": "full_automation",
                  "title": "Full automation",
                  "detail": "Send all future invoices through DocExtract AI with no manual review. Benefits: fastest processing, zero labor cost per invoice, and the quarter close will always be hit. Costs: the 8% error rate means roughly 27 wrong invoices per 340 batch, leading to customer disputes, rework, and potential lost revenue from incorrect billing that is not caught."
                },
                {
                  "id": "guarded_pilot",
                  "title": "Guarded pilot with review rules",
                  "detail": "Continue using DocExtract AI but keep the review rules you set up (amount-outside-range and Low OCR confidence flags). Benefits: catches the costliest errors while still automating 90%+ of invoices. Costs: requires a billing coordinator to review 20-30 flagged invoices per batch (about 2-3 hours of labor), and some errors on unflagged invoices may still slip through."
                },
                {
                  "id": "pause",
                  "title": "Pause and retrain",
                  "detail": "Stop using DocExtract AI for invoice processing until the tool is retrained on Ridgeline's specific paperwork formats. Benefits: eliminates all AI-related errors going forward. Costs: all 340+ invoices per batch must be manually entered, delaying future closes by 3-5 business days and requiring temporary staffing or overtime."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "sundial_pm_roadmap": {
    "caseId": "sundial_pm_roadmap",
    "version": 1,
    "meta": {
      "level": "N2 · Workflow",
      "profile": "Product Management",
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
      "primary_question": "Whether this product manager can turn messy user input into a roadmap with judgment: keeping identifiable and sensitive user data out of the AI tool, catching demand numbers and impact estimates the tool made up, grounding priorities in real evidence instead of the loudest accounts, and knowing which parts of the draft are safe to put in front of leadership.",
      "assignment_brief": "Priya needs the Q3 roadmap and a spec for the top feature by Monday. You have four raw data sources: **400 support tickets**, a churn survey with **1,200 responses**, **850 satisfaction-survey verbatims**, and a feature-request spreadsheet with **310 entries**. Every source contains personal data: email addresses, account IDs, and free-text where users pasted bank balances and account numbers while describing bugs. Priya wants you to use the AI assistant to find the top themes, draft the feature spec, and produce a prioritized roadmap with estimated revenue impact. She needs to know what you put into the tool, what you kept out, and whether the output is ready for leadership or needs rework.",
      "business_metric": "Roadmap accuracy: percentage of prioritized features that match real user demand signals from verified data",
      "risk_metric": "Data exposure incidents: count of identifiable or sensitive user data points that enter the AI tool outside approved agreements",
      "expected_signal": "The participant strips or aggregates personal and sensitive data before pasting anything into the AI tool, catches the invented demand percentages and revenue estimates in the output, checks priority rankings against real evidence rather than loud accounts, and decides to keep the draft as a working draft with numbers marked unverified rather than sending it to leadership or pausing entirely.",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Sundial Money Q3 roadmap",
            "body": "You are a **Product Manager** at **Sundial Money**, a 90-person fintech company based in Columbus, Ohio. Sundial helps consumers manage their spending with a digital envelope-budgeting app. Your main tool is **Sundial Compass**, an AI drafting assistant that can synthesize themes, generate feature specs, and rewrite content for different audiences. It cannot access Sundial's product analytics, customer records system, or user database, and it cannot process personal data under Sundial's user-data agreements.\n\n**Priya Chandrasekhar**, VP of Product, has just assigned you a high-stakes project. It is **Friday, June 5, 2026**. She wants a prioritized Q3 roadmap delivered to the leadership team by **Monday, June 8, 2026**.",
            "caseContext": {
              "meta": {
                "profile": "Product Management",
                "level": "N2 · Workflow",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Priya's assignment email",
            "body": "Priya sends you an email with the full scope of the project.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Chandrasekhar"
                },
                "timestamp": "2026-06-05T09:15:00-04:00",
                "body": "Subject: Q3 Roadmap, due Monday\n\nHi team,\n\nWe need a prioritized Q3 2026 roadmap ready for the Monday, June 8 leadership presentation. Here is what I need from you:\n\n1. A prioritized Q3 roadmap with the top 3 features ranked by user demand.\n2. A feature spec for the #1 priority feature, including a problem statement and proposed solution.\n3. Estimated revenue impact for each of the top 3 features.\n4. A summary of what data was fed into the AI tool and what was kept out.\n5. A readiness assessment: whether the draft is safe to present to leadership or needs rework.\n\nUse Sundial Compass to help draft the roadmap and spec. But remember its limitations: it cannot access our product analytics, customer records system, or user database, and it cannot process personal data.\n\nDeadline: Monday, June 8, 2026, by 9:00 AM ET.\n\nThanks,\nPriya"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "User feedback dataset",
            "body": "You have a **12-row sample** of user feedback drawn from support tickets, churn surveys, satisfaction-survey verbatims, and feature requests. Each row contains personal data, financial details, and consent flags. You must apply these **data-policy rules** before feeding anything into Sundial Compass:\n\n- **Rule 1:** Any user who has opted out of data sharing must be excluded from all analysis and never have their data processed by any tool.\n- **Rule 2:** Any user whose consent status is unknown or unconfirmed must be excluded until consent is verified.\n- **Rule 3:** Any record flagged as a duplicate or internal test must be removed before analysis to avoid double-counting or false signals.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "source",
                    "label": "Source"
                  },
                  {
                    "key": "user_name",
                    "label": "User name"
                  },
                  {
                    "key": "email",
                    "label": "Email"
                  },
                  {
                    "key": "account_id",
                    "label": "Account ID"
                  },
                  {
                    "key": "text_excerpt",
                    "label": "Text excerpt"
                  },
                  {
                    "key": "consent_status",
                    "label": "Consent status"
                  },
                  {
                    "key": "account_tier",
                    "label": "Account tier"
                  },
                  {
                    "key": "flag",
                    "label": "Flag"
                  }
                ],
                "rows": [
                  {
                    "source": "support_ticket",
                    "user_name": "Jennifer Alvarez",
                    "email": "jen.alvarez@email.com",
                    "account_id": "SA-10234",
                    "text_excerpt": "My direct deposit of $3,400 USD posted to the wrong envelope. My account number is 987654321 at Chase.",
                    "consent_status": "opted_in",
                    "account_tier": "Plus",
                    "flag": ""
                  },
                  {
                    "source": "support_ticket",
                    "user_name": "Robert Chen",
                    "email": "rob.chen@workmail.com",
                    "account_id": "SA-10891",
                    "text_excerpt": "The recurring bill pay keeps failing. I have $12,800 USD in my checking account so funds are not the issue.",
                    "consent_status": "opted_in",
                    "account_tier": "Enterprise",
                    "flag": ""
                  },
                  {
                    "source": "churn_survey",
                    "user_name": "Diana Reyes",
                    "email": "dreyes@personal.com",
                    "account_id": "SA-11567",
                    "text_excerpt": "I left because there is no shared budget feature. My husband and I split everything 50/50 and the app cannot do that.",
                    "consent_status": "opted_in",
                    "account_tier": "Free",
                    "flag": ""
                  },
                  {
                    "source": "churn_survey",
                    "user_name": "Tyrone Jackson",
                    "email": "tyrone.j@fastmail.com",
                    "account_id": "SA-12104",
                    "text_excerpt": "Too expensive for what it does. I moved to a free spreadsheet.",
                    "consent_status": "opted_out",
                    "account_tier": "Free",
                    "flag": ""
                  },
                  {
                    "source": "nps_verbatim",
                    "user_name": "Priya Mehta",
                    "email": "pmehta@consulting.co",
                    "account_id": "SA-10922",
                    "text_excerpt": "I love the savings goals feature. I have $47,000 USD saved across three goals.",
                    "consent_status": "opted_in",
                    "account_tier": "Plus",
                    "flag": ""
                  },
                  {
                    "source": "nps_verbatim",
                    "user_name": "Carlos Mendez",
                    "email": "carlos.mendez@university.edu",
                    "account_id": "SA-13015",
                    "text_excerpt": "The app crashes every time I try to link my credit union. Routing number 322271627.",
                    "consent_status": "unknown",
                    "account_tier": "Free",
                    "flag": "unconfirmed"
                  },
                  {
                    "source": "feature_request",
                    "user_name": "Emily Park",
                    "email": "emily.park@techstartup.io",
                    "account_id": "SA-14203",
                    "text_excerpt": "Please add investment tracking. I want to see my Vanguard portfolio of $215,000 USD inside Sundial.",
                    "consent_status": "opted_in",
                    "account_tier": "Enterprise",
                    "flag": ""
                  },
                  {
                    "source": "feature_request",
                    "user_name": "Samuel Green",
                    "email": "sam.green@oldmail.com",
                    "account_id": "SA-10012",
                    "text_excerpt": "Shared budgets would save my marriage. We need a joint envelope system.",
                    "consent_status": "opted_in",
                    "account_tier": "Free",
                    "flag": ""
                  },
                  {
                    "source": "support_ticket",
                    "user_name": "Linda O'Brien",
                    "email": "lobrien@regionalbank.com",
                    "account_id": "SA-11876",
                    "text_excerpt": "Duplicate of ticket #28471. Same issue with the transaction import failing.",
                    "consent_status": "opted_in",
                    "account_tier": "Plus",
                    "flag": "duplicate"
                  },
                  {
                    "source": "churn_survey",
                    "user_name": "Marcus Webb",
                    "email": "marcus.webb@sundialmoney.com",
                    "account_id": "SA-99999",
                    "text_excerpt": "Testing the survey link. Ignore this response.",
                    "consent_status": "unknown",
                    "account_tier": "Enterprise",
                    "flag": "internal_test"
                  },
                  {
                    "source": "nps_verbatim",
                    "user_name": "Fatima Al-Rashid",
                    "email": "falrashid@familycare.org",
                    "account_id": "SA-13340",
                    "text_excerpt": "The budgeting categories are too rigid. I need to customize my envelope names.",
                    "consent_status": "opted_in",
                    "account_tier": "Free",
                    "flag": ""
                  },
                  {
                    "source": "feature_request",
                    "user_name": "David Kowalski",
                    "email": "dkowalski@midwest.com",
                    "account_id": "SA-14588",
                    "text_excerpt": "Please add round-up savings. I would save an extra $190 USD a month.",
                    "consent_status": "opted_out",
                    "account_tier": "Plus",
                    "flag": ""
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Sundial by the numbers",
            "body": "Here are the headline figures for the full dataset and company context.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Support tickets in raw export",
                  "value": "400"
                },
                {
                  "label": "Churn survey responses",
                  "value": "1,200"
                },
                {
                  "label": "Satisfaction-survey verbatims",
                  "value": "850"
                },
                {
                  "label": "Feature-request spreadsheet entries",
                  "value": "310"
                },
                {
                  "label": "Sundial Money employees",
                  "value": "90"
                },
                {
                  "label": "Last feature release (shared budget pilot)",
                  "value": "April 15, 2026 (Enterprise only)"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Marcus Webb on Compass limits",
            "body": "Marcus Webb, Engineering Lead, sends you a Slack message about what Sundial Compass can and cannot do.",
            "caseContext": {
              "message": {
                "channel": "slack_dm",
                "from": {
                  "name": "Marcus Webb"
                },
                "timestamp": "2026-06-05T10:30:00-04:00",
                "body": "Hey, quick heads up on Sundial Compass before you dive in.\n\nWhat it CAN do:\n- Draft text from structured summaries and anonymized themes\n- Synthesize patterns from aggregated, non-identifiable input\n- Generate feature specs and roadmap documents from curated prompts\n- Rewrite and format content for different audiences\n\nWhat it CANNOT do:\n- Access Sundial's product analytics, customer records system, or user database\n- Verify claims against real usage data or revenue figures\n- Distinguish real quotes from plausible-sounding invented ones\n- Know which accounts are enterprise vs. consumer\n- Process personal data under Sundial's user-data agreements\n\nSo you need to feed it clean, anonymized summaries. Don't give it raw rows with names, emails, account IDs, or financial figures. And double-check any numbers or quotes it generates against real data.\n\nLet me know if you have questions."
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Triage rows 1 through 6",
            "body": "Apply the data-policy rules to each row. Decide if the row can be used in analysis or must be excluded.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in analysis"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from analysis"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Jennifer Alvarez, support_ticket, opted_in, no flag"
                },
                {
                  "id": "row_2",
                  "label": "Robert Chen, support_ticket, opted_in, no flag"
                },
                {
                  "id": "row_3",
                  "label": "Diana Reyes, churn_survey, opted_in, no flag"
                },
                {
                  "id": "row_4",
                  "label": "Tyrone Jackson, churn_survey, opted_out, no flag"
                },
                {
                  "id": "row_5",
                  "label": "Priya Mehta, nps_verbatim, opted_in, no flag"
                },
                {
                  "id": "row_6",
                  "label": "Carlos Mendez, nps_verbatim, unknown, unconfirmed"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Triage rows 7 through 12",
            "body": "Apply the data-policy rules to each remaining row. Decide if the row can be used or must be excluded.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in analysis"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from analysis"
                }
              ],
              "rows": [
                {
                  "id": "row_7",
                  "label": "Emily Park, feature_request, opted_in, no flag"
                },
                {
                  "id": "row_8",
                  "label": "Samuel Green, feature_request, opted_in, no flag"
                },
                {
                  "id": "row_9",
                  "label": "Linda O'Brien, support_ticket, opted_in, duplicate"
                },
                {
                  "id": "row_10",
                  "label": "Marcus Webb, churn_survey, unknown, internal_test"
                },
                {
                  "id": "row_11",
                  "label": "Fatima Al-Rashid, nps_verbatim, opted_in, no flag"
                },
                {
                  "id": "row_12",
                  "label": "David Kowalski, feature_request, opted_out, no flag"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Balance human review for sensitive data",
            "body": "The text_excerpts contain bank balances, account numbers, and routing numbers. Adjust sliders for **autonomy** (how much the AI can decide without review), **safety** (how aggressively sensitive data is scrubbed), and **cost** (hours of human review). Your choices determine the review model applied before data reaches Sundial Compass.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Prompt Sundial Compass for feature analysis",
            "body": "Write an instruction for Sundial Compass. It should identify the top feature requests from the filtered dataset. Remember what Compass can and cannot do, and what data boundaries apply.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Sundial Money data-handling policy",
            "body": "Internal policy document that governs how user feedback data is processed before analysis.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Sundial Money Data Handling Policy v3.1",
                  "kind": "document"
                },
                {
                  "name": "Exclusion rules quick reference",
                  "kind": "document"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Sundial Compass output",
            "body": "You paste the filtered dataset into Sundial Compass. The tool returns four themes: **shared budgets**, **investment tracking**, **customizable categories**, and **round-up savings**. It also states: *\"62% of users who mentioned a feature requested shared budgets.\"* No source is cited for that percentage.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Write a structured prompt",
            "body": "Write a prompt for Sundial Compass to produce a feature spec for the **#1 priority feature**. The audience is the **leadership team**. The prompt must forbid personal data and invented percentages.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Draft a feature spec for shared budgets",
                  "Write a problem statement for the #1 feature",
                  "Summarize user demand without personal data"
                ],
                "audiencias": [
                  "Sundial Money leadership team (chief executive, chief technology officer, head of growth)",
                  "Product team for internal review",
                  "Engineering leads for scoping discussion"
                ],
                "limites": [
                  "Do not include any personal data (names, emails, account IDs)",
                  "Do not invent or cite any percentage not present in the filtered dataset",
                  "Do not reference dollar amounts from individual user comments",
                  "Do not include any user whose consent status is opted_out, unknown, or unconfirmed"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review the draft spec",
            "body": "Sundial Compass returns a draft feature spec for shared budgets. Review each segment below and flag any that contains personal data, invented metrics, or policy violations.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Shared budgets would serve couples and roommates who split expenses. This feature was requested by Diana Reyes, who said her husband and she split everything 50/50.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_2",
                  "text": "User demand for shared budgets is 62% based on analysis of all feedback sources.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "A shared budget feature would increase retention among Free-tier users who currently churn due to missing collaboration tools.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_4",
                  "text": "One user mentioned that shared budgets would save their marriage. Another said the lack of this feature caused them to leave.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Estimate revenue impact",
            "body": "Ask Sundial Compass to estimate the **revenue impact** for each of the **top 3 features**. You decide how to structure the request. The tool cannot access Sundial's product analytics or revenue figures.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review revenue estimates",
            "body": "Sundial Compass returns revenue-impact estimates for the top 3 features. Review each segment and flag any number that is invented or unsupported by the filtered dataset.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_5",
                  "text": "Shared budgets: projected $240,000 USD annual revenue from converting 8% of Free users to Plus at $9.99/month.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_6",
                  "text": "Investment tracking: projected $180,000 USD annual revenue from 15% conversion of Enterprise users.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_7",
                  "text": "Round-up savings: projected $95,000 USD annual revenue from 5% conversion of Free users.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_8",
                  "text": "Customizable categories: projected $50,000 USD annual revenue from 3% conversion of Plus users.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Review data transparency summary",
            "body": "Sundial Compass generated a data-transparency summary for the leadership presentation. It describes what data was fed into the tool. Your job is to read each claim the AI made and flag any that contradicts the actual filtering decisions you made earlier. Mark each segment that contains a problem.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "We analyzed all user feedback from support tickets, churn surveys, satisfaction-survey verbatims, and feature requests. The dataset included 2,760 total responses across all sources.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_2",
                  "text": "Records from users who opted out of data sharing were excluded before analysis, as required by Sundial data policy.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_3",
                  "text": "Records flagged as duplicates or internal tests were removed to prevent double-counting and false signals.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_4",
                  "text": "Users with unknown or unconfirmed consent status were included because their feedback still reflects real product experience.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_5",
                  "text": "The filtered dataset contained 1,847 verified, consented, non-duplicate records from opted-in users.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_6",
                  "text": "Personal identifiers such as names, email addresses, and account IDs were stripped before the data was processed by Sundial Compass.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Pick the best problem statement",
            "body": "Sundial Compass generated four versions of the problem statement for the shared-budget feature spec. Each one draws from the same user feedback dataset. Pick the version that accurately reflects what users said without including personal data, invented statistics, or misleading claims.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Free and Plus users frequently request shared budgeting tools. One churned user said they left because there is no shared budget feature, and another user said shared budgets would save their marriage. Both requested a joint envelope system."
                },
                {
                  "id": "B",
                  "body": "62% of Free-tier users cite the lack of shared budgets as their primary reason for churning. Users want a joint envelope system to split expenses with partners. This feature would reduce churn by an estimated 30%."
                },
                {
                  "id": "C",
                  "body": "Diana Reyes (SA-11567) said she left because there is no shared budget feature. Samuel Green (SA-10012) said shared budgets would save his marriage. Both are Free-tier users requesting a joint envelope system."
                },
                {
                  "id": "D",
                  "body": "Multiple users have requested shared budgeting capabilities. Feedback indicates that couples splitting expenses need a joint envelope system. This aligns with the shared budget pilot launched for Enterprise accounts in April 2026."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Lena flags a demand figure",
            "body": "Lena Okonkwo, Customer Support Manager, reviewed the draft roadmap and sent feedback about a specific claim.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Lena Okonkwo"
                },
                "body": "Hi team, I reviewed the draft roadmap for the leadership presentation. There is a claim on slide 4 that 62% of Free-tier users cited the lack of shared budgets as their primary reason for churning. I pulled the support data myself. That number does not come from any ticket, survey, or satisfaction-survey response we have. Our shared-budget mentions are in the single digits across all sources. I am concerned this is an AI hallucination. Please verify before we present this to the chief executive and the chief technology officer. If the number is fabricated, we need to remove it and flag the draft as needing rework. Thanks, Lena",
                "timestamp": "Friday, June 5, 2026 3:18 PM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Confirm which records were used",
            "body": "Lena's warning about the 62% figure raises a question: did the dataset fed into Sundial Compass include any records that should have been excluded? Re-triage each of the **12 rows** from the original dataset. For each one, confirm whether it was correctly included or should have been excluded based on Sundial's data-handling policy.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in analysis"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from analysis"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Jennifer Alvarez - support_ticket - opted_in - no flag"
                },
                {
                  "id": "row_2",
                  "label": "Robert Chen - support_ticket - opted_in - no flag"
                },
                {
                  "id": "row_3",
                  "label": "Diana Reyes - churn_survey - opted_in - no flag"
                },
                {
                  "id": "row_4",
                  "label": "Tyrone Jackson - churn_survey - opted_out - no flag"
                },
                {
                  "id": "row_5",
                  "label": "Priya Mehta - nps_verbatim - opted_in - no flag"
                },
                {
                  "id": "row_6",
                  "label": "Carlos Mendez - nps_verbatim - unknown - unconfirmed"
                },
                {
                  "id": "row_7",
                  "label": "Emily Park - feature_request - opted_in - no flag"
                },
                {
                  "id": "row_8",
                  "label": "Samuel Green - feature_request - opted_in - no flag"
                },
                {
                  "id": "row_9",
                  "label": "Linda O'Brien - support_ticket - opted_in - duplicate"
                },
                {
                  "id": "row_10",
                  "label": "Marcus Webb - churn_survey - unknown - internal_test"
                },
                {
                  "id": "row_11",
                  "label": "Fatima Al-Rashid - nps_verbatim - opted_in - no flag"
                },
                {
                  "id": "row_12",
                  "label": "David Kowalski - feature_request - opted_out - no flag"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best revenue impact table",
            "body": "Sundial Compass generated four versions of the revenue-impact table for the top 3 features. The table needs to show estimated revenue impact using only defensible, data-backed figures. Pick the version that avoids invented percentages, hallucinated demand numbers, and unsupported projections.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Shared budgets: 62% of Free users demand this feature, projected to increase retention by 30%, estimated annual revenue impact of $240,000 USD. Investment tracking: 18% of Enterprise users requested this, estimated $95,000 USD. Round-up savings: 22% of Plus users would adopt, estimated $50,000 USD."
                },
                {
                  "id": "B",
                  "body": "Shared budgets: 2 direct requests from Free users, pilot already launched for Enterprise in April 2026, revenue impact depends on conversion rate not yet measured. Investment tracking: 1 request from an Enterprise user with a $215,000 USD portfolio. Round-up savings: 1 request from a Plus user estimating $190 USD per month in additional savings."
                },
                {
                  "id": "C",
                  "body": "Shared budgets: 47% of all users want this feature, projected to generate $500,000 USD in new revenue. Investment tracking: 35% of Enterprise accounts requested portfolio integration, estimated $210,000 USD. Round-up savings: 28% of Plus users would upgrade, estimated $130,000 USD."
                },
                {
                  "id": "D",
                  "body": "Shared budgets: 2 users explicitly requested this feature in the dataset. Investment tracking: 1 user mentioned a $215,000 USD Vanguard portfolio. Round-up savings: 1 user estimated saving $190 USD per month. All figures are direct from user feedback with no extrapolation."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Readiness assessment comparison",
            "body": "Priya asked for a readiness assessment: whether the draft is safe to present to leadership or needs rework. Four versions of the closing memo paragraph have been drafted. Pick the one that accurately evaluates the draft's readiness based on what you know.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "The draft is ready to present. All data was filtered to opted-in, verified users. The AI output was reviewed for hallucinations and the 62% shared-budget figure was flagged as unsupported. Revenue estimates are labeled as directional. No personal data appears in the spec. One minor risk: the investment tracking estimate uses a single user's portfolio size, which may not generalize."
                },
                {
                  "id": "B",
                  "body": "The draft is ready to present with no changes. Sundial Compass generated a complete roadmap, feature spec, and revenue table. The AI is a trusted tool and the output reflects the full dataset. Leadership will appreciate the speed. No further review is needed before the Monday deadline."
                },
                {
                  "id": "C",
                  "body": "The draft needs significant rework. The AI was given raw data that included opted-out users, unconfirmed records, and an internal test. The shared-budget demand figure of 62% is likely a hallucination. Revenue estimates reference specific user bank balances. The entire dataset must be refiltered and the AI must be re-prompted before this can go to leadership."
                },
                {
                  "id": "D",
                  "body": "The draft needs minor rework. The data filtering was mostly correct but one opted-out user (David Kowalski) was included in the feature request analysis. The revenue estimates for round-up savings reference his estimate of $190 USD per month. Remove that row and re-run the analysis. The rest of the draft is safe to present."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the roadmap prompt",
            "body": "Now write a final prompt to Sundial Compass. It must produce a **prioritized Q3 roadmap** with the **top 3 features ranked by user demand**. Use only the filtered, clean dataset you confirmed. Be specific about what data you are sending and what you want the AI to do with it.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Select appendix quotes",
            "body": "The feature spec appendix needs user quotes to illustrate demand. Categorize each row below as **Include** (safe to use in the appendix) or **Exclude** (must be left out due to policy or personal financial data).",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include in appendix"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from appendix"
                }
              ],
              "rows": [
                {
                  "id": "R1",
                  "label": "Jennifer Alvarez: \"My direct deposit of $3,400 USD posted to the wrong envelope.\""
                },
                {
                  "id": "R2",
                  "label": "Diana Reyes: \"I left because there is no shared budget feature.\""
                },
                {
                  "id": "R3",
                  "label": "Samuel Green: \"Shared budgets would save my marriage. We need a joint envelope system.\""
                },
                {
                  "id": "R4",
                  "label": "Emily Park: \"Please add investment tracking. I want to see my Vanguard portfolio of $215,000 USD inside Sundial.\""
                },
                {
                  "id": "R5",
                  "label": "Fatima Al-Rashid: \"The budgeting categories are too rigid. I need to customize my envelope names.\""
                },
                {
                  "id": "R6",
                  "label": "Robert Chen: \"The recurring bill pay keeps failing. I have $12,800 USD in my checking account so funds are not the issue.\""
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Final Sundial Compass output",
            "body": "Based on your prompt and the filtered dataset, Sundial Compass produced the following deliverables. All three are shown below.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Decision and memo to Priya",
            "body": "You have the AI-generated roadmap, spec, and revenue estimates. Now decide what to deliver to Priya and the leadership team by **Monday, June 8, 2026**. Choose an action and write a memo that delivers all five manager promises.",
            "caseContext": {
              "decisions": [
                {
                  "id": "present_as_is",
                  "title": "Present the AI output as-is",
                  "detail": "Benefit: Meets the Monday deadline with zero delay. The roadmap is complete and aligned with the filtered data. Cost: The 62% shared-budget demand figure is unverified and may be a hallucination. If leadership questions it, you will need to defend a number the AI may have invented."
                },
                {
                  "id": "revise_and_present",
                  "title": "Revise the draft with human corrections",
                  "detail": "Benefit: You can remove the hallucinated 62% figure, replace it with a count of actual mentions from the clean dataset, and add a caveat about small sample sizes. Cost: Requires 4-6 hours of manual work. You will need to present on Monday with a note that the revenue estimates are directional, not audited."
                },
                {
                  "id": "pause_for_more_data",
                  "title": "Pause and request more data before presenting",
                  "detail": "Benefit: You can run a proper survey or pull verified product analytics to get real demand numbers. The final roadmap will be defensible. Cost: You will miss the Monday deadline. Priya and the leadership team will not have a Q3 roadmap to review on time, which may delay the planning cycle."
                },
                {
                  "id": "escalate_to_priya",
                  "title": "Escalate concerns to Priya for guidance",
                  "detail": "Benefit: You share accountability for the data quality issue. Priya can decide whether to accept the risk, extend the deadline, or reassign the work. Cost: You are deferring the decision rather than making it. Priya explicitly asked you to deliver a readiness assessment, not to hand the question back to her."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "tallgrass_hr_screening": {
    "caseId": "tallgrass_hr_screening",
    "version": 1,
    "meta": {
      "level": "N1 · Foundations",
      "profile": "Recruiting",
      "profile_pack": "operations_automation",
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
      "primary_question": "Whether this recruiting coordinator can build a shortlist under a hiring deadline with judgment: keeping candidate personal data out of the AI tool, refusing to let it rank people on biased or invented signals, grounding the cut in the real job requirements, and knowing when applicants need to be told a tool was involved before anyone gets screened out.",
      "assignment_brief": "Diane Marchetti, the hiring manager for the new distribution center, needs a shortlist of 20 shift-supervisor candidates from 220 applicants by Friday. The applicant export from the system includes full names, home addresses, dates of birth, graduation years, prior salary, and a photo field. Diane wants you to use the AI assistant to help get through the stack fast. But company policy says applicants must be told when a tool helps decide who moves forward. And the tool is not connected to the applicant tracking system. Anything you paste into it leaves the company's candidate-data agreements. Diane needs a shortlist she can trust, and she needs it in four days.",
      "business_metric": "Shortlist of 20 qualified candidates delivered by Friday",
      "risk_metric": "Candidate personal data exposed outside the company's data agreements, biased ranking signals (zip code, employment gaps, invented fit scores), and failure to notify applicants that a tool was used in screening",
      "expected_signal": "The coordinator identifies which personal data fields must be stripped before the spreadsheet goes into the AI tool, catches the biased and ungrounded signals the tool produces (zip-code preference, gap penalty, fake fit score), and decides to run a guarded pilot where a human reviews every candidate near the cutline rather than using the AI shortlist as-is or pausing entirely.",
      "expected_action": "pilotar",
      "alternatives": [
        "entrenar",
        "pausar",
        "escalar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Tallgrass Outdoor Co. - Recruiting Coordinator",
            "body": "You are the Recruiting Coordinator at Tallgrass Outdoor Co., a retailer of camping and hiking gear. Diane Marchetti, Hiring Manager for Distribution Center Operations, has asked you to build a shortlist of **20 shift-supervisor candidates** from **220 applicants** for the new distribution center. She wants you to use **Summit Assist**, an AI tool that can summarize applications, draft comparison tables, flag missing fields, and generate plain-language notices about AI-assisted screening. The shortlist is due by **Friday, June 5, 2026** - **4 days** from now.",
            "caseContext": {
              "meta": {
                "profile": "Recruiting",
                "level": "N1 · Foundations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Assignment from Diane Marchetti",
            "body": "Diane Marchetti sent the following email outlining the task.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Diane Marchetti"
                },
                "body": "Hi team,\n\nWe're moving fast on staffing the new distribution center. We need a shortlist of **20 shift-supervisor candidates** from the **220 applicants** we received. Please evaluate each applicant against the **posted job requirements** for the shift-supervisor role. Use **Summit Assist** to help with the screening.\n\nAlso, we need to notify every applicant that an AI tool was used to help decide who moves forward in the hiring process. Please include that notice when you communicate with them.\n\nDeadline is **Friday, June 5, 2026**. Let me know if you have questions.\n\nBest,\nDiane",
                "timestamp": "Monday, June 1, 2026 09:15 AM"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Sample applicant data",
            "body": "Here is a sample of **10 applicant records** from the full set of 220. Each record includes job-relevant fields and personal data fields.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "full_name",
                    "label": "Full Name"
                  },
                  {
                    "key": "email",
                    "label": "Email"
                  },
                  {
                    "key": "home_address",
                    "label": "Home Address"
                  },
                  {
                    "key": "date_of_birth",
                    "label": "Date of Birth"
                  },
                  {
                    "key": "graduation_year",
                    "label": "Graduation Year"
                  },
                  {
                    "key": "prior_salary",
                    "label": "Prior Salary"
                  },
                  {
                    "key": "supervisory_experience",
                    "label": "Years of Supervisory Experience"
                  },
                  {
                    "key": "shift_availability",
                    "label": "Availability for Shift Work"
                  },
                  {
                    "key": "warehouse_experience",
                    "label": "Distribution or Warehouse Experience"
                  },
                  {
                    "key": "photo",
                    "label": "Photo"
                  }
                ],
                "rows": [
                  {
                    "full_name": "Angela Torres",
                    "email": "a.torres@email.com",
                    "home_address": "1425 Oak St, Apt 3B, Columbus, OH 43201",
                    "date_of_birth": "1989-04-12",
                    "graduation_year": "2011",
                    "prior_salary": "$52,000 USD",
                    "supervisory_experience": "4",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "angela_torres.jpg"
                  },
                  {
                    "full_name": "Brian Kwon",
                    "email": "bkwon@workmail.com",
                    "home_address": "789 Pine Rd, Columbus, OH 43215",
                    "date_of_birth": "1992-11-03",
                    "graduation_year": "2014",
                    "prior_salary": "$48,500 USD",
                    "supervisory_experience": "3",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "brian_kwon.jpg"
                  },
                  {
                    "full_name": "Cynthia Hayes",
                    "email": "chayes@fastmail.net",
                    "home_address": "3200 Maple Dr, Grove City, OH 43123",
                    "date_of_birth": "1985-07-22",
                    "graduation_year": "2007",
                    "prior_salary": "$58,000 USD",
                    "supervisory_experience": "6",
                    "shift_availability": "No",
                    "warehouse_experience": "Yes",
                    "photo": "cynthia_hayes.jpg"
                  },
                  {
                    "full_name": "Darnell Fisher",
                    "email": "dfisher@hireme.org",
                    "home_address": "55 Elm St, Columbus, OH 43206",
                    "date_of_birth": "1990-02-18",
                    "graduation_year": "2012",
                    "prior_salary": "$44,000 USD",
                    "supervisory_experience": "2",
                    "shift_availability": "Yes",
                    "warehouse_experience": "No",
                    "photo": "darnell_fisher.jpg"
                  },
                  {
                    "full_name": "Elena Vasquez",
                    "email": "evasquez@example.com",
                    "home_address": "210 Cedar Ln, Columbus, OH 43210",
                    "date_of_birth": "1994-09-30",
                    "graduation_year": "2016",
                    "prior_salary": "$41,000 USD",
                    "supervisory_experience": "1",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "elena_vasquez.jpg"
                  },
                  {
                    "full_name": "Franklin Osei",
                    "email": "fosei@consultant.com",
                    "home_address": "880 West Ave, Columbus, OH 43213",
                    "date_of_birth": "1987-06-14",
                    "graduation_year": "2009",
                    "prior_salary": "$55,000 USD",
                    "supervisory_experience": "5",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "franklin_osei.jpg"
                  },
                  {
                    "full_name": "Gabrielle Roy",
                    "email": "groy@careermail.com",
                    "home_address": "177 Birch St, Columbus, OH 43202",
                    "date_of_birth": "1991-12-05",
                    "graduation_year": "2013",
                    "prior_salary": "$46,000 USD",
                    "supervisory_experience": "3",
                    "shift_availability": "Yes",
                    "warehouse_experience": "No",
                    "photo": "gabrielle_roy.jpg"
                  },
                  {
                    "full_name": "Hector Mendez",
                    "email": "hmendez@workplace.net",
                    "home_address": "450 Walnut Ave, Columbus, OH 43205",
                    "date_of_birth": "1988-08-19",
                    "graduation_year": "2010",
                    "prior_salary": "$50,000 USD",
                    "supervisory_experience": "4",
                    "shift_availability": "No",
                    "warehouse_experience": "Yes",
                    "photo": "hector_mendez.jpg"
                  },
                  {
                    "full_name": "Isabel Choi",
                    "email": "ichoi@proton.me",
                    "home_address": "633 Spruce Ct, Columbus, OH 43214",
                    "date_of_birth": "1993-03-27",
                    "graduation_year": "2015",
                    "prior_salary": "$43,000 USD",
                    "supervisory_experience": "2",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "isabel_choi.jpg"
                  },
                  {
                    "full_name": "James Whitfield",
                    "email": "jwhitfield@oldmail.com",
                    "home_address": "910 Cherry Blvd, Columbus, OH 43209",
                    "date_of_birth": "1986-10-11",
                    "graduation_year": "2008",
                    "prior_salary": "$56,000 USD",
                    "supervisory_experience": "7",
                    "shift_availability": "Yes",
                    "warehouse_experience": "Yes",
                    "photo": "james_whitfield.jpg"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Key numbers for this assignment",
            "body": "These metrics define the scope of the task.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Total applicants",
                  "value": "220"
                },
                {
                  "label": "Shortlist spots",
                  "value": "20"
                },
                {
                  "label": "Roles to fill",
                  "value": "6"
                },
                {
                  "label": "Days until deadline",
                  "value": "4"
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Reminder from Marcus Webb",
            "body": "Marcus Webb, Senior Recruiter, sent a message about using Summit Assist safely.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Marcus Webb"
                },
                "body": "Hi there,\n\nQuick reminder before you start using Summit Assist for the shift-supervisor shortlist.\n\nSummit Assist **cannot connect to our applicant tracking system** or any company HR system. It also **cannot guarantee that personal data stays within company control** once uploaded. There is no signed data-processing agreement covering Summit Assist for candidate data.\n\nBecause of that, **you must strip out any personal data fields** that are not strictly needed to evaluate job qualifications before you upload anything to Summit Assist. That includes home address, date of birth, prior salary, and photo.\n\nLet me know if you have questions.\n\nMarcus",
                "timestamp": "Monday, June 1, 2026 10:30 AM"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Classify each data field",
            "body": "Diane needs a shortlist of **20 candidates** from **220 applicants** by **Friday, June 5, 2026**. The posted job requirements for shift-supervisor are: supervisory experience, availability for shift work including nights and weekends, and distribution or warehouse experience.\n\nBefore you can work with the data, classify each field below. Pick **Needed for job evaluation** if the field helps you assess whether an applicant meets the posted requirements. Pick **Not needed** if it does not.",
            "caseContext": {
              "actions": [
                {
                  "value": "needed",
                  "label": "Needed for job evaluation"
                },
                {
                  "value": "not_needed",
                  "label": "Not needed"
                }
              ],
              "rows": [
                {
                  "id": "full_name",
                  "label": "Full Name"
                },
                {
                  "id": "email",
                  "label": "Email"
                },
                {
                  "id": "home_address",
                  "label": "Home Address"
                },
                {
                  "id": "date_of_birth",
                  "label": "Date of Birth"
                },
                {
                  "id": "graduation_year",
                  "label": "Graduation Year"
                },
                {
                  "id": "prior_salary",
                  "label": "Prior Salary"
                },
                {
                  "id": "years_supervisory",
                  "label": "Years of Supervisory Experience"
                },
                {
                  "id": "availability_shift",
                  "label": "Availability for Shift Work"
                },
                {
                  "id": "warehouse_exp",
                  "label": "Distribution or Warehouse Experience"
                },
                {
                  "id": "photo",
                  "label": "Photo"
                }
              ],
              "rows[0].hint": "Needed for identification and communication, not for evaluating qualifications against requirements",
              "rows[1].hint": "Needed for contacting applicants, not for evaluating qualifications",
              "rows[2].hint": "Not a posted job requirement; using location to filter introduces bias",
              "rows[3].hint": "Not a posted job requirement; age is prohibited from screening decisions",
              "rows[4].hint": "Not a posted job requirement; graduation year correlates with age",
              "rows[5].hint": "Not a posted job requirement; salary history is prohibited from screening decisions",
              "rows[6].hint": "Directly relevant to the supervisory experience requirement",
              "rows[7].hint": "Directly relevant to the shift-work availability requirement",
              "rows[8].hint": "Directly relevant to the warehouse experience requirement",
              "rows[9].hint": "Not a posted job requirement; photos are prohibited from screening decisions"
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Identify personal data to remove",
            "body": "Company policy says: **Remove any field that is not strictly needed to evaluate job qualifications before uploading data to an external tool**. Summit Assist cannot guarantee that personal data pasted into it stays within company control.\n\nFor each field below, pick **Must remove** if it contains personal data that should be stripped before using Summit Assist. Pick **Keep** if it is needed for evaluating qualifications.",
            "caseContext": {
              "actions": [
                {
                  "value": "remove",
                  "label": "Must remove"
                },
                {
                  "value": "keep",
                  "label": "Keep"
                }
              ],
              "rows": [
                {
                  "id": "full_name",
                  "label": "Full Name"
                },
                {
                  "id": "email",
                  "label": "Email"
                },
                {
                  "id": "home_address",
                  "label": "Home Address"
                },
                {
                  "id": "date_of_birth",
                  "label": "Date of Birth"
                },
                {
                  "id": "graduation_year",
                  "label": "Graduation Year"
                },
                {
                  "id": "prior_salary",
                  "label": "Prior Salary"
                },
                {
                  "id": "years_supervisory",
                  "label": "Years of Supervisory Experience"
                },
                {
                  "id": "availability_shift",
                  "label": "Availability for Shift Work"
                },
                {
                  "id": "warehouse_exp",
                  "label": "Distribution or Warehouse Experience"
                },
                {
                  "id": "photo",
                  "label": "Photo"
                }
              ],
              "rows[0].hint": "Name alone is not sensitive personal data, but it is not needed for evaluating qualifications against requirements",
              "rows[1].hint": "Email is needed to contact candidates, but not for evaluating qualifications",
              "rows[2].hint": "Home address is personal data; using location to screen is prohibited by policy",
              "rows[3].hint": "Date of birth is personal data; age is prohibited from screening decisions",
              "rows[4].hint": "Graduation year correlates with age and is not needed for evaluating qualifications",
              "rows[5].hint": "Prior salary is personal data; salary history is prohibited from screening decisions",
              "rows[6].hint": "Years of supervisory experience is needed for evaluating qualifications",
              "rows[7].hint": "Availability for shift work is needed for evaluating qualifications",
              "rows[8].hint": "Distribution or warehouse experience is needed for evaluating qualifications",
              "rows[9].hint": "Photo is personal data; photos are prohibited from screening decisions"
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Tradeoffs in stripping personal data",
            "body": "Stripping personal data fields before uploading to Summit Assist creates tradeoffs. Consider each one below.\n\n**Speed vs. privacy protection.** Removing fields takes time. You have **4 days** to shortlist **20 candidates** from **220 applicants**. But leaving personal data in exposes applicants to risk if Summit Assist cannot guarantee data stays within company control.\n\n**Completeness vs. compliance.** If you keep fields like home address, you could filter by location. But company policy prohibits using home location, age, salary history, or photos to screen candidates.\n\n**Risk of using prohibited data.** Summit Assist will process whatever you give it. If you include location or salary data, the tool could use those fields to rank candidates even if you did not intend it. The tool cannot detect or correct for bias in its own outputs.\n\nMove the sliders to show how you balance each tradeoff.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your first instruction to Summit Assist",
            "body": "You have cleaned the data and are ready to use Summit Assist. Write the instruction you will give the tool to summarize applicants against the posted job requirements for the shift-supervisor role.\n\nRemember what Summit Assist can do: summarize application text against a list of job requirements, draft a neutral comparison table, flag missing or incomplete fields, and generate a plain-language notice about AI-assisted screening.\n\nWhat do you ask Summit Assist to do?",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Company AI-use policy",
            "body": "Marcus Webb sent this policy document. Review it before you proceed.",
            "caseContext": {
              "attachments": [
                {
                  "name": "AI_Use_Policy_Hiring_v2.pdf",
                  "kind": "document"
                },
                {
                  "name": "Applicant_Privacy_Notice_Template.docx",
                  "kind": "document"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "Summit Assist capabilities and limits",
            "body": "You open Summit Assist to review what it can and cannot do for this assignment.\n\n**What Summit Assist can do:**\n- Summarize application text against a list of job requirements\n- Draft a neutral comparison table of candidates on defined criteria\n- Flag missing or incomplete fields in a structured data set\n- Generate a plain-language notice about AI-assisted screening for applicants\n\n**What Summit Assist cannot do:**\n- Connect to the applicant tracking system or any company HR system\n- Access candidate data under a signed data-processing agreement\n- Produce a legally defensible ranking or fit score\n- Guarantee that personal data pasted into it stays within company control\n- Detect or correct for bias in its own outputs",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request to Summit Assist",
            "body": "Diane needs a shortlist of **20 candidates** from **220 applicants** by **Friday, June 5, 2026**. You will use Summit Assist to summarize applicant data against the posted job requirements for the shift-supervisor role.\n\nBefore you write, choose the goal, the audience for the summary, and the data limits you want Summit Assist to follow.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Summarize each applicant against the posted job requirements for shift supervisor",
                  "Flag which applicants are missing required fields in their application",
                  "Generate a notice about AI-assisted screening to send to applicants",
                  "Rank all 220 applicants from best to worst fit for the role"
                ],
                "audiencias": [
                  "Diane Marchetti, Hiring Manager",
                  "Marcus Webb, Senior Recruiter",
                  "All 220 applicants",
                  "The 20 shortlisted candidates only"
                ],
                "limites": [
                  "Use only job-relevant fields: supervisory experience, shift availability, and warehouse experience",
                  "Include all data fields so the hiring manager has the full picture",
                  "Exclude home address, date of birth, salary history, and photo from the analysis",
                  "Filter candidates by how close they live to the distribution center"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Review Summit Assist output for risks",
            "body": "You asked Summit Assist to summarize each applicant against the job requirements. Here is the output it returned for a few candidates. Review each segment and flag any that contain personal data or other risks under company policy.",
            "caseContext": {
              "segments": [
                {
                  "id": "s1",
                  "text": "Angela Torres: 4 years supervisory experience, available for shift work, has warehouse experience. Home address: 1425 Oak St, Apt 3B, Columbus, OH 43201.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s2",
                  "text": "Brian Kwon: 3 years supervisory experience, available for shift work, has warehouse experience. Date of birth: 1992-11-03.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s3",
                  "text": "Cynthia Hayes: 6 years supervisory experience, NOT available for shift work, has warehouse experience.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "s4",
                  "text": "Darnell Fisher: 2 years supervisory experience, available for shift work, no warehouse experience. Prior salary: $44,000 USD.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "s5",
                  "text": "Franklin Osei: 5 years supervisory experience, available for shift work, has warehouse experience. Photo: franklin_osei.jpg.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write a corrected instruction",
            "body": "Your review showed that Summit Assist included personal data (home address, date of birth, salary, and photo) in the candidate summaries. Company policy requires you to remove any field that is not strictly needed to evaluate job qualifications before uploading data to an external tool.\n\nWrite a new instruction to Summit Assist that tells it exactly which fields to use and which to exclude. Be specific.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Check the revised output",
            "body": "You sent a corrected instruction. Summit Assist removed home address, date of birth, salary, and photo. Here is the revised output for a few candidates. Review each segment and flag any that still contain a risk.",
            "caseContext": {
              "segments": [
                {
                  "id": "t1",
                  "text": "Angela Torres: 4 years supervisory experience, available for shift work, has warehouse experience. Graduation year: 2011.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "t2",
                  "text": "Brian Kwon: 3 years supervisory experience, available for shift work, has warehouse experience. Graduation year: 2014.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "t3",
                  "text": "Cynthia Hayes: 6 years supervisory experience, NOT available for shift work, has warehouse experience. Graduation year: 2007.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "t4",
                  "text": "Darnell Fisher: 2 years supervisory experience, available for shift work, no warehouse experience.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "t5",
                  "text": "Franklin Osei: 5 years supervisory experience, available for shift work, has warehouse experience.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Check the revised output",
            "body": "You asked Summit Assist to produce a candidate comparison table using only job-relevant fields. Below is the output it returned. Review each marked segment and flag any that still contains personal data that should have been removed.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Angela Torres | 4 years supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_2",
                  "text": "Brian Kwon | 3 years supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_3",
                  "text": "Cynthia Hayes | 6 years supervisory exp | No (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_4",
                  "text": "Darnell Fisher | 2 years supervisory exp | Yes (shift work) | No (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_5",
                  "text": "Elena Vasquez | 1 year supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_6",
                  "text": "Franklin Osei | 5 years supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_7",
                  "text": "Gabrielle Roy | 3 years supervisory exp | Yes (shift work) | No (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_8",
                  "text": "Hector Mendez | 4 years supervisory exp | No (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_9",
                  "text": "Isabel Choi | 2 years supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_10",
                  "text": "James Whitfield | 7 years supervisory exp | Yes (shift work) | Yes (warehouse exp)",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_11",
                  "text": "Photo filenames included: angela_torres.jpg, brian_kwon.jpg, cynthia_hayes.jpg, darnell_fisher.jpg, elena_vasquez.jpg, franklin_osei.jpg, gabrielle_roy.jpg, hector_mendez.jpg, isabel_choi.jpg, james_whitfield.jpg",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Choose the applicant notification",
            "body": "Company policy requires that you notify applicants about AI-assisted screening before the shortlist is delivered. Diane Marchetti needs a short, clear message to include in the email that goes out to all 220 applicants. Pick the version that correctly informs applicants without overpromising or creating legal exposure.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "We used Summit Assist, an AI tool, to help review applications against the posted job requirements for the shift-supervisor role. This helped us identify candidates who best match the qualifications."
                },
                {
                  "id": "B",
                  "body": "Summit Assist made the final hiring decisions for the shift-supervisor role. If you have questions about how the AI ranked you, contact our recruiting team."
                },
                {
                  "id": "C",
                  "body": "An AI tool was used to screen your application. This tool is certified to be free of bias and complies with all federal and state employment laws."
                },
                {
                  "id": "D",
                  "body": "We used an AI tool to process your application. Your personal data was kept completely confidential and was not shared with any third party."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Follow-up from Diane",
            "body": "Diane Marchetti sends a reminder about the deadline and the notification requirement.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Diane Marchetti"
                },
                "body": "Hi there,\n\nJust checking in on the shift-supervisor shortlist. I need it by end of day this Friday, June 5, 2026. Remember that applicants need to be notified about the AI tool before the shortlist is delivered. Let me know if you have any questions.\n\nThanks,\nDiane Marchetti\nHiring Manager, Distribution Center Operations",
                "timestamp": "Wednesday, June 3, 2026 10:15 AM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Build the shortlist",
            "body": "Based on the posted job requirements for the shift-supervisor role, classify each applicant. The minimum qualifications are: at least **2 years** of supervisory experience, must be available for shift work (including nights and weekends), and must have distribution or warehouse experience. Mark each applicant as **include** or **exclude**.",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include on shortlist"
                },
                {
                  "value": "exclude",
                  "label": "Exclude from shortlist"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Angela Torres - 4 yrs supervisory, Yes shift, Yes warehouse"
                },
                {
                  "id": "row_2",
                  "label": "Brian Kwon - 3 yrs supervisory, Yes shift, Yes warehouse"
                },
                {
                  "id": "row_3",
                  "label": "Cynthia Hayes - 6 yrs supervisory, No shift, Yes warehouse"
                },
                {
                  "id": "row_4",
                  "label": "Darnell Fisher - 2 yrs supervisory, Yes shift, No warehouse"
                },
                {
                  "id": "row_5",
                  "label": "Elena Vasquez - 1 yr supervisory, Yes shift, Yes warehouse"
                },
                {
                  "id": "row_6",
                  "label": "Franklin Osei - 5 yrs supervisory, Yes shift, Yes warehouse"
                },
                {
                  "id": "row_7",
                  "label": "Gabrielle Roy - 3 yrs supervisory, Yes shift, No warehouse"
                },
                {
                  "id": "row_8",
                  "label": "Hector Mendez - 4 yrs supervisory, No shift, Yes warehouse"
                },
                {
                  "id": "row_9",
                  "label": "Isabel Choi - 2 yrs supervisory, Yes shift, Yes warehouse"
                },
                {
                  "id": "row_10",
                  "label": "James Whitfield - 7 yrs supervisory, Yes shift, Yes warehouse"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Choose the shortlist format",
            "body": "Diane needs the shortlist presented in a clear format. Pick the version that presents candidate qualifications neutrally without ranking candidates or using prohibited data (home location, age, salary history, or photo).",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Ranking | Name | Supervisory Exp | Shift Available | Warehouse Exp\n1 | Angela Torres | 4 yrs | Yes | Yes\n2 | Brian Kwon | 3 yrs | Yes | Yes\n3 | Franklin Osei | 5 yrs | Yes | Yes\n4 | Isabel Choi | 2 yrs | Yes | Yes\n5 | James Whitfield | 7 yrs | Yes | Yes"
                },
                {
                  "id": "B",
                  "body": "Name | Supervisory Exp | Shift Available | Warehouse Exp | Home Address\nAngela Torres | 4 yrs | Yes | Yes | 1425 Oak St, Apt 3B, Columbus, OH 43201\nBrian Kwon | 3 yrs | Yes | Yes | 789 Pine Rd, Columbus, OH 43215\nFranklin Osei | 5 yrs | Yes | Yes | 880 West Ave, Columbus, OH 43213\nIsabel Choi | 2 yrs | Yes | Yes | 633 Spruce Ct, Columbus, OH 43214\nJames Whitfield | 7 yrs | Yes | Yes | 910 Cherry Blvd, Columbus, OH 43209"
                },
                {
                  "id": "C",
                  "body": "Name | Supervisory Exp | Shift Available | Warehouse Exp\nAngela Torres | 4 yrs | Yes | Yes\nBrian Kwon | 3 yrs | Yes | Yes\nFranklin Osei | 5 yrs | Yes | Yes\nIsabel Choi | 2 yrs | Yes | Yes\nJames Whitfield | 7 yrs | Yes | Yes"
                },
                {
                  "id": "D",
                  "body": "Name | Supervisory Exp | Shift Available | Warehouse Exp | Prior Salary | Photo\nAngela Torres | 4 yrs | Yes | Yes | $52,000 USD | angela_torres.jpg\nBrian Kwon | 3 yrs | Yes | Yes | $48,500 USD | brian_kwon.jpg\nFranklin Osei | 5 yrs | Yes | Yes | $55,000 USD | franklin_osei.jpg\nIsabel Choi | 2 yrs | Yes | Yes | $43,000 USD | isabel_choi.jpg\nJames Whitfield | 7 yrs | Yes | Yes | $56,000 USD | james_whitfield.jpg"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the applicant notification",
            "body": "Diane Marchetti asked you to notify applicants that an AI tool was used to help decide who moves forward. Marcus Webb reviewed your draft and asked you to pick the final version. Read each option below. Choose the one that is compliant with company policy, clear to applicants, and does not create legal exposure.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Tallgrass Outdoor Co. used Summit Assist, an AI tool, to help screen the 220 applications we received for the shift-supervisor roles at our new distribution center. The tool compared each applicant's experience against the posted job requirements. Your application was included in this process. If you have questions about how the tool was used, contact Diane Marchetti at d.marchetti@tallgrass.com."
                },
                {
                  "id": "B",
                  "body": "We used an AI tool called Summit Assist to help us decide which applicants move forward for the shift-supervisor roles. The tool reviewed your application data including your home address, date of birth, salary history, and photo to generate a ranking. You were not selected for the shortlist. If you believe this was unfair, you may reply to this email to request a manual review."
                },
                {
                  "id": "C",
                  "body": "We used Summit Assist to screen all applicants for the shift-supervisor positions. The tool summarized each applicant's experience against the job requirements posted on the listing. Your application was part of that process. No personal data beyond what you submitted was used, and no automated ranking or score was produced. The final shortlist was reviewed by our hiring team. For questions, contact Diane Marchetti."
                },
                {
                  "id": "D",
                  "body": "Your application for the shift-supervisor role was processed using Summit Assist, an AI screening tool. This tool had access to your full application including your address, date of birth, and photo. By continuing with the application process, you consented to this use. If you do not want your data processed this way, please withdraw your application by replying to this email."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the final notification message",
            "body": "Diane needs the final version of the applicant notification to send to all shortlisted candidates. Write the message here. It must tell applicants that an AI tool was used to help decide who moves forward, be clear and direct, and follow company policy. Write your final message below, one or two paragraphs.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Verify the final shortlist",
            "body": "Earlier you built a shortlist of **20 candidates** from the **220 total applicants**. The sample data below shows the **10 applicants** you reviewed during the case. For each one, classify them as **shortlisted** or **not shortlisted** based on the evaluation you completed in the previous section.",
            "caseContext": {
              "actions": [
                {
                  "value": "shortlisted",
                  "label": "Shortlisted"
                },
                {
                  "value": "not_shortlisted",
                  "label": "Not shortlisted"
                }
              ],
              "rows": [
                {
                  "id": "angela_torres",
                  "label": "Angela Torres"
                },
                {
                  "id": "brian_kwon",
                  "label": "Brian Kwon"
                },
                {
                  "id": "cynthia_hayes",
                  "label": "Cynthia Hayes"
                },
                {
                  "id": "darnell_fisher",
                  "label": "Darnell Fisher"
                },
                {
                  "id": "elena_vasquez",
                  "label": "Elena Vasquez"
                },
                {
                  "id": "franklin_osei",
                  "label": "Franklin Osei"
                },
                {
                  "id": "gabrielle_roy",
                  "label": "Gabrielle Roy"
                },
                {
                  "id": "hector_mendez",
                  "label": "Hector Mendez"
                },
                {
                  "id": "isabel_choi",
                  "label": "Isabel Choi"
                },
                {
                  "id": "james_whitfield",
                  "label": "James Whitfield"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Shortlist and notification summary",
            "body": "You have completed the assignment Diane Marchetti gave you on **Monday, June 1, 2026**. Here is a summary of what was delivered against her three promises.\n\n**Promise 1: Shortlist of 20 shift-supervisor candidates from 220 applicants**\nDelivered. The shortlist of **20 candidates** is ready for Diane's review. Personal data fields (home address, date of birth, salary history, and photo) were removed before any data was uploaded to Summit Assist.\n\n**Promise 2: Delivered by Friday, June 5, 2026**\nOn track. The shortlist will be submitted by the end of the day on **Friday, June 5, 2026**.\n\n**Promise 3: Candidates evaluated against the posted job requirements**\nCompleted. Summit Assist was used to summarize each applicant's experience against the requirements listed in the job posting. No ranking or fit score was produced. The hiring team will make the final selection.\n\n**Promise 4: Applicants notified that an AI tool was used**\nDrafted. The notification message has been written and is ready to send to all shortlisted candidates.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Decide the delivery timing",
            "body": "Diane wants the shortlist by end of day **Friday, June 5, 2026**. You also need to send the applicant notification about AI use. You have two options.\n\n**Option A: Deliver on Friday, notify after**\nSubmit the shortlist to Diane by the Friday deadline. Send the applicant notification to all shortlisted candidates on the following **Monday, June 8, 2026**. This meets Diane's deadline but means candidates learn about AI use after the shortlist is already submitted.\n\n**Option B: Notify first, deliver Monday**\nSend the applicant notification to all shortlisted candidates on **Friday, June 5, 2026**. Submit the shortlist to Diane on **Monday, June 8, 2026**. This ensures every candidate is notified before the shortlist is handed over, but the shortlist arrives one business day late.\n\nChoose an option and write a brief memo to Diane explaining your decision.",
            "caseContext": {
              "decisions": [
                {
                  "id": "deliver_friday",
                  "title": "Deliver on Friday, notify after",
                  "detail": "Submit the shortlist to Diane by end of day Friday, June 5, 2026. Send the applicant notification on Monday, June 8, 2026. Meets the original deadline. Candidates learn about AI use after the shortlist is submitted."
                },
                {
                  "id": "notify_first_deliver_monday",
                  "title": "Notify first, deliver Monday",
                  "detail": "Send the applicant notification on Friday, June 5, 2026. Submit the shortlist to Diane on Monday, June 8, 2026. Every candidate is notified before the shortlist is handed over. The shortlist arrives one business day late."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "verdant_comms_boarddeck": {
    "caseId": "verdant_comms_boarddeck",
    "version": 1,
    "meta": {
      "level": "N2 · Workflow",
      "profile": "Communications",
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
      "primary_question": "Whether this communications manager can turn a milestone into a board deck and public announcement with judgment: telling apart what is verifiable from what the AI made up, never putting an unprovable customer or market claim in front of the board or the public, and knowing which claims need sign-off before anything ships.",
      "assignment_brief": "Priya assigns you the board deck and press announcement for the Series B close and the 500-building milestone. She says: \"Marcus Webb, our chief executive officer, presents to the board on Tuesday, June 9, 2026. I need a draft deck narrative and a press-ready external announcement by Wednesday, June 3. Use the AI writing assistant to speed things up, but every claim in the final versions has to be something we can prove if a board member or a reporter asks. I fed the tool our internal metrics doc, last quarter's numbers, and your outline. It came back with a polished draft. Your job is to check every claim against what is actually true and verifiable, flag or remove anything we cannot stand behind, and decide what ships and what needs sign-off. Come to me with your call.\"",
      "business_metric": "Speed to publish a board deck and press announcement that are accurate and compelling",
      "risk_metric": "Number of unverifiable or fabricated claims that reach the board or the public",
      "expected_signal": "The participant identifies which claims in the AI draft are unverifiable or fabricated, flags them for leadership and legal sign-off, and does not let unsupported customer counts, growth rates, dollar savings, or competitor comparisons appear in the final deck or announcement without approval.",
      "expected_action": "escalar",
      "alternatives": [
        "pilotar",
        "entrenar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Verdant Grid: Series B announcement",
            "body": "You are the **Communications Manager** at **Verdant Grid**, a commercial energy-management company that helps building owners reduce energy waste. The company just closed a **$3,400,000 USD Series B** and crossed **500 commercial buildings under management**.\n\nYour job: produce two high-stakes deliverables in **48 hours**.\n\n1. A **board deck narrative** for the presentation Marcus Webb, our chief executive officer, gives to the board on **Tuesday, June 9, 2026**.\n2. A **press-ready external announcement** for US business media announcing the Series B close and the 500-building milestone.\n\nYou will use **DraftForge**, an AI writing tool that generates polished narrative text from outlines and source documents. DraftForge can suggest headlines, format content into slide and press-release structure, and flag internal inconsistencies it detects. But it cannot verify claims against real company data, distinguish a real metric from a plausible-sounding invented one, or publish anything on its own. That judgment is yours.",
            "caseContext": {
              "meta": {
                "profile": "Communications",
                "level": "N2 · Workflow",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Assignment from Priya Chandrasekhar",
            "body": "Your VP of Communications, **Priya Chandrasekhar**, sends you a message with clear instructions.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Priya Chandrasekhar"
                },
                "body": "Hi team,\n\nWe have two critical pieces to deliver this week. Marcus presents to the board on June 9, and we are also going public with the Series B close and the 500-building milestone. I need you to:\n\n1. Draft the **board deck narrative** using DraftForge. Give Marcus a compelling story about our growth, our customers, and what the Series B enables.\n2. Draft a **press-ready external announcement** for US business media covering the Series B and the 500-building milestone.\n\n**Cross-check every claim** in the AI draft against our verified internal data. If DraftForge generates a number or a statement we cannot prove when a board member or reporter asks, flag it or cut it.\n\nDeadline: **Wednesday, June 3, 2026**, end of day.\n\nDecide what ships as-is, what needs legal sign-off, and what gets cut. I trust your judgment.\n\nPriya",
                "timestamp": "Monday, June 1, 2026, 9:15 AM ET"
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "Customer data for cross-checking",
            "body": "This is the dataset of **10 commercial building accounts** from the Verdant Grid platform. You will use it to verify claims in the DraftForge output and to decide which customers can be named in the board deck and press announcement.",
            "caseContext": {
              "table": {
                "columns": [
                  {
                    "key": "customer_name",
                    "label": "Customer name"
                  },
                  {
                    "key": "building_type",
                    "label": "Building type"
                  },
                  {
                    "key": "state",
                    "label": "State"
                  },
                  {
                    "key": "sq_ft",
                    "label": "Square footage"
                  },
                  {
                    "key": "annual_energy_spend",
                    "label": "Annual energy spend"
                  },
                  {
                    "key": "annual_savings_verified",
                    "label": "Annual savings (verified)"
                  },
                  {
                    "key": "months_active",
                    "label": "Months active"
                  },
                  {
                    "key": "opt_out_status",
                    "label": "Opted out of press"
                  },
                  {
                    "key": "consent_for_testimonial",
                    "label": "Testimonial release"
                  },
                  {
                    "key": "notes",
                    "label": "Notes"
                  }
                ],
                "rows": [
                  {
                    "customer_name": "Meridian Tower",
                    "building_type": "Office",
                    "state": "NY",
                    "sq_ft": 320000,
                    "annual_energy_spend": "$1,200,000 USD",
                    "annual_savings_verified": "$96,000 USD",
                    "months_active": 18,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "Yes",
                    "notes": "Flagship account. Referenced in Series A deck."
                  },
                  {
                    "customer_name": "Pinecrest Medical Plaza",
                    "building_type": "Medical office",
                    "state": "OH",
                    "sq_ft": 95000,
                    "annual_energy_spend": "$410,000 USD",
                    "annual_savings_verified": "$28,700 USD",
                    "months_active": 14,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "No",
                    "notes": "Has not signed testimonial release. Do not name publicly."
                  },
                  {
                    "customer_name": "Westfield Logistics Hub",
                    "building_type": "Warehouse",
                    "state": "IN",
                    "sq_ft": 480000,
                    "annual_energy_spend": "$890,000 USD",
                    "annual_savings_verified": "$62,300 USD",
                    "months_active": 10,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "Yes",
                    "notes": ""
                  },
                  {
                    "customer_name": "Coastal Retail Center",
                    "building_type": "Retail",
                    "state": "FL",
                    "sq_ft": 180000,
                    "annual_energy_spend": "$520,000 USD",
                    "annual_savings_verified": "$36,400 USD",
                    "months_active": 8,
                    "opt_out_status": "Yes",
                    "consent_for_testimonial": "No",
                    "notes": "Opted out of all marketing and press mentions. Flagged."
                  },
                  {
                    "customer_name": "Summit Corporate Park",
                    "building_type": "Office",
                    "state": "CA",
                    "sq_ft": 600000,
                    "annual_energy_spend": "$2,100,000 USD",
                    "annual_savings_verified": "$168,000 USD",
                    "months_active": 24,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "Yes",
                    "notes": "Longest-tenured customer. Good case study candidate."
                  },
                  {
                    "customer_name": "Red Rock Data Center",
                    "building_type": "Data center",
                    "state": "AZ",
                    "sq_ft": 150000,
                    "annual_energy_spend": "$3,400,000 USD",
                    "annual_savings_verified": "$238,000 USD",
                    "months_active": 6,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "No",
                    "notes": "High spend but new. No testimonial release on file."
                  },
                  {
                    "customer_name": "Harborview School District",
                    "building_type": "K-12 school",
                    "state": "WA",
                    "sq_ft": 220000,
                    "annual_energy_spend": "$680,000 USD",
                    "annual_savings_verified": "$47,600 USD",
                    "months_active": 12,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "Yes",
                    "notes": ""
                  },
                  {
                    "customer_name": "Northside Community Hospital",
                    "building_type": "Hospital",
                    "state": "IL",
                    "sq_ft": 400000,
                    "annual_energy_spend": "$2,800,000 USD",
                    "annual_savings_verified": "$196,000 USD",
                    "months_active": 9,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "No",
                    "notes": "Health facility. Legal requires extra review before any public mention."
                  },
                  {
                    "customer_name": "Lakeside Plaza",
                    "building_type": "Mixed-use",
                    "state": "TX",
                    "sq_ft": 250000,
                    "annual_energy_spend": "$750,000 USD",
                    "annual_savings_verified": "$52,500 USD",
                    "months_active": 3,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "No",
                    "notes": "Very new. Savings may not be representative. No release."
                  },
                  {
                    "customer_name": "Metroline Depot",
                    "building_type": "Transit facility",
                    "state": "PA",
                    "sq_ft": 120000,
                    "annual_energy_spend": "$340,000 USD",
                    "annual_savings_verified": "$23,800 USD",
                    "months_active": 15,
                    "opt_out_status": "No",
                    "consent_for_testimonial": "Yes",
                    "notes": ""
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "Key metrics at a glance",
            "body": "These three headline numbers define the story you need to tell. The AI draft will likely reference them. You must verify each one against the internal data before it reaches the board or the press.",
            "caseContext": {
              "kpis": [
                {
                  "label": "Commercial buildings under management",
                  "value": "500",
                  "delta": {}
                },
                {
                  "label": "Series B funding round",
                  "value": "$3,400,000 USD",
                  "delta": {}
                },
                {
                  "label": "Total verified annual savings across all 500 buildings",
                  "value": "$18,500,000 USD",
                  "delta": {}
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Reminder from Elena Torres",
            "body": "**Elena Torres**, Head of Legal and Compliance, sends a reminder about the rules that govern what you can publish.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Elena Torres"
                },
                "body": "Hi all,\n\nA quick reminder as you prepare materials for the board meeting and press announcement.\n\n**Opt-out rule:** Any customer who has opted out of marketing or press mentions must never appear in board materials or the press announcement in a way that names or identifies them. This is not negotiable.\n\n**Testimonial release rule:** Any customer who has not signed a testimonial release may not be quoted or named in external-facing materials, including press announcements. Board deck is internal, but if our chief executive officer plans to share slides externally later, treat it the same way.\n\n**Health facilities:** Accounts like Northside Community Hospital (and any other health-care facility) need extra legal review before any public mention, even if aggregated. Run those by me first.\n\nAggregated or anonymized data (no customer name, no identifying details) is fine as long as the numbers are verified and the aggregation does not allow re-identification of a single account.\n\nIf you have any questions on a specific customer, flag it to me before the deadline.\n\nElena",
                "timestamp": "Monday, June 1, 2026, 10:30 AM ET"
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Triage customer rows for board deck use",
            "body": "For each of the **10 customer accounts**, decide how it can be used in the board deck narrative. The board deck is an internal presentation, but it could be shared externally after the meeting. Apply company policy on opt-out status and testimonial consent.",
            "caseContext": {
              "actions": [
                {
                  "value": "name_and_quote",
                  "label": "Name and quote in board deck"
                },
                {
                  "value": "aggregate_only",
                  "label": "Use in aggregate only (no name or identifying details)"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot use in any form"
                }
              ],
              "rows": [
                {
                  "id": "meridian_tower",
                  "label": "Meridian Tower, Office, NY, Opt-out: No, Consent: Yes, Notes: Flagship account"
                },
                {
                  "id": "pinecrest_medical",
                  "label": "Pinecrest Medical Plaza, Medical office, OH, Opt-out: No, Consent: No, Notes: No testimonial release"
                },
                {
                  "id": "westfield_logistics",
                  "label": "Westfield Logistics Hub, Warehouse, IN, Opt-out: No, Consent: Yes"
                },
                {
                  "id": "coastal_retail",
                  "label": "Coastal Retail Center, Retail, FL, Opt-out: Yes, Consent: No, Notes: Opted out of all marketing"
                },
                {
                  "id": "summit_corporate",
                  "label": "Summit Corporate Park, Office, CA, Opt-out: No, Consent: Yes, Notes: Longest-tenured customer"
                },
                {
                  "id": "red_rock_data",
                  "label": "Red Rock Data Center, Data center, AZ, Opt-out: No, Consent: No, Notes: No testimonial release"
                },
                {
                  "id": "harborview_school",
                  "label": "Harborview School District, K-12 school, WA, Opt-out: No, Consent: Yes"
                },
                {
                  "id": "northside_hospital",
                  "label": "Northside Community Hospital, Hospital, IL, Opt-out: No, Consent: No, Notes: Health facility, legal review required"
                },
                {
                  "id": "lakeside_plaza",
                  "label": "Lakeside Plaza, Mixed-use, TX, Opt-out: No, Consent: No, Notes: Very new, no release"
                },
                {
                  "id": "metroline_depot",
                  "label": "Metroline Depot, Transit facility, PA, Opt-out: No, Consent: Yes"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "Triage customer rows for press announcement",
            "body": "Now re-evaluate the same **10 customer accounts** for the **press announcement** that will go to US business media. External-facing rules are stricter. Any customer who has not signed a testimonial release may not be named or quoted. Any customer who opted out is excluded entirely. Health facilities need extra legal review before any public mention.",
            "caseContext": {
              "actions": [
                {
                  "value": "name_and_quote",
                  "label": "Name and quote in press announcement"
                },
                {
                  "value": "aggregate_only",
                  "label": "Use in aggregate only (no name or identifying details)"
                },
                {
                  "value": "cannot_use",
                  "label": "Cannot use in any form"
                }
              ],
              "rows": [
                {
                  "id": "meridian_tower_press",
                  "label": "Meridian Tower, Office, NY, Opt-out: No, Consent: Yes, Notes: Flagship account"
                },
                {
                  "id": "pinecrest_medical_press",
                  "label": "Pinecrest Medical Plaza, Medical office, OH, Opt-out: No, Consent: No, Notes: No testimonial release"
                },
                {
                  "id": "westfield_logistics_press",
                  "label": "Westfield Logistics Hub, Warehouse, IN, Opt-out: No, Consent: Yes"
                },
                {
                  "id": "coastal_retail_press",
                  "label": "Coastal Retail Center, Retail, FL, Opt-out: Yes, Consent: No, Notes: Opted out of all marketing"
                },
                {
                  "id": "summit_corporate_press",
                  "label": "Summit Corporate Park, Office, CA, Opt-out: No, Consent: Yes, Notes: Longest-tenured customer"
                },
                {
                  "id": "red_rock_data_press",
                  "label": "Red Rock Data Center, Data center, AZ, Opt-out: No, Consent: No, Notes: No testimonial release"
                },
                {
                  "id": "harborview_school_press",
                  "label": "Harborview School District, K-12 school, WA, Opt-out: No, Consent: Yes"
                },
                {
                  "id": "northside_hospital_press",
                  "label": "Northside Community Hospital, Hospital, IL, Opt-out: No, Consent: No, Notes: Health facility, legal review required"
                },
                {
                  "id": "lakeside_plaza_press",
                  "label": "Lakeside Plaza, Mixed-use, TX, Opt-out: No, Consent: No, Notes: Very new, no release"
                },
                {
                  "id": "metroline_depot_press",
                  "label": "Metroline Depot, Transit facility, PA, Opt-out: No, Consent: Yes"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Balance tradeoffs for board deck detail level",
            "body": "Priya wants the board deck to show customer proof points. But you have constraints: **legal safety** (no violations of opt-out or consent rules), **narrative impact** (compelling named examples drive confidence), and **speed** (you have until **Wednesday, June 3, 2026** to deliver drafts).\n\nConsider three approaches:\n- **Named only**: Use only the 4 customers with full consent (Meridian Tower, Westfield Logistics Hub, Summit Corporate Park, Harborview School District, Metroline Depot). Strong impact, narrow data set.\n- **Aggregated plus named**: Show aggregate metrics for all 500 buildings, then highlight the 4 consent-cleared customers by name. Balanced approach.\n- **Aggregated only**: Use no customer names. Use anonymized aggregate figures only. Legally safest, but less compelling for the board.\n\nReview the tradeoffs. You will decide the approach in the next section.",
            "caseContext": {}
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write your first DraftForge prompt",
            "body": "You are about to open **DraftForge** for the first time. Write a prompt that will generate a **board deck narrative outline** using the customer data and key numbers provided.\n\nYour prompt should tell DraftForge:\n- What to produce (a narrative outline for the board deck)\n- Which data to use (customer accounts, key metrics, the **500-building milestone**, the **$3,400,000 USD Series B**)\n- Any constraints or rules to follow (opt-out status, consent, health-facility review)\n- The tone and audience (board of directors)\n\nWrite your instruction here, one or two lines.",
            "caseContext": {}
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "Company policy: Customer testimonials and public mentions",
            "body": "Elena Torres sent this policy document as a reminder. Review it carefully before you finalize any customer selections for the board deck or press announcement.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Verdant Grid Policy 4.3, Customer Publicity and Testimonials",
                  "kind": "pdf"
                },
                {
                  "name": "Verdant Grid Policy 4.7, Health Facility Communications Review",
                  "kind": "pdf"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "DraftForge capabilities and limits",
            "body": "DraftForge generates polished narrative text from outlines and source documents. It suggests headline language and formats content into slide or press release structure. It can flag internal inconsistencies it detects in your source materials. However, DraftForge **cannot verify claims** against real company data or external sources. It does not know what is true outside the documents it receives. It **cannot distinguish** a real metric from a plausible-sounding invented one. It never publishes or sends anything on its own.",
            "caseContext": {}
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your press announcement request",
            "body": "You are drafting the press announcement for the **$3,400,000 USD Series B** and the **500-building milestone**. Choose the goal, audience, and data limits for your DraftForge request.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Announce Series B funding round and total amount",
                  "Highlight 500-building milestone and average savings of 7.2%",
                  "Position Verdant Grid as a leader in commercial energy optimization",
                  "Generate interest from prospective building owners and operators"
                ],
                "audiencias": [
                  "US business media (trade and general business press)",
                  "Prospective commercial real estate customers",
                  "Current investors and potential future investors",
                  "Verdant Grid employees and internal stakeholders"
                ],
                "limites": [
                  "Use only aggregated data with no named customers",
                  "Include named customers only if they have signed testimonial releases",
                  "Exclude any customer who has opted out of press mentions",
                  "Do not include savings claims that cannot be verified from the customer database"
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "Flag risks in DraftForge's draft",
            "body": "DraftForge returned the first draft of the press announcement. Read each segment below. Flag any segment that contains a fabricated claim, a named customer without consent, or other policy violation.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Verdant Grid today announced the close of a $3,400,000 USD Series B funding round.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_2",
                  "text": "The company now manages energy for 500 commercial buildings across the United States.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_3",
                  "text": "Customers save an average of 12.4% on their annual energy costs, representing over $25 million in total verified savings.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_4",
                  "text": "\"Verdant Grid transformed our energy strategy,\" said a spokesperson from Pinecrest Medical Plaza.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_5",
                  "text": "Summit Corporate Park in California, Verdant Grid's longest-tenured customer, has achieved $168,000 USD in verified annual savings.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_6",
                  "text": "The company projects it will reach 1,000 buildings under management within 18 months.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Write a corrective DraftForge prompt",
            "body": "The first draft contained a fabricated savings percentage (**12.4%** instead of the verified **7.2%**), a fabricated total savings figure, a named quote from Pinecrest Medical Plaza (no testimonial release), and an unverifiable projection. Write a new DraftForge prompt that fixes these issues and regenerates the press announcement.",
            "caseContext": {}
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Review the revised press announcement",
            "body": "DraftForge generated a revised press announcement based on your corrective prompt. Read each segment below. Flag any segment that still contains a policy violation or an unverifiable claim.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_7",
                  "text": "Verdant Grid has closed a $3,400,000 USD Series B round led by Acrew Capital.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_8",
                  "text": "The platform now serves 500 commercial buildings, with average verified savings of 7.2% on annual energy spend.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_9",
                  "text": "Coastal Retail Center in Florida reduced its annual energy spend by $36,400 USD after joining the platform.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_10",
                  "text": "Total verified annual savings across all customers is approximately $18,500,000 USD.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_11",
                  "text": "Verdant Grid is the fastest-growing energy optimization platform in the commercial real estate sector.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_12",
                  "text": "The company expects to expand into three new states by the end of the fiscal year.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Flag risks in DraftForge's board deck draft",
            "body": "DraftForge has produced a draft narrative for the board deck. Review each segment below and flag any that contain an unverifiable claim, a compliance risk, or a sensitive data issue.",
            "caseContext": {
              "segments": [
                {
                  "id": "seg_1",
                  "text": "Verdant Grid now manages energy across 500 commercial buildings nationwide, delivering an average of 7.2% savings on annual energy spend.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_2",
                  "text": "Our longest-tenured customer, Summit Corporate Park in California, has saved over $168,000 USD annually across 600,000 square feet of office space.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "seg_3",
                  "text": "Newer customers like Lakeside Plaza in Texas are already seeing strong early returns, with projected annual savings of $52,500 USD.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_4",
                  "text": "The Series B raise of $3,400,000 USD positions us to scale from 500 to 1,500 buildings by the end of next year.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "seg_5",
                  "text": "Healthcare facilities such as Northside Community Hospital in Illinois are achieving significant reductions in energy use through our platform.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "seg_6",
                  "text": "Coastal Retail Center in Florida, a 180,000-square-foot retail property, is saving $36,400 USD annually with Verdant Grid.",
                  "flagIfMarked": "dato_sensible"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Pick the best board slide headline",
            "body": "The board deck needs a headline for the savings performance slide. Each version below makes a different claim. Choose the one that is both provable from verified data and compliant with customer consent rules.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Verdant Grid delivers 7.2% average savings across 500 commercial buildings."
                },
                {
                  "id": "B",
                  "body": "Verdant Grid customers save over $18,500,000 USD annually, led by Summit Corporate Park with $168,000 USD in verified savings."
                },
                {
                  "id": "C",
                  "body": "Verdant Grid customers save an average of 7.2% on energy, with top performers like Summit Corporate Park and Meridian Tower exceeding 8%."
                },
                {
                  "id": "D",
                  "body": "Verdant Grid cuts energy costs by 7 to 10 percent for commercial buildings nationwide, based on customer data from 500 properties."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Feedback from Marcus Webb",
            "body": "Marcus Webb reviews your board deck draft and sends feedback.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Marcus Webb"
                },
                "body": "Hi team,\n\nI looked at the board deck draft. The savings numbers are solid, but the story needs more punch. I want a customer-success case study on slide 6. Summit Corporate Park is our longest-tenured account, they save $168,000 USD a year, and they are in California where our investors love seeing traction. Let us feature them by name with their photo and quote. That will resonate with the board.\n\nCan you get that into the next revision by Wednesday?\n\nThanks,\nMarcus",
                "timestamp": "Monday, June 1, 2026, 2:15 PM"
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Triage customers for the chief executive officer's case study",
            "body": "Marcus wants a named case study featuring Summit Corporate Park. Review each customer and decide whether they can be included as a named example in the board deck, included only in aggregated data, or excluded entirely.",
            "caseContext": {
              "actions": [
                {
                  "value": "named",
                  "label": "Include as named example"
                },
                {
                  "value": "aggregated",
                  "label": "Include in aggregated data only"
                },
                {
                  "value": "exclude",
                  "label": "Exclude entirely"
                }
              ],
              "rows": [
                {
                  "id": "row_1",
                  "label": "Meridian Tower"
                },
                {
                  "id": "row_2",
                  "label": "Pinecrest Medical Plaza"
                },
                {
                  "id": "row_3",
                  "label": "Westfield Logistics Hub"
                },
                {
                  "id": "row_4",
                  "label": "Coastal Retail Center"
                },
                {
                  "id": "row_5",
                  "label": "Summit Corporate Park"
                },
                {
                  "id": "row_6",
                  "label": "Red Rock Data Center"
                },
                {
                  "id": "row_7",
                  "label": "Harborview School District"
                },
                {
                  "id": "row_8",
                  "label": "Northside Community Hospital"
                },
                {
                  "id": "row_9",
                  "label": "Lakeside Plaza"
                },
                {
                  "id": "row_10",
                  "label": "Metroline Depot"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the best closing paragraph for the board deck",
            "body": "DraftForge generated four closing paragraphs for the board deck narrative. Each one makes a forward-looking claim. Choose the version that is strongest narratively while staying grounded in verified facts and compliant with policy.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "With $3,400,000 USD in new Series B funding and 500 buildings under management, Verdant Grid is positioned to double its footprint. Our proven 7.2% average savings rate gives us a clear path to 1,500 buildings by next year."
                },
                {
                  "id": "B",
                  "body": "The Series B close of $3,400,000 USD validates our model. We have 500 commercial buildings on the platform and verified annual savings of approximately $18,500,000 USD across the portfolio. Our longest-tenured customer, Summit Corporate Park, has been with us for 24 months."
                },
                {
                  "id": "C",
                  "body": "Verdant Grid is scaling fast. With 500 buildings and $3,400,000 USD in Series B funding, we are on track to become the leading energy optimization platform for commercial real estate. Customers like Summit Corporate Park and Meridian Tower trust us with their energy spend."
                },
                {
                  "id": "D",
                  "body": "We closed $3,400,000 USD in Series B funding and now serve 500 commercial buildings. Our platform delivers measurable savings, with top customers seeing reductions of up to 10% on annual energy costs. The board can expect continued growth in the coming year."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Choose the press announcement headline",
            "body": "You have four headline options for the press announcement. Pick the one that is accurate, compliant with company policy, and impactful for the Series B announcement.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "body": "Verdant Grid Raises $3,400,000 USD Series B to Expand AI-Driven Energy Platform Across 500 Commercial Buildings"
                },
                {
                  "id": "B",
                  "body": "Verdant Grid Closes $3,400,000 USD Series B as Customers Like Meridian Tower and Summit Corporate Park Save Over 7% on Energy"
                },
                {
                  "id": "C",
                  "body": "Verdant Grid Secures $3,400,000 USD Series B, Saving Commercial Buildings $18,500,000 USD Annually Across the United States"
                },
                {
                  "id": "D",
                  "body": "Verdant Grid Raises $3,400,000 USD Series B to Bring Energy Savings to 500 Buildings Including Hospitals, Schools, and Data Centers"
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write your final DraftForge prompt",
            "body": "Write a prompt to DraftForge that produces the polished press announcement. It must include the Series B amount, the 500-building milestone, the verified aggregate savings, and comply with all policies on customer names and consent. Be specific about what DraftForge should include and what it must avoid.",
            "caseContext": {}
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Final call: board deck appendix customers",
            "body": "Marcus wants a short appendix for the board deck that names specific customers with their verified savings. Apply all policies one last time. For each customer, decide: **Include** (name and savings in the appendix), **Aggregate only** (use data but do not name), or **Exclude entirely** (remove from the appendix).",
            "caseContext": {
              "actions": [
                {
                  "value": "include",
                  "label": "Include (name and savings)"
                },
                {
                  "value": "aggregate",
                  "label": "Aggregate only (no name)"
                },
                {
                  "value": "exclude",
                  "label": "Exclude entirely"
                }
              ],
              "rows": [
                {
                  "id": "meridian",
                  "label": "Meridian Tower - Office, NY - $96,000 USD savings - 18 months active"
                },
                {
                  "id": "pinecrest",
                  "label": "Pinecrest Medical Plaza - Medical office, OH - $28,700 USD savings - 14 months active"
                },
                {
                  "id": "westfield",
                  "label": "Westfield Logistics Hub - Warehouse, IN - $62,300 USD savings - 10 months active"
                },
                {
                  "id": "coastal",
                  "label": "Coastal Retail Center - Retail, FL - $36,400 USD savings - 8 months active"
                },
                {
                  "id": "summit",
                  "label": "Summit Corporate Park - Office, CA - $168,000 USD savings - 24 months active"
                },
                {
                  "id": "redrock",
                  "label": "Red Rock Data Center - Data center, AZ - $238,000 USD savings - 6 months active"
                },
                {
                  "id": "harborview",
                  "label": "Harborview School District - K-12 school, WA - $47,600 USD savings - 12 months active"
                },
                {
                  "id": "northside",
                  "label": "Northside Community Hospital - Hospital, IL - $196,000 USD savings - 9 months active"
                },
                {
                  "id": "lakeside",
                  "label": "Lakeside Plaza - Mixed-use, TX - $52,500 USD savings - 3 months active"
                },
                {
                  "id": "metroline",
                  "label": "Metroline Depot - Transit facility, PA - $23,800 USD savings - 15 months active"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Final deliverables summary",
            "body": "Here is a summary of the two final deliverables you are sending to Priya Chandrasekhar, Marcus Webb, and Elena Torres.\n\n**Board deck narrative (Tuesday, June 9, 2026)**\n- Headline: \"500 Buildings, $18,500,000 USD in Verified Annual Savings\"\n- Includes the $3,400,000 USD Series B close and the 500-building milestone\n- Aggregate savings figure verified against internal data: **7.2% average savings** across all customers\n- Customer appendix: only customers with signed testimonial releases and no opt-out flag are named\n- Claims that could not be verified from the dataset were removed from the AI draft\n\n**Press announcement (for US business media)**\n- Headline chosen from the options you evaluated\n- Mentions the Series B round, the 500-building milestone, and the aggregate annual savings figure\n- No named customers without signed testimonial releases\n- No mention of customers who opted out\n- No unverifiable growth projections or market share claims\n\n**Items cut or flagged for sign-off**\n- Pinecrest Medical Plaza, Red Rock Data Center, Northside Community Hospital, Lakeside Plaza: not named in external materials (no testimonial release)\n- Coastal Retail Center: excluded from all materials (opted out)\n- Any fabricated metric or unverifiable claim from the initial DraftForge draft was removed\n- Case study candidates for the chief executive officer sent to Elena Torres for legal review before publication",
            "caseContext": {}
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Write your decision memo",
            "body": "Write a decision memo to Priya Chandrasekhar (VP of Communications), Marcus Webb (Chief Executive Officer), and Elena Torres (Head of Legal and Compliance). Explain what ships as-is, what needs sign-off before release, and what was cut. Deliver on all three manager promises: the board deck narrative, the press announcement, and the cross-check against verified data.",
            "caseContext": {
              "decisions": [
                {
                  "id": "ship_as_is",
                  "title": "Ship both deliverables as-is",
                  "detail": "The board deck and press announcement are fully verified and compliant. No further review needed. This saves time before the **Wednesday, June 3, 2026** deadline but skips a final legal read on the chief executive officer's case study candidates."
                },
                {
                  "id": "flag_case_studies",
                  "title": "Ship the press announcement, flag case studies for sign-off",
                  "detail": "The press announcement goes out on schedule. The board deck appendix naming specific customers is sent to Elena Torres for final legal sign-off before the **Tuesday, June 9, 2026** board meeting. This adds a review cycle but ensures the named customers are fully cleared."
                },
                {
                  "id": "flag_all_external",
                  "title": "Flag all external-facing content for legal review",
                  "detail": "Both the press announcement and the board deck (including internal slides) go to Elena Torres for sign-off. This is the most cautious approach but risks missing the press distribution window if legal takes extra time."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  },
  "vertiz_backlog_entregas": {
    "caseId": "vertiz_backlog_entregas",
    "version": 1,
    "meta": {
      "level": "N1 · Fundamentals",
      "profile": "Operations",
      "profile_pack": "operations_automation",
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
      "primary_question": "Can this person clear a delivery exception backlog using AI with judgment, without paying out claims that have no proof of loss or exposing customer data?",
      "assignment_brief": "Assign this case when you want to know if someone in Operations can sort a queue of failed deliveries (claims, fraud, duplicates, customer data), ask AI for a useful customer notice without leaking sensitive information or inventing amounts, review what comes back, and decide whether to resolve, run it solo, or escalate. The result tells you whether they can close exceptions with judgment or need practice before they touch real claim payouts.",
      "business_metric": "on-time exception resolution at 72 hours",
      "risk_metric": "claims paid without proof of loss, or customer data sent to AI",
      "expected_signal": "tells closing with judgment apart from clearing the queue for speed",
      "expected_action": "entrenar",
      "alternatives": [
        "pilotar",
        "pausar"
      ]
    },
    "sections": [
      {
        "id": "contexto",
        "name": "Context",
        "slides": [
          {
            "slideId": "contexto-1",
            "blockId": "case_cover",
            "title": "Clear the delivery exception backlog, with the claims as they came in",
            "body": "You work at **Vantage Logistics**. Your director asked you to **close out this week's delivery exceptions** before **Friday, Jun 5**. The queue came in with claims that have no proof, a duplicate, a package still in transit, and **customer data** mixed into several records. You decide what gets resolved, what you ask AI for, and what you hand your director.",
            "caseContext": {
              "meta": {
                "profile": "Operations",
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
            "slideId": "contexto-2",
            "blockId": "reading_message",
            "title": "Dana assigns you the backlog close-out",
            "body": "Read it in full. What she asks for here is what you deliver at the end.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Dana Whitfield",
                  "role": "Director of Operations · Vantage Logistics"
                },
                "to": {
                  "name": "You",
                  "role": "Operations Analyst"
                },
                "timestamp": "Today, 9:15 AM",
                "subject": "We close the exceptions this week",
                "body": "Hi. This week we **close the delivery exceptions** and the deadline is **Friday, Jun 5**. The queue I'm handing you has questionable claims in it, so the first job is to sort it and not pay out anything that has no support. Once you have it, send me a proposal with three things: the **claims** you're going to resolve and how, the **base notice** that goes out to customers, and the **metrics you'll monitor** so we know if we did this well."
              }
            }
          },
          {
            "slideId": "contexto-3",
            "blockId": "reading_data_table",
            "title": "The exception queue, as it came in",
            "body": "Eight claims. Look at the **exception type**, whether there is **evidence**, and the **declared value** (the high-value ones with no proof are the ones that hurt).",
            "caseContext": {
              "table": {
                "caption": "Exception queue · Jun 1, 2026",
                "columns": [
                  {
                    "key": "guia",
                    "label": "Tracking"
                  },
                  {
                    "key": "excepcion",
                    "label": "Exception"
                  },
                  {
                    "key": "antiguedad",
                    "label": "Age"
                  },
                  {
                    "key": "valor",
                    "label": "Declared value (USD)"
                  },
                  {
                    "key": "evidencia",
                    "label": "Evidence"
                  }
                ],
                "rows": [
                  {
                    "guia": "V-1001",
                    "excepcion": "Incomplete address",
                    "antiguedad": "1 day",
                    "valor": "$420",
                    "evidencia": "on-site photo"
                  },
                  {
                    "guia": "V-1002",
                    "excepcion": "Recipient unavailable (3 attempts)",
                    "antiguedad": "4 days",
                    "valor": "$190",
                    "evidencia": "attempt log"
                  },
                  {
                    "guia": "V-1003",
                    "excepcion": "Damaged in transit",
                    "antiguedad": "2 days",
                    "valor": "$1,250",
                    "evidencia": "damage photo"
                  },
                  {
                    "guia": "V-1004",
                    "excepcion": "Theft claim, marked delivered",
                    "antiguedad": "5 days",
                    "valor": "$3,400",
                    "evidencia": "none"
                  },
                  {
                    "guia": "V-1005",
                    "excepcion": "Not received, POD on file",
                    "antiguedad": "3 days",
                    "valor": "$260",
                    "evidencia": "signature + delivery photo"
                  },
                  {
                    "guia": "V-1006",
                    "excepcion": "Incomplete address",
                    "antiguedad": "1 day",
                    "valor": "$420",
                    "evidencia": "on-site photo"
                  },
                  {
                    "guia": "V-1007",
                    "excepcion": "Route flagged, no delivery attempt",
                    "antiguedad": "6 days",
                    "valor": "$510",
                    "evidencia": "route alert"
                  },
                  {
                    "guia": "V-1008",
                    "excepcion": "Refund requested",
                    "antiguedad": "1 day",
                    "valor": "$330",
                    "evidencia": "out for delivery"
                  }
                ]
              }
            }
          },
          {
            "slideId": "contexto-4",
            "blockId": "reading_kpi_cards",
            "title": "How the operation ran last month",
            "body": "These are the baseline numbers. The one on the left is **the one to beat**.",
            "caseContext": {
              "kpis": [
                {
                  "label": "On-time resolution (72h)",
                  "value": "62%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to beat"
                  }
                },
                {
                  "label": "Claims payout cost",
                  "value": "3.1%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to protect"
                  }
                },
                {
                  "label": "Repeat complaints",
                  "value": "2.4%",
                  "delta": {
                    "direction": "flat",
                    "label": "the number to protect"
                  }
                }
              ]
            }
          },
          {
            "slideId": "contexto-5",
            "blockId": "reading_message",
            "title": "Marcus, from Claims, sets a rule",
            "body": "Read it. This draws a line that isn't up for negotiation.",
            "caseContext": {
              "message": {
                "channel": "email",
                "from": {
                  "name": "Marcus Reed",
                  "role": "Claims Control Analyst · Vantage Logistics"
                },
                "to": {
                  "name": "You",
                  "role": "Operations Analyst"
                },
                "timestamp": "Today, 9:40 AM",
                "subject": "Careful with the payouts in this queue",
                "body": "I saw you're closing out the exceptions. Two things I always check. A claim with **no proof of loss** doesn't get paid, it gets escalated, and that goes double when the declared value is high. And the customer's **address and phone** never go into AI to draft anything; the exception type is enough. Under our privacy policy that counts as a disclosure to a vendor, so if any of it gets out, it's a serious problem."
              }
            }
          }
        ]
      },
      {
        "id": "datos",
        "name": "Data",
        "slides": [
          {
            "slideId": "datos-1",
            "blockId": "categorize_rows",
            "title": "Decide what you do with each claim",
            "body": "For each one: **resolve**, **escalate** if there's doubt or a high value with no proof, or **reject** if it doesn't apply yet. Remember Marcus's rule.",
            "caseContext": {
              "actions": [
                {
                  "value": "resolver",
                  "label": "Resolve"
                },
                {
                  "value": "escalar",
                  "label": "Escalate"
                },
                {
                  "value": "rechazar",
                  "label": "Reject"
                }
              ],
              "rows": [
                {
                  "id": "g3",
                  "label": "V-1003 · damaged in transit · damage photo"
                },
                {
                  "id": "g4",
                  "label": "V-1004 · theft claim $3,400 USD · no proof of loss"
                },
                {
                  "id": "g6",
                  "label": "V-1006 · identical to V-1001"
                },
                {
                  "id": "g8",
                  "label": "V-1008 · package still in transit"
                },
                {
                  "id": "g2",
                  "label": "V-1002 · unavailable after 3 attempts · attempt log"
                }
              ]
            }
          },
          {
            "slideId": "datos-2",
            "blockId": "categorize_rows",
            "title": "What fields can AI see?",
            "body": "For each field decide: **send to model**, **send transformed**, or **don't send**. Apply the case's data policy.",
            "caseContext": {
              "actions": [
                {
                  "value": "va",
                  "label": "Send to model"
                },
                {
                  "value": "transformado",
                  "label": "Send transformed"
                },
                {
                  "value": "no_va",
                  "label": "Don't send"
                }
              ],
              "rows": [
                {
                  "id": "c_tipo",
                  "label": "Exception type"
                },
                {
                  "id": "c_direccion",
                  "label": "Customer address"
                },
                {
                  "id": "c_monto",
                  "label": "Payout amount"
                },
                {
                  "id": "c_nombre",
                  "label": "Customer name"
                }
              ]
            }
          },
          {
            "slideId": "datos-3",
            "blockId": "model_tradeoff_sliders",
            "title": "Tune the model for customer data and money",
            "body": "Move **autonomy**, **security**, and **cost** knowing there's customer data and claim payouts in play. There's no single answer, there's judgment.",
            "caseContext": {
              "modelTradeoff": {
                "prompt": "For a queue with customer data and claim payout amounts, how much autonomy do you give AI, how much security do you require, and how much cost do you accept?",
                "sliderLabels": {
                  "autonomy": "Autonomy",
                  "security": "Security",
                  "cost": "Cost"
                }
              }
            }
          },
          {
            "slideId": "datos-4",
            "blockId": "ai_textfield_free",
            "title": "Write the data use limit",
            "body": "In one or two lines, tell the **Vantage Assistant** what it **can't** use from this queue. This will guide what you ask it for next.",
            "caseContext": {
              "placeholder": "Write the data use limit here, in one or two lines."
            }
          },
          {
            "slideId": "datos-5",
            "blockId": "reading_attachment",
            "title": "The claims and data policy",
            "body": "Three rules. You'll be citing them later.",
            "caseContext": {
              "attachments": [
                {
                  "name": "Claims and data policy · Vantage Logistics",
                  "kind": "pdf",
                  "description": "1) A claim with no proof of loss is escalated, not paid. 2) A duplicate is closed as a single claim. 3) The address, the phone, and the payout amount never go to AI."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "ia",
        "name": "AI",
        "slides": [
          {
            "slideId": "ia-1",
            "blockId": "reading_passive",
            "title": "What the Vantage Assistant is, and what it isn't",
            "body": "The **Vantage Assistant** is the company's approved AI. It **drafts** and **adjusts tone** with whatever you paste into it. It does **not** query the tracking system and it does **not** send anything. It can **invent tracking numbers, amounts, or dates**, so everything it gives back has to be verified."
          },
          {
            "slideId": "ia-2",
            "blockId": "ai_textfield_guided",
            "title": "Build your request to the Vantage Assistant",
            "body": "Define the **goal**, the **audience**, and the **limits** of the notice you want. Be explicit about what it can't use.",
            "caseContext": {
              "guided": {
                "objetivos": [
                  "Tell the customer their claim is under review, in a clear and respectful tone.",
                  "Explain the next step without promising a payout that isn't confirmed."
                ],
                "audiencias": [
                  "Customers with a failed delivery under review.",
                  "Customers waiting on a response to an open claim."
                ],
                "limites": [
                  "Don't mention any payout amount.",
                  "Don't include the customer's address or phone."
                ]
              }
            }
          },
          {
            "slideId": "ia-3",
            "blockId": "ai_output_review",
            "title": "First draft from the Vantage Assistant",
            "body": "Read it carefully and flag what's wrong. Watch for **sensitive data**, **invented amounts**, and **tone**.",
            "caseContext": {
              "segments": [
                {
                  "id": "r1",
                  "text": "Hi Brian, we see your package to 1425 Oak St, Apt 3B is still pending.",
                  "flagIfMarked": "dato_sensible"
                },
                {
                  "id": "r2",
                  "text": "We're confirming a $3,400 payout that you'll see within 24 hours.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r3",
                  "text": "Resolve now or your claim closes for good.",
                  "flagIfMarked": "tono_agresivo"
                },
                {
                  "id": "r4",
                  "text": "We're here to help with anything you need.",
                  "flagIfMarked": "frase_reutilizable"
                }
              ]
            }
          },
          {
            "slideId": "ia-4",
            "blockId": "ai_textfield_free",
            "title": "Tell it what to fix",
            "body": "Write to the **Vantage Assistant** about what to change in that draft. Aim at what you flagged.",
            "caseContext": {
              "placeholder": "Write what to change in the draft here."
            }
          },
          {
            "slideId": "ia-5",
            "blockId": "ai_output_review",
            "title": "Revised draft",
            "body": "Review it again. What matters here is that the change **reflects your instruction** and that there's no sensitive data or amounts left.",
            "caseContext": {
              "segments": [
                {
                  "id": "r5",
                  "text": "Hi, we wanted to let you know your delivery claim is under review.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "r6",
                  "text": "We'll contact you with the next step within 72 hours.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "r7",
                  "text": "Your $260 payout has already been approved by the system.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          }
        ]
      },
      {
        "id": "revision",
        "name": "Verification",
        "slides": [
          {
            "slideId": "revision-1",
            "blockId": "ai_output_review",
            "title": "Hunt the amounts and figures you can't prove",
            "body": "Last review pass. Flag any **amount** or **number** that doesn't come from the case data.",
            "caseContext": {
              "segments": [
                {
                  "id": "v1",
                  "text": "95% of claims are resolved the same day.",
                  "flagIfMarked": "claim_no_verificado"
                },
                {
                  "id": "v2",
                  "text": "Your claim is on file with a tracking number.",
                  "flagIfMarked": "frase_reutilizable"
                },
                {
                  "id": "v3",
                  "text": "We're the fastest carrier in the country.",
                  "flagIfMarked": "claim_no_verificado"
                }
              ]
            }
          },
          {
            "slideId": "revision-2",
            "blockId": "ai_comparison",
            "title": "Pick the closing line for the notice",
            "body": "Four versions of the closing line. Pick the one that informs without over-promising and justify it in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Closing 1",
                  "body": "We'll contact you with the outcome of your claim within 72 hours."
                },
                {
                  "id": "B",
                  "title": "Closing 2",
                  "body": "Your payout will be deposited within the next 24 hours."
                },
                {
                  "id": "C",
                  "title": "Closing 3",
                  "body": "Your claim has been filed. Await a response."
                },
                {
                  "id": "D",
                  "title": "Closing 4",
                  "body": "Respond today or your claim will be canceled."
                }
              ]
            }
          },
          {
            "slideId": "revision-3",
            "blockId": "reading_message",
            "title": "Dana answers with one condition",
            "body": "She messages you on chat before you close.",
            "caseContext": {
              "message": {
                "channel": "chat",
                "from": {
                  "name": "Dana Whitfield",
                  "role": "Director of Operations"
                },
                "to": {
                  "name": "You",
                  "role": "Operations Analyst"
                },
                "timestamp": "Today, 11:05 AM",
                "subject": "Before you close",
                "body": "Good. Before you close, tell me how you left the queue and what notice the customer gets. I want to see your judgment before this goes out."
              }
            }
          },
          {
            "slideId": "revision-4",
            "blockId": "categorize_rows",
            "title": "Final notice checklist",
            "body": "For each part of the notice: **keep**, **fix**, or **cut**.",
            "caseContext": {
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
                  "id": "k_asunto",
                  "label": "Subject: your delivery claim is under review"
                },
                {
                  "id": "k_saludo",
                  "label": "Generic greeting, no full name"
                },
                {
                  "id": "k_monto",
                  "label": "Mention of a payout amount"
                },
                {
                  "id": "k_plazo",
                  "label": "72 hour response window"
                }
              ]
            }
          },
          {
            "slideId": "revision-5",
            "blockId": "ai_comparison",
            "title": "Pick the final version",
            "body": "With Dana's feedback, pick the notice you'd ship. Justify it in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "Version 1",
                  "body": "Hi, your delivery claim is under review. We'll contact you with the outcome within 72 hours. Thanks for your patience."
                },
                {
                  "id": "B",
                  "title": "Version 2",
                  "body": "Hi, your payout is approved and lands within 24 hours."
                },
                {
                  "id": "C",
                  "title": "Version 3",
                  "body": "Hi, your package to your address on file is still under review; we'll write to you."
                },
                {
                  "id": "D",
                  "title": "Version 4",
                  "body": "Hi, respond today or your claim closes; this is important."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "cierre",
        "name": "Close",
        "slides": [
          {
            "slideId": "cierre-1",
            "blockId": "ai_comparison",
            "title": "Pick the batch you resolve first",
            "body": "Four possible batches. Pick which one you resolve first and say why in one line.",
            "caseContext": {
              "options": [
                {
                  "id": "A",
                  "title": "With evidence",
                  "body": "Claims with a photo or a log like V-1003 and V-1002, grouped by attached evidence."
                },
                {
                  "id": "B",
                  "title": "High value in dispute",
                  "body": "The $3,400 USD theft claim that still has no proof of loss attached."
                },
                {
                  "id": "C",
                  "title": "Repeated record",
                  "body": "V-1006 comes in with the same tracking and the same value as V-1001."
                },
                {
                  "id": "D",
                  "title": "The whole queue",
                  "body": "All eight claims together in a single send, without splitting them by type."
                }
              ]
            }
          },
          {
            "slideId": "cierre-2",
            "blockId": "ai_textfield_free",
            "title": "Write the base notice",
            "body": "Write the **full base notice** for the batch you picked. No address, no invented amounts, with the real 72 hour window.",
            "caseContext": {
              "placeholder": "Write the notice the customer would receive here."
            }
          },
          {
            "slideId": "cierre-3",
            "blockId": "categorize_rows",
            "title": "Define the metrics you'll monitor",
            "body": "For each metric: **monitor** or **ignore**. These close the promise you made to Dana.",
            "caseContext": {
              "actions": [
                {
                  "value": "monitorear",
                  "label": "Monitor"
                },
                {
                  "value": "ignorar",
                  "label": "Ignore"
                }
              ],
              "rows": [
                {
                  "id": "m_sla",
                  "label": "On-time resolution at 72h (beat 62%)"
                },
                {
                  "id": "m_reemb",
                  "label": "Claims payout cost (alarm above 3.1%)"
                },
                {
                  "id": "m_quejas",
                  "label": "Repeat complaints (watch above 2.4%)"
                },
                {
                  "id": "m_color",
                  "label": "Button color on the notice"
                }
              ]
            }
          },
          {
            "slideId": "cierre-4",
            "blockId": "reading_passive",
            "title": "Preview of the final notice",
            "body": "This is how the notice to your chosen batch would land, with the **72 hour window** and no promise of an amount."
          },
          {
            "slideId": "cierre-5",
            "blockId": "tradeoff_decision_memo",
            "title": "Your decision, and why",
            "body": "This is the last one: the decision you'll defend to Dana, with its cost and its benefit.",
            "caseContext": {
              "decisions": [
                {
                  "id": "resolver_todo_hoy",
                  "title": "Resolve everything today",
                  "detail": "Close all eight claims today. Benefit: you close the most claims inside the window. Cost: if you paid the theft claim with no proof, or the duplicate, you overspend and you open the door to fraud."
                },
                {
                  "id": "pilotar_lote_claro",
                  "title": "Resolve the clear batch and escalate the rest",
                  "detail": "Close the claims with evidence today and escalate the questionable ones to Marcus. Benefit: you move on what has proof. Cost: the backlog isn't closed today and the questionable ones stay open."
                },
                {
                  "id": "pausar_y_evidencia",
                  "title": "Pause and request evidence",
                  "detail": "Hold every payout until each one has proof. Benefit: zero improper payment. Cost: you lose the week's window."
                },
                {
                  "id": "escalar_a_finanzas",
                  "title": "Escalate the high-value claims to Claims Review",
                  "detail": "Send the theft claim and the high-value ones to Marcus before paying. Benefit: formal backing. Cost: it depends on his turnaround."
                }
              ]
            }
          }
        ]
      }
    ],
    "totalSlides": 25
  }
};
