// lib/course-generation/generate.ts — Inline course + exercise generation pipeline

import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  searchSyllabusWithReranker,
  generateSearchQueries,
  formatSyllabusForPrompt,
} from './rag';
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
 * 2. Claude Sonnet generates personalized course plan
 * 3. Save to intake_responses
 * 4. Claude Sonnet generates practical exercises
 * 5. Save to user_exercises
 */
export async function generateCourseInline(
  supabase: SupabaseClient,
  input: GenerateCourseInput
): Promise<void> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('[course-gen] Starting inline generation for user:', input.userId);

  // ───── Step 1: RAG search with reranker ─────
  console.log('[course-gen] Step 1: RAG search with Cohere reranker');
  const searchQueries = generateSearchQueries(input.projectIdea);
  console.log('[course-gen] Generated', searchQueries.length, 'search queries');

  const relevantDocs = await searchSyllabusWithReranker(
    supabase,
    input.projectIdea,
    searchQueries
  );
  console.log('[course-gen] Found', relevantDocs.length, 'relevant documents after reranking');

  const syllabusContext = formatSyllabusForPrompt(relevantDocs);

  // ───── Step 2: Generate course plan with Claude ─────
  console.log('[course-gen] Step 2: Generating course plan with Claude Sonnet');
  const courseSystemPrompt = getCourseGenerationPrompt(
    input.projectIdea,
    syllabusContext
  );

  const courseUserMessage = `#UserMessage\n"${input.projectIdea}"\n\n_____\n\n#UserProfile\n`;

  const courseResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    temperature: 0.3,
    system: courseSystemPrompt,
    messages: [{ role: 'user', content: courseUserMessage }],
  });

  const courseText =
    courseResponse.content[0].type === 'text'
      ? courseResponse.content[0].text
      : '';

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

  // ───── Step 3: Save to intake_responses ─────
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

  // ───── Step 4: Generate exercises with Claude ─────
  console.log('[course-gen] Step 4: Generating exercises with Claude Sonnet');

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

  const exerciseResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    temperature: 0.3,
    system: EXERCISE_GENERATION_PROMPT,
    messages: [{ role: 'user', content: exerciseMessage }],
  });

  const exerciseText =
    exerciseResponse.content[0].type === 'text'
      ? exerciseResponse.content[0].text
      : '';

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

  // ───── Step 5: Save to user_exercises ─────
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

  console.log('[course-gen] Pipeline complete for user:', input.userId);
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
