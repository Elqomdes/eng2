'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Play, RotateCcw, Volume2, CheckCircle, Sparkles, Loader2, X, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'
import { evaluateSpeaking, type SpeakingEvaluation } from '@/lib/ai-evaluation'

interface SpeakingExercise {
  id: number
  title: string
  level: string
  prompt: string
  example: string
  duration: number
  tips: string[]
}

const speakingExercises: SpeakingExercise[] = [
  {
    id: 1,
    title: 'Introduce Yourself',
    level: 'Beginner',
    prompt: 'Introduce yourself in English. Talk about your name, where you are from, your hobbies, and what you like to do in your free time.',
    example: 'Hello, my name is... I am from... I like...',
    duration: 60,
    tips: [
      'Speak clearly and at a moderate pace',
      'Use simple sentences',
      'Don\'t worry about making mistakes',
      'Practice pronunciation of difficult words'
    ]
  },
  {
    id: 2,
    title: 'Describe Your Favorite Place',
    level: 'Intermediate',
    prompt: 'Describe your favorite place. It could be a city, a park, a restaurant, or anywhere special to you. Explain why you like it and what makes it special.',
    example: 'My favorite place is... because... It is special because...',
    duration: 90,
    tips: [
      'Use descriptive adjectives',
      'Organize your thoughts before speaking',
      'Use connecting words (because, also, however)',
      'Include specific details'
    ]
  },
  {
    id: 3,
    title: 'Express Your Opinion',
    level: 'Advanced',
    prompt: 'Give your opinion on the following topic: "Should students be required to learn a second language?" Explain your position with reasons and examples.',
    example: 'In my opinion... I believe this because... For example...',
    duration: 120,
    tips: [
      'State your opinion clearly',
      'Provide strong reasons',
      'Use examples to support your points',
      'Consider counterarguments'
    ]
  }
]

export default function SpeakingPage() {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [recordingComplete, setRecordingComplete] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [transcript, setTranscript] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { updateProgress, addTime, completeActivity } = useProgress()

  const exercise = speakingExercises[currentExercise]

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }, [mediaRecorder, isRecording])

  useEffect(() => {
    if (!exercise) return
    
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= exercise.duration) {
            stopRecording()
            return exercise.duration
          }
          return prev + 1
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
  }, [isRecording, exercise, stopRecording])

  if (!exercise) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setAudioChunks(chunks)
        setRecordingComplete(true)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setTimeElapsed(0)
      setRecordingComplete(false)
      setAudioUrl(null)
    } catch (error) {
      console.error('Error accessing microphone:', error)
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
  }

  const handleSubmit = () => {
    if (recordingComplete) {
      const timeSpent = Math.round(timeElapsed / 60)
      updateProgress('speaking', Math.min(100, (timeElapsed / exercise.duration) * 50 + 25))
      addTime(timeSpent)
      completeActivity()
    }
  }

  const handleEvaluate = async () => {
    if (!transcript.trim()) {
      alert('Lütfen konuşmanızın transkriptini girin.')
      return
    }

    setEvaluating(true)
    setShowEvaluation(false)
    
    try {
      const result = await evaluateSpeaking(transcript, exercise.prompt, exercise.level)
      setEvaluation(result)
      setShowEvaluation(true)
      
      // İlerlemeyi güncelle
      updateProgress('speaking', Math.min(100, result.score))
      addTime(Math.round(timeElapsed / 60))
      completeActivity()
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme sırasında bir hata oluştu.'
      alert(`Hata: ${errorMessage}\n\nLütfen tekrar deneyin veya API anahtarınızı kontrol edin.`)
    } finally {
      setEvaluating(false)
    }
  }

  // Cleanup audio URL on unmount or exercise change
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const handleNext = () => {
    if (currentExercise < speakingExercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      handleReset()
    }
  }

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1)
      handleReset()
    }
  }

  const progress = (timeElapsed / exercise.duration) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Konuşma Pratikleri</h1>
            <p className="text-gray-600">Telaffuz ve konuşma becerilerinizi geliştirin</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{exercise.title}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {exercise.level}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {currentExercise + 1} / {speakingExercises.length}
          </div>
        </div>

        {/* Exercise Prompt */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Görev</h3>
          <p className="text-gray-700 leading-relaxed mb-4">{exercise.prompt}</p>
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Örnek Başlangıç:</p>
            <p className="text-sm text-gray-700 italic">{exercise.example}</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">İpuçları</h3>
          <ul className="space-y-2">
            {exercise.tips.map((tip, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <span className="text-orange-500 mr-2">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

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

          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-4"
            >
              <div className="text-2xl font-bold text-red-600 mb-2">
                {Math.floor(timeElapsed)}s / {exercise.duration}s
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
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
              
              {/* Transcript Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Konuşmanızın Transkripti (Ne söylediğinizi yazın):
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Kaydettiğiniz konuşmanın içeriğini buraya yazın..."
                  className="w-full h-32 p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AI değerlendirmesi için konuşmanızın transkriptini girmeniz gerekmektedir.
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
              onClick={handlePrevious}
              disabled={currentExercise === 0}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Önceki
            </button>
            {currentExercise < speakingExercises.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!recordingComplete}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentExercise(0)
                  handleReset()
                }}
                disabled={!recordingComplete}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Başa Dön
              </button>
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
              className="mt-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">AI Değerlendirme Sonuçları</h3>
                    <div className="text-3xl font-bold text-orange-600 mt-1">{evaluation.score}/100</div>
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
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">✅ Görev Tamamlama</h4>
                    <span className="text-sm font-bold text-orange-600">{evaluation.taskCompletion.score}/5</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{evaluation.taskCompletion.assessment}</p>
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

                {/* Grammar */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">📝 Dilbilgisi</h4>
                    <span className="text-sm font-bold text-orange-600">{evaluation.grammar.score}/5</span>
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
                    <span className="text-sm font-bold text-orange-600">{evaluation.vocabulary.score}/5</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{evaluation.vocabulary.assessment}</p>
                  <p className="text-xs text-gray-600 mb-1">Kelime Çeşitliliği: {evaluation.vocabulary.range}</p>
                  {evaluation.vocabulary.accuracy && (
                    <p className="text-xs text-gray-600 mb-1">Doğruluk: {evaluation.vocabulary.accuracy}</p>
                  )}
                  {evaluation.vocabulary.videoVocabulary && (
                    <p className="text-xs text-gray-600 mb-1">Video Kelimeleri: {evaluation.vocabulary.videoVocabulary}</p>
                  )}
                </div>

                {/* Fluency & Pronunciation */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">💬 Akıcılık ve Telaffuz</h4>
                    <span className="text-sm font-bold text-orange-600">{evaluation.fluency.score}/5</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{evaluation.fluency.assessment}</p>
                  <p className="text-xs text-gray-600 mb-1">Hız: {evaluation.fluency.pace}</p>
                  <p className="text-xs text-gray-600 mb-1">Tereddütler: {evaluation.fluency.hesitations}</p>
                  <p className="text-xs text-gray-600">Telaffuz: {evaluation.fluency.pronunciation}</p>
                </div>

                {/* Overall Feedback */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
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
                  
                  {evaluation.overall.practiceSuggestions.length > 0 && (
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


