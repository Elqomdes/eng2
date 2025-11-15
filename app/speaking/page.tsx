'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, RotateCcw, CheckCircle, Sparkles, Loader2, X, FileText, RefreshCw, Video, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'
import { evaluateSpeaking, type SpeakingEvaluation } from '@/lib/ai-evaluation'

interface VideoData {
  title: string
  transcript: string
  mainPoints: string[]
}

interface SpeakingExercise {
  id: number
  taskType: 'independent' | 'integrated'
  title: string
  level: string
  prompt: string
  example: string
  duration: number
  tips: string[]
  video?: VideoData
}

export default function SpeakingPage() {
  const [currentExercise, setCurrentExercise] = useState<SpeakingExercise | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [recordingComplete, setRecordingComplete] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [transcript, setTranscript] = useState('')
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('B2')
  const [taskType, setTaskType] = useState<string>('random')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const levelRef = useRef<string>('B2')
  const taskTypeRef = useRef<string>('random')
  const streamRef = useRef<MediaStream | null>(null)
  const { updateProgress, addTime, completeActivity } = useProgress()

  // Update refs when state changes
  useEffect(() => {
    levelRef.current = level
  }, [level])

  useEffect(() => {
    taskTypeRef.current = taskType
  }, [taskType])

  const generateNewExercise = useCallback(async (selectedLevel?: string, selectedTaskType?: string) => {
    setIsGenerating(true)
    setError(null)
    setIsLoading(true)
    setRecordingComplete(false)
    setTranscript('')
    setShowEvaluation(false)
    setEvaluation(null)
    setTimeElapsed(0)
    setIsRecording(false)
    // Cleanup previous audio URL if exists
    setAudioUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl)
      }
      return null
    })
    setAudioChunks([])
    
    // Stop any active recording and cleanup stream
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    setMediaRecorder(prevRecorder => {
      if (prevRecorder && prevRecorder.state !== 'inactive') {
        try {
          prevRecorder.stop()
        } catch (error) {
          console.error('Error stopping mediaRecorder:', error)
        }
      }
      return null
    })
    
    // Stop and cleanup media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
      streamRef.current = null
    }

    try {
      const response = await fetch('/api/speaking/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: selectedLevel || levelRef.current,
          taskType: selectedTaskType || (taskTypeRef.current === 'random' ? undefined : taskTypeRef.current),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to generate speaking exercise'
        
        // Check for 429 status code
        if (response.status === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('kotası')) {
          throw new Error('OpenAI API kotası aşıldı. Lütfen OpenAI hesabınızın faturalama ayarlarını kontrol edin ve tekrar deneyin.')
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setCurrentExercise(data)
      if (data.level) {
        setLevel(data.level)
        levelRef.current = data.level
      }
      if (data.taskType) {
        setTaskType(data.taskType)
        taskTypeRef.current = data.taskType
      }
    } catch (err: any) {
      console.error('Error generating exercise:', err)
      setError(err.message || 'Yeni konuşma görevi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }, [])

  // Generate new exercise on component mount only
  useEffect(() => {
    let isMounted = true
    generateNewExercise().catch((err) => {
      if (isMounted) {
        console.error('Error in generateNewExercise:', err)
      }
    })
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateTranscript = async (audioBlob: Blob) => {
    setIsGeneratingTranscript(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/speaking/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to generate transcript'
        
        // Check for 429 status code
        if (response.status === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('kotası')) {
          alert('OpenAI API kotası aşıldı. Transkripti manuel olarak girebilirsiniz.')
          return
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (data && typeof data.transcript === 'string') {
        setTranscript(data.transcript)
      } else {
        throw new Error('Geçersiz transkript formatı alındı.')
      }
    } catch (err: any) {
      console.error('Error generating transcript:', err)
      const errorMessage = err.message || 'Transkript oluşturulurken bir hata oluştu.'
      if (!errorMessage.includes('kotası')) {
        alert(`${errorMessage} Lütfen manuel olarak girebilirsiniz.`)
      }
    } finally {
      setIsGeneratingTranscript(false)
    }
  }

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive' && isRecording) {
      try {
        mediaRecorder.stop()
        setIsRecording(false)
      } catch (error) {
        console.error('Error stopping recording:', error)
        setIsRecording(false)
      }
    } else if (isRecording) {
      setIsRecording(false)
    }
  }, [mediaRecorder, isRecording])

  if (isLoading && !currentExercise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Konuşma görevi oluşturuluyor...</p>
          <p className="text-gray-500 text-sm mt-2">AI ile e-TEP formatında içerik hazırlanıyor</p>
        </div>
      </div>
    )
  }

  if (error && !currentExercise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Hata Oluştu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => generateNewExercise()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!currentExercise) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  useEffect(() => {
    if (!currentExercise || !currentExercise.duration) return
    
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const currentDuration = currentExercise?.duration
          if (currentDuration && typeof prev === 'number' && prev >= currentDuration) {
            stopRecording()
            return currentDuration
          }
          if (typeof prev === 'number' && !isNaN(prev)) {
            return prev + 1
          }
          return 0
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording, currentExercise, stopRecording])

  const startRecording = async () => {
    try {
      // Cleanup any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioChunks(chunks)
        setRecordingComplete(true)
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Automatically generate transcript
        try {
          await generateTranscript(blob)
        } catch (error) {
          console.error('Error generating transcript:', error)
        }
      }

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setIsRecording(false)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setTimeElapsed(0)
      setRecordingComplete(false)
      setAudioUrl(null)
      setTranscript('')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setIsRecording(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      alert('Mikrofon erişimi için izin gerekli. Lütfen tarayıcı ayarlarınızdan mikrofon iznini verin.')
    }
  }

  const handleReset = () => {
    setIsRecording(false)
    setTimeElapsed(0)
    setRecordingComplete(false)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioChunks([])
    setTranscript('')
    setShowEvaluation(false)
    setEvaluation(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop()
      } catch (error) {
        console.error('Error stopping mediaRecorder:', error)
      }
    }
    // Cleanup stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleSubmit = () => {
    if (recordingComplete && currentExercise && currentExercise.duration && typeof timeElapsed === 'number') {
      try {
        const timeSpent = Math.round(timeElapsed / 60)
        const progressValue = Math.min(100, Math.max(0, (timeElapsed / currentExercise.duration) * 50 + 25))
        updateProgress('speaking', progressValue)
        if (timeSpent > 0) {
          addTime(timeSpent)
        }
        completeActivity()
      } catch (error) {
        console.error('Error in handleSubmit:', error)
      }
    }
  }

  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      alert('Lütfen konuşmanızın transkriptini bekleyin veya manuel olarak girin.')
      return
    }

    if (!currentExercise) {
      alert('Görev yüklenmedi. Lütfen sayfayı yenileyin.')
      return
    }

    if (!currentExercise.prompt || !currentExercise.level) {
      alert('Görev verisi eksik. Lütfen yeni bir görev oluşturun.')
      return
    }

    setEvaluating(true)
    setShowEvaluation(false)
    
    try {
      const result = await evaluateSpeaking(transcript, currentExercise.prompt, currentExercise.level)
      
      if (!result || typeof result !== 'object' || typeof result.score !== 'number') {
        throw new Error('Geçersiz değerlendirme sonucu alındı.')
      }
      
      // Validate result structure
      if (!result.taskCompletion || !result.grammar || !result.vocabulary || !result.fluency || !result.overall) {
        throw new Error('Eksik değerlendirme verisi alındı.')
      }
      
      setEvaluation(result)
      setShowEvaluation(true)
      
      // İlerlemeyi güncelle
      if (typeof result.score === 'number' && !isNaN(result.score)) {
        updateProgress('speaking', Math.min(100, Math.max(0, result.score)))
      }
      if (typeof timeElapsed === 'number' && !isNaN(timeElapsed)) {
        addTime(Math.round(timeElapsed / 60))
      }
      completeActivity()
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme sırasında bir hata oluştu.'
      
      // Show specific message for quota errors
      if (errorMessage.includes('kotası') || errorMessage.toLowerCase().includes('quota')) {
        alert(`Hata: ${errorMessage}\n\nOpenAI hesabınızın faturalama ayarlarını kontrol edin.`)
      } else {
        alert(`Hata: ${errorMessage}\n\nLütfen tekrar deneyin veya API anahtarınızı kontrol edin.`)
      }
    } finally {
      setEvaluating(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      // Cleanup audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      // Cleanup media recorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop()
        } catch (error) {
          console.error('Error stopping mediaRecorder on unmount:', error)
        }
      }
      
      // Cleanup stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [audioUrl, mediaRecorder])

  const progress = currentExercise && currentExercise.duration && typeof timeElapsed === 'number' && !isNaN(timeElapsed)
    ? Math.min(100, Math.max(0, (timeElapsed / currentExercise.duration) * 100))
    : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Konuşma Pratikleri</h1>
              <p className="text-gray-600">e-TEP formatında konuşma becerilerinizi geliştirin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="B2-C1">B2-C1</option>
              <option value="C1">C1</option>
            </select>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <option value="random">Rastgele</option>
              <option value="independent">Independent</option>
              <option value="integrated">Integrated</option>
            </select>
            <button
              onClick={() => generateNewExercise(level, taskType)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentExercise.title || 'Konuşma Görevi'}</h2>
            <div className="flex items-center gap-2 mt-2">
              {currentExercise.level && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  {currentExercise.level}
                </span>
              )}
              {currentExercise.taskType && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentExercise.taskType === 'independent' ? (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Independent Speaking
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Video className="w-4 h-4" />
                      Integrated Speaking
                    </span>
                  )}
                </span>
              )}
              <span className="text-xs text-gray-500">AI ile oluşturuldu</span>
            </div>
          </div>
        </div>

        {/* Video Transcript for Integrated Tasks */}
        {currentExercise.taskType === 'integrated' && currentExercise.video && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{currentExercise.video.title || 'Video İçeriği'}</h3>
            </div>
            {currentExercise.video.transcript && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentExercise.video.transcript}</p>
              </div>
            )}
            {currentExercise.video.mainPoints && Array.isArray(currentExercise.video.mainPoints) && currentExercise.video.mainPoints.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Ana Noktalar:</h4>
                <ul className="space-y-1">
                  {currentExercise.video.mainPoints.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Exercise Prompt */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Görev</h3>
          {currentExercise.prompt && (
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{currentExercise.prompt}</p>
          )}
          {currentExercise.example && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Örnek Başlangıç:</p>
              <p className="text-sm text-gray-700 italic">{currentExercise.example}</p>
            </div>
          )}
        </div>

        {/* Tips */}
        {currentExercise.tips && Array.isArray(currentExercise.tips) && currentExercise.tips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">İpuçları</h3>
            <ul className="space-y-2">
              {currentExercise.tips.map((tip, index) => (
                <li key={index} className="flex items-start text-gray-700">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recording Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={!recordingComplete && !isRecording}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>

          {isRecording && currentExercise && currentExercise.duration && typeof timeElapsed === 'number' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-4"
            >
              <div className="text-2xl font-bold text-red-600 mb-2">
                {Math.floor(timeElapsed)}s / {currentExercise.duration}s
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
            </motion.div>
          )}

          {recordingComplete && audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Kayıt Tamamlandı</span>
                </div>
              </div>
              <audio controls className="w-full mb-4" src={audioUrl}>
                Your browser does not support the audio element.
              </audio>
              
              {/* Transcript Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Konuşmanızın Transkripti:
                  </label>
                  {isGeneratingTranscript && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI ile oluşturuluyor...</span>
                    </div>
                  )}
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isGeneratingTranscript ? "Transkript oluşturuluyor..." : "Transkript otomatik olarak oluşturulacak veya manuel olarak girebilirsiniz..."}
                  className="w-full h-32 p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none text-gray-900"
                  disabled={isGeneratingTranscript}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isGeneratingTranscript 
                    ? "AI transkript oluşturuyor, lütfen bekleyin..." 
                    : "Transkript otomatik olarak oluşturuldu. Gerekirse düzenleyebilirsiniz."}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-2">
            {recordingComplete && transcript && (
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !transcript.trim()}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
            {recordingComplete && (
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Kaydet ve İlerle
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => generateNewExercise(level, taskType)}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Yeni Görev Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Yeni Görev Al</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Evaluation Results */}
        <AnimatePresence>
          {showEvaluation && evaluation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">AI Değerlendirme Sonuçları</h3>
                    <div className="text-3xl font-bold text-orange-600 mt-1">{evaluation.score || 0}/100</div>
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
                {/* Task Completion */}
                {evaluation.taskCompletion && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">✅ Görev Tamamlama</h4>
                      <span className="text-sm font-bold text-orange-600">{evaluation.taskCompletion.score || 0}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.taskCompletion.assessment || 'Değerlendirme yapılamadı.'}</p>
                    {evaluation.taskCompletion.contentDevelopment && (
                      <p className="text-xs text-gray-600 mb-1">İçerik Geliştirme: {evaluation.taskCompletion.contentDevelopment}</p>
                    )}
                    {evaluation.taskCompletion.organization && (
                      <p className="text-xs text-gray-600 mb-1">Organizasyon: {evaluation.taskCompletion.organization}</p>
                    )}
                    {evaluation.taskCompletion.summaryQuality && (
                      <p className="text-xs text-gray-600 mb-1">Özet Kalitesi: {evaluation.taskCompletion.summaryQuality}</p>
                    )}
                    {evaluation.taskCompletion.discussionQuality && (
                      <p className="text-xs text-gray-600 mb-1">Tartışma Kalitesi: {evaluation.taskCompletion.discussionQuality}</p>
                    )}
                  </div>
                )}

                {/* Grammar */}
                {evaluation.grammar && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">📝 Dilbilgisi</h4>
                      <span className="text-sm font-bold text-orange-600">{evaluation.grammar.score || 0}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.grammar.assessment || 'Değerlendirme yapılamadı.'}</p>
                    {evaluation.grammar.complexStructures && (
                      <p className="text-xs text-gray-600 mb-2">Karmaşık Yapılar: {evaluation.grammar.complexStructures}</p>
                    )}
                    {evaluation.grammar.errors && Array.isArray(evaluation.grammar.errors) && evaluation.grammar.errors.length > 0 && (
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
                )}

                {/* Vocabulary */}
                {evaluation.vocabulary && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">📚 Kelime Bilgisi</h4>
                      <span className="text-sm font-bold text-orange-600">{evaluation.vocabulary.score || 0}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.vocabulary.assessment || 'Değerlendirme yapılamadı.'}</p>
                    {evaluation.vocabulary.range && (
                      <p className="text-xs text-gray-600 mb-1">Kelime Çeşitliliği: {evaluation.vocabulary.range}</p>
                    )}
                    {evaluation.vocabulary.accuracy && (
                      <p className="text-xs text-gray-600 mb-1">Doğruluk: {evaluation.vocabulary.accuracy}</p>
                    )}
                    {evaluation.vocabulary.videoVocabulary && (
                      <p className="text-xs text-gray-600 mb-1">Video Kelimeleri: {evaluation.vocabulary.videoVocabulary}</p>
                    )}
                  </div>
                )}

                {/* Fluency & Pronunciation */}
                {evaluation.fluency && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">💬 Akıcılık ve Telaffuz</h4>
                      <span className="text-sm font-bold text-orange-600">{evaluation.fluency.score || 0}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{evaluation.fluency.assessment || 'Değerlendirme yapılamadı.'}</p>
                    {evaluation.fluency.pace && (
                      <p className="text-xs text-gray-600 mb-1">Hız: {evaluation.fluency.pace}</p>
                    )}
                    {evaluation.fluency.hesitations && (
                      <p className="text-xs text-gray-600 mb-1">Tereddütler: {evaluation.fluency.hesitations}</p>
                    )}
                    {evaluation.fluency.pronunciation && (
                      <p className="text-xs text-gray-600">Telaffuz: {evaluation.fluency.pronunciation}</p>
                    )}
                  </div>
                )}

                {/* Overall Feedback */}
                {evaluation.overall && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💬 Genel Geri Bildirim</h4>
                    {evaluation.feedback && (
                      <p className="text-sm text-gray-700 mb-3">{evaluation.feedback}</p>
                    )}
                    
                    {evaluation.overall.strengths && Array.isArray(evaluation.overall.strengths) && evaluation.overall.strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-green-700 mb-1">Güçlü Yönler:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.strengths.map((strength, i) => (
                            <li key={i}>✓ {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.overall.improvements && Array.isArray(evaluation.overall.improvements) && evaluation.overall.improvements.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-orange-700 mb-1">Geliştirilmesi Gerekenler:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.improvements.map((improvement, i) => (
                            <li key={i}>• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {evaluation.overall.practiceSuggestions && Array.isArray(evaluation.overall.practiceSuggestions) && evaluation.overall.practiceSuggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Pratik Önerileri:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {evaluation.overall.practiceSuggestions.map((suggestion, i) => (
                            <li key={i}>→ {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
