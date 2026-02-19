'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import { SearchInput } from '@/components/ui/Input';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';

interface Profile {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  initials: string;
  project: string;
  skills: string[];
  linkedin: string | null;
  website: string | null;
  location: string;
}

// Mock data — will be replaced with real data
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'María García',
    role: 'Diseñadora UX',
    photo: null,
    initials: 'MG',
    project: 'App de meditación con IA personalizada',
    skills: ['Figma', 'UX Research', 'IA Generativa'],
    linkedin: 'https://linkedin.com/in/mariagarcia',
    website: 'https://mariagarcia.com',
    location: 'CDMX',
  },
  {
    id: '2',
    name: 'Carlos López',
    role: 'Desarrollador Full Stack',
    photo: null,
    initials: 'CL',
    project: 'Plataforma de automatización para restaurantes',
    skills: ['Next.js', 'Python', 'APIs', 'n8n'],
    linkedin: 'https://linkedin.com/in/carloslopez',
    website: null,
    location: 'Monterrey',
  },
  {
    id: '3',
    name: 'Ana Rodríguez',
    role: 'Product Manager',
    photo: null,
    initials: 'AR',
    project: 'Chatbot de atención al cliente para e-commerce',
    skills: ['Product Strategy', 'ChatGPT', 'Scrum'],
    linkedin: 'https://linkedin.com/in/anarodriguez',
    website: 'https://anarodriguez.dev',
    location: 'Guadalajara',
  },
  {
    id: '4',
    name: 'Diego Martínez',
    role: 'Data Scientist',
    photo: null,
    initials: 'DM',
    project: 'Herramienta de análisis predictivo para ventas',
    skills: ['Python', 'ML', 'Análisis de datos', 'IA'],
    linkedin: null,
    website: 'https://diegomartinez.io',
    location: 'Remoto',
  },
  {
    id: '5',
    name: 'Sofía Hernández',
    role: 'Marketing Digital',
    photo: null,
    initials: 'SH',
    project: 'Generador automático de contenido para redes sociales',
    skills: ['SEO', 'Content Marketing', 'IA Generativa', 'Copywriting'],
    linkedin: 'https://linkedin.com/in/sofiahernandez',
    website: null,
    location: 'Buenos Aires',
  },
  {
    id: '6',
    name: 'Roberto Torres',
    role: 'Ingeniero de Software',
    photo: null,
    initials: 'RT',
    project: 'Sistema de facturación con inteligencia artificial',
    skills: ['React', 'Node.js', 'PostgreSQL', 'OpenAI'],
    linkedin: 'https://linkedin.com/in/robertotorres',
    website: 'https://robertorres.com',
    location: 'Bogotá',
  },
];

// Colors for avatar backgrounds
const avatarColors = [
  'bg-[#1472FF]',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
];

export default function NetworkPage() {
  const [search, setSearch] = useState('');
  const [profiles] = useState<Profile[]>(mockProfiles);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.project.toLowerCase().includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q)) ||
      p.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeader
          title="network"
          subtitle="Conoce a otros estudiantes y profesionales"
        />

        {/* Search */}
        <div className="max-w-md">
          <SearchInput
            placeholder="Buscar por nombre, skill, proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Profiles Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="No se encontraron perfiles"
            description="Intenta con otra búsqueda o revisa más tarde."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((profile, index) => (
              <CardFlat key={profile.id} className="shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {profile.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-[#4b4b4b] dark:text-white truncate">{profile.name}</p>
                      <Caption className="truncate">{profile.role} · {profile.location}</Caption>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="mb-4">
                    <Headline className="mb-1">proyecto</Headline>
                    <Body className="text-[#777777] dark:text-gray-400 line-clamp-2 text-sm">{profile.project}</Body>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.skills.slice(0, 3).map((skill) => (
                      <Tag key={skill} variant="outline" className="!text-xs !px-2 !py-0.5">
                        {skill}
                      </Tag>
                    ))}
                    {profile.skills.length > 3 && (
                      <Caption className="self-center">+{profile.skills.length - 3}</Caption>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex gap-2">
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn
                        </Button>
                      </a>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Web
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardFlat>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
