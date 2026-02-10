'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEFAULT_WIDTH = 256; // 16rem = 256px (w-64)
const MIN_WIDTH = 256;
const MAX_WIDTH = 480;

export default function TutorChatButton() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy tu tutor de IA personal. Estoy aquí para ayudarte con cualquier duda sobre tu curso. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('chatgpt-mini');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const asideRef = useRef<HTMLAsideElement>(null);

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

  const LINE_HEIGHT = 24;
  const MAX_LINES = 5;

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const h = Math.min(el.scrollHeight, MAX_LINES * LINE_HEIGHT);
    el.style.height = `${h}px`;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Update CSS variable for layout
  useEffect(() => {
    document.documentElement.style.setProperty('--chat-width', `${width}px`);
    return () => {
      document.documentElement.style.setProperty('--chat-width', `${DEFAULT_WIDTH}px`);
    };
  }, [width]);

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'Lo siento, no pude procesar tu pregunta.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling tutor API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      ref={asideRef}
      className="hidden md:flex fixed right-0 top-0 h-screen bg-white dark:bg-gray-800 flex-col z-40"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#1472FF]/50 transition-colors ${
          isResizing ? 'bg-[#1472FF]' : 'bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      />

      {/* Header - solo selector de modelo con estilo design system (contorno + profundidad) */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="relative w-full" ref={modelDropdownRef}>
          <button
            type="button"
            onClick={() => setModelDropdownOpen((o) => !o)}
            className="w-full flex items-center gap-2 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-white text-sm font-medium pl-2 pr-2 py-2.5 focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150 active:border-b-2 active:mt-[2px]"
            aria-label="Modelo de IA"
            aria-expanded={modelDropdownOpen}
            aria-haspopup="listbox"
          >
            <Image src={selectedModelData.icon} alt="" width={20} height={20} className="rounded object-contain flex-shrink-0 w-5 h-5" />
            <span className="flex-1 text-left truncate text-xs">{selectedModelData.label}</span>
            <span className="text-[#777777] dark:text-gray-400 font-normal tabular-nums text-xs">{priceString(selectedModelData.price)}</span>
            <svg className={`w-3.5 h-3.5 flex-shrink-0 text-[#777777] dark:text-gray-400 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {modelDropdownOpen && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1 z-50 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 shadow-lg py-1 max-h-[280px] overflow-y-auto"
              aria-label="Modelos disponibles"
            >
              {tutorModels.map((m) => (
                <li key={m.id} role="option" aria-selected={selectedModel === m.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedModel(m.id); setModelDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs transition-colors ${selectedModel === m.id ? 'bg-[#1472FF]/10 dark:bg-[#1472FF]/20 text-[#1472FF] dark:text-[#1472FF]' : 'text-[#4b4b4b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <Image src={m.icon} alt="" width={18} height={18} className="rounded object-contain flex-shrink-0 w-[18px] h-[18px]" />
                    <span className="flex-1 truncate font-medium">{m.label}</span>
                    <span className="text-[#777777] dark:text-gray-400 font-normal tabular-nums">{priceString(m.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Messages - Clean and spacious */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-2xl border-2 border-b-4 ${
                  message.role === 'user'
                    ? 'bg-gray-300 dark:bg-gray-800 text-[#4b4b4b] dark:text-white border-[#aeb3bb] dark:border-gray-900 border-b-[#aeb3bb] dark:border-b-gray-900'
                    : 'bg-white dark:bg-gray-800 text-[#4b4b4b] dark:text-gray-300 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#1472FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - textarea crece hasta 5 líneas */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 flex-shrink-0">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              placeholder="Escribe tu mensaje..."
              rows={1}
              className="w-full min-h-[3rem] max-h-[7.5rem] px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-900 border-b-4 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 text-sm text-[#4b4b4b] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1472FF]/20 focus:border-[#1472FF] transition-all resize-none overflow-y-auto"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || isLoading}
            className="w-full flex items-center justify-center"
          >
            Enviar Mensaje
          </Button>
        </form>
      </div>
    </aside>
  );
}
