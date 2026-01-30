'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SpinnerPage } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  createdAt: string;
  projectIdea?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: intakeData } = await supabase
          .from('intake_responses')
          .select('responses')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const projectIdea = intakeData?.responses?.project_idea || 
                           intakeData?.responses?.project || '';

        setProfile({
          id: user.id,
          name: userData?.name || user.user_metadata?.name || '',
          email: userData?.email || user.email || '',
          tier: userData?.tier || 'basic',
          createdAt: userData?.created_at || user.created_at,
          projectIdea,
        });
        setEditName(userData?.name || user.user_metadata?.name || '');
      }
      setIsLoading(false);
    }
    
    fetchProfile();
  }, [supabase]);

  const handleSaveName = async () => {
    if (!profile || !editName.trim()) return;
    
    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('users')
      .update({ name: editName.trim() })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios' });
    } else {
      setProfile({ ...profile, name: editName.trim() });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Nombre actualizado correctamente' });
      setTimeout(() => setMessage(null), 3000);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'personalized': return 'Personalizado';
      default: return 'Básico';
    }
  };

  const userInitials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (isLoading) {
    return (
      <SpinnerPage />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center">
        <p className="text-[#777777] dark:text-gray-400">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#4b4b4b] dark:text-white tracking-tight">mi perfil</h1>
          <p className="mt-2 text-[#777777] dark:text-gray-400">Gestiona tu información personal</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Avatar Section */}
          <div className="p-6 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 rounded-full bg-[#1472FF] border-2 border-b-4 border-[#0E5FCC] flex items-center justify-center text-white text-2xl font-bold">
              {userInitials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#4b4b4b] dark:text-white">{profile.name || 'Sin nombre'}</h2>
              <p className="text-[#777777] dark:text-gray-400">{profile.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                profile.tier === 'premium' 
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400'
                  : profile.tier === 'personalized'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-900 text-[#777777] dark:text-gray-400'
              }`}>
                Plan {getTierName(profile.tier)}
              </span>
            </div>
          </div>

          {/* Info Sections */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Name */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#777777] dark:text-gray-400">Nombre</label>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-[#1472FF] hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#1472FF] focus:outline-none"
                    placeholder="Tu nombre"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(profile.name);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <p className="text-[#4b4b4b] dark:text-white">{profile.name || 'Sin nombre'}</p>
              )}
            </div>

            {/* Email */}
            <div className="p-6">
              <label className="text-sm font-medium text-[#777777] dark:text-gray-400 block mb-2">Correo electrónico</label>
              <p className="text-[#4b4b4b] dark:text-white">{profile.email}</p>
            </div>

            {/* Member Since */}
            <div className="p-6">
              <label className="text-sm font-medium text-[#777777] dark:text-gray-400 block mb-2">Miembro desde</label>
              <p className="text-[#4b4b4b] dark:text-white">{formatDate(profile.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Project Card */}
        {profile.projectIdea && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#4b4b4b] dark:text-white mb-2">Tu Proyecto</h3>
              <p className="text-[#777777] dark:text-gray-400 leading-relaxed">{profile.projectIdea}</p>
            </div>
          </div>
        )}

        {/* Configuration Section */}
        <div id="configuracion" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-[#4b4b4b] dark:text-white">Configuración</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Plan */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#4b4b4b] dark:text-white">Plan actual</p>
                <p className="text-sm text-[#777777] dark:text-gray-400">Plan {getTierName(profile.tier)}</p>
              </div>
              <Button variant="primary" size="md" rounded2xl>
                Mejorar Plan
              </Button>
            </div>

            {/* Notifications */}
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#4b4b4b] dark:text-white">Notificaciones</p>
                <p className="text-sm text-[#777777] dark:text-gray-400">Recibe actualizaciones por correo</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-[#1472FF] relative transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 overflow-hidden">
          <div className="p-6 border-b border-red-100 dark:border-red-900/50">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-500">Zona de peligro</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#4b4b4b] dark:text-white">Cerrar sesión</p>
                <p className="text-sm text-[#777777] dark:text-gray-400">Salir de tu cuenta en este dispositivo</p>
              </div>
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

