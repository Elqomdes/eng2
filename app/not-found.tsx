import Link from 'next/link'
import { Home, BookOpen, PenTool, Headphones, Mic } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h2>
        <p className="text-lg text-gray-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <Link
            href="/reading"
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Okuma</span>
          </Link>
          <Link
            href="/writing"
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <PenTool className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Yazma</span>
          </Link>
          <Link
            href="/listening"
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <Headphones className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Dinleme</span>
          </Link>
          <Link
            href="/speaking"
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <Mic className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Konuşma</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

