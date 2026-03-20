'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserInfo {
  display_name?: string;
  avatar_url?: string;
  open_id?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo>({});

  useEffect(() => {
    // Read display_name from cookie (non-httpOnly)
    const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = decodeURIComponent(v || '');
      return acc;
    }, {});
    setUser({
      display_name: cookies['tt_display_name'] || 'TikTok User',
      avatar_url: cookies['tt_avatar_url'] || '',
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sandbox banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-1.5 text-center">
        <span className="text-amber-700 text-xs font-medium">
          SANDBOX MODE — TikTok Developer Sandbox Environment
        </span>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43v-7.17a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81.04z" />
        </svg>
        <span className="font-semibold text-sm text-gray-900">Itera × TikTok</span>
        <span className="ml-auto text-xs text-gray-400">itera.la</span>
        <a
          href="/api/tiktok/logout"
          className="text-xs text-gray-500 underline hover:text-gray-700"
        >
          Logout
        </a>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* User info card — demonstrates user.info.basic scope */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                {(user.display_name || 'T')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user.display_name || 'TikTok User'}</p>
              <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-mono">user.info.basic ✓</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Successfully authenticated via TikTok OAuth 2.0. User profile retrieved using the{' '}
            <code className="font-mono bg-gray-100 px-1 rounded">user.info.basic</code> scope.
          </p>
        </div>

        {/* Actions */}
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Content Publishing Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/home/upload?mode=draft"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-mono">video.upload</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">Upload as Draft</h3>
            <p className="text-xs text-gray-500">
              Sends video to TikTok inbox as draft for review before publishing.
            </p>
          </Link>

          <Link
            href="/home/upload?mode=publish"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-mono">video.publish</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">Direct Publish</h3>
            <p className="text-xs text-gray-500">
              Posts video directly to TikTok profile using Content Posting API.
            </p>
          </Link>
        </div>

        <div className="bg-gray-50 rounded-xl border border-dashed p-4 text-center">
          <p className="text-xs text-gray-400">
            All actions use sandbox environment — no real TikTok posts are made
          </p>
        </div>
      </div>

      <footer className="border-t bg-white py-3 text-center text-xs text-gray-400">
        Itera © 2026 —{' '}
        <a href="https://www.itera.la" className="underline">itera.la</a>
      </footer>
    </main>
  );
}
