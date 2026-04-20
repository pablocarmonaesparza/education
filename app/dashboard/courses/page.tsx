'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Card from '@/components/ui/Card';
import { SearchInput } from '@/components/ui';
import { Title, Subtitle, Body } from '@/components/ui/Typography';

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Todas las categorías del curso completo
  const categories = [
    { id: 'all', name: 'Todos', icon: '📚', count: 400 },
    { id: 'intro', name: 'Introducción', icon: '🎯', count: 25 },
    { id: 'ia', name: 'IA & LLMs', icon: '🤖', count: 40 },
    { id: 'apis', name: 'APIs', icon: '🔌', count: 35 },
    { id: 'automation', name: 'Automatización', icon: '⚡', count: 50 },
    { id: 'data', name: 'Data & Analytics', icon: '📊', count: 30 },
    { id: 'vibe-coding', name: 'Vibe-Coding', icon: '💻', count: 45 },
    { id: 'products', name: 'Productos', icon: '🚀', count: 40 },
    { id: 'finance', name: 'Finanzas', icon: '💰', count: 25 },
    { id: 'growth', name: 'Growth', icon: '📈', count: 30 },
    { id: 'ai-apps', name: 'AI Apps', icon: '🎨', count: 35 },
    { id: 'cases', name: 'Casos de Uso', icon: '💡', count: 25 },
    { id: 'agents', name: 'AI Agents', icon: '🤝', count: 20 },
  ];

  // Módulos de ejemplo (en producción vendrían de Supabase)
  const allModules = [
    {
      id: '1',
      category: 'intro',
      title: 'Introducción a IA & Automatización',
      description: 'Conceptos fundamentales, panorama de LLMs y casos de uso reales',
      videoCount: 25,
      duration: '45-60 min',
      level: 'Principiante',
      topics: ['LLMs', 'Fundamentos', 'Casos de Uso'],
    },
    {
      id: '2',
      category: 'ia',
      title: 'Large Language Models',
      description: 'Claude, GPT-4, Llama y otros modelos de lenguaje',
      videoCount: 40,
      duration: '90-120 min',
      level: 'Intermedio',
      topics: ['Claude', 'GPT-4', 'Prompt Engineering'],
    },
    {
      id: '3',
      category: 'apis',
      title: 'APIs y Integraciones',
      description: 'REST, GraphQL, Webhooks y automatización con APIs',
      videoCount: 35,
      duration: '75-90 min',
      level: 'Intermedio',
      topics: ['REST', 'Webhooks', 'Authentication'],
    },
    {
      id: '4',
      category: 'automation',
      title: 'Automatización con n8n',
      description: 'Workflows, automatizaciones y casos de uso con n8n',
      videoCount: 50,
      duration: '120-150 min',
      level: 'Intermedio',
      topics: ['n8n', 'Workflows', 'Integraciones'],
    },
    {
      id: '5',
      category: 'data',
      title: 'Data & Analytics',
      description: 'Análisis de datos, métricas y visualizaciones',
      videoCount: 30,
      duration: '60-75 min',
      level: 'Intermedio',
      topics: ['Analytics', 'Métricas', 'Visualización'],
    },
    {
      id: '6',
      category: 'vibe-coding',
      title: 'Vibe-Coding con Claude',
      description: 'Desarrollo asistido por IA con Claude Code',
      videoCount: 45,
      duration: '90-120 min',
      level: 'Avanzado',
      topics: ['Claude Code', 'AI-Assisted Dev', 'Productividad'],
    },
    {
      id: '7',
      category: 'products',
      title: 'Construcción de Productos',
      description: 'MVP, deployment, scaling y optimización',
      videoCount: 40,
      duration: '90-105 min',
      level: 'Avanzado',
      topics: ['MVP', 'Deployment', 'Scaling'],
    },
    {
      id: '8',
      category: 'finance',
      title: 'Finanzas y Monetización',
      description: 'Pagos, suscripciones y economía de tokens',
      videoCount: 25,
      duration: '45-60 min',
      level: 'Intermedio',
      topics: ['Stripe', 'Mercado Pago', 'Token Economics'],
    },
  ];

  const filteredModules = allModules.filter(module => {
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          module.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 bg-white dark:bg-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Title className="mb-2 tracking-tight">todos los cursos</Title>
        <Body className="text-[#777777] dark:text-gray-400">
          Explora el catálogo completo de contenido disponible
        </Body>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchInput
          placeholder="Buscar por nombre, descripción o tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-3 pb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              size="md"
              rounded2xl
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
              <span className={`text-sm ${selectedCategory === category.id ? 'text-white opacity-80' : 'text-[#777777]'}`}>
                ({category.count})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-[#777777]">
          Mostrando <span className="font-bold text-[#4b4b4b]">{filteredModules.length}</span> módulos
          {searchQuery && <span> para "<span className="font-semibold">{searchQuery}</span>"</span>}
        </p>
      </div>

      {/* Modules Grid */}
      {filteredModules.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card
              key={module.id}
              variant="neutral"
              padding="none"
              interactive
              className="group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">
                    {categories.find(c => c.id === module.category)?.icon || '📚'}
                  </div>
                  <Tag variant={
                    module.level === 'Principiante' ? 'success' :
                    module.level === 'Intermedio' ? 'warning' : 'neutral'
                  } className="text-xs">
                    {module.level}
                  </Tag>
                </div>

                {/* Title & Description */}
                <Subtitle as="h3" className="mb-2 group-hover:text-[#1472FF] transition-colors">
                  {module.title}
                </Subtitle>
                <p className="text-sm text-[#777777] mb-4">
                  {module.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {module.topics.map((topic, index) => (
                    <Tag key={index} variant="primary" className="text-xs">
                      {topic}
                    </Tag>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-[#777777] mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{module.videoCount} videos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{module.duration}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button variant="primary" size="md" className="w-full">
                  Ver Módulo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <Title as="h3" className="mb-2">
            No se encontraron resultados
          </Title>
          <p className="text-[#777777] mb-6">
            Intenta con otros términos de búsqueda o categoría
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
