'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Lazy initialization of Supabase client to avoid SSR issues
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if Supabase is configured before trying to create client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const configured = url &&
        key &&
        url !== 'https://your-project.supabase.co' &&
        key !== 'your-anon-key-here' &&
        !url.includes('your-project');

      if (configured) {
        try {
          setSupabase(createClient());
        } catch (error: any) {
          console.error('Error initializing Supabase client:', error);
        }
      }
    }
  }, []);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = () => {
    if (typeof window === 'undefined') return false;
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return url &&
           key &&
           url !== 'https://your-project.supabase.co' &&
           key !== 'your-anon-key-here' &&
           !url.includes('your-project');
  };

  const translateError = (errorMessage: string): string => {
    // Error especial cuando Supabase no está configurado
    if (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('NetworkError')) {
      return 'Supabase no está configurado. Usa el botón "Ver Demo" para explorar la plataforma.';
    }

    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address': 'Email inválido',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return errorMessage;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(translateError(signInError.message));
      } else {
        // Wait for session to be fully established before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        // Use window.location for more reliable redirect on mobile
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocurrió un error. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://itera.la/auth/callback',
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setError(translateError(error.message || 'Error al iniciar sesión con Google'));
        setLoading(false);
        return;
      }

      // If data.url exists, Supabase will handle the redirect automatically
      // Don't set loading to false as we're redirecting
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(translateError(err.message || 'Error al iniciar sesión con Google'));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-950">
      <AuthNavbar />

      <section className="min-h-screen flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Inicia Sesión
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Continúa tu aprendizaje en IA y automatización
              </p>
            </div>

            {/* Advertencia si Supabase no está configurado */}
            {!isSupabaseConfigured() && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm font-semibold mb-2">
                      ⚠️ Base de datos no configurada
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">
                      Supabase aún no está configurado. Puedes explorar la plataforma en modo demo.
                    </p>
                    <Link
                      href="/demo"
                      className="inline-block bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🎯 Ver Demo del Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1472FF] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1472FF] focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full font-semibold text-sm bg-gradient-to-r from-[#1472FF] to-[#5BA0FF] text-white shadow-md hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-4 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O continúa con</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
            </button>

            {/* Signup Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Regístrate gratis
              </Link>
          </p>
          </div>
        </div>
      </section>
    </main>
  );
}