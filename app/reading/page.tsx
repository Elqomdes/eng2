'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, XCircle, ArrowRight, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProgress } from '@/components/ProgressProvider'

type QuestionType = 'multiple-choice' | 'matching' | 'ordering'

interface BaseQuestion {
  id: number
  type: QuestionType
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  question: string
  options: string[]
  correct: number
}

interface MatchingQuestion extends BaseQuestion {
  type: 'matching'
  instruction: string
  items: string[]
  matches: { [key: number]: number } // item index -> paragraph index
  paragraphs: string[]
}

interface OrderingQuestion extends BaseQuestion {
  type: 'ordering'
  instruction: string
  parts: string[]
  correctOrder: number[]
}

type Question = MultipleChoiceQuestion | MatchingQuestion | OrderingQuestion

interface ReadingPassage {
  id: number
  title: string
  level: string
  content: string
  questions: Question[]
}

// Reading passages are now generated dynamically via API

export default function ReadingPage() {
  const [passage, setPassage] = useState<ReadingPassage | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | number[] | { [key: number]: number } }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [level, setLevel] = useState<string>('B2-C1')
  const { updateProgress, addTime, completeActivity } = useProgress()

  // Generate new passage on component mount
  useEffect(() => {
    generateNewPassage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateNewPassage = async (selectedLevel?: string) => {
    setIsGenerating(true)
    setError(null)
    setIsLoading(true)
    setShowResults(false)
    setSelectedAnswers({})
    setScore(0)

    try {
      const response = await fetch('/api/reading/generate', {
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
        throw new Error(errorData.error || 'Failed to generate reading passage')
      }

      const data = await response.json()
      setPassage(data)
      setLevel(data.level || level)
    } catch (err: any) {
      console.error('Error generating passage:', err)
      setError(err.message || 'Yeni makale oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  if (isLoading && !passage) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Akademik makale oluşturuluyor...</p>
          <p className="text-gray-500 text-sm mt-2">Google Akademik tarzı içerik hazırlanıyor</p>
        </div>
      </div>
    )
  }

  if (error && !passage) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Hata Oluştu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => generateNewPassage()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!passage) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>
  }

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    })
  }

  const handleMatchingSelect = (questionId: number, itemIndex: number, paragraphIndex: number) => {
    const currentMatches = (selectedAnswers[questionId] as { [key: number]: number }) || {}
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: {
        ...currentMatches,
        [itemIndex]: paragraphIndex
      }
    })
  }

  const handleOrderingChange = (questionId: number, draggedPartIndex: number, targetPartIndex: number) => {
    if (!passage) return
    const currentOrder = (selectedAnswers[questionId] as number[]) || []
    const question = passage.questions.find(q => q.id === questionId)
    
    if (!question || question.type !== 'ordering') return
    
    // If order is empty, initialize it with all parts in original order
    if (currentOrder.length === 0) {
      const initialOrder = question.parts.map((_, idx) => idx)
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: initialOrder
      })
      return
    }
    
    // Find positions in the current order array
    const fromPos = currentOrder.indexOf(draggedPartIndex)
    const toPos = currentOrder.indexOf(targetPartIndex)
    
    // If either part is not in the order yet, add it
    if (fromPos === -1 && toPos === -1) {
      // Both are new, add both
      const newOrder = [...currentOrder, draggedPartIndex, targetPartIndex]
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newOrder
      })
      return
    }
    
    if (fromPos === -1) {
      // Dragged part is new, insert it at target position
      const newOrder = [...currentOrder]
      newOrder.splice(toPos, 0, draggedPartIndex)
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newOrder
      })
      return
    }
    
    if (toPos === -1) {
      // Target is new, move dragged to end
      const newOrder = currentOrder.filter(idx => idx !== draggedPartIndex)
      newOrder.push(draggedPartIndex)
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newOrder
      })
      return
    }
    
    // Both are in order, swap their positions
    const newOrder = [...currentOrder]
    const [removed] = newOrder.splice(fromPos, 1)
    newOrder.splice(toPos, 0, removed)
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: newOrder
    })
  }
  
  const handleOrderingClick = (questionId: number, partIndex: number) => {
    if (showResults) return
    
    const currentOrder = (selectedAnswers[questionId] as number[]) || []
    
    // If part is already in order, remove it; otherwise add it to the end
    if (currentOrder.includes(partIndex)) {
      const newOrder = currentOrder.filter(idx => idx !== partIndex)
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newOrder
      })
    } else {
      const newOrder = [...currentOrder, partIndex]
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: newOrder
      })
    }
  }

  const handleSubmit = () => {
    let correct = 0
    passage.questions.forEach(q => {
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
      } else if (q.type === 'ordering') {
        const order = selectedAnswers[q.id] as number[] || []
        // Check if order matches correctOrder exactly
        if (order.length === q.correctOrder.length) {
          const isCorrect = order.every((partIndex, pos) => {
            return partIndex === q.correctOrder[pos]
          })
          if (isCorrect) {
          correct++
          }
        }
      }
    })
    setScore(correct)
    setShowResults(true)
    
    const percentage = Math.round((correct / passage.questions.length) * 100)
    updateProgress('reading', Math.min(100, percentage + 10))
    addTime(15)
    completeActivity()
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
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{passage.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {passage.level}
              </span>
              <span className="text-xs text-gray-500">AI ile oluşturuldu</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isGenerating}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="B2">B2</option>
              <option value="B2-C1">B2-C1</option>
              <option value="C1">C1</option>
            </select>
            <button
              onClick={() => generateNewPassage(level)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Yeni Makale</span>
                </>
              )}
            </button>
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
            {passage.questions.map((question) => {
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
                )
              } else if (question.type === 'matching') {
                const matches = (selectedAnswers[question.id] as { [key: number]: number }) || {}
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{question.instruction}</p>
                    <div className="space-y-3">
                      {question.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3">
                          <span className="font-medium text-gray-700 w-32">{item}</span>
                          <select
                            value={matches[itemIndex] !== undefined ? matches[itemIndex] : ''}
                            onChange={(e) => !showResults && handleMatchingSelect(question.id, itemIndex, parseInt(e.target.value))}
                            disabled={showResults}
                            className={`flex-1 p-2 border-2 rounded-lg ${
                              showResults && matches[itemIndex] === question.matches[itemIndex]
                                ? 'border-green-500 bg-green-50'
                                : showResults && matches[itemIndex] !== question.matches[itemIndex]
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <option value="">Seçiniz...</option>
                            {question.paragraphs.map((para, paraIndex) => (
                              <option key={paraIndex} value={paraIndex}>
                                {para}
                              </option>
                            ))}
                          </select>
                          {showResults && matches[itemIndex] === question.matches[itemIndex] && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {showResults && matches[itemIndex] !== undefined && matches[itemIndex] !== question.matches[itemIndex] && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              } else if (question.type === 'ordering') {
                const order = (selectedAnswers[question.id] as number[]) || []
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{question.instruction}</p>
                    
                    {/* Display ordered parts */}
                    <div className="space-y-2 mb-4">
                      {order.length > 0 ? (
                        order.map((partIndex, orderPos) => {
                          const part = question.parts[partIndex]
                          const correctPos = question.correctOrder.indexOf(partIndex)
                          const isCorrect = showResults && orderPos === correctPos
                          const isWrong = showResults && orderPos !== correctPos && correctPos !== -1
                        return (
                          <div
                              key={`ordered-${partIndex}`}
                            draggable={!showResults}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', partIndex.toString())
                                e.dataTransfer.setData('orderPos', orderPos.toString())
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                                e.currentTarget.classList.add('border-blue-400')
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('border-blue-400')
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                                e.currentTarget.classList.remove('border-blue-400')
                                const draggedPartIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                const targetPartIndex = partIndex
                                // If dragging within ordered list, reorder
                                if (order.includes(draggedPartIndex) && order.includes(targetPartIndex)) {
                                  const newOrder = [...order]
                                  const fromPos = newOrder.indexOf(draggedPartIndex)
                                  const toPos = newOrder.indexOf(targetPartIndex)
                                  const [removed] = newOrder.splice(fromPos, 1)
                                  newOrder.splice(toPos, 0, removed)
                                  setSelectedAnswers({
                                    ...selectedAnswers,
                                    [question.id]: newOrder
                                  })
                                } else {
                                  handleOrderingChange(question.id, draggedPartIndex, targetPartIndex)
                                }
                              }}
                              className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                              isCorrect ? 'border-green-500 bg-green-50' : ''
                            } ${
                              isWrong ? 'border-red-500 bg-red-50' : ''
                            } ${
                                !showResults ? 'border-gray-200 hover:border-blue-300 cursor-move bg-white' : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                              <div className="flex items-center space-x-2 flex-1">
                                <span className="text-sm font-semibold text-gray-500 w-8">{orderPos + 1}.</span>
                              {showResults && isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {showResults && isWrong && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                                <span className={showResults && isCorrect ? 'font-semibold text-green-700' : showResults && isWrong ? 'text-red-700' : 'text-gray-700'}>
                                  {part}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                          Parçaları sıralamak için aşağıdaki listeden seçin veya sürükleyip bırakın.
                        </p>
                      )}
                    </div>
                    
                    {/* Display unordered parts */}
                    {!showResults && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Kullanılabilir Parçalar:</p>
                        <div className="space-y-2">
                          {question.parts.map((part, index) => {
                            const isInOrder = order.includes(index)
                            return (
                              <div
                                key={`unordered-${index}`}
                                onClick={() => handleOrderingClick(question.id, index)}
                                draggable={!showResults}
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', index.toString())
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  if (order.length > 0) {
                                    e.currentTarget.classList.add('border-blue-400')
                                  }
                                }}
                                onDragLeave={(e) => {
                                  e.currentTarget.classList.remove('border-blue-400')
                                }}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  e.currentTarget.classList.remove('border-blue-400')
                                  const draggedPartIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                  const currentOrder = (selectedAnswers[question.id] as number[]) || []
                                  // If dragging from ordered list to unordered, remove from order
                                  if (currentOrder.includes(draggedPartIndex)) {
                                    const newOrder = currentOrder.filter(idx => idx !== draggedPartIndex)
                                    setSelectedAnswers({
                                      ...selectedAnswers,
                                      [question.id]: newOrder
                                    })
                                  } else {
                                    // Add to order
                                    handleOrderingClick(question.id, draggedPartIndex)
                                  }
                                }}
                                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                  isInOrder 
                                    ? 'border-gray-300 bg-gray-100 opacity-50' 
                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {isInOrder && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  <span className={isInOrder ? 'text-gray-500 line-through' : 'text-gray-700'}>
                                    {part}
                                  </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                      </div>
                    )}
                    
                    {showResults && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Doğru Sıralama:</p>
                        <div className="space-y-1">
                          {question.correctOrder.map((partIndex, pos) => (
                            <div key={`correct-${partIndex}`} className="text-sm text-blue-700">
                              {pos + 1}. {question.parts[partIndex]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
            disabled={passage.questions.some(q => {
              if (q.type === 'multiple-choice') {
                return selectedAnswers[q.id] === undefined
              } else if (q.type === 'matching') {
                const matches = selectedAnswers[q.id] as { [key: number]: number } || {}
                return Object.keys(matches).length !== q.items.length
              } else if (q.type === 'ordering') {
                const order = selectedAnswers[q.id] as number[] || []
                return order.length !== q.parts.length
              }
              return true
            })}
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
                onClick={() => generateNewPassage(level)}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Yeni Makale Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Yeni Makale Al</span>
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

