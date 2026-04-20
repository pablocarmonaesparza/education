'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { Button, Input, SpinnerPage, Card, Divider, Title, Caption } from '@/components/ui';
import { useSupabaseInit } from '@/lib/auth/useSupabaseInit';
import { translateError, getOAuthRedirectUrl, GoogleIcon } from '@/lib/auth/utils';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectingToGoogle, setRedirectingToGoogle] = useState(false);
  const router = useRouter();
  const { supabase, showSupabaseWarning, isMounted, error, setError } = useSupabaseInit();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(translateError(signInError.message));
      } else if (signInData?.session) {
        try {
          const { data: intakeData } = await supabase
            .from('intake_responses')
            .select('generated_path')
            .eq('user_id', signInData.session.user.id)
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
      } else {
        setError('Error al iniciar sesión. Por favor intenta de nuevo.');
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
          redirectTo: getOAuthRedirectUrl('login'),
          queryParams: { prompt: 'select_account' },
        },
      });

      if (error) {
        setError(translateError(error.message || 'Error al iniciar sesión con Google'));
        setLoading(false);
        return;
      }

      if (data?.url) {
        setRedirectingToGoogle(true);
        window.location.href = data.url;
      } else {
        setError('No se pudo obtener la URL de autenticación. Intenta de nuevo.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(translateError(err.message || 'Error al iniciar sesión con Google'));
      setLoading(false);
    }
  };

  if (redirectingToGoogle) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-800">
        <SpinnerPage />
        <Caption className="mt-4">Redirigiendo a Google...</Caption>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
      <AuthNavbar />

      <section className="min-h-screen flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-md">
          <Card variant="neutral" padding="lg" className="md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <Title className="text-3xl md:text-4xl mb-2">inicia sesión</Title>
              <Caption>Continúa tu aprendizaje en IA y automatización</Caption>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                id="email"
                variant="default"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                id="password"
                variant="default"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-[#1472FF] hover:text-[#0E5FCC] text-xs font-semibold">
                  ¿Olvidaste tu contraseña?
                </Link>
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
                {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
              </Button>
            </form>

            {/* Divider */}
            <Divider title="O continúa con" className="my-6" />

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
              <GoogleIcon />
              <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
            </Button>

            {/* Signup Link */}
            <Caption className="mt-6 text-center" as="p">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Regístrate gratis
              </Link>
            </Caption>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
        <AuthNavbar />
        <SpinnerPage />
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
