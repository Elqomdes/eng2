import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ProgressProvider from '@/components/ProgressProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'English Learning Platform - İngilizce Çalışma Sitesi',
  description: 'Profesyonel İngilizce öğrenme platformu - Okuma, Yazma, Dinleme ve Konuşma pratikleri',
  keywords: ['İngilizce öğrenme', 'English learning', 'İngilizce pratik', 'Okuma', 'Yazma', 'Dinleme', 'Konuşma', 'English practice'],
  authors: [{ name: 'English Learning Platform' }],
  creator: 'English Learning Platform',
  publisher: 'English Learning Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  ...(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? {
        metadataBase: process.env.NEXT_PUBLIC_SITE_URL
          ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
          : new URL(`https://${process.env.VERCEL_URL}`),
      }
    : {}),
  openGraph: {
    title: 'English Learning Platform - İngilizce Çalışma Sitesi',
    description: 'Profesyonel İngilizce öğrenme platformu - Okuma, Yazma, Dinleme ve Konuşma pratikleri',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English Learning Platform - İngilizce Çalışma Sitesi',
    description: 'Profesyonel İngilizce öğrenme platformu - Okuma, Yazma, Dinleme ve Konuşma pratikleri',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow bg-gradient-to-br from-blue-50 via-white to-indigo-50">
              {children}
            </main>
            <Footer />
          </div>
        </ProgressProvider>
      </body>
    </html>
  )
}

