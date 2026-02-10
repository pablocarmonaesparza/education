// lib/tutor/rag.ts — RAG pipeline: embeddings + vector search

import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RAGDocument } from '@/types/tutor';

/**
 * Genera un embedding para la query del usuario.
 * Usa el mismo modelo que genero los embeddings existentes (1536 dimensiones).
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });

  return response.data[0].embedding;
}

/**
 * Busca documentos relevantes en education_system usando el RPC search_videos_hybrid.
 */
export async function searchRelevantDocuments(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  matchCount: number = 5
): Promise<RAGDocument[]> {
  const { data, error } = await supabase.rpc('search_videos_hybrid', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.7,
    match_count: matchCount,
  });

  if (error) {
    console.error('RAG search error:', error);
    return [];
  }

  return (data || []).map((doc: any) => ({
    id: doc.id,
    content: doc.content,
    topic: doc.topic,
    subtopic: doc.subtopic,
    description: doc.description,
    similarity: doc.similarity,
  }));
}

/**
 * Formatea los documentos RAG para inyectar en el system prompt.
 */
export function formatRAGContext(documents: RAGDocument[]): string {
  if (documents.length === 0) return '';

  const formatted = documents.map((doc) => {
    // Truncar contenido largo
    const content =
      doc.content.length > 500
        ? doc.content.substring(0, 500) + '...'
        : doc.content;

    return `--- ${doc.topic} > ${doc.subtopic} ---\n${doc.description}\n${content}`;
  });

  return formatted.join('\n\n');
}
