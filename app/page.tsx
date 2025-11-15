'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, PenTool, Headphones, Mic, TrendingUp, Award, Clock, Target, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'

export default function Home() {
  const router = useRouter()
  const { progress } = useProgress()

  const skills = [
    {
      id: 'reading',
      title: 'Okuma',
      description: 'AI ile oluşturulmuş akademik metinleri okuyun, anlayın ve kelime dağarcığınızı geliştirin',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      href: '/reading',
    },
    {
      id: 'writing',
      title: 'Yazma',
      description: 'Yazma becerilerinizi geliştirin ve AI destekli geri bildirimlerle kompozisyonlar yazın',
      icon: PenTool,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      href: '/writing',
    },
    {
      id: 'listening',
      title: 'Dinleme',
      description: 'AI seslendirmeli dinleme pratikleri yapın ve anlama becerinizi artırın',
      icon: Headphones,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      href: '/listening',
    },
    {
      id: 'speaking',
      title: 'Konuşma',
      description: 'Telaffuz pratikleri yapın ve AI ile konuşma akıcılığınızı geliştirin',
      icon: Mic,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      href: '/speaking',
    },
  ]

  const stats = [
    { 
      icon: Target, 
      label: 'Tamamlanan', 
      value: progress.totalCompleted, 
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    { 
      icon: Clock, 
      label: 'Çalışma Süresi', 
      value: `${progress.totalTime} dk`, 
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    { 
      icon: TrendingUp, 
      label: 'İlerleme', 
      value: `${progress.overallProgress}%`, 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    { 
      icon: Award, 
      label: 'Başarılar', 
      value: progress.achievements, 
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          İngilizce Öğrenme Platformu
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Okuma, Yazma, Dinleme ve Konuşma becerilerinizi AI destekli profesyonel bir şekilde geliştirin
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            AI Destekli
          </span>
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Kişiselleştirilmiş
          </span>
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            İnteraktif
          </span>
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {skills.map((skill, index) => {
          const Icon = skill.icon
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => router.push(skill.href)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 group relative"
            >
              <div className={`h-1 bg-gradient-to-r ${skill.color}`} />
              <div className={`p-8 bg-gradient-to-br ${skill.bgColor} bg-opacity-0 group-hover:bg-opacity-100 transition-all duration-300`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${skill.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300`}>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                  {skill.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {skill.description}
                </p>
                <div className={`flex items-center text-sm font-semibold bg-gradient-to-r ${skill.color} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
                  <span>Çalışmaya Başla</span>
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
        className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Genel İlerleme</h2>
            <p className="text-gray-600">Becerilerinizdeki gelişiminizi takip edin</p>
          </div>
          <div className="hidden md:flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(progress.skills).map(([skill, value], index) => {
            const skillInfo = skills.find(s => s.id === skill)
            const skillColor = skillInfo?.color || 'from-gray-500 to-gray-600'
            const skillBgColor = skillInfo?.bgColor || 'from-gray-50 to-gray-100'
            const SkillIcon = skillInfo?.icon || BookOpen
            
            return (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${skillColor} flex items-center justify-center shadow-md`}>
                      <SkillIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base font-semibold text-gray-900 capitalize">
                      {skill === 'reading' ? 'Okuma' : skill === 'writing' ? 'Yazma' : skill === 'listening' ? 'Dinleme' : 'Konuşma'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-700">{value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                    className={`h-3 rounded-full bg-gradient-to-r ${skillColor} shadow-sm`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

