'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { Button, Input, SpinnerPage, Card, Title, Caption } from '@/components/ui';
import { useSupabaseInit } from '@/lib/auth/useSupabaseInit';
import { translateError } from '@/lib/auth/utils';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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

    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(translateError(resetError.message));
      } else {
        setSuccess('Si el email existe, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.');
        setEmail('');
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocurrió un error. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
      <AuthNavbar />

      <section className="min-h-screen flex items-center justify-center py-12 md:py-20 px-4 relative z-10">
        <div className="w-full max-w-md">
          <Card variant="neutral" padding="lg" className="md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <Title className="text-3xl md:text-4xl mb-2">recupera tu cuenta</Title>
              <Caption>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</Caption>
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
                      Supabase aún no está configurado.
                    </p>
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
                type="email"
                id="email"
                variant="default"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                depth="bottom"
                size="none"
                rounded2xl
                disabled={loading}
                className="w-full py-4 text-sm"
              >
                {loading ? 'Enviando...' : 'ENVIAR ENLACE'}
              </Button>
            </form>

            {/* Back to login */}
            <Caption className="mt-6 text-center" as="p">
              <Link href="/auth/login" className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold">
                Volver a iniciar sesión
              </Link>
            </Caption>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
        <AuthNavbar />
        <SpinnerPage />
      </main>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
