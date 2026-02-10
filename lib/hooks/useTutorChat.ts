'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TutorConversation, TutorMessage, TutorStreamChunk } from '@/types/tutor';

interface UseTutorChatReturn {
  messages: TutorMessage[];
  isStreaming: boolean;
  streamingContent: string;
  conversations: TutorConversation[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createNewConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
}

export function useTutorChat(): UseTutorChatReturn {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversations, setConversations] = useState<TutorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedModel, setSelectedModel] = useState('chatgpt-mini');
  const abortControllerRef = useRef<AbortController | null>(null);

  const supabase = createClient();

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from('tutor_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setConversations(
          data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            title: c.title,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))
        );
      }
      setIsLoadingConversations(false);
    }
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select a conversation and load its messages
  const selectConversation = useCallback(
    async (id: string) => {
      setActiveConversationId(id);
      setIsLoadingMessages(true);
      setStreamingContent('');

      const { data, error } = await supabase
        .from('tutor_messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(
          data.map((m: any) => ({
            id: m.id,
            conversationId: m.conversation_id,
            role: m.role,
            content: m.content,
            createdAt: m.created_at,
          }))
        );
      }
      setIsLoadingMessages(false);
    },
    [supabase]
  );

  // Create a new empty conversation (actual DB record created on first message)
  const createNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent('');
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      // Delete messages first
      await supabase.from('tutor_messages').delete().eq('conversation_id', id);
      await supabase.from('tutor_conversations').delete().eq('id', id);

      setConversations((prev) => prev.filter((c) => c.id !== id));

      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
    [supabase, activeConversationId]
  );

  // Send a message and stream the response
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Cancel any previous stream
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Optimistic user message
      const userMsg: TutorMessage = {
        id: `temp-user-${Date.now()}`,
        conversationId: activeConversationId || '',
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent('');

      try {
        // Build messages array for the API
        const apiMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            model: selectedModel,
            conversationId: activeConversationId,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No se pudo leer la respuesta');

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            let chunk: TutorStreamChunk;
            try {
              chunk = JSON.parse(line);
            } catch {
              continue;
            }

            switch (chunk.type) {
              case 'conversation_id': {
                const newId = chunk.conversationId;
                setActiveConversationId(newId);
                // Add to conversations list
                setConversations((prev) => [
                  {
                    id: newId,
                    userId: '',
                    title: content.trim().substring(0, 47) + (content.length > 47 ? '...' : ''),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  ...prev,
                ]);
                break;
              }
              case 'text_delta':
                accumulated += chunk.content;
                setStreamingContent(accumulated);
                break;
              case 'done': {
                // Move streaming content to messages
                const assistantMsg: TutorMessage = {
                  id: `temp-assistant-${Date.now()}`,
                  conversationId: activeConversationId || '',
                  role: 'assistant',
                  content: accumulated,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamingContent('');
                break;
              }
              case 'error':
                throw new Error(chunk.error);
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;

        console.error('Chat error:', error);
        const errorMsg: TutorMessage = {
          id: `temp-error-${Date.now()}`,
          conversationId: activeConversationId || '',
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setStreamingContent('');
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, selectedModel, activeConversationId, isStreaming]
  );

  return {
    messages,
    isStreaming,
    streamingContent,
    conversations,
    activeConversationId,
    isLoadingConversations,
    isLoadingMessages,
    sendMessage,
    selectConversation,
    createNewConversation,
    deleteConversation,
    selectedModel,
    setSelectedModel,
  };
}
