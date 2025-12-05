import VideoPlayer from '@/components/dashboard/VideoPlayer';
import Link from 'next/link';

export default function CoursePage({ params }: { params: { id: string } }) {
  // Datos de ejemplo - reemplazar con datos reales más adelante
  const videos = [
    {
      id: '1',
      title: 'Introducción a la Inteligencia Artificial',
      duration: '3:24',
      completed: false,
    },
    {
      id: '2',
      title: 'Tipos de IA: Narrow vs General',
      duration: '2:15',
      completed: false,
    },
    {
      id: '3',
      title: 'Modelos de Lenguaje Grandes (LLMs)',
      duration: '4:10',
      completed: false,
    },
    {
      id: '4',
      title: 'Casos de Uso Prácticos',
      duration: '3:45',
      completed: false,
    },
  ];

  const currentVideo = videos[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link href="/dashboard" className="hover:text-[#1472FF]">
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-semibold">Fundamentos de IA</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <VideoPlayer
              videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              title={currentVideo.title}
              onProgress={(time) => console.log('Progress:', time)}
              onComplete={() => console.log('Video completed!')}
            />

            {/* Video Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {currentVideo.title}
              </h1>
              <p className="text-gray-600 mb-4">
                En esta lección aprenderás los conceptos básicos de la inteligencia artificial,
                cómo funciona y por qué es importante para el futuro de la tecnología.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#0E5FCC] hover:to-[#1472FF] transition-all">
                  Marcar como Completado
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                  Siguiente Video
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recursos Adicionales</h2>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-[#1472FF] hover:text-[#0E5FCC]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Transcripción del video
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-[#1472FF] hover:text-[#0E5FCC]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Slides de presentación
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-[#1472FF] hover:text-[#0E5FCC]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Enlaces útiles
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-[#1472FF] to-[#0E5FCC] p-4">
                <h2 className="text-white font-bold text-lg">Contenido del Módulo</h2>
                <p className="text-[#1472FF]/80 text-sm">{videos.length} videos</p>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      video.id === currentVideo.id ? 'bg-[#1472FF]/10 border-l-4 border-l-[#1472FF]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {video.completed ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm mb-1 ${
                          video.id === currentVideo.id ? 'text-[#1472FF]' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500">{video.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
