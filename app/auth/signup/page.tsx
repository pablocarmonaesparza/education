'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Spinner } from '@/components/ui';

function SignupContent() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [showSupabaseWarning, setShowSupabaseWarning] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Lazy initialization of Supabase client to avoid SSR issues
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    setIsMounted(true);

    // Check for error in URL params (from OAuth callback or redirect)
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }

    if (typeof window !== 'undefined') {
      // Check if Supabase is configured before trying to create client
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const configured = url &&
        key &&
        url !== 'https://your-project.supabase.co' &&
        key !== 'your-anon-key-here' &&
        !url.includes('your-project') &&
        url.startsWith('https://') &&
        key.length > 20;

      if (configured) {
        try {
          setSupabase(createClient());
          setShowSupabaseWarning(false);
        } catch (error: any) {
          console.error('Error initializing Supabase client:', error);
          setShowSupabaseWarning(true);
        }
      } else {
        console.warn('Supabase not configured:', { url: url?.substring(0, 30), keyPresent: !!key });
        setShowSupabaseWarning(true);
      }
    }
  }, []);


  const translateError = (errorMessage: string): string => {
    // Error especial cuando Supabase no está configurado
    if (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('NetworkError')) {
      return 'Supabase no está configurado. Usa el botón "Ver Demo" para explorar la plataforma.';
    }

    const errorMap: { [key: string]: string } = {
      'User already registered': 'Este email ya está registrado',
      'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Use dynamic redirect URL based on current origin
      const redirectUrl = `${window.location.origin}/auth/callback?from=signup`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        setError(translateError(signUpError.message));
      } else if (signUpData?.session) {
        // Auto-confirmed signup (session created immediately)
        window.location.href = '/onboarding';
      } else {
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
        // Limpiar el formulario
        setEmail('');
        setPassword('');
        setName('');
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
      // Use dynamic redirect URL based on current origin to ensure PKCE flow works correctly
      const redirectUrl = `${window.location.origin}/auth/callback?from=signup`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
      <AuthNavbar />

      <section className="min-h-screen flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border-2 border-gray-200 dark:border-gray-900">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#4b4b4b] dark:text-white mb-2 tracking-tight">
                crea tu cuenta
              </h1>
              <p className="text-[#777777] dark:text-gray-400">
                Comienza tu viaje en IA y automatización
              </p>
            </div>

            {/* Advertencia si Supabase no está configurado */}
            {isMounted && showSupabaseWarning && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm font-bold mb-2">
                      Base de datos no configurada
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">
                      Supabase aún no está configurado. Puedes explorar la plataforma en modo demo.
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      rounded2xl
                      href="/demo"
                      className="bg-yellow-500 hover:bg-yellow-600 border-yellow-600"
                    >
                      Ver Demo
                    </Button>
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
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-2xl">
                <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">{success}</p>
              </div>
            )}

            {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                id="name"
                variant="flat"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                type="email"
                id="email"
                variant="flat"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
              <Input
                  type={showPassword ? "text" : "password"}
                id="password"
                  variant="flat"
                  className="pr-12"
                  placeholder="Contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                  minLength={6}
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
            </div>

              <Button
                type="submit"
                variant="primary"
                depth="bottom"
                size="none"
                rounded2xl
                disabled={loading}
                className="w-full py-4 text-sm"
              >
                {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-4 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-900"></div>
              <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O continúa con</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-900"></div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              depth="full"
              size="none"
              rounded2xl
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4"
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
            </Button>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Inicia sesión
              </Link>
          </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
        <AuthNavbar />
        <section className="min-h-screen flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
          <Spinner />
        </section>
      </main>
    }>
      <SignupContent />
    </Suspense>
  );
}