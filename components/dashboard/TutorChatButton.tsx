'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function TutorChatButton() {
  const [showTutorChat, setShowTutorChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .single();
        
        const userData = {
          ...user,
          profile: profile || { name: user.user_metadata?.name, email: user.email }
        };
        
        setUser(userData);
        
        // Set welcome message with user name
        const displayName = userData.profile?.name || userData.profile?.email?.split('@')[0] || 'Usuario';
        setChatMessages([
          { role: 'assistant', content: `¡Hola ${displayName}! ¿Cómo puedo ayudarte hoy?` }
        ]);
      }
    }
    fetchUser();
  }, [supabase]);

  // Get user initials
  const userName = user?.profile?.name || user?.profile?.email?.split('@')[0] || '';
  const userInitials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMessage }].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error de conexión.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble - Fixed to bottom with same padding as navbar */}
      <AnimatePresence>
        {showTutorChat && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/60 dark:bg-gray-950/80"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" style={{ height: '22vh', minHeight: '220px' }}>
              {/* Close button - Top right */}
              <button
                onClick={() => setShowTutorChat(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' ? (
                      <div className="w-7 h-7 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        IA
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[10px] font-bold flex-shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className={`px-3 py-2 max-w-[85%] rounded-2xl ${
                      msg.role === 'assistant' 
                        ? 'text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      IA
                    </div>
                    <div className="rounded-2xl px-3 py-2 border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input field - Inside chat bubble with glass effect */}
              <div className="px-4 pt-2 pb-3 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 flex items-center px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-[#1472FF] transition-colors">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Escribe tu pregunta..."
                      className="flex-1 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      disabled={isLoading}
                    />
                    {/* Plus icon */}
                    <button 
                      type="button"
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    {/* Microphone icon */}
                    <button 
                      type="button"
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !chatInput.trim()}
                    className="w-8 h-8 rounded-full bg-[#1472FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar - like navbar (only when chat is closed) */}
      <AnimatePresence>
        {!showTutorChat && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/60 dark:bg-gray-950/80"
          >
            <div className="container mx-auto px-4">
              <div className="flex justify-center items-center h-20 relative">
                {/* Chat Button when closed */}
                <button
                  onClick={() => setShowTutorChat(true)}
                  className="px-6 py-3 rounded-2xl font-bold uppercase tracking-wide text-white bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150"
                >
                  Platica con tu tutor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



