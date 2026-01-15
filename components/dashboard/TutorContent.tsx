'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface UserContext {
  userId: string;
  userName: string;
  userEmail: string;
  projectIdea: string;
  totalVideos: number;
  completedVideos: number;
  currentPhase: string;
  completedExercises: number;
  totalExercises: number;
}

export default function TutorContent() {
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // User context
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  
  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load user context
  useEffect(() => {
    async function loadUserContext() {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();

      // Get intake responses (project idea and path)
      const { data: intakeData } = await supabase
        .from('intake_responses')
        .select('responses, generated_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get video progress
      const { data: videoProgress } = await supabase
        .from('video_progress')
        .select('video_id, completed')
        .eq('user_id', user.id);

      // Get exercise progress
      const { data: exerciseProgress } = await supabase
        .from('exercise_progress')
        .select('exercise_id, completed')
        .eq('user_id', user.id);

      // Calculate progress
      const completedVideos = videoProgress?.filter(v => v.completed).length || 0;
      
      // Count total videos from generated_path
      let totalVideos = 0;
      let currentPhase = '';
      if (intakeData?.generated_path?.phases) {
        intakeData.generated_path.phases.forEach((phase: any) => {
          if (phase.videos) {
            totalVideos += phase.videos.length;
          }
        });
        // Find current phase (first incomplete)
        const firstIncompletePhase = intakeData.generated_path.phases.find((phase: any) => {
          const phaseVideos = phase.videos || [];
          return phaseVideos.some((v: any) => {
            const videoId = `phase-${phase.order}-video-${v.order}`;
            return !videoProgress?.find(vp => vp.video_id === videoId && vp.completed);
          });
        });
        currentPhase = firstIncompletePhase?.title || 'Completado';
      }

      // Get user exercises count
      const { data: userExercises } = await supabase
        .from('user_exercises')
        .select('id')
        .eq('user_id', user.id);

      const totalExercises = userExercises?.length || 0;
      const completedExercises = exerciseProgress?.filter(e => e.completed).length || 0;

      const projectIdea = 
        intakeData?.responses?.project_idea ||
        intakeData?.responses?.project ||
        intakeData?.responses?.idea ||
        'No definido';

      setUserContext({
        userId: user.id,
        userName: profile?.name || user.user_metadata?.name || 'Usuario',
        userEmail: profile?.email || user.email || '',
        projectIdea,
        totalVideos,
        completedVideos,
        currentPhase,
        totalExercises,
        completedExercises,
      });

      // Load conversations
      const { data: convos } = await supabase
        .from('tutor_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (convos && convos.length > 0) {
        setConversations(convos);
      }

      setIsLoading(false);
    }

    loadUserContext();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      const { data: msgs } = await supabase
        .from('tutor_messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);
    }

    loadMessages();
  }, [selectedConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation
  const createNewConversation = async () => {
    if (!userContext) return;

    const { data: newConvo, error } = await supabase
      .from('tutor_conversations')
      .insert({
        user_id: userContext.userId,
        title: 'Nueva conversación',
      })
      .select()
      .single();

    if (newConvo) {
      setConversations([newConvo, ...conversations]);
      setSelectedConversationId(newConvo.id);
      setMessages([]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !userContext || isSending) return;

    let conversationId = selectedConversationId;

    // Create conversation if none selected
    if (!conversationId) {
      const { data: newConvo } = await supabase
        .from('tutor_conversations')
        .insert({
          user_id: userContext.userId,
          title: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? '...' : ''),
        })
        .select()
        .single();

      if (newConvo) {
        conversationId = newConvo.id;
        setConversations([newConvo, ...conversations]);
        setSelectedConversationId(newConvo.id);
      } else {
        return;
      }
    }

    setIsSending(true);
    const userMessage = inputMessage;
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // Save user message to DB
    const { data: savedUserMsg } = await supabase
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
      })
      .select()
      .single();

    // Build context for AI
    const courseContext = `
CONTEXTO DEL ESTUDIANTE:
- Nombre: ${userContext.userName}
- Proyecto que quiere construir: ${userContext.projectIdea}
- Fase actual del curso: ${userContext.currentPhase}
- Progreso en videos: ${userContext.completedVideos}/${userContext.totalVideos} completados (${Math.round((userContext.completedVideos / Math.max(userContext.totalVideos, 1)) * 100)}%)
- Progreso en retos: ${userContext.completedExercises}/${userContext.totalExercises} completados

INSTRUCCIONES ADICIONALES:
- Personaliza tus respuestas usando el nombre del estudiante
- Relaciona tus explicaciones con su proyecto específico cuando sea relevante
- Si el estudiante está en las primeras fases, usa explicaciones más básicas
- Si tiene buen avance, puedes ser más técnico
- Motívalo mencionando su progreso cuando sea apropiado
    `.trim();

    // Get conversation history for context
    const conversationHistory = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...conversationHistory, { role: 'user', content: userMessage }],
          courseContext,
        }),
      });

      const data = await response.json();

      if (data.message) {
        // Save assistant message to DB
        const { data: savedAssistantMsg } = await supabase
          .from('tutor_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: data.message,
          })
          .select()
          .single();

        // Update UI with real messages
        if (savedUserMsg && savedAssistantMsg) {
          setMessages(prev => [
            ...prev.filter(m => !m.id.startsWith('temp-')),
            savedUserMsg,
            savedAssistantMsg,
          ]);
        }

        // Update conversation title if it's the first message
        if (messages.length === 0) {
          await supabase
            .from('tutor_conversations')
            .update({ 
              title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

          // Update local state
          setConversations(prev => prev.map(c => 
            c.id === conversationId 
              ? { ...c, title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') }
              : c
          ));
        } else {
          // Just update timestamp
          await supabase
            .from('tutor_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    }

    setIsSending(false);
  };

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Delete conversation
  const deleteConversation = async (convId: string) => {
    await supabase.from('tutor_conversations').delete().eq('id', convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (selectedConversationId === convId) {
      setSelectedConversationId(null);
      setMessages([]);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-gray-950">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tutor IA</h2>
            <button
              onClick={createNewConversation}
              className="p-2 rounded-lg bg-[#1472FF] text-white hover:bg-[#0E5FCC] transition-colors"
              title="Nueva conversación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {userContext && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userContext.completedVideos}/{userContext.totalVideos} videos • {userContext.completedExercises}/{userContext.totalExercises} retos
            </p>
          )}
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative ${
                    selectedConversationId === conv.id 
                      ? 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <button
                    onClick={() => setSelectedConversationId(conv.id)}
                    className="w-full text-left p-3 pr-10"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(conv.updated_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No hay conversaciones
            </div>
          )}
        </div>
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col">
        {/* Header del chat */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Tutor IA</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userContext ? `Ayudándote con: ${userContext.projectIdea.slice(0, 40)}${userContext.projectIdea.length > 40 ? '...' : ''}` : 'Tu asistente personalizado'}
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Mensaje de bienvenida si no hay mensajes */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    ¡Hola{userContext?.userName ? `, ${userContext.userName.split(' ')[0]}` : ''}! 👋
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Soy tu tutor IA personalizado. Conozco tu proyecto 
                    {userContext?.projectIdea && userContext.projectIdea !== 'No definido' && (
                      <span className="font-medium text-[#1472FF]"> "{userContext.projectIdea.slice(0, 50)}{userContext.projectIdea.length > 50 ? '...' : ''}"</span>
                    )} y tu progreso en el curso.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              </div>
            )}

            {/* Mensajes de la conversación */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gray-200 dark:bg-gray-700' 
                    : 'bg-gradient-to-br from-[#1472FF] to-[#5BA0FF]'
                }`}>
                  {msg.role === 'user' ? (
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <div className={`flex-1 rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-[#1472FF] text-white ml-12'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white mr-12'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input de mensaje */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="flex-1 resize-none border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF] focus:border-transparent"
              rows={1}
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="p-3 bg-[#1472FF] text-white rounded-xl hover:bg-[#0E5FCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
