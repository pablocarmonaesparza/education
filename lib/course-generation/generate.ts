// lib/course-generation/generate.ts — Inline course + exercise generation pipeline

import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchFullCatalog } from './rag';
import {
  getCourseGenerationPrompt,
  EXERCISE_GENERATION_PROMPT,
  buildExerciseUserMessage,
} from './prompts';

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

interface ExerciseResult {
  success: boolean;
  user_project: string;
  total_exercises: number;
  practice_hours: string;
  exercises: any[];
  milestones: string[];
}

/**
 * Full course generation pipeline — replaces the n8n workflow.
 *
 * Steps:
 * 1. RAG search with Cohere reranker to find relevant syllabus videos
 * 2. OpenAI GPT-4o generates personalized course plan
 * 3. Save to intake_responses
 * 4. OpenAI GPT-4o generates practical exercises
 * 5. Save to user_exercises
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
    model: 'gpt-4o',
    max_tokens: 16000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: courseSystemPrompt },
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
  stepStart = Date.now();
  console.log('[course-gen] Step 3: Saving course to intake_responses');
  const { error: saveError } = await supabase.from('intake_responses').insert({
    user_id: input.userId,
    responses: {
      project_idea: input.projectIdea,
      submitted_at: new Date().toISOString(),
    },
    generated_path: courseResult.course,
  });

  if (saveError) {
    console.error('[course-gen] Error saving to intake_responses:', saveError);
    throw new Error(`Failed to save course: ${saveError.message}`);
  }
  tick('3_save_course', stepStart);

  // ───── Step 4: Generate exercises with OpenAI GPT-4o ─────
  stepStart = Date.now();
  console.log('[course-gen] Step 4: Generating exercises with GPT-4o');

  const userData = [
    `##Name\n${input.userName}`,
    `##Message\n"${input.projectIdea}"`,
    `##Responses\n${JSON.stringify(input.questionnaire)}`,
  ].join('\n\n___\n\n');

  const courseData = [
    `##LearningPathSummary\n${courseResult.course.learning_path_summary.join('\n')}`,
    `##NextSteps\n${courseResult.course.next_steps.join('\n')}`,
    `##Phases\n${JSON.stringify(courseResult.course.phases)}`,
    `##Recommendations\n${courseResult.course.recommendations.join('\n')}`,
    `##TotalVideos\n${courseResult.course.total_videos}`,
  ].join('\n\n___\n\n');

  const exerciseMessage = buildExerciseUserMessage(userData, courseData);

  const exerciseResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 16000,
    temperature: 0.3,
    messages: [
      { role: 'system', content: EXERCISE_GENERATION_PROMPT },
      { role: 'user', content: exerciseMessage },
    ],
  });

  const exerciseText = exerciseResponse.choices[0]?.message?.content?.trim() ?? '';

  const exerciseResult = parseJSONResponse<ExerciseResult>(exerciseText);
  if (!exerciseResult?.success || !exerciseResult.exercises) {
    throw new Error('Failed to generate exercises: invalid AI response');
  }

  console.log(
    '[course-gen] Exercises generated:',
    exerciseResult.total_exercises,
    'exercises,',
    exerciseResult.practice_hours
  );
  tick('4_openai_exercises', stepStart);

  // ───── Step 5: Save to user_exercises ─────
  stepStart = Date.now();
  console.log('[course-gen] Step 5: Saving exercises to user_exercises');
  const { error: exerciseSaveError } = await supabase
    .from('user_exercises')
    .insert({
      user_id: input.userId,
      user_project: exerciseResult.user_project,
      total_exercises: exerciseResult.total_exercises,
      practice_hours: exerciseResult.practice_hours,
      exercises: exerciseResult.exercises,
      milestones: exerciseResult.milestones,
    });

  if (exerciseSaveError) {
    console.error('[course-gen] Error saving exercises:', exerciseSaveError);
    throw new Error(`Failed to save exercises: ${exerciseSaveError.message}`);
  }
  tick('5_save_exercises', stepStart);

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
