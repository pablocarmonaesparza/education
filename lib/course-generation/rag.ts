// lib/course-generation/rag.ts — RAG with Cohere reranker for course generation

import Anthropic from '@anthropic-ai/sdk';
import { generateQueryEmbedding } from '@/lib/tutor/rag';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';

export interface SyllabusDocument {
  id: number;
  content: string;
  topic: string;
  subtopic: string;
  description: string;
  duration: string;
  similarity: number;
}

/**
 * Search the education_system vector store with multiple queries,
 * then rerank results with Cohere for optimal relevance.
 */
export async function searchSyllabusWithReranker(
  supabase: SupabaseClient,
  projectIdea: string,
  searchQueries: string[]
): Promise<SyllabusDocument[]> {
  // 1. Generate embeddings for all queries in parallel
  const embeddings = await Promise.all(
    searchQueries.map((q) => generateQueryEmbedding(q))
  );

  // 2. Search vector store with each embedding (top 20 per query)
  const searchResults = await Promise.all(
    embeddings.map((embedding) =>
      supabase.rpc('search_videos_hybrid', {
        query_embedding: embedding,
        match_threshold: 0.4,
        match_count: 20,
      })
    )
  );

  // 3. Deduplicate results by id
  const seen = new Set<number>();
  const allDocs: SyllabusDocument[] = [];

  for (const { data, error } of searchResults) {
    if (error) {
      console.error('Vector search error:', error);
      continue;
    }
    for (const doc of data || []) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        allDocs.push({
          id: doc.id,
          content: doc.content,
          topic: doc.topic,
          subtopic: doc.subtopic,
          description: doc.description || '',
          duration: doc.duration || '',
          similarity: doc.similarity,
        });
      }
    }
  }

  if (allDocs.length === 0) return [];

  // 4. Rerank with Cohere
  const cohereKey = process.env.COHERE_API_KEY;
  if (!cohereKey) {
    console.warn('COHERE_API_KEY not set, returning raw vector results');
    return allDocs.sort((a, b) => b.similarity - a.similarity).slice(0, 15);
  }

  const cohere = new CohereClient({ token: cohereKey });

  const reranked = await cohere.v2.rerank({
    model: 'rerank-multilingual-v3.0',
    query: projectIdea,
    documents: allDocs.map(
      (d) => `${d.topic} > ${d.subtopic}: ${d.description}\n${d.content}`
    ),
    topN: 15,
  });

  // 5. Map reranked indices back to docs
  return reranked.results.map((r) => ({
    ...allDocs[r.index],
    similarity: r.relevanceScore,
  }));
}

/**
 * Fetch the syllabus taxonomy (section > concept pairs) from Supabase.
 */
async function fetchSyllabusTaxonomy(
  supabase: SupabaseClient
): Promise<string> {
  const { data, error } = await supabase
    .from('education_system_vectorized')
    .select('section, concept')
    .order('section')
    .order('concept');

  if (error || !data) {
    console.error('[rag] Failed to fetch taxonomy:', error);
    return '';
  }

  const grouped: Record<string, Set<string>> = {};
  for (const row of data) {
    if (!grouped[row.section]) grouped[row.section] = new Set();
    grouped[row.section].add(row.concept);
  }

  return Object.entries(grouped)
    .map(([section, concepts]) => `${section}: ${[...concepts].join(', ')}`)
    .join('\n');
}

/**
 * Generate search queries using Claude, aligned to the real syllabus vocabulary.
 */
export async function generateSearchQueriesWithAI(
  anthropic: Anthropic,
  supabase: SupabaseClient,
  projectIdea: string,
  questionnaire: Record<string, any>
): Promise<string[]> {
  const taxonomy = await fetchSyllabusTaxonomy(supabase);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    temperature: 0,
    system: `Eres un motor de búsqueda semántica. Tu trabajo es generar queries de búsqueda en ESPAÑOL para encontrar los videos más relevantes de un syllabus educativo sobre IA y automatización.

TAXONOMÍA DEL SYLLABUS DISPONIBLE:
${taxonomy}

REGLAS:
- Genera entre 8 y 14 queries de búsqueda
- Cada query debe ser una frase corta (3-8 palabras) en español
- Las queries deben cubrir: fundamentos necesarios, herramientas específicas, implementación del proyecto, y deployment
- Usa el vocabulario EXACTO de la taxonomía cuando sea posible (nombres de secciones y conceptos)
- Incluye queries tanto específicas al proyecto como de fundamentos generales
- NO repitas queries similares

Responde SOLO con un JSON array de strings. Sin explicaciones.
Ejemplo: ["fundamentos de LLMs y selección de modelos", "API de WhatsApp webhooks", "deploy básico producción"]`,
    messages: [{
      role: 'user',
      content: `PROYECTO: ${projectIdea}\n\nCUESTIONARIO: ${JSON.stringify(questionnaire)}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]';

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('[rag] AI-generated queries:', parsed);
      return parsed;
    }
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fall through */ }
    }
  }

  // Fallback: basic queries if AI fails
  console.warn('[rag] AI query generation failed, using fallback');
  return [
    'fundamentos de LLMs y selección de modelos',
    'configuración de APIs',
    'automatización con n8n y Make',
    'bases de datos y Supabase',
    'deploy en producción',
    projectIdea.slice(0, 100),
  ];
}

/**
 * Format syllabus documents for injection into the AI agent prompt.
 */
export function formatSyllabusForPrompt(docs: SyllabusDocument[]): string {
  return docs
    .map(
      (doc, i) =>
        `[${i + 1}] ${doc.topic} > ${doc.subtopic}\n` +
        `Descripción: ${doc.description}\n` +
        `Duración: ${doc.duration}\n` +
        `Contenido: ${doc.content.slice(0, 1200)}`
    )
    .join('\n\n---\n\n');
}
