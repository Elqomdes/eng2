'use client'

import { BookOpen, PenTool, Headphones, Mic, Home } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/reading', label: 'Okuma', icon: BookOpen },
    { href: '/writing', label: 'Yazma', icon: PenTool },
    { href: '/listening', label: 'Dinleme', icon: Headphones },
    { href: '/speaking', label: 'Konuşma', icon: Mic },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-white">English Learning</span>
            </div>
            <p className="text-gray-400 text-sm">
              Profesyonel İngilizce öğrenme platformu. Okuma, Yazma, Dinleme ve Konuşma becerilerinizi geliştirin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hakkında</h3>
            <p className="text-gray-400 text-sm mb-4">
              e-TEP değerlendirme kriterlerine göre hazırlanmış profesyonel İngilizce öğrenme platformu. 
              AI destekli değerlendirme sistemi ile yazma ve konuşma becerilerinizi geliştirin.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} English Learning Platform. Tüm hakları saklıdır.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Powered by Next.js & OpenAI
          </p>
        </div>
      </div>
    </footer>
  )
}

