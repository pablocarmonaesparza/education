'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

interface TutorContentProps {
  chats?: Chat[];
}

export default function TutorContent({ chats: initialChats }: TutorContentProps) {
  const [chats, setChats] = useState<Chat[]>(
    initialChats && initialChats.length > 0
      ? initialChats
      : [
          {
            id: '1',
            title: 'Nueva conversación',
            lastMessage: 'Haz una pregunta a tu tutor IA',
            lastMessageAt: 'Ahora',
            unreadCount: 0,
          },
        ]
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Conversación ${chats.length + 1}`,
      lastMessage: 'Nueva conversación iniciada',
      lastMessageAt: 'Ahora',
      unreadCount: 0,
    };
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lista de Chats - Sidebar izquierda */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Tutor IA</h2>
            <button
              onClick={createNewChat}
              className="p-2 rounded-lg bg-[#1472FF] text-white hover:bg-[#0E5FCC] transition-colors"
              title="Nueva conversación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Tu asistente de aprendizaje personalizado
          </p>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedChatId === chat.id ? 'bg-[#1472FF]/10 border-l-4 border-[#1472FF]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                      {chat.title}
                    </h3>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-[#1472FF] text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                      {chat.lastMessage}
                    </p>
                  )}
                  {chat.lastMessageAt && (
                    <p className="text-xs text-gray-400">
                      {chat.lastMessageAt}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600 mb-2">No hay conversaciones aún</p>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-[#1472FF] text-white rounded-lg hover:bg-[#0E5FCC] transition-colors text-sm"
              >
                Iniciar conversación
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{selectedChat.title}</h3>
              <p className="text-sm text-gray-500">Tutor IA - Listo para ayudarte</p>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Mensaje de bienvenida */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-900">
                      ¡Hola! Soy tu tutor IA. Estoy aquí para ayudarte con cualquier pregunta sobre tu ruta de aprendizaje. 
                      ¿En qué puedo ayudarte hoy?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input de Mensaje */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2">
                  <textarea
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1472FF] focus:border-transparent"
                    rows={2}
                  />
                  <button className="p-2 bg-[#1472FF] text-white rounded-lg hover:bg-[#0E5FCC] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona una conversación</h3>
              <p className="text-gray-600 mb-4">O crea una nueva para comenzar</p>
              <button
                onClick={createNewChat}
                className="px-6 py-3 bg-[#1472FF] text-white rounded-lg hover:bg-[#0E5FCC] transition-colors"
              >
                Nueva Conversación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




