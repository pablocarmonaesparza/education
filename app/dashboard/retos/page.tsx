'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RetosPage() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();
        
        const name = profile?.name || user.user_metadata?.name || '';
        setUserName(name.split(' ')[0]);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-11rem)] bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1472FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Retos</h1>
          <p className="mt-2 text-gray-500">Próximamente...</p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#1472FF] to-[#5BA0FF] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Retos en camino!
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Estamos preparando retos personalizados para que puedas practicar y aplicar lo que aprendes. 
              Muy pronto podrás poner a prueba tus habilidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
