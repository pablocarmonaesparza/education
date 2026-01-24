'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Lazy initialization of Supabase client to avoid SSR issues
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setSupabase(createClient());
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
      }
    }
  }, []);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return url &&
           key &&
           url !== 'https://your-project.supabase.co' &&
           key !== 'your-anon-key-here' &&
           !url.includes('your-project');
  };

  // Traducir errores comunes de Supabase al español
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
      'User already registered': 'Este email ya está registrado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address': 'Email inválido',
      'Signup disabled': 'El registro está deshabilitado temporalmente',
      'Email rate limit exceeded': 'Demasiados intentos. Intenta de nuevo más tarde',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return errorMessage;
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }
    
    setOauthLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(translateError(err.message || 'Error al iniciar sesión con Google'));
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        // Validaciones adicionales
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        if (!email.includes('@')) {
          throw new Error('Por favor ingresa un email válido');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        setMessage('Cuenta creada. Revisa tu email para confirmar tu cuenta.');
        // Limpiar el formulario
        setEmail('');
        setPassword('');
        setName('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if there's a pending project idea from the landing page
        const pendingIdea = typeof window !== 'undefined' ? sessionStorage.getItem('pendingProjectIdea') : null;
        
        setMessage('Inicio de sesión exitoso. Redirigiendo...');
        setTimeout(() => {
          if (pendingIdea) {
            // Redirect to onboarding to create the course with the saved idea
            router.push('/onboarding');
          } else {
          router.push('/dashboard');
          }
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocurrió un error. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-10 border-2 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-2 tracking-tight">
            {mode === 'login' ? 'inicia sesión' : 'crea tu cuenta'}
          </h1>
          <p className="text-[#777777] dark:text-gray-400">
            {mode === 'login'
              ? 'Continúa tu aprendizaje'
              : 'Comienza tu viaje en IA y automatización'}
          </p>
        </div>

        {/* Advertencia si Supabase no está configurado */}
        {!isSupabaseConfigured() && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm font-bold mb-2">
                  Base de datos no configurada
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">
                  Supabase aún no está configurado. Puedes explorar la plataforma en modo demo.
                </p>
                <Link
                  href="/demo"
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-wide border-b-4 border-yellow-600 hover:border-yellow-700 active:border-b-0 active:mt-1 transition-all duration-150"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-2xl">
            <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
              placeholder="Nombre completo"
            />
          )}

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            placeholder="Correo electrónico"
          />

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            placeholder="Contraseña (mínimo 6 caracteres)"
          />

          <button
            type="submit"
            disabled={loading || oauthLoading}
            className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[#1472FF] text-white border-b-4 border-[#0E5FCC] hover:bg-[#1265e0] active:border-b-0 active:mt-1 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-b-4 disabled:mt-0"
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'INICIAR SESIÓN'
              : 'CREAR CUENTA'}
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
          disabled={loading || oauthLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-b-4 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 active:border-b-2 active:mt-[2px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" suppressHydrationWarning>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" suppressHydrationWarning>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>{oauthLoading ? 'Conectando...' : 'Continuar con Google'}</span>
        </button>

        {/* Login/Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Regístrate gratis
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Inicia sesión
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
