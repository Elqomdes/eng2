'use client'

import { useState, useRef, useEffect } from 'react'
import { Headphones, Play, Pause, RotateCcw, CheckCircle, XCircle, RefreshCw, Loader2, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'

type ListeningQuestionType = 'multiple-choice' | 'matching'

interface BaseListeningQuestion {
  id: number
  type: ListeningQuestionType
}

interface MultipleChoiceListeningQuestion extends BaseListeningQuestion {
  type: 'multiple-choice'
  question: string
  options: string[]
  correct: number
}

interface MatchingListeningQuestion extends BaseListeningQuestion {
  type: 'matching'
  instruction: string
  speakers: string[]
  statements: string[]
  matches: { [key: number]: number } // speaker index -> statement index
}

type ListeningQuestion = MultipleChoiceListeningQuestion | MatchingListeningQuestion

interface ListeningExercise {
  id: number
  title: string
  level: string
  transcript: string
  questions: ListeningQuestion[]
  duration: number
}

export default function ListeningPage() {
  const [currentExercise, setCurrentExercise] = useState<ListeningExercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | { [key: number]: number } }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('B2')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { updateProgress, addTime, completeActivity } = useProgress()

  // Generate new exercise on component mount
  useEffect(() => {
    generateNewExercise()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ''
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioElement, audioUrl])

  const generateNewExercise = async (selectedLevel?: string) => {
    setIsGenerating(true)
    setError(null)
    setIsLoading(true)
    setShowResults(false)
    setSelectedAnswers({})
    setScore(0)
    setShowTranscript(false)
    setTimeElapsed(0)
    setIsPlaying(false)
    setAudioUrl(null)
    
    // Cleanup previous audio
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ''
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    try {
      const response = await fetch('/api/listening/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: selectedLevel || level,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate listening exercise')
      }

      const data = await response.json()
      setCurrentExercise(data)
      setLevel(data.level || level)

      // Generate audio for the transcript
      await generateAudio(data.transcript)
    } catch (err: any) {
      console.error('Error generating exercise:', err)
      setError(err.message || 'Yeni dinleme görevi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const generateAudio = async (transcript: string) => {
    setIsGeneratingAudio(true)
    try {
      const response = await fetch('/api/listening/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcript,
          voice: 'alloy', // You can make this configurable
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }

      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Create audio element
      const audio = new Audio(url)
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setTimeElapsed(currentExercise?.duration || 0)
      })
      audio.addEventListener('timeupdate', () => {
        setTimeElapsed(Math.floor(audio.currentTime))
      })
      setAudioElement(audio)
    } catch (err: any) {
      console.error('Error generating audio:', err)
      // Don't fail the whole exercise if audio generation fails
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  useEffect(() => {
    if (!currentExercise) return
    
    if (isPlaying && audioElement) {
      audioElement.play().catch(err => {
        console.error('Error playing audio:', err)
        setIsPlaying(false)
      })
    } else if (!isPlaying && audioElement) {
      audioElement.pause()
    }

    return () => {
      if (audioElement) {
        audioElement.pause()
      }
    }
  }, [isPlaying, audioElement, currentExercise])

  if (isLoading && !currentExercise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Dinleme görevi oluşturuluyor...</p>
          <p className="text-gray-500 text-sm mt-2">AI ile içerik ve seslendirme hazırlanıyor</p>
        </div>
      </div>
    )
  }

  if (error && !currentExercise) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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

  const handlePlay = () => {
    if (audioElement) {
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setTimeElapsed(0)
    setShowTranscript(false)
    if (audioElement) {
      audioElement.currentTime = 0
    }
  }

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    })
  }

  const handleMatchingSelect = (questionId: number, speakerIndex: number, statementIndex: number) => {
    const currentMatches = (selectedAnswers[questionId] as { [key: number]: number }) || {}
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: {
        ...currentMatches,
        [speakerIndex]: statementIndex
      }
    })
  }

  const handleSubmit = () => {
    let correct = 0
    currentExercise.questions.forEach(q => {
      if (q.type === 'multiple-choice') {
        if (selectedAnswers[q.id] === q.correct) {
          correct++
        }
      } else if (q.type === 'matching') {
        const matches = selectedAnswers[q.id] as { [key: number]: number } || {}
        let matchCorrect = true
        Object.keys(q.matches).forEach(key => {
          if (matches[parseInt(key)] !== q.matches[parseInt(key)]) {
            matchCorrect = false
          }
        })
        if (matchCorrect && Object.keys(matches).length === Object.keys(q.matches).length) {
          correct++
        }
      }
    })
    setScore(correct)
    setShowResults(true)
    
    const percentage = Math.round((correct / currentExercise.questions.length) * 100)
    updateProgress('listening', Math.min(100, percentage + 10))
    addTime(Math.round(currentExercise.duration / 60))
    completeActivity()
  }

  const progress = currentExercise ? (timeElapsed / currentExercise.duration) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dinleme Pratikleri</h1>
              <p className="text-gray-600">AI ile oluşturulmuş dinleme görevleri</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="B2-C1">B2-C1</option>
              <option value="C1">C1</option>
            </select>
            <button
              onClick={() => generateNewExercise(level)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
            <h2 className="text-2xl font-bold text-gray-900">{currentExercise.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {currentExercise.level}
              </span>
              <span className="text-xs text-gray-500">AI ile oluşturuldu</span>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
          {isGeneratingAudio && (
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-5 h-5 text-green-500 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Seslendirme oluşturuluyor...</span>
            </div>
          )}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={!audioElement || isGeneratingAudio}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={!audioElement || isGeneratingAudio}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            {audioElement && (
              <div className="flex items-center gap-1 text-green-600">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-medium">AI Seslendirme</span>
              </div>
            )}
          </div>

          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>{Math.floor(timeElapsed)}s</span>
            <span>{currentExercise.duration}s</span>
          </div>
        </div>

        {/* Transcript Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {showTranscript ? 'Transkripti Gizle' : 'Transkripti Göster'}
          </button>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {currentExercise.transcript}
              </p>
            </motion.div>
          )}
        </div>

        {/* Questions */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sorular</h3>
          <div className="space-y-4">
            {currentExercise.questions.map((question) => {
              if (question.type === 'multiple-choice') {
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, index) => {
                        const isSelected = selectedAnswers[question.id] === index
                        const isCorrect = showResults && index === question.correct
                        const isWrong = showResults && isSelected && index !== question.correct
                        
                        return (
                          <button
                            key={index}
                            onClick={() => !showResults && handleAnswerSelect(question.id, index)}
                            disabled={showResults}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${
                              isCorrect ? 'border-green-500 bg-green-50' : ''
                            } ${
                              isWrong ? 'border-red-500 bg-red-50' : ''
                            } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center space-x-2">
                              {showResults && isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {showResults && isWrong && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span className={showResults && isCorrect ? 'font-semibold text-green-700' : showResults && isWrong ? 'text-red-700' : 'text-gray-700'}>
                                {option}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              } else if (question.type === 'matching') {
                const matches = (selectedAnswers[question.id] as { [key: number]: number }) || {}
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{question.instruction}</p>
                    <div className="space-y-3">
                      {question.speakers.map((speaker, speakerIndex) => (
                        <div key={speakerIndex} className="flex items-center space-x-3">
                          <span className="font-medium text-gray-700 w-32">{speaker}</span>
                          <select
                            value={matches[speakerIndex] !== undefined ? matches[speakerIndex] : ''}
                            onChange={(e) => !showResults && handleMatchingSelect(question.id, speakerIndex, parseInt(e.target.value))}
                            disabled={showResults}
                            className={`flex-1 p-2 border-2 rounded-lg ${
                              showResults && matches[speakerIndex] === question.matches[speakerIndex]
                                ? 'border-green-500 bg-green-50'
                                : showResults && matches[speakerIndex] !== question.matches[speakerIndex]
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <option value="">Seçiniz...</option>
                            {question.statements.map((statement, statementIndex) => (
                              <option key={statementIndex} value={statementIndex}>
                                {statement}
                              </option>
                            ))}
                          </select>
                          {showResults && matches[speakerIndex] === question.matches[speakerIndex] && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {showResults && matches[speakerIndex] !== undefined && matches[speakerIndex] !== question.matches[speakerIndex] && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        {!showResults ? (
          <button
            onClick={handleSubmit}
            disabled={currentExercise.questions.some(q => {
              if (q.type === 'multiple-choice') {
                return selectedAnswers[q.id] === undefined
              } else if (q.type === 'matching') {
                const matches = selectedAnswers[q.id] as { [key: number]: number } || {}
                return Object.keys(matches).length !== q.speakers.length
              }
              return true
            })}
            className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cevapları Gönder
          </button>
        ) : (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {score} / {currentExercise.questions.length}
                </div>
                <div className="text-lg text-green-600">
                  {score === currentExercise.questions.length ? 'Mükemmel! 🎉' : score >= currentExercise.questions.length / 2 ? 'İyi iş! 👍' : 'Daha fazla pratik yapmalısın 💪'}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => generateNewExercise(level)}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}
      </div>
    </div>
  )
}
