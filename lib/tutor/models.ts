// lib/tutor/models.ts — Registry unico de modelos del tutor IA

import type { TutorModel } from '@/types/tutor';

export const MODEL_REGISTRY: Record<string, TutorModel> = {
  'chatgpt-5.2': {
    id: 'chatgpt-5.2',
    label: 'ChatGPT 5.2',
    provider: 'openai',
    apiModel: 'gpt-4o',
    icon: '/icons/tutor-models/chatgpt.png',
    price: 4,
  },
  'chatgpt-mini': {
    id: 'chatgpt-mini',
    label: 'ChatGPT (Mini)',
    provider: 'openai',
    apiModel: 'gpt-4o-mini',
    icon: '/icons/tutor-models/chatgpt.png',
    price: 1,
  },
  'gemini-pro-3': {
    id: 'gemini-pro-3',
    label: 'Gemini Pro 3',
    provider: 'google',
    apiModel: 'gemini-2.5-pro',
    icon: '/icons/tutor-models/gemini.png',
    price: 3,
  },
  'gemini-flash-3': {
    id: 'gemini-flash-3',
    label: 'Gemini Flash 3',
    provider: 'google',
    apiModel: 'gemini-2.5-flash',
    icon: '/icons/tutor-models/gemini.png',
    price: 2,
  },
  'claude-opus-4.6': {
    id: 'claude-opus-4.6',
    label: 'Claude Opus 4.6',
    provider: 'anthropic',
    apiModel: 'claude-opus-4-6',
    icon: '/icons/tutor-models/claude.png',
    price: 4,
  },
  'claude-haiku-4.5': {
    id: 'claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    provider: 'anthropic',
    apiModel: 'claude-haiku-4-5-20251001',
    icon: '/icons/tutor-models/claude.png',
    price: 2,
  },
};

// Ordered array for the UI dropdown
export const TUTOR_MODELS: TutorModel[] = [
  MODEL_REGISTRY['chatgpt-5.2'],
  MODEL_REGISTRY['chatgpt-mini'],
  MODEL_REGISTRY['gemini-pro-3'],
  MODEL_REGISTRY['gemini-flash-3'],
  MODEL_REGISTRY['claude-opus-4.6'],
  MODEL_REGISTRY['claude-haiku-4.5'],
];

export function getModel(id: string): TutorModel {
  return MODEL_REGISTRY[id] ?? MODEL_REGISTRY['chatgpt-mini'];
}
