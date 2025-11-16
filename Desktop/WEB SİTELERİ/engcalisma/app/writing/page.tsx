'use client'

import { useState, useRef, useEffect } from 'react'
import { PenTool, Save, CheckCircle, Lightbulb, Clock, Sparkles, Loader2, X, RefreshCw, BarChart3, MessageSquare, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'
import { evaluateWriting, type WritingEvaluation } from '@/lib/ai-evaluation'

interface GraphData {
  title: string
  type: 'line' | 'bar' | 'pie'
  xAxis: string
  yAxis: string
  dataPoints: Array<{ label: string; value: number; unit: string }>
  description: string
}

interface PodcastData {
  title: string
  transcript: string
  mainPoints: string[]
}

interface PostData {
  author: string
  platform: string
  content: string
  timestamp: string
}

interface CommentData {
  author: string
  content: string
}

interface WritingTask {
  id: number
  taskType: 'task1' | 'task2'
  title: string
  level: string
  graph?: GraphData
  podcast?: PodcastData
  post?: PostData
  comment?: CommentData
  prompt: string
  tips: string[]
  wordCount: number
}

export default function WritingPage() {
  const [currentTask, setCurrentTask] = useState<WritingTask | null>(null)
  const [writing, setWriting] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const startTimeRef = useRef(Date.now())
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('B2-C1')
  const [taskType, setTaskType] = useState<string>('random')
  const { updateProgress, addTime, completeActivity } = useProgress()

  // Generate new task on component mount
  useEffect(() => {
    generateNewTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateNewTask = async (selectedLevel?: string, selectedTaskType?: string) => {
    setIsGenerating(true)
    setError(null)
    setIsLoading(true)
    setWriting('')
    setWordCount(0)
    setShowEvaluation(false)
    setEvaluation(null)
    setSaved(false)

    try {
      const response = await fetch('/api/writing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: selectedLevel || level,
          taskType: selectedTaskType || taskType === 'random' ? undefined : selectedTaskType || taskType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate writing task')
      }

      const data = await response.json()
      setCurrentTask(data)
      setLevel(data.level || level)
      setTaskType(data.taskType || taskType)
    } catch (err: any) {
      console.error('Error generating task:', err)
      setError(err.message || 'Yeni yazma görevi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  // Reset start time when task changes
  useEffect(() => {
    if (currentTask) {
      startTimeRef.current = Date.now()
    }
  }, [currentTask])

  if (isLoading && !currentTask) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Yazma görevi oluşturuluyor...</p>
          <p className="text-gray-500 text-sm mt-2">AI ile e-TEP formatında içerik hazırlanıyor</p>
        </div>
      </div>
    )
  }

  if (error && !currentTask) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Hata Oluştu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => generateNewTask()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!currentTask) {
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
    if (currentTask && wordCount >= currentTask.wordCount) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 60000)
      updateProgress('writing', Math.min(100, (wordCount / currentTask.wordCount) * 50 + 25))
      addTime(timeSpent)
      completeActivity()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleEvaluate = async () => {
    if (!currentTask) return
    
    if (wordCount < currentTask.wordCount) {
      alert(`Lütfen en az ${currentTask.wordCount} kelime yazın.`)
      return
    }

    setEvaluating(true)
    setShowEvaluation(false)
    
    try {
      const result = await evaluateWriting(writing, currentTask.prompt, currentTask.level)
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

  const progress = currentTask ? Math.min(100, (wordCount / currentTask.wordCount) * 100) : 0

  // Graph rendering component
  const renderGraph = (graph: GraphData) => {
    const maxValue = Math.max(...graph.dataPoints.map(d => d.value))
    const minValue = Math.min(...graph.dataPoints.map(d => d.value))
    const range = maxValue - minValue || 1
    const width = 600
    const height = 300
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    if (graph.type === 'line' || graph.type === 'bar') {
      const points = graph.dataPoints.map((point, index) => {
        const x = padding + (index / (graph.dataPoints.length - 1)) * chartWidth
        const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight
        return { x, y, ...point }
      })

      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{graph.title}</h4>
          <p className="text-sm text-gray-600 mb-4">{graph.description}</p>
          <svg width={width} height={height} className="w-full max-w-full">
            {/* Axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
            
            {/* Y-axis label */}
            <text x={padding - 10} y={padding - 10} textAnchor="end" fill="#4b5563" fontSize="12">
              {graph.yAxis}
            </text>
            
            {/* X-axis label */}
            <text x={width / 2} y={height - 10} textAnchor="middle" fill="#4b5563" fontSize="12">
              {graph.xAxis}
            </text>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding + chartHeight - ratio * chartHeight
              const value = minValue + ratio * range
              return (
                <g key={ratio}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="11">
                    {Math.round(value)}{graph.dataPoints[0]?.unit || ''}
                  </text>
                </g>
              )
            })}

            {/* Data points and lines/bars */}
            {points.map((point, index) => {
              if (graph.type === 'line') {
                return (
                  <g key={index}>
                    {index > 0 && (
                      <line
                        x1={points[index - 1].x}
                        y1={points[index - 1].y}
                        x2={point.x}
                        y2={point.y}
                        stroke="#8b5cf6"
                        strokeWidth="3"
                      />
                    )}
                    <circle cx={point.x} cy={point.y} r="6" fill="#8b5cf6" />
                    <text x={point.x} y={height - padding + 20} textAnchor="middle" fill="#374151" fontSize="11">
                      {point.label}
                    </text>
                    <text x={point.x} y={point.y - 10} textAnchor="middle" fill="#6b21a8" fontSize="11" fontWeight="600">
                      {point.value}{point.unit}
                    </text>
                  </g>
                )
              } else {
                const barWidth = chartWidth / graph.dataPoints.length - 10
                const barHeight = chartHeight - (point.y - padding)
                return (
                  <g key={index}>
                    <rect
                      x={point.x - barWidth / 2}
                      y={point.y}
                      width={barWidth}
                      height={barHeight}
                      fill="#8b5cf6"
                      rx="4"
                    />
                    <text x={point.x} y={height - padding + 20} textAnchor="middle" fill="#374151" fontSize="11">
                      {point.label}
                    </text>
                    <text x={point.x} y={point.y - 5} textAnchor="middle" fill="#6b21a8" fontSize="11" fontWeight="600">
                      {point.value}{point.unit}
                    </text>
                  </g>
                )
              }
            })}
          </svg>
        </div>
      )
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yazma Pratikleri</h1>
              <p className="text-gray-600">e-TEP formatında yazma becerilerinizi geliştirin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="B1/B2">B1/B2</option>
              <option value="B2">B2</option>
              <option value="B2-C1">B2-C1</option>
              <option value="C1">C1</option>
            </select>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="random">Rastgele</option>
              <option value="task1">Task 1 (Social Media)</option>
              <option value="task2">Task 2 (Graph + Podcast)</option>
            </select>
            <button
              onClick={() => generateNewTask(level, taskType)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Yeni Görev</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTask.title}</h2>
              <div className="flex items-center gap-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {currentTask.level}
                </span>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentTask.taskType === 'task1' ? (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Task 1: Social Media Response
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Task 2: Integrated Writing
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">AI ile oluşturuldu</span>
              </div>
            </div>
          </div>

          {/* Task 1: Social Media Post */}
          {currentTask.taskType === 'task1' && currentTask.post && currentTask.comment && (
            <div className="mb-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentTask.post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{currentTask.post.author}</div>
                    <div className="text-xs text-gray-500">{currentTask.post.platform} • {currentTask.post.timestamp}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{currentTask.post.content}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 ml-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {currentTask.comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{currentTask.comment.author}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{currentTask.comment.content}</p>
              </div>
            </div>
          )}

          {/* Task 2: Graph and Podcast */}
          {currentTask.taskType === 'task2' && currentTask.graph && currentTask.podcast && (
            <div className="mb-6 space-y-6">
              {renderGraph(currentTask.graph)}
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{currentTask.podcast.title}</h3>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentTask.podcast.transcript}</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Ana Noktalar:</h4>
                  <ul className="space-y-1">
                    {currentTask.podcast.mainPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Görev:</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentTask.prompt}</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">İpuçları</h3>
            </div>
            <ul className="space-y-2">
              {currentTask.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Yazınız</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Kelime: <span className="font-semibold text-gray-900">{wordCount} / {currentTask.wordCount}</span>
                </span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={wordCount < currentTask.wordCount || saved}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Kaydedildi</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={wordCount < currentTask.wordCount || evaluating}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Değerlendiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI ile Değerlendir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <textarea
            value={writing}
            onChange={handleWritingChange}
            placeholder="Yazmaya başlayın..."
            className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-gray-900 leading-relaxed"
          />

          {wordCount >= currentTask.wordCount && !saved && (
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
      </div>

      {/* AI Evaluation Results */}
      <AnimatePresence>
        {showEvaluation && evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200"
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
                  {/* Content */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">📄 İçerik</h4>
                      <span className="text-sm font-bold text-purple-600">{evaluation.content.score}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.content.assessment}</p>
                    {evaluation.content.referenceQuality && (
                      <p className="text-xs text-gray-600 mb-1">Referans Kalitesi: {evaluation.content.referenceQuality}</p>
                    )}
                    {evaluation.content.opinionQuality && (
                      <p className="text-xs text-gray-600 mb-1">Görüş Kalitesi: {evaluation.content.opinionQuality}</p>
                    )}
                    {evaluation.content.summaryQuality && (
                      <p className="text-xs text-gray-600 mb-1">Özet Kalitesi: {evaluation.content.summaryQuality}</p>
                    )}
                    {evaluation.content.connectionQuality && (
                      <p className="text-xs text-gray-600 mb-1">Bağlantı Kalitesi: {evaluation.content.connectionQuality}</p>
                    )}
                  </div>

                  {/* Grammar */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">📝 Dilbilgisi</h4>
                      <span className="text-sm font-bold text-purple-600">{evaluation.grammar.score}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.grammar.assessment}</p>
                    <p className="text-xs text-gray-600 mb-2">Karmaşık Yapılar: {evaluation.grammar.complexStructures}</p>
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
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">📚 Kelime Bilgisi</h4>
                      <span className="text-sm font-bold text-purple-600">{evaluation.vocabulary.score}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.vocabulary.assessment}</p>
                    <p className="text-xs text-gray-600 mb-2">Kelime Çeşitliliği: {evaluation.vocabulary.range}</p>
                    {evaluation.vocabulary.collocationalExpressions && (
                      <p className="text-xs text-gray-600 mb-2">Eşdizimli İfadeler: {evaluation.vocabulary.collocationalExpressions}</p>
                    )}
                    {evaluation.vocabulary.resourceUsage && (
                      <p className="text-xs text-gray-600 mb-2">Kaynak Kullanımı: {evaluation.vocabulary.resourceUsage}</p>
                    )}
                  </div>

                  {/* Coherence */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">🔗 Tutarlılık ve Bağlantı</h4>
                      <span className="text-sm font-bold text-purple-600">{evaluation.coherence.score}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.coherence.assessment}</p>
                    <p className="text-xs text-gray-600 mb-1">Akış: {evaluation.coherence.flow}</p>
                    <p className="text-xs text-gray-600">Bağlantı Öğeleri: {evaluation.coherence.cohesiveDevices}</p>
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
  )
}

