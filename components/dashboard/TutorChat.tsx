'use client';

import { useState } from 'react';

export default function TutorChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Chat panel */}
      <div
        className={`bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'h-96' : 'h-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Tutor IA</h3>
            <span className="text-xs text-gray-500">Pregúntame sobre tu curso</span>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1472FF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                IA
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                <p className="text-sm text-gray-700">
                  ¡Hola! Soy tu tutor IA. ¿En qué puedo ayudarte con tu curso?
                </p>
              </div>
            </div>
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#1472FF] text-sm"
              />
              <button className="w-10 h-10 rounded-full bg-[#1472FF] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-white px-4 py-3 flex items-center justify-center gap-2 bg-[#1472FF] border-b-4 border-[#0E5FCC] hover:bg-[#0E5FCC] active:border-b-0 transition-all duration-150"
      >
        <span className="text-sm font-bold uppercase tracking-wide">Platica con tu tutor</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}



