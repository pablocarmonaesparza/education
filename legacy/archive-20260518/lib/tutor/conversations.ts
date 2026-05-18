// lib/tutor/conversations.ts — CRUD de conversaciones del tutor

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TutorConversation, TutorMessage } from '@/types/tutor';

/**
 * Crea una nueva conversacion.
 */
export async function createConversation(
  supabase: SupabaseClient,
  userId: string,
  title?: string
): Promise<TutorConversation | null> {
  const { data, error } = await supabase
    .from('tutor_conversations')
    .insert({
      user_id: userId,
      title: title || 'Nueva conversacion',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Obtiene todas las conversaciones del usuario, ordenadas por actividad reciente.
 */
export async function getConversations(
  supabase: SupabaseClient,
  userId: string
): Promise<TutorConversation[]> {
  const { data, error } = await supabase
    .from('tutor_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    title: c.title,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));
}

/**
 * Obtiene los mensajes de una conversacion.
 */
export async function getConversationMessages(
  supabase: SupabaseClient,
  conversationId: string
): Promise<TutorMessage[]> {
  const { data, error } = await supabase
    .from('tutor_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    conversationId: m.conversation_id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
  }));
}

/**
 * Guarda un mensaje y actualiza el updated_at de la conversacion.
 */
export async function saveMessage(
  supabase: SupabaseClient,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<TutorMessage | null> {
  const { data, error } = await supabase
    .from('tutor_messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    return null;
  }

  // Actualizar updated_at de la conversacion
  await supabase
    .from('tutor_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    id: data.id,
    conversationId: data.conversation_id,
    role: data.role,
    content: data.content,
    createdAt: data.created_at,
  };
}

/**
 * Elimina una conversacion y todos sus mensajes.
 */
export async function deleteConversation(
  supabase: SupabaseClient,
  conversationId: string
): Promise<boolean> {
  // Borrar mensajes primero (puede no tener CASCADE)
  await supabase
    .from('tutor_messages')
    .delete()
    .eq('conversation_id', conversationId);

  const { error } = await supabase
    .from('tutor_conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
}

/**
 * Genera un titulo de conversacion a partir del primer mensaje.
 */
export function generateConversationTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 50) return cleaned;
  return cleaned.substring(0, 47) + '...';
}
