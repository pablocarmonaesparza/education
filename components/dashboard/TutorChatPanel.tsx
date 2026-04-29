'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Spinner from '@/components/ui/Spinner';
import IconButton from '@/components/ui/IconButton';
import { useTutorChat } from '@/lib/hooks/useTutorChat';
import { TUTOR_MODELS } from '@/lib/tutor/models';
import { depth } from '@/lib/design-tokens';

/**
 * TutorChatPanel — cuerpo reutilizable del Tutor IA.
 *
 * Antes vivía dentro de un aside fijo en `TutorChatButton.tsx`. Se extrajo
 * para que el chat ahora viva en un FAB flotante (`FloatingChat`), pero el
 * layout interno (header con acciones, lista de mensajes, input + selector
 * de modelo) sigue siendo el mismo. El componente ocupa el espacio que su
 * contenedor le dé y asume que el contenedor es flex column con altura
 * conocida — así sirve igual dentro de un panel flotante de 384px que
 * dentro de cualquier sidebar futuro.
 */

// Simple markdown renderer for assistant messages
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^[-*]\s/)) {
      const items: string[] = [line.replace(/^[-*]\s/, '')];
      while (i + 1 < lines.length && lines[i + 1].match(/^[-*]\s/)) {
        i++;
        items.push(lines[i].replace(/^[-*]\s/, ''));
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-1">
          {items.map((item, j) => (
            <li key={j}>{formatInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={i}
          className="bg-gray-100 dark:bg-gray-900 rounded-xl p-3 my-2 overflow-x-auto text-xs"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    if (!line.trim()) {
      elements.push(<br key={i} />);
      continue;
    }

    elements.push(
      <p key={i} className="my-0.5">
        {formatInline(line)}
      </p>,
    );
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function TutorChatPanel({
  onClose,
  showCloseButton = false,
}: {
  /** Si está presente, se renderiza un botón de cerrar en el header. */
  onClose?: () => void;
  showCloseButton?: boolean;
}) {
  const {
    messages,
    isStreaming,
    streamingContent,
    conversations,
    activeConversationId,
    isLoadingMessages,
    sendMessage,
    selectConversation,
    createNewConversation,
    deleteConversation,
    selectedModel,
    setSelectedModel,
  } = useTutorChat();

  const [input, setInput] = useState('');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedModelData =
    TUTOR_MODELS.find((m) => m.id === selectedModel) || TUTOR_MODELS[1];
  const priceString = useCallback((n: number) => '$'.repeat(n), []);

  // Cierra dropdowns al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
      if (
        conversationsRef.current &&
        !conversationsRef.current.contains(e.target as Node)
      ) {
        setShowConversations(false);
      }
    }
    if (modelDropdownOpen || showConversations) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [modelDropdownOpen, showConversations]);

  // Scroll al final cuando llegan mensajes nuevos / streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Foco al montar
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const content = input.trim();
    setInput('');
    await sendMessage(content);
  };

  const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header: título y acciones */}
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-100 dark:border-gray-900">
        <h3 className="text-base font-bold text-ink dark:text-gray-200 lowercase">
          tutor ia
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={createNewConversation}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            aria-label="Nueva conversación"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <div className="relative" ref={conversationsRef}>
            <button
              type="button"
              onClick={() => setShowConversations((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Historial"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            {showConversations && (
              <div
                className={`absolute right-0 top-full mt-1 z-50 w-64 rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 shadow-lg max-h-[300px] overflow-y-auto`}
              >
                <div className="p-2">
                  {conversations.length === 0 ? (
                    <p className="text-xs text-ink-muted dark:text-gray-400 text-center py-4">
                      Sin conversaciones previas
                    </p>
                  ) : (
                    // Cada item de conversación es una row con dos
                    // affordances: seleccionar (botón principal) y eliminar
                    // (botón secundario que aparece en hover). Los buttons
                    // no se anidan — son hermanos dentro de un wrapper
                    // posicional. El wrapper es un `div` con `role="group"`
                    // (no clickable) para mantener accesibilidad.
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        role="group"
                        className={`relative rounded-xl group ${
                          activeConversationId === conv.id
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            selectConversation(conv.id);
                            setShowConversations(false);
                          }}
                          className="w-full text-left px-3 py-2 pr-8 rounded-xl transition-colors"
                          aria-label={`Abrir conversación: ${conv.title}`}
                        >
                          <p
                            className={`text-xs font-medium truncate ${
                              activeConversationId === conv.id
                                ? 'text-primary'
                                : 'text-ink dark:text-white'
                            }`}
                          >
                            {conv.title}
                          </p>
                          <p className="text-[10px] text-ink-muted dark:text-gray-400">
                            {relativeTime(conv.updatedAt)}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteConversation(conv.id)}
                          className="opacity-0 group-hover:opacity-100 absolute top-1/2 right-2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all flex-shrink-0"
                          aria-label={`Eliminar conversación: ${conv.title}`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Cerrar chat"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white dark:bg-gray-800">
        {isLoadingMessages && (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && !activeConversationId && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div
                className={`bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 text-ink dark:text-gray-300`}
              >
                <p className="text-sm leading-relaxed">
                  Hola, soy tu tutor de IA personal. Estoy aquí para ayudarte
                  con cualquier duda sobre tu curso. ¿En qué puedo ayudarte
                  hoy?
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] ${
                message.role === 'user' ? 'order-2' : 'order-1'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${depth.border} ${depth.bottom} ${
                  message.role === 'user'
                    ? 'bg-gray-300 dark:bg-gray-800 text-ink dark:text-white border-gray-400 dark:border-gray-900 border-b-gray-400 dark:border-b-gray-900'
                    : 'bg-white dark:bg-gray-800 text-ink dark:text-gray-300 border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {message.role === 'assistant' ? (
                    renderMarkdown(message.content)
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div
                className={`bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 text-ink dark:text-gray-300`}
              >
                <div className="text-sm leading-relaxed">
                  {renderMarkdown(streamingContent)}
                  <span className="inline-block w-1.5 h-4 bg-primary rounded-sm animate-pulse ml-0.5 align-text-bottom" />
                </div>
              </div>
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div
                className={`bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input + selector de modelo */}
      <div className="px-4 py-4 bg-white dark:bg-gray-800 flex-shrink-0 border-t border-gray-100 dark:border-gray-900">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-0">
          <div
            className={`rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 overflow-visible`}
          >
            <div className="overflow-hidden rounded-t-2xl">
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
                rows={2}
                className="w-full min-h-[4rem] max-h-[4rem] px-4 py-3 text-sm text-ink dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent resize-none overflow-y-auto border-0 border-none"
              />
            </div>
            <div className="flex items-center gap-2 px-2 pb-2 pt-0">
              <div
                className="relative flex-shrink-0 h-9 flex items-center"
                ref={modelDropdownRef}
              >
                <button
                  type="button"
                  onClick={() => setModelDropdownOpen((o) => !o)}
                  className="h-9 flex items-center gap-1.5 pl-1 pr-1 rounded-lg text-ink dark:text-white text-xs font-bold outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-0 border-transparent bg-transparent min-w-0"
                  aria-label="Modelo de IA"
                  aria-expanded={modelDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    <Image
                      src={selectedModelData.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded object-contain"
                    />
                  </span>
                  <span className="truncate max-w-[100px] font-bold">
                    {selectedModelData.label}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-ink-muted/15 dark:bg-gray-600 text-ink-muted dark:text-gray-400 text-xs font-bold tabular-nums border border-ink-muted/30 dark:border-gray-500/50">
                    {priceString(selectedModelData.price)}
                  </span>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 text-ink-muted dark:text-gray-400 transition-transform ${
                      modelDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {modelDropdownOpen && (
                  <ul
                    role="listbox"
                    className={`absolute left-0 bottom-full mb-1 z-50 rounded-2xl ${depth.border} ${depth.bottom} border-gray-200 dark:border-gray-900 border-b-gray-300 dark:border-b-gray-900 bg-white dark:bg-gray-800 shadow-lg py-1 min-w-[200px] max-h-[280px] overflow-y-auto`}
                    aria-label="Modelos disponibles"
                  >
                    {TUTOR_MODELS.map((m) => (
                      <li key={m.id} role="option" aria-selected={selectedModel === m.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel(m.id);
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs font-bold transition-colors ${
                            selectedModel === m.id
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                              : 'text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            <Image
                              src={m.icon}
                              alt=""
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded object-contain"
                            />
                          </span>
                          <span className="flex-1 truncate">{m.label}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-ink-muted/15 dark:bg-gray-600 text-ink-muted dark:text-gray-400 tabular-nums border border-ink-muted/30 dark:border-gray-500/50">
                            {priceString(m.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex-1 min-w-0" aria-hidden="true" />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className={`w-9 h-9 flex items-center justify-center rounded-xl ${depth.border} ${depth.bottom} border-primary border-b-primary-dark bg-primary text-white hover:bg-primary-hover ${depth.active} transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                aria-label="Enviar mensaje"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
