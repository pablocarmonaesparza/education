'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button, Input, Title, Caption } from '@/components/ui';
import { translateError, isSupabaseConfigured, getOAuthRedirectUrl, GoogleIcon } from '@/lib/auth/utils';

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

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }

    setOauthLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl(mode),
          queryParams: { prompt: 'select_account' },
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
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback?from=signup`,
          },
        });

        if (error) throw error;

        if (data?.session) {
          window.location.href = '/onboarding';
          return;
        }

        setMessage('Cuenta creada. Revisa tu email para confirmar tu cuenta.');
        setEmail('');
        setPassword('');
        setName('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.session) {
          const pendingIdea = typeof window !== 'undefined' ? sessionStorage.getItem('pendingProjectIdea') : null;

          if (pendingIdea) {
            window.location.href = '/onboarding';
          } else {
            try {
              const { data: intakeData } = await supabase
                .from('intake_responses')
                .select('generated_path')
                .eq('user_id', data.session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (intakeData?.generated_path) {
                window.location.href = '/dashboard';
              } else {
                window.location.href = '/onboarding';
              }
            } catch {
              window.location.href = '/onboarding';
            }
          }
        } else {
          setError('Error al iniciar sesión. Por favor intenta de nuevo.');
        }
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocurrió un error. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 border-2 border-gray-200 dark:border-gray-900">
        {/* Header */}
        <div className="text-center mb-8">
          <Title className="text-3xl md:text-4xl mb-2">
            {mode === 'login' ? 'inicia sesión' : 'crea tu cuenta'}
          </Title>
          <Caption>
            {mode === 'login'
              ? 'Continúa tu aprendizaje'
              : 'Comienza tu viaje en IA y automatización'}
          </Caption>
        </div>

        {/* Advertencia si Supabase no está configurado */}
        {!isSupabaseConfigured() && (
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
        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-2xl">
            <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              variant="flat"
              placeholder="Nombre completo"
            />
          )}

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="flat"
            placeholder="Correo electrónico"
          />

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            variant="flat"
            placeholder="Contraseña (mínimo 6 caracteres)"
          />

          <Button
            type="submit"
            variant="primary"
            depth="bottom"
            size="none"
            rounded2xl
            disabled={loading || oauthLoading}
            className="w-full py-4 text-sm"
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'INICIAR SESIÓN'
              : 'CREAR CUENTA'}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6 mb-4 flex items-center">
          <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span className="px-4 text-sm font-bold text-gray-500 dark:text-white uppercase tracking-wider">O continúa con</span>
          <div className="flex-1 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          depth="full"
          size="none"
          rounded2xl
          onClick={handleGoogleLogin}
          disabled={loading || oauthLoading}
          className="w-full flex items-center justify-center gap-3 py-4"
        >
          <GoogleIcon />
          <span>{oauthLoading ? 'Conectando...' : 'Continuar con Google'}</span>
        </Button>

        {/* Login/Signup Link */}
        <Caption className="mt-6 text-center" as="p">
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
        </Caption>
      </div>
    </div>
  );
}
