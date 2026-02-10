'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import Spinner from '@/components/ui/Spinner';
import IconButton from '@/components/ui/IconButton';

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

interface VideoInfo {
  id: string;
  title: string;
  phase: string;
  completed: boolean;
}

interface UserContext {
  userId: string;
  userName: string;
  userEmail: string;
  projectIdea: string;
  intakeResponses: Record<string, any>;
  totalVideos: number;
  completedVideos: number;
  currentVideo: VideoInfo | null;
  completedVideosList: VideoInfo[];
  currentPhase: string;
  completedExercises: number;
  totalExercises: number;
}

export default function TutorContent() {
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('chatgpt-mini');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const tutorModels = [
    { id: 'chatgpt-5.2', label: 'ChatGPT 5.2', icon: '/icons/tutor-models/chatgpt.png', price: 4 },
    { id: 'chatgpt-mini', label: 'ChatGPT (Mini)', icon: '/icons/tutor-models/chatgpt.png', price: 1 },
    { id: 'gemini-pro-3', label: 'Gemini Pro 3', icon: '/icons/tutor-models/gemini.png', price: 3 },
    { id: 'gemini-flash-3', label: 'Gemini Flash 3', icon: '/icons/tutor-models/gemini.png', price: 2 },
    { id: 'claude-opus-4.6', label: 'Claude Opus 4.6', icon: '/icons/tutor-models/claude.png', price: 4 },
    { id: 'claude-haiku-4.5', label: 'Claude Haiku 4.5', icon: '/icons/tutor-models/claude.png', price: 2 },
  ] as const;

  const selectedModelData = tutorModels.find((m) => m.id === selectedModel)!;
  const priceString = (n: number) => '$'.repeat(n);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    }
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [modelDropdownOpen]);

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

      // Get intake responses (ALL responses, not just project)
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
        .select('video_id, completed, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      // Get exercise progress
      const { data: exerciseProgress } = await supabase
        .from('exercise_progress')
        .select('exercise_id, completed')
        .eq('user_id', user.id);

      // Build video info from generated_path
      const allVideos: VideoInfo[] = [];
      const completedVideosList: VideoInfo[] = [];
      let currentVideo: VideoInfo | null = null;
      let currentPhase = '';
      let totalVideos = 0;

      if (intakeData?.generated_path?.phases) {
        for (const phase of intakeData.generated_path.phases) {
          if (phase.videos) {
            for (const video of phase.videos) {
              totalVideos++;
              const videoId = `phase-${phase.order}-video-${video.order}`;
              const isCompleted = videoProgress?.some(vp => vp.video_id === videoId && vp.completed) || false;
              
              const videoInfo: VideoInfo = {
                id: videoId,
                title: video.title,
                phase: phase.title,
                completed: isCompleted,
              };
              
              allVideos.push(videoInfo);
              
              if (isCompleted) {
                completedVideosList.push(videoInfo);
              } else if (!currentVideo) {
                // First incomplete video is the current one
                currentVideo = videoInfo;
                currentPhase = phase.title;
              }
            }
          }
        }
      }

      // If all videos are complete
      if (!currentVideo && allVideos.length > 0) {
        currentPhase = 'Completado';
      }

      // Get exercises count
      const { data: userExercises } = await supabase
        .from('user_exercises')
        .select('id')
        .eq('user_id', user.id);

      const totalExercises = userExercises?.length || 0;
      const completedExercisesCount = exerciseProgress?.filter(e => e.completed).length || 0;

      // Extract project idea from responses
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
        intakeResponses: intakeData?.responses || {},
        totalVideos,
        completedVideos: completedVideosList.length,
        currentVideo,
        completedVideosList,
        currentPhase,
        totalExercises,
        completedExercises: completedExercisesCount,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = async () => {
    if (!userContext) return;

    const { data: newConvo } = await supabase
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

  const sendMessage = async () => {
    if (!inputMessage.trim() || !userContext || isSending) return;

    let conversationId = selectedConversationId;

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

    const tempUserMsg: Message = {
      id: 'temp-user-' + Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    const { data: savedUserMsg } = await supabase
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
      })
      .select()
      .single();

    // Build comprehensive context for AI
    const completedVideosText = userContext.completedVideosList.length > 0
      ? userContext.completedVideosList.map(v => `  - "${v.title}" (${v.phase})`).join('\n')
      : '  Ninguno aún';

    const intakeResponsesText = Object.entries(userContext.intakeResponses)
      .filter(([key]) => !['generated_path'].includes(key))
      .map(([key, value]) => `  - ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n');

    const courseContext = `
INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${userContext.userName}
- Email: ${userContext.userEmail}

RESPUESTAS DE REGISTRO (lo que dijo cuando se inscribió):
${intakeResponsesText || '  No hay respuestas registradas'}

PROYECTO QUE QUIERE CONSTRUIR:
${userContext.projectIdea}

PROGRESO ACTUAL:
- Fase actual: ${userContext.currentPhase}
- Video/clase actual: ${userContext.currentVideo ? `"${userContext.currentVideo.title}" en la fase "${userContext.currentVideo.phase}"` : 'Todos completados'}
- Videos completados: ${userContext.completedVideos}/${userContext.totalVideos}
- Retos completados: ${userContext.completedExercises}/${userContext.totalExercises}

CLASES/VIDEOS YA COMPLETADOS:
${completedVideosText}
    `.trim();

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
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (data.message) {
        const { data: savedAssistantMsg } = await supabase
          .from('tutor_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: data.message,
          })
          .select()
          .single();

        if (savedUserMsg && savedAssistantMsg) {
          setMessages(prev => [
            ...prev.filter(m => !m.id.startsWith('temp-')),
            savedUserMsg,
            savedAssistantMsg,
          ]);
        }

        if (messages.length === 0) {
          await supabase
            .from('tutor_conversations')
            .update({ 
              title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

          setConversations(prev => prev.map(c => 
            c.id === conversationId 
              ? { ...c, title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '') }
              : c
          ));
        } else {
          await supabase
            .from('tutor_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    }

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <div className="w-72 border-r-2 border-gray-200 dark:border-gray-900 flex flex-col">
        <div className="p-4 border-b-2 border-gray-200 dark:border-gray-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">tutor ia</h2>
            <IconButton
              variant="primary"
              onClick={createNewConversation}
              aria-label="Nueva conversación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </IconButton>
          </div>
          {userContext && (
            <p className="text-xs text-[#777777] dark:text-gray-400">
              {userContext.completedVideos}/{userContext.totalVideos} videos • {userContext.completedExercises}/{userContext.totalExercises} retos
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-900">
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
                    <p className="text-sm font-medium text-[#4b4b4b] dark:text-white truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-[#777777] dark:text-gray-400 mt-1">
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
            <div className="p-4 text-center text-[#777777] dark:text-gray-400 text-sm">
              No hay conversaciones
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-900">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#1472FF] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#4b4b4b] dark:text-white">Tutor IA</h3>
                <p className="text-xs text-[#777777] dark:text-gray-400 truncate">
                  {userContext?.currentVideo 
                    ? `Clase actual: ${userContext.currentVideo.title}`
                    : 'Tu asistente de aprendizaje'}
                </p>
              </div>
            </div>
            <div className="relative flex-shrink-0" ref={modelDropdownRef}>
              <button
                type="button"
                onClick={() => setModelDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-white text-sm font-medium pl-2 pr-3 py-2 focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[180px]"
                aria-label="Modelo de IA"
                aria-expanded={modelDropdownOpen}
                aria-haspopup="listbox"
              >
                <Image
                  src={selectedModelData.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded object-contain flex-shrink-0 w-5 h-5"
                />
                <span className="flex-1 text-left truncate">{selectedModelData.label}</span>
                <span className="text-[#777777] dark:text-gray-400 font-normal tabular-nums">
                  {priceString(selectedModelData.price)}
                </span>
                <svg className={`w-4 h-4 flex-shrink-0 text-[#777777] dark:text-gray-400 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {modelDropdownOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full mt-1 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
                  aria-label="Modelos disponibles"
                >
                  {tutorModels.map((m) => (
                    <li key={m.id} role="option" aria-selected={selectedModel === m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedModel === m.id
                            ? 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20 text-[#1472FF] dark:text-[#1472FF]'
                            : 'text-[#4b4b4b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Image
                          src={m.icon}
                          alt=""
                          width={20}
                          height={20}
                          className="rounded object-contain flex-shrink-0 w-5 h-5"
                        />
                        <span className="flex-1 truncate font-medium">{m.label}</span>
                        <span className="text-[#777777] dark:text-gray-400 font-normal tabular-nums">
                          {priceString(m.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1472FF] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-900">
                  <p className="text-[#4b4b4b] dark:text-white">
                    Hola{userContext?.userName ? ` ${userContext.userName.split(' ')[0]}` : ''}, ¿en qué te puedo ayudar?
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gray-200 dark:bg-gray-700' 
                    : 'bg-[#1472FF]'
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
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-900 text-[#4b4b4b] dark:text-white mr-12'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1472FF] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-900">
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="flex-1 resize-none border-2 border-gray-200 dark:border-gray-900 rounded-2xl px-4 py-4 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF] focus:border-transparent"
              rows={1}
              disabled={isSending}
            />
            <IconButton
              variant="primary"
              size="lg"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              aria-label="Enviar mensaje"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
