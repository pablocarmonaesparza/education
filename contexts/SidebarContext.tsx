'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface LessonNavItem {
  id: string;
  title: string;
  order: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface LessonNav {
  phaseName: string;
  lessons: LessonNavItem[];
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
}

interface SidebarContextType {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  /** Mobile sidebar open (drawer). Desktop ignores. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** When set, the sidebar swaps its global nav for a lesson nav scoped
   *  to the current phase. Cleared when the lesson overlay closes. */
  lessonNav: LessonNav | null;
  setLessonNav: (nav: LessonNav | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lessonNav, setLessonNav] = useState<LessonNav | null>(null);

  return (
    <SidebarContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        mobileOpen,
        setMobileOpen,
        lessonNav,
        setLessonNav,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

/** For mobile menu toggle only; safe when provider missing (e.g. non-dashboard). */
export function useSidebarOptional() {
  return useContext(SidebarContext);
}

























