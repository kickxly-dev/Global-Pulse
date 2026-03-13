'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, XCircle, Lightbulb, Trophy, RotateCcw } from 'lucide-react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  category: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'Which country recently announced a major climate initiative?',
    options: ['Germany', 'China', 'United States', 'Brazil'],
    correct: 0,
    explanation: 'Germany announced a €10 billion climate action fund.',
    category: 'World'
  },
  {
    id: '2',
    question: 'What tech company reported the highest revenue this quarter?',
    options: ['Apple', 'Microsoft', 'Google', 'Amazon'],
    correct: 1,
    explanation: 'Microsoft reported record revenue of $62 billion.',
    category: 'Tech'
  },
  {
    id: '3',
    question: 'Which space agency launched a new Mars mission?',
    options: ['NASA', 'ESA', 'SpaceX', 'ISRO'],
    correct: 2,
    explanation: 'SpaceX launched the Starship Mars prototype.',
    category: 'Science'
  },
]

export default function NewsQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [streak, setStreak] = useState(0)

  const question = quizQuestions[currentQuestion]
  const totalQuestions = quizQuestions.length

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(index)
    setShowResult(true)
    
    if (index === question.correct) {
      setScore(prev => prev + 10)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setStreak(0)
    setQuizComplete(false)
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold">News Quiz</h3>
        </div>
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-xs text-orange-400"
            >
              <Trophy className="w-3 h-3" />
              {streak} streak
            </motion.div>
          )}
          <span className="text-xs text-white/40">{score} pts</span>
        </div>
      </div>

      {quizComplete ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h4 className="text-xl font-bold mb-2">Quiz Complete!</h4>
          <p className="text-white/60 mb-1">You scored {score} points</p>
          <p className="text-sm text-white/40 mb-4">
            {score >= 20 ? 'Perfect score! 🎉' : score >= 10 ? 'Great job! 👏' : 'Keep reading! 📰'}
          </p>
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </motion.div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
            <span className="text-xs text-white/40">{currentQuestion + 1}/{totalQuestions}</span>
          </div>

          {/* Category */}
          <span className="text-xs text-amber-400 font-medium">{question.category}</span>

          {/* Question */}
          <h4 className="text-lg font-medium mt-2 mb-4">{question.question}</h4>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i
              const isCorrect = i === question.correct
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    showCorrect
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : showWrong
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                      : isSelected
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5 border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      showCorrect
                        ? 'bg-emerald-500/30 text-emerald-400'
                        : showWrong
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-white/10'
                    }`}>
                      {showCorrect ? <CheckCircle className="w-4 h-4" /> : showWrong ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5" />
                  <p className="text-sm text-white/70">{question.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleNext}
              className="mt-4 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {currentQuestion < totalQuestions - 1 ? 'Next Question' : 'See Results'}
            </motion.button>
          )}
        </>
      )}
    </div>
  )
}
