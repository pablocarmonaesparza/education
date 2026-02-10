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
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
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
 * Trae la transcripcion COMPLETA de una clase por su subtopic.
 * Junta todos los chunks ordenados para reconstruir el script del video.
 */
export async function getCurrentClassTranscript(
  supabase: SupabaseClient,
  subtopic: string
): Promise<string> {
  const { data, error } = await supabase
    .from('education_system')
    .select('id, content, topic, description')
    .eq('subtopic', subtopic)
    .order('id', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('Current class transcript error:', error);
    return '';
  }

  // Extraer solo el audio script de cada chunk y eliminar duplicados de overlap
  const scripts: string[] = [];
  const seenLines = new Set<string>();

  for (const chunk of data) {
    // El content tiene formato "Lecture Number: X | ... | Audio Script: ..."
    const scriptMatch = chunk.content.match(/Audio Script:\s*([\s\S]*?)(\s*\|\s*Tags:|$)/);
    const script = scriptMatch ? scriptMatch[1].trim() : chunk.content;

    // Dividir en lineas numeradas y filtrar duplicados (por overlap entre chunks)
    const lines = script.split(/\n\n+/).filter(Boolean);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !seenLines.has(trimmed)) {
        seenLines.add(trimmed);
        scripts.push(trimmed);
      }
    }
  }

  const topic = data[0].topic;
  const description = data[0].description;

  return `[${topic} > ${subtopic}] ${description}\n\n${scripts.join('\n\n')}`;
}

/**
 * Formatea los documentos RAG para inyectar en el system prompt.
 */
export function formatRAGContext(documents: RAGDocument[]): string {
  if (documents.length === 0) return '';

  const formatted = documents.map((doc) => {
    // Truncar contenido largo (1500 chars para dar contexto suficiente)
    const content =
      doc.content.length > 1500
        ? doc.content.substring(0, 1500) + '...'
        : doc.content;

    return `--- ${doc.topic} > ${doc.subtopic} ---\n${doc.description}\n${content}`;
  });

  return formatted.join('\n\n');
}
