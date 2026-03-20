// lib/course-generation/rag.ts — RAG with Cohere reranker for course generation

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
 * Generate smart search queries based on the user's project idea.
 */
export function generateSearchQueries(projectIdea: string): string[] {
  const keywords = projectIdea.toLowerCase();

  const queries = [
    'LLM fundamentals introduction',
    'API integration configuration',
    'prompt engineering techniques',
  ];

  if (keywords.includes('whatsapp') || keywords.includes('chat') || keywords.includes('bot'))
    queries.push('chatbot development', 'webhook configuration', 'messaging integration');
  if (keywords.includes('shopify') || keywords.includes('ecommerce') || keywords.includes('tienda'))
    queries.push('Shopify API integration', 'ecommerce automation');
  if (keywords.includes('automat') || keywords.includes('n8n') || keywords.includes('make'))
    queries.push('workflow automation n8n', 'Make automation');
  if (keywords.includes('content') || keywords.includes('video') || keywords.includes('marketing'))
    queries.push('content generation AI', 'marketing automation');
  if (keywords.includes('database') || keywords.includes('datos') || keywords.includes('base'))
    queries.push('database storage configuration', 'data management');
  if (keywords.includes('agente') || keywords.includes('agent'))
    queries.push('AI agent development', 'autonomous agents');
  if (keywords.includes('web') || keywords.includes('app') || keywords.includes('aplicacion'))
    queries.push('web application development', 'frontend integration');
  if (keywords.includes('api'))
    queries.push('API development REST', 'API authentication');
  if (keywords.includes('deploy') || keywords.includes('produccion') || keywords.includes('production'))
    queries.push('deployment production', 'hosting configuration');

  // Always include broad coverage queries
  queries.push(
    'automation tools setup',
    'code generation AI tools',
    'testing deployment production'
  );

  // Deduplicate
  return [...new Set(queries)];
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
