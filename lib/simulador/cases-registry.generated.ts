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
