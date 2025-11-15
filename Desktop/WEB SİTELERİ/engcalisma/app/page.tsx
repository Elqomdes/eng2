'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, PenTool, Headphones, Mic, TrendingUp, Award, Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'

export default function Home() {
  const router = useRouter()
  const { progress } = useProgress()

  const skills = [
    {
      id: 'reading',
      title: 'Okuma',
      description: 'Metinleri okuyun, anlayın ve kelime dağarcığınızı geliştirin',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      href: '/reading',
    },
    {
      id: 'writing',
      title: 'Yazma',
      description: 'Yazma becerilerinizi geliştirin ve kompozisyonlar yazın',
      icon: PenTool,
      color: 'from-purple-500 to-pink-500',
      href: '/writing',
    },
    {
      id: 'listening',
      title: 'Dinleme',
      description: 'İngilizce dinleme pratikleri yapın ve anlama becerinizi artırın',
      icon: Headphones,
      color: 'from-green-500 to-emerald-500',
      href: '/listening',
    },
    {
      id: 'speaking',
      title: 'Konuşma',
      description: 'Telaffuz pratikleri yapın ve konuşma akıcılığınızı geliştirin',
      icon: Mic,
      color: 'from-orange-500 to-red-500',
      href: '/speaking',
    },
  ]

  const stats = [
    { icon: Target, label: 'Tamamlanan', value: progress.totalCompleted, color: 'text-blue-600' },
    { icon: Clock, label: 'Çalışma Süresi', value: `${progress.totalTime} dk`, color: 'text-green-600' },
    { icon: TrendingUp, label: 'İlerleme', value: `${progress.overallProgress}%`, color: 'text-purple-600' },
    { icon: Award, label: 'Başarılar', value: progress.achievements, color: 'text-orange-600' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          İngilizce Öğrenme Platformu
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Okuma, Yazma, Dinleme ve Konuşma becerilerinizi profesyonel bir şekilde geliştirin
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {skills.map((skill, index) => {
          const Icon = skill.icon
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => router.push(skill.href)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 group"
            >
              <div className={`h-2 bg-gradient-to-r ${skill.color}`} />
              <div className="p-8">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{skill.title}</h2>
                <p className="text-gray-600 mb-4">{skill.description}</p>
                <div className="flex items-center text-primary-600 font-semibold group-hover:text-primary-700">
                  Çalışmaya Başla
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Genel İlerleme</h2>
        <div className="space-y-4">
          {Object.entries(progress.skills).map(([skill, value]) => (
            <div key={skill}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">{skill}</span>
                <span className="text-sm font-medium text-gray-700">{value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-3 rounded-full bg-gradient-to-r ${
                    skill === 'reading' ? 'from-blue-500 to-cyan-500' :
                    skill === 'writing' ? 'from-purple-500 to-pink-500' :
                    skill === 'listening' ? 'from-green-500 to-emerald-500' :
                    'from-orange-500 to-red-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

