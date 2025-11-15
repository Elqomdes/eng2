import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import ProgressProvider from '@/components/ProgressProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'English Learning Platform - İngilizce Çalışma Sitesi',
  description: 'Profesyonel İngilizce öğrenme platformu - Okuma, Yazma, Dinleme ve Konuşma pratikleri',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ProgressProvider>
          <Navigation />
          <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {children}
          </main>
        </ProgressProvider>
      </body>
    </html>
  )
}

