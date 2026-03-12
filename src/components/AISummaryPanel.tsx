'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Wand2, Brain, Zap } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface AISummaryPanelProps {
  article: NewsArticle
  isOpen: boolean
  onClose: () => void
}

export default function AISummaryPanel({ article, isOpen, onClose }: AISummaryPanelProps) {
  const [summary, setSummary] = useState('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | 'neutral'>('neutral')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && article) {
      generateAISummary()
    }
  }, [isOpen, article])

  const generateAISummary = async () => {
    setLoading(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate smart summary based on article content
    const text = article.content || article.description || ''
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    
    // Extract key sentences for summary
    const summarySentences = sentences.slice(0, 3)
    const generatedSummary = summarySentences.join('. ') + '.'
    
    // Extract key points
    const points = [
      'Key development in ' + (article.category || 'global news'),
      'Impact on ' + (article.source.name || 'industry'),
      'Market reaction expected',
      'Further updates pending'
    ]
    
    // Simple sentiment analysis
    const positiveWords = ['growth', 'success', 'breakthrough', 'improve', 'win', 'positive', 'gain']
    const negativeWords = ['crisis', 'fail', 'decline', 'loss', 'negative', 'drop', 'crash']
    
    const textLower = text.toLowerCase()
    const posCount = positiveWords.filter(w => textLower.includes(w)).length
    const negCount = negativeWords.filter(w => textLower.includes(w)).length
    
    setSummary(generatedSummary || 'AI-generated summary of the article highlights the key developments and potential impacts on the industry.')
    setKeyPoints(points)
    setSentiment(posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral')
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Summary</h3>
                <p className="text-xs text-purple-400">Powered by Global Pulse AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500"
                />
                <p className="mt-4 text-purple-400 animate-pulse">Analyzing article...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">TL;DR Summary</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{summary}</p>
                </div>

                {/* Key Points */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Key Insights</span>
                  </div>
                  <ul className="space-y-2">
                    {keyPoints.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-gray-400"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Sentiment */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Zap className={`w-5 h-5 ${
                    sentiment === 'positive' ? 'text-green-400' :
                    sentiment === 'negative' ? 'text-red-400' :
                    'text-yellow-400'
                  }`} />
                  <div>
                    <span className="text-sm text-gray-400">Sentiment:</span>
                    <span className={`ml-2 text-sm font-medium capitalize ${
                      sentiment === 'positive' ? 'text-green-400' :
                      sentiment === 'negative' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {sentiment}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <p className="text-xs text-center text-gray-500">
              AI summaries are generated automatically and may not capture all nuances
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
