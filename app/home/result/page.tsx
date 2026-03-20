'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResultContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'draft';
  const publishId = searchParams.get('publish_id') || '';
  const title = searchParams.get('title') || 'Itera Educational Content';
  const isDraft = mode === 'draft';

  return (
    <div className="max-w-lg mx-auto w-full px-4 py-10 text-center">
      <div className="bg-white rounded-xl border shadow-sm p-8 mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {isDraft ? 'Video Sent to Inbox' : 'Video Published!'}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          {isDraft
            ? 'Your video draft has been sent to the TikTok inbox using the video.upload scope.'
            : 'Your video has been published to TikTok using the video.publish scope.'}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Scope used</span>
            <span
              className={`font-mono px-2 py-0.5 rounded ${
                isDraft ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {isDraft ? 'video.upload' : 'video.publish'}
            </span>
          </div>
          {publishId && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Publish ID</span>
              <span className="font-mono text-gray-700 break-all text-right max-w-[60%]">{publishId}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Title</span>
            <span className="text-gray-700 text-right max-w-[60%]">{title}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Environment</span>
            <span className="text-amber-600">Sandbox</span>
          </div>
        </div>

        {publishId && (
          <Link
            href={`/home/status?publish_id=${encodeURIComponent(publishId)}`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline mb-4"
          >
            Check publish status →
          </Link>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          href="/home/dashboard"
          className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </Link>
        <Link
          href={`/home/upload?mode=${mode}`}
          className="px-5 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Upload Another
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
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
          <ResultContent />
        </Suspense>
      </div>

      <footer className="border-t bg-white py-3 text-center text-xs text-gray-400">
        Itera © 2026 —{' '}
        <a href="https://www.itera.la" className="underline">itera.la</a>
      </footer>
    </main>
  );
}
