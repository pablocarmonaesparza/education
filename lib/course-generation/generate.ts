// lib/course-generation/generate.ts — Inline course + exercise generation pipeline

import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchFullCatalog } from './rag';
import { getCourseGenerationPrompt } from './prompts';

interface GenerateCourseInput {
  userId: string;
  userName: string;
  userEmail: string;
  projectIdea: string;
  projectSummary?: string;
  questionnaire: Record<string, any>;
}

interface CourseResult {
  success: boolean;
  course: {
    user_project: string;
    total_videos: number;
    estimated_hours: string;
    phases: any[];
    learning_path_summary: string[];
    recommendations: string[];
    next_steps: string[];
  };
}

/**
 * Full course generation pipeline — replaces the n8n workflow.
 *
 * Steps:
 * 1. RAG search with Cohere reranker to find relevant syllabus videos
 * 2. OpenAI GPT-4o generates personalized course plan
 * 3. Save to intake_responses
 *
 * (El Step 4/5 generaba retos y los guardaba en `user_exercises`. Ambas
 * tablas y el feature de retos fueron retirados; los `evaluate` slides de
 * cada lección cumplen ese rol ahora.)
 */
export async function generateCourseInline(
  supabase: SupabaseClient,
  input: GenerateCourseInput
): Promise<void> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const pipelineStart = Date.now();
  const timings: Record<string, number> = {};
  const tick = (label: string, start: number) => {
    const ms = Date.now() - start;
    timings[label] = ms;
    console.log(`[course-gen] ⏱ ${label}: ${(ms / 1000).toFixed(1)}s`);
  };

  console.log('[course-gen] Starting inline generation for user:', input.userId);

  // ───── Step 1: Fetch full video catalog ─────
  let stepStart = Date.now();
  console.log('[course-gen] Step 1: Fetching full video catalog');
  const syllabusContext = await fetchFullCatalog(supabase);
  tick('1_fetch_catalog', stepStart);

  // ───── Step 2: Generate course plan with OpenAI GPT-4o ─────
  stepStart = Date.now();
  console.log('[course-gen] Step 2: Generating course plan with GPT-4o');
  const courseSystemPrompt = getCourseGenerationPrompt(
    input.projectIdea,
    syllabusContext
  );

  const questionnaireContext = Object.keys(input.questionnaire).length > 0
    ? `\n\n#UserProfile\n${JSON.stringify(input.questionnaire, null, 2)}`
    : '';
  const courseUserMessage = `#UserMessage\n"${input.projectIdea}"${questionnaireContext}`;

  const courseResponse = await openai.chat.completions.create({
    model: 'o4-mini',
    max_completion_tokens: 16000,
    messages: [
      { role: 'developer', content: courseSystemPrompt },
      { role: 'user', content: courseUserMessage },
    ],
  });

  const courseText = courseResponse.choices[0]?.message?.content?.trim() ?? '';

  const courseResult = parseJSONResponse<CourseResult>(courseText);
  if (!courseResult?.success || !courseResult.course) {
    throw new Error('Failed to generate course plan: invalid AI response');
  }

  console.log(
    '[course-gen] Course plan generated:',
    courseResult.course.total_videos,
    'videos in',
    courseResult.course.phases.length,
    'phases'
  );
  tick('2_openai_course', stepStart);

  // ───── Step 3: Save to intake_responses ─────
  // Preferimos UPDATE del draft activo del usuario (creado durante el
  // onboarding por /projectDescription y /projectContext). Si no hay draft
  // (edge case: generación directa sin pasar por onboarding), hacemos INSERT.
  stepStart = Date.now();
  console.log('[course-gen] Step 3: Saving course to intake_responses');

  const { data: draft } = await supabase
    .from('intake_responses')
    .select('id, responses')
    .eq('user_id', input.userId)
    .is('generated_path', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const mergedResponses = {
    ...(draft?.responses || {}),
    project_idea: input.projectIdea,
    questionnaire: input.questionnaire,
    submitted_at: new Date().toISOString(),
  };

  const saveError = draft
    ? (await supabase
        .from('intake_responses')
        .update({
          responses: mergedResponses,
          generated_path: courseResult.course,
        })
        .eq('id', draft.id)
        .eq('user_id', input.userId)).error
    : (await supabase.from('intake_responses').insert({
        user_id: input.userId,
        responses: mergedResponses,
        generated_path: courseResult.course,
      })).error;

  if (saveError) {
    console.error('[course-gen] Error saving to intake_responses:', saveError);
    throw new Error(`Failed to save course: ${saveError.message}`);
  }
  tick('3_save_course', stepStart);

  const totalSeconds = ((Date.now() - pipelineStart) / 1000).toFixed(1);
  console.log('[course-gen] Pipeline complete for user:', input.userId);
  console.log(`[course-gen] ⏱ TOTAL: ${totalSeconds}s`);
  console.log('[course-gen] ⏱ Breakdown:', JSON.stringify(timings, null, 2));
}

/**
 * Parse a JSON response from Claude, handling markdown code blocks.
 */
function parseJSONResponse<T>(text: string): T | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // fall through
      }
    }

    // Try finding the first { ... } block
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        // fall through
      }
    }

    console.error('[course-gen] Failed to parse JSON response:', text.slice(0, 200));
    return null;
  }
}
