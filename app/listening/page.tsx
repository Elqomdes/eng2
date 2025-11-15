'use client'

import { useState, useRef, useEffect } from 'react'
import { Headphones, Play, Pause, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
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

const listeningExercises: ListeningExercise[] = [
  {
    id: 1,
    title: 'Daily Conversation',
    level: 'Beginner',
    transcript: `Sarah: Hi Tom, how are you today?
Tom: I'm great, thanks! How about you?
Sarah: I'm doing well. What are your plans for the weekend?
Tom: I'm planning to visit the museum on Saturday. Would you like to join me?
Sarah: That sounds interesting! What time are you going?
Tom: Around 2 PM. We can meet at the museum entrance.
Sarah: Perfect! I'll see you there.`,
    questions: [
      {
        id: 1,
        type: 'multiple-choice' as const,
        question: 'What is Tom planning to do on Saturday?',
        options: [
          'Go to the park',
          'Visit the museum',
          'Watch a movie',
          'Go shopping'
        ],
        correct: 1
      },
      {
        id: 2,
        type: 'multiple-choice' as const,
        question: 'What time will they meet?',
        options: [
          '12 PM',
          '2 PM',
          '4 PM',
          '6 PM'
        ],
        correct: 1
      },
      {
        id: 3,
        type: 'multiple-choice' as const,
        question: 'Where will they meet?',
        options: [
          'At the park',
          'At the museum entrance',
          'At a restaurant',
          'At the cinema'
        ],
        correct: 1
      }
    ],
    duration: 30
  },
  {
    id: 2,
    title: 'Job Interview',
    level: 'Intermediate',
    transcript: `Interviewer: Good morning, thank you for coming in today. Can you tell me a little about yourself?
Candidate: Good morning. I'm a recent graduate with a degree in computer science. I've always been passionate about technology and software development. During my studies, I completed several projects and internships that gave me practical experience.
Interviewer: That's great. What interests you most about this position?
Candidate: I'm particularly drawn to the innovative projects your company is working on. I believe my skills in programming and problem-solving would be a great fit for your team. I'm also excited about the opportunity to learn and grow in a dynamic environment.
Interviewer: Excellent. Do you have any questions for us?
Candidate: Yes, I'd like to know more about the team structure and what opportunities there are for professional development.`,
    questions: [
      {
        id: 4,
        type: 'multiple-choice' as const,
        question: 'What is the candidate\'s educational background?',
        options: [
          'Business degree',
          'Computer science degree',
          'Engineering degree',
          'Not mentioned'
        ],
        correct: 1
      },
      {
        id: 5,
        type: 'multiple-choice' as const,
        question: 'What does the candidate find most interesting about the position?',
        options: [
          'The salary',
          'The innovative projects',
          'The location',
          'The working hours'
        ],
        correct: 1
      },
      {
        id: 6,
        type: 'multiple-choice' as const,
        question: 'What does the candidate ask about?',
        options: [
          'Salary and benefits',
          'Team structure and professional development',
          'Vacation time',
          'Company history'
        ],
        correct: 1
      }
    ],
    duration: 60
  }
]

export default function ListeningPage() {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | { [key: number]: number } }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { updateProgress, addTime, completeActivity } = useProgress()

  const exercise = listeningExercises[currentExercise]

  useEffect(() => {
    if (!exercise) return
    
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= exercise.duration) {
            setIsPlaying(false)
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
  }, [isPlaying, exercise])

  if (!exercise) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setTimeElapsed(0)
    setShowTranscript(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
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
    exercise.questions.forEach(q => {
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
    
    const percentage = Math.round((correct / exercise.questions.length) * 100)
    updateProgress('listening', Math.min(100, percentage + 10))
    addTime(Math.round(exercise.duration / 60))
    completeActivity()
  }

  const handleNext = () => {
    if (currentExercise < listeningExercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setSelectedAnswers({})
      setShowResults(false)
      setScore(0)
      handleReset()
    }
  }

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1)
      setSelectedAnswers({})
      setShowResults(false)
      setScore(0)
      handleReset()
    }
  }

  const progress = (timeElapsed / exercise.duration) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dinleme Pratikleri</h1>
            <p className="text-gray-600">Dinleyin ve anlama becerinizi test edin</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{exercise.title}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {exercise.level}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {currentExercise + 1} / {listeningExercises.length}
          </div>
        </div>

        {/* Audio Player */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all shadow"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
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
            <span>{exercise.duration}s</span>
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
                {exercise.transcript}
              </p>
            </motion.div>
          )}
        </div>

        {/* Questions */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sorular</h3>
          <div className="space-y-4">
            {exercise.questions.map((question) => {
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
            disabled={exercise.questions.some(q => {
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
                  {score} / {exercise.questions.length}
                </div>
                <div className="text-lg text-green-600">
                  {score === exercise.questions.length ? 'Mükemmel! 🎉' : score >= exercise.questions.length / 2 ? 'İyi iş! 👍' : 'Daha fazla pratik yapmalısın 💪'}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentExercise === 0}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              {currentExercise < listeningExercises.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Sonraki
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentExercise(0)
                    setSelectedAnswers({})
                    setShowResults(false)
                    setScore(0)
                    handleReset()
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Başa Dön
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


