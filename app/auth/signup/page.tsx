'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { Button, Input, SpinnerPage, Card, Divider, Title, Caption } from '@/components/ui';
import { useSupabaseInit } from '@/lib/auth/useSupabaseInit';
import { translateError, getOAuthRedirectUrl, GoogleIcon } from '@/lib/auth/utils';

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?from=signup`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        setError(translateError(signUpError.message));
      } else if (signUpData?.session) {
        window.location.href = '/onboarding';
      } else {
        setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthRedirectUrl('signup'),
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
              <Title className="text-3xl md:text-4xl mb-2">crea tu cuenta</Title>
              <Caption>Comienza tu viaje en IA y automatización</Caption>
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
                variant="default"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                type="email"
                id="email"
                variant="default"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  variant="default"
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

            {/* Login Link */}
            <Caption className="mt-6 text-center" as="p">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Inicia sesión
              </Link>
            </Caption>
          </Card>
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
        <SpinnerPage />
      </main>
    }>
      <SignupContent />
    </Suspense>
  );
}
