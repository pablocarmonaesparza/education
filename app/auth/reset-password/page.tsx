'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AuthNavbar from '@/components/auth/AuthNavbar';
import { Button, Input, SpinnerPage, Card, Title, Caption } from '@/components/ui';
import { useSupabaseInit } from '@/lib/auth/useSupabaseInit';
import { translateError } from '@/lib/auth/utils';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { supabase, error, setError } = useSupabaseInit();

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked link and session was set)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError('Supabase no está inicializado. Por favor recarga la página.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(translateError(updateError.message));
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocurrió un error. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
        <AuthNavbar />
        <SpinnerPage />
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
              <Title className="text-3xl md:text-4xl mb-2">nueva contraseña</Title>
              <Caption>Ingresa tu nueva contraseña</Caption>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                id="password"
                variant="default"
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <Input
                type="password"
                id="confirm-password"
                variant="default"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASEÑA'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-gray-800">
        <AuthNavbar />
        <SpinnerPage />
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
