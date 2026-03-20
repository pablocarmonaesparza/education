'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function UploadForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get('mode') === 'publish' ? 'publish' : 'draft';
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('Itera Educational Content');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDraft = mode === 'draft';
  const scopeLabel = isDraft ? 'video.upload' : 'video.publish';
  const scopeColor = isDraft ? 'purple' : 'green';
  const endpoint = isDraft ? '/api/tiktok/upload/draft' : '/api/tiktok/upload/publish';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl, title }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'API error');
        setLoading(false);
        return;
      }
      const publishId = data.data?.publish_id || '';
      router.push(`/home/result?mode=${mode}&publish_id=${encodeURIComponent(publishId)}&title=${encodeURIComponent(title)}`);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-10">
      <div className="mb-6">
        <Link href="/home/dashboard" className="text-xs text-gray-400 hover:text-gray-600 underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span
          className={`px-2 py-0.5 rounded text-xs font-mono ${
            isDraft ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {scopeLabel}
        </span>
        <h1 className="text-xl font-bold text-gray-900">
          {isDraft ? 'Upload as Draft' : 'Direct Publish'}
        </h1>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Publicly accessible .mp4 URL (min 3s, max 10min)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title / Caption
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Itera Educational Content"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-colors ${
              isDraft
                ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
            }`}
          >
            {loading ? 'Processing…' : isDraft ? 'Send to Inbox as Draft' : 'Publish to TikTok'}
          </button>
        </form>
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Sandbox mode — no real TikTok content will be posted
      </p>
    </div>
  );
}

export default function UploadPage() {
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
      </nav>

      <div className="flex-1">
        <Suspense fallback={<div className="p-10 text-center text-gray-400 text-sm">Loading…</div>}>
          <UploadForm />
        </Suspense>
      </div>

      <footer className="border-t bg-white py-3 text-center text-xs text-gray-400">
        Itera © 2026 —{' '}
        <a href="https://www.itera.la" className="underline">itera.la</a>
      </footer>
    </main>
  );
}
