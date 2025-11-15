'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'

interface ReadingPassage {
  id: number
  title: string
  level: string
  content: string
  questions: {
    id: number
    question: string
    options: string[]
    correct: number
  }[]
}

const readingPassages: ReadingPassage[] = [
  {
    id: 1,
    title: 'The Benefits of Reading',
    level: 'Beginner',
    content: `Reading is one of the most important skills you can develop. It opens up new worlds and allows you to learn about different cultures, ideas, and perspectives. When you read regularly, you improve your vocabulary, enhance your writing skills, and become a better communicator.

Reading also helps reduce stress. Studies show that just six minutes of reading can reduce stress levels by up to 68%. It's a great way to relax and escape from the pressures of daily life.

Moreover, reading improves your memory and concentration. When you read, your brain is actively working to understand and remember information. This mental exercise keeps your brain sharp and helps prevent cognitive decline as you age.

Finally, reading is a source of entertainment. Whether you enjoy fiction, non-fiction, or poetry, there's always something new to discover. Books can take you on adventures, teach you new skills, or help you understand complex topics.`,
    questions: [
      {
        id: 1,
        question: 'What is one benefit of reading mentioned in the text?',
        options: [
          'It makes you taller',
          'It improves your vocabulary',
          'It helps you sleep better',
          'It increases your appetite'
        ],
        correct: 1
      },
      {
        id: 2,
        question: 'How much can reading reduce stress levels?',
        options: [
          'Up to 50%',
          'Up to 68%',
          'Up to 75%',
          'Up to 90%'
        ],
        correct: 1
      },
      {
        id: 3,
        question: 'What does reading help prevent?',
        options: [
          'Physical illness',
          'Cognitive decline',
          'Hair loss',
          'Weight gain'
        ],
        correct: 1
      }
    ]
  },
  {
    id: 2,
    title: 'Climate Change and Its Effects',
    level: 'Intermediate',
    content: `Climate change is one of the most pressing issues of our time. It refers to long-term changes in temperature, precipitation patterns, and other aspects of the Earth's climate system. The primary cause of recent climate change is human activity, particularly the burning of fossil fuels which releases greenhouse gases into the atmosphere.

These greenhouse gases trap heat from the sun, causing the Earth's average temperature to rise. This phenomenon, known as global warming, has far-reaching effects on our planet. Sea levels are rising due to melting ice caps and glaciers. Extreme weather events, such as hurricanes, droughts, and floods, are becoming more frequent and severe.

Ecosystems around the world are being affected. Many species are struggling to adapt to changing conditions, and some face the risk of extinction. Coral reefs, which are home to a quarter of all marine species, are particularly vulnerable to rising ocean temperatures.

Addressing climate change requires global cooperation. Countries must work together to reduce greenhouse gas emissions, invest in renewable energy sources, and develop sustainable practices. Individual actions, such as reducing energy consumption and supporting eco-friendly products, also play an important role.`,
    questions: [
      {
        id: 1,
        question: 'What is the primary cause of recent climate change?',
        options: [
          'Natural disasters',
          'Human activity',
          'Solar radiation',
          'Ocean currents'
        ],
        correct: 1
      },
      {
        id: 2,
        question: 'What percentage of marine species live in coral reefs?',
        options: [
          '10%',
          '25%',
          '50%',
          '75%'
        ],
        correct: 1
      },
      {
        id: 3,
        question: 'What is required to address climate change?',
        options: [
          'Individual action only',
          'Global cooperation',
          'Government action only',
          'Scientific research only'
        ],
        correct: 1
      }
    ]
  }
]

export default function ReadingPage() {
  const [currentPassage, setCurrentPassage] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const { updateProgress, addTime, completeActivity } = useProgress()

  const passage = readingPassages[currentPassage]

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    })
  }

  const handleSubmit = () => {
    let correct = 0
    passage.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) {
        correct++
      }
    })
    setScore(correct)
    setShowResults(true)
    
    const percentage = Math.round((correct / passage.questions.length) * 100)
    updateProgress('reading', Math.min(100, percentage + 10))
    addTime(15)
    completeActivity()
  }

  const handleNext = () => {
    if (currentPassage < readingPassages.length - 1) {
      setCurrentPassage(currentPassage + 1)
      setSelectedAnswers({})
      setShowResults(false)
      setScore(0)
    }
  }

  const handlePrevious = () => {
    if (currentPassage > 0) {
      setCurrentPassage(currentPassage - 1)
      setSelectedAnswers({})
      setShowResults(false)
      setScore(0)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Okuma Pratikleri</h1>
            <p className="text-gray-600">Metinleri okuyun ve soruları cevaplayın</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{passage.title}</h2>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {passage.level}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {currentPassage + 1} / {readingPassages.length}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {passage.content}
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sorular</h3>
          <div className="space-y-4">
            {passage.questions.map((question) => (
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
                            ? 'border-blue-500 bg-blue-50'
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
            ))}
          </div>
        </div>

        {!showResults ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== passage.questions.length}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cevapları Gönder
          </button>
        ) : (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {score} / {passage.questions.length}
                </div>
                <div className="text-lg text-green-600">
                  {score === passage.questions.length ? 'Mükemmel! 🎉' : score >= passage.questions.length / 2 ? 'İyi iş! 👍' : 'Daha fazla pratik yapmalısın 💪'}
                </div>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handlePrevious}
                disabled={currentPassage === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Önceki</span>
              </button>
              {currentPassage < readingPassages.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  <span>Sonraki</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPassage(0)
                    setSelectedAnswers({})
                    setShowResults(false)
                    setScore(0)
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <span>Başa Dön</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

