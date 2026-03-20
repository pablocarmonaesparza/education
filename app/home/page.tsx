import Link from 'next/link';

export default function TikTokHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
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

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">TikTok Integration</h1>
          <p className="text-gray-600 mb-10">
            Itera lets educators publish educational content directly to TikTok.
            This demo showcases all integrated API scopes.
          </p>

          {/* 3 scope cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">user.info.basic</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">Login with TikTok</h3>
              <p className="text-xs text-gray-500">OAuth 2.0 authentication. Retrieves profile info.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-mono">video.upload</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">Upload as Draft</h3>
              <p className="text-xs text-gray-500">Sends video to inbox for review before posting.</p>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-mono">video.publish</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">Direct Publish</h3>
              <p className="text-xs text-gray-500">Posts video directly to TikTok profile.</p>
            </div>
          </div>

          <Link
            href="/api/tiktok/auth"
            className="inline-flex items-center gap-3 bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43v-7.17a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81.04z" />
            </svg>
            Continue with TikTok
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Scopes: user.info.basic, video.upload, video.publish
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
