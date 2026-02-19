'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Headline, Body, Caption } from '@/components/ui/Typography';
import { SearchInput } from '@/components/ui/Input';
import SectionHeader from '@/components/ui/SectionHeader';
import EmptyState from '@/components/ui/EmptyState';
import HorizontalScroll from '@/components/shared/HorizontalScroll';

interface Product {
  id: string;
  name: string;
  author: string;
  authorInitials: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl: string | null;
  thumbnail: string | null;
  likes: number;
  createdAt: string;
}

// Mock data — will be replaced with real data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'MediBot',
    author: 'María García',
    authorInitials: 'MG',
    description: 'Chatbot de meditación guiada que personaliza sesiones usando IA según tu estado de ánimo y objetivos.',
    category: 'Salud & Bienestar',
    tags: ['Chatbot', 'IA', 'Bienestar'],
    demoUrl: 'https://medibot.demo',
    thumbnail: null,
    likes: 24,
    createdAt: '2025-02-10',
  },
  {
    id: '2',
    name: 'RestoFlow',
    author: 'Carlos López',
    authorInitials: 'CL',
    description: 'Sistema de automatización para restaurantes: pedidos, inventario y atención al cliente con IA.',
    category: 'Productividad',
    tags: ['Automatización', 'n8n', 'Restaurantes'],
    demoUrl: 'https://restoflow.demo',
    thumbnail: null,
    likes: 18,
    createdAt: '2025-02-08',
  },
  {
    id: '3',
    name: 'ShopAssist',
    author: 'Ana Rodríguez',
    authorInitials: 'AR',
    description: 'Asistente de compras inteligente para e-commerce que responde preguntas sobre productos 24/7.',
    category: 'E-commerce',
    tags: ['ChatGPT', 'E-commerce', 'Atención al cliente'],
    demoUrl: null,
    thumbnail: null,
    likes: 31,
    createdAt: '2025-02-05',
  },
  {
    id: '4',
    name: 'SalesPredict',
    author: 'Diego Martínez',
    authorInitials: 'DM',
    description: 'Dashboard predictivo que analiza datos de ventas y genera pronósticos con machine learning.',
    category: 'Analytics',
    tags: ['ML', 'Dashboard', 'Ventas'],
    demoUrl: 'https://salespredict.demo',
    thumbnail: null,
    likes: 15,
    createdAt: '2025-02-01',
  },
  {
    id: '5',
    name: 'ContentGen',
    author: 'Sofía Hernández',
    authorInitials: 'SH',
    description: 'Herramienta que genera automáticamente posts, stories y captions optimizados para cada red social.',
    category: 'Marketing',
    tags: ['IA Generativa', 'Social Media', 'Copywriting'],
    demoUrl: 'https://contentgen.demo',
    thumbnail: null,
    likes: 42,
    createdAt: '2025-01-28',
  },
  {
    id: '6',
    name: 'FacturAI',
    author: 'Roberto Torres',
    authorInitials: 'RT',
    description: 'Sistema de facturación inteligente que categoriza gastos, detecta errores y sugiere deducciones.',
    category: 'Finanzas',
    tags: ['Fintech', 'IA', 'Facturación'],
    demoUrl: null,
    thumbnail: null,
    likes: 9,
    createdAt: '2025-01-25',
  },
];

const categories = ['Todos', 'Salud & Bienestar', 'Productividad', 'E-commerce', 'Analytics', 'Marketing', 'Finanzas'];

const avatarColors = [
  'bg-[#1472FF]',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
];

export default function PitchPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [products] = useState<Product[]>(mockProducts);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-800 p-4 sm:p-6 lg:p-8 font-sans text-[#4b4b4b] dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHeader
          title="pitch"
          subtitle="Descubre y prueba los productos de la comunidad"
        />

        {/* Search */}
        <div className="max-w-md">
          <SearchInput
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <HorizontalScroll fadeEdges>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </HorizontalScroll>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            }
            title="No se encontraron productos"
            description="Intenta con otra búsqueda o categoría."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product, index) => (
              <CardFlat key={product.id} className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {/* Thumbnail area */}
                <div className="h-40 bg-gray-100 dark:bg-gray-900 rounded-t-2xl flex items-center justify-center">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-xl mx-auto mb-2`}>
                        {product.name.charAt(0)}
                      </div>
                      <Caption>{product.category}</Caption>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Author + Product name */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-7 h-7 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {product.authorInitials}
                    </div>
                    <Caption className="truncate">{product.author}</Caption>
                  </div>

                  <p className="font-bold text-lg text-[#4b4b4b] dark:text-white mb-1">
                    {product.name}
                  </p>

                  <Body className="text-[#777777] dark:text-gray-400 line-clamp-2 text-sm mb-3 flex-1">
                    {product.description}
                  </Body>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.tags.map((tag) => (
                      <Tag key={tag} variant="outline" className="!text-xs !px-2 !py-0.5">
                        {tag}
                      </Tag>
                    ))}
                  </div>

                  {/* Footer: Likes + CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-[#777777] dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <Caption>{product.likes}</Caption>
                    </div>
                    {product.demoUrl ? (
                      <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" size="sm">
                          Probar
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Próximamente
                      </Button>
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
