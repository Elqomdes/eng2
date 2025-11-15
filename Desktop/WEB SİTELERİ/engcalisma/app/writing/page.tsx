'use client'

import { useState, useRef, useEffect } from 'react'
import { PenTool, Save, CheckCircle, Lightbulb, Clock, Sparkles, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'
import { evaluateWriting, type WritingEvaluation } from '@/lib/ai-evaluation'

interface WritingPrompt {
  id: number
  title: string
  level: string
  prompt: string
  tips: string[]
  wordCount: number
}

const writingPrompts: WritingPrompt[] = [
  {
    id: 1,
    title: 'My Daily Routine',
    level: 'Beginner',
    prompt: 'Write about your daily routine. Describe what you do from morning to evening. Include activities like waking up, eating meals, going to work or school, and your hobbies.',
    tips: [
      'Use present simple tense (I wake up, I eat breakfast)',
      'Use time expressions (in the morning, at noon, in the evening)',
      'Write at least 100 words',
      'Check your spelling and grammar'
    ],
    wordCount: 100
  },
  {
    id: 2,
    title: 'A Memorable Vacation',
    level: 'Intermediate',
    prompt: 'Describe a vacation or trip that was memorable for you. Explain where you went, what you did, who you were with, and why it was special. Include details about the place, activities, and your feelings.',
    tips: [
      'Use past tense (I went, I saw, I felt)',
      'Use descriptive adjectives (beautiful, amazing, exciting)',
      'Write at least 200 words',
      'Organize your writing with paragraphs'
    ],
    wordCount: 200
  },
  {
    id: 3,
    title: 'The Impact of Technology',
    level: 'Advanced',
    prompt: 'Discuss how technology has changed our lives. Consider both positive and negative aspects. Include examples from communication, work, education, and daily life. What do you think the future holds?',
    tips: [
      'Use a variety of sentence structures',
      'Include examples and evidence',
      'Write at least 300 words',
      'Use linking words (however, furthermore, therefore)',
      'Express your opinion clearly'
    ],
    wordCount: 300
  }
]

export default function WritingPage() {
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [writing, setWriting] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const startTimeRef = useRef(Date.now())
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const { updateProgress, addTime, completeActivity } = useProgress()

  const prompt = writingPrompts[currentPrompt]

  // Reset start time when prompt changes
  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [currentPrompt])

  if (!prompt) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  const handleWritingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setWriting(text)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setSaved(false)
  }

  const handleSave = () => {
    if (wordCount >= prompt.wordCount) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 60000)
      updateProgress('writing', Math.min(100, (wordCount / prompt.wordCount) * 50 + 25))
      addTime(timeSpent)
      completeActivity()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleEvaluate = async () => {
    if (wordCount < prompt.wordCount) {
      alert(`Lütfen en az ${prompt.wordCount} kelime yazın.`)
      return
    }

    setEvaluating(true)
    setShowEvaluation(false)
    
    try {
      const result = await evaluateWriting(writing, prompt.prompt, prompt.level)
      setEvaluation(result)
      setShowEvaluation(true)
      
      // İlerlemeyi güncelle
      updateProgress('writing', Math.min(100, result.score))
      addTime(Math.round((Date.now() - startTimeRef.current) / 60000))
      completeActivity()
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme sırasında bir hata oluştu.'
      alert(`Hata: ${errorMessage}\n\nLütfen tekrar deneyin veya API anahtarınızı kontrol edin.`)
    } finally {
      setEvaluating(false)
    }
  }

  const handleNext = () => {
    if (currentPrompt < writingPrompts.length - 1) {
      setCurrentPrompt(currentPrompt + 1)
      setWriting('')
      setWordCount(0)
      setSaved(false)
      startTimeRef.current = Date.now()
    }
  }

  const handlePrevious = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(currentPrompt - 1)
      setWriting('')
      setWordCount(0)
      setSaved(false)
      startTimeRef.current = Date.now()
    }
  }

  const progress = Math.min(100, (wordCount / prompt.wordCount) * 100)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yazma Pratikleri</h1>
            <p className="text-gray-600">Yazma becerilerinizi geliştirin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{prompt.title}</h2>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {prompt.level}
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{prompt.prompt}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">İpuçları</h3>
              </div>
              <ul className="space-y-2">
                {prompt.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Kelime Sayısı</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {wordCount} / {prompt.wordCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={handlePrevious}
                disabled={currentPrompt === 0}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Önceki
              </button>
              <button
                onClick={handleNext}
                disabled={currentPrompt === writingPrompts.length - 1}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>

        {/* Writing Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yazınız</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={wordCount < prompt.wordCount || saved}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Kaydedildi</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={wordCount < prompt.wordCount || evaluating}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Değerlendiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>AI ile Değerlendir</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={writing}
              onChange={handleWritingChange}
              placeholder="Yazmaya başlayın..."
              className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-gray-900 leading-relaxed"
            />

            {wordCount >= prompt.wordCount && !saved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-green-50 border-2 border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Hedef kelime sayısına ulaştınız! Yazınızı kaydedebilir veya AI ile değerlendirebilirsiniz.</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* AI Evaluation Results */}
          <AnimatePresence>
            {showEvaluation && evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Değerlendirme Sonuçları</h3>
                      <div className="text-3xl font-bold text-purple-600 mt-1">{evaluation.score}/100</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEvaluation(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Grammar */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📝 Dilbilgisi</h4>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.grammar.assessment}</p>
                    {evaluation.grammar.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-600 mb-1">Hatalar:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {evaluation.grammar.errors.map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Vocabulary */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📚 Kelime Bilgisi</h4>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.vocabulary.assessment}</p>
                    {evaluation.vocabulary.strengths.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-600 mb-1">Güçlü Yönler:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {evaluation.vocabulary.strengths.map((strength, i) => (
                            <li key={i}>✓ {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Structure */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📐 Yapı ve Organizasyon</h4>
                    <p className="text-sm text-gray-700">{evaluation.structure.assessment}</p>
                  </div>

                  {/* Overall Feedback */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💬 Genel Geri Bildirim</h4>
                    <p className="text-sm text-gray-700 mb-3">{evaluation.feedback}</p>
                    
                    {evaluation.overall.strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-green-700 mb-1">Güçlü Yönler:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.strengths.map((strength, i) => (
                            <li key={i}>✓ {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.overall.improvements.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-orange-700 mb-1">Geliştirilmesi Gerekenler:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.improvements.map((improvement, i) => (
                            <li key={i}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.overall.nextSteps.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Sonraki Adımlar:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.nextSteps.map((step, i) => (
                            <li key={i}>→ {step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

