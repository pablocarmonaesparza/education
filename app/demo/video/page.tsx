import DemoVideoPlayerWrapper from './DemoVideoPlayerWrapper';
import Link from 'next/link';

export const metadata = {
  title: 'Demo Video Player | IA & Automatización',
  description: 'Vista previa del reproductor de video del curso',
};

export default function DemoVideoPage() {
  const demoVideos = [
    {
      id: '1',
      title: 'Introducción al Curso de IA',
      description: 'Bienvenida y visión general del curso',
      duration: '3:45',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: '2',
      title: '¿Qué es la Inteligencia Artificial?',
      description: 'Conceptos fundamentales de IA explicados de forma simple',
      duration: '2:30',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      id: '3',
      title: 'Tipos de Modelos de IA',
      description: 'GPT, Claude, Gemini y más - ¿cuál usar?',
      duration: '4:15',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    {
      id: '4',
      title: 'Tu Primer Prompt',
      description: 'Aprende a comunicarte efectivamente con la IA',
      duration: '3:00',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  ];

  const currentVideo = demoVideos[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white py-3 px-4 text-center">
        <p className="text-sm">
          📺 <strong>DEMO DE VIDEO</strong> - Esta es una vista previa del reproductor. {' '}
          <Link href="/auth/signup" className="underline font-semibold">
            Crea tu cuenta
          </Link>{' '}
          para acceder a los 366 videos del curso completo.
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* Back button */}
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1472FF] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard Demo
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden shadow-xl mb-6">
              <DemoVideoPlayerWrapper
                videoUrl={currentVideo.videoUrl}
                title={currentVideo.title}
              />
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentVideo.title}
                  </h1>
                  <p className="text-gray-600">
                    {currentVideo.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap ml-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentVideo.duration}</span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tu progreso en este video</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Module info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Módulo 1: Fundamentos de IA
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Video 1 de 25
                  </span>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recursos del Video</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Guía PDF: Conceptos de IA</p>
                      <p className="text-sm text-gray-500">1.2 MB</p>
                    </div>
                  </div>
                  <button className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold text-sm">
                    Descargar
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#1472FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Ejemplos de Código</p>
                      <p className="text-sm text-gray-500">GitHub Repository</p>
                    </div>
                  </div>
                  <button className="text-[#1472FF] hover:text-[#0E5FCC] font-semibold text-sm">
                    Ver
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white p-4">
                <h2 className="font-bold text-lg">Lista de Videos</h2>
                <p className="text-sm opacity-90">Módulo 1: Fundamentos de IA</p>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {demoVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      index === 0
                        ? 'bg-[#1472FF]/10 border-l-4 border-[#1472FF]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          index === 0
                            ? 'bg-[#1472FF] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index === 0 ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm mb-1 ${
                          index === 0 ? 'text-[#1472FF]' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {video.duration}
                          </span>
                          {index === 0 && (
                            <span className="text-xs text-[#1472FF] font-semibold">
                              Reproduciendo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* More videos placeholder */}
                <div className="p-4 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    + 21 videos más en este módulo
                  </p>
                  <Link
                    href="/auth/signup"
                    className="text-sm text-[#1472FF] font-semibold hover:text-[#0E5FCC]"
                  >
                    Crear cuenta para ver todos
                  </Link>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-6 space-y-3">
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 px-4 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                ← Video Anterior
              </button>
              <button className="w-full bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white px-4 py-3 rounded-lg font-semibold hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all">
                Siguiente Video →
              </button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 border border-[#1472FF]/20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Te gusta lo que ves?
          </h3>
          <p className="text-gray-600 mb-6">
            Accede a los 366 videos del curso completo y empieza tu viaje en IA hoy
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Volver al Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
