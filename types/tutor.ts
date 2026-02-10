// types/tutor.ts — Tipos centrales del sistema de tutor IA

export type TutorProvider = 'openai' | 'anthropic' | 'google';

export interface TutorModel {
  id: string;
  label: string;
  provider: TutorProvider;
  apiModel: string;
  icon: string;
  price: number; // 1-4, for $ indicators
}

export interface TutorConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface TutorChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  model: string;
  conversationId?: string;
}

export type TutorStreamChunk =
  | { type: 'conversation_id'; conversationId: string }
  | { type: 'text_delta'; content: string }
  | { type: 'done' }
  | { type: 'error'; error: string };

export interface RAGDocument {
  id: number;
  content: string;
  topic: string;
  subtopic: string;
  description: string;
  similarity: number;
}

export interface TutorUserContext {
  userName: string | null;
  projectDescription: string | null;
  tier: string;
  completedVideos: number;
  totalVideos: number;
  currentModuleTitle: string | null;
  currentVideoTitle: string | null;
  currentVideoDescription: string | null;
  learningPathSummary: string | null;
  exercisesSummary: string | null;
}

export interface StreamProviderParams {
  model: string;
  systemPrompt: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
  temperature: number;
}
