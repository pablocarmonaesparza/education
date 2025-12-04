'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

const DEFAULT_WIDTH = 500;

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isMobile, setIsMobile] = useState(false);

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen, sidebarWidth, setSidebarWidth, isMobile, setIsMobile }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

