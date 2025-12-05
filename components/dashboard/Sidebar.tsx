'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();

  const navItems = [
    {
      name: 'Inicio',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Mi Ruta',
      href: '/dashboard/my-path',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      name: 'Favoritos',
      href: '/dashboard/favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: 'Tutor',
      href: '/dashboard/tutor',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-50"
        aria-label={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
      >
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg transition-colors ${
                    isExpanded ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!isExpanded ? item.name : undefined}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {isExpanded && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Danos tu opinión */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="#"
          className={`flex items-center rounded-lg transition-colors ${
            isExpanded ? 'gap-3 px-4 py-3' : 'justify-center px-3 py-3'
          } text-gray-700 hover:bg-gray-100`}
          title={!isExpanded ? 'Danos tu opinión' : undefined}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </span>
          {isExpanded && <span className="font-medium whitespace-nowrap">Danos tu opinión</span>}
        </Link>
      </div>
    </aside>
  );
}
