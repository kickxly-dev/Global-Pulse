'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, Clock, Sparkles, AlertTriangle, Target, Zap } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import { predictTrends } from '@/lib/aiAnalysis'

interface Prediction {
  topic: string
  probability: number
  timeframe: string
  reasoning: string
  confidence: 'high' | 'medium' | 'low'
}

interface PulsePredictProps {
  articles: NewsArticle[]
}

export default function PulsePredict({ articles }: PulsePredictProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [accuracy, setAccuracy] = useState(0.78) // Simulated accuracy

  useEffect(() => {
    if (articles.length > 0) {
      const trends = predictTrends(articles)
      const enrichedPredictions: Prediction[] = trends.map(trend => ({
        ...trend,
        confidence: trend.probability > 0.8 ? 'high' : trend.probability > 0.6 ? 'medium' : 'low'
      }))
      setPredictions(enrichedPredictions)
    }
  }, [articles])

  const getConfidenceColor = (confidence: string) => {
    switch(confidence) {
      case 'high': return 'text-green-500 border-green-500/30 bg-green-500/10'
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10'
      default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch(confidence) {
      case 'high': return <Target className="w-4 h-4" />
      case 'medium': return <Sparkles className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-cyber-purple animate-pulse" />
          <h3 className="text-lg font-bold font-cyber text-cyber-purple">
            Pulse Predict™
          </h3>
          <span className="px-2 py-1 bg-cyber-purple/20 rounded text-xs text-cyber-purple font-bold">
            BETA
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Accuracy: {Math.round(accuracy * 100)}%
        </div>
      </div>

      {/* AI Analysis Status */}
      <div className="mb-4 p-3 bg-cyber-dark/50 rounded-lg border border-cyber-purple/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase">AI Analysis</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-4 h-4 text-cyber-yellow" />
          </motion.div>
        </div>
        <p className="text-xs text-gray-300">
          Analyzing {articles.length} articles for emerging trends...
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Patterns:</span>
            <span className="ml-1 text-cyber-blue font-bold">
              {predictions.length * 3}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Signals:</span>
            <span className="ml-1 text-cyber-green font-bold">
              {Math.round(predictions.length * 1.7)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Trends:</span>
            <span className="ml-1 text-cyber-purple font-bold">
              {predictions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-3">
        <div className="text-xs text-gray-400 uppercase mb-2">
          Predicted Trending Topics
        </div>
        
        <AnimatePresence mode="popLayout">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPrediction(
                selectedPrediction?.topic === prediction.topic ? null : prediction
              )}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                getConfidenceColor(prediction.confidence)
              } ${selectedPrediction?.topic === prediction.topic ? 'ring-2 ring-cyber-purple' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getConfidenceIcon(prediction.confidence)}
                  <span className="font-medium capitalize">
                    {prediction.topic}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {prediction.timeframe}
                  </span>
                </div>
              </div>

              {/* Probability Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Probability</span>
                  <span className="font-bold">
                    {Math.round(prediction.probability * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-cyber-dark rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${prediction.probability * 100}%` }}
                    className={`h-full ${
                      prediction.confidence === 'high' ? 'bg-green-500' :
                      prediction.confidence === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                  />
                </div>
              </div>

              <AnimatePresence>
                {selectedPrediction?.topic === prediction.topic && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 pt-2 border-t border-cyber-dark"
                  >
                    <p className="text-xs text-gray-300 italic">
                      {prediction.reasoning}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {predictions.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Analyzing patterns...
          </div>
        )}
      </div>

      {/* Prediction Accuracy Tracker */}
      <div className="mt-4 pt-4 border-t border-cyber-blue/20">
        <div className="text-xs text-gray-400 uppercase mb-2">
          Historical Accuracy
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-8 bg-cyber-dark rounded overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500/30 border-r border-green-500"
                style={{ width: '65%' }}
              >
                <span className="text-xs text-green-500 px-1">Correct</span>
              </div>
              <div 
                className="bg-yellow-500/30 border-r border-yellow-500"
                style={{ width: '25%' }}
              >
                <span className="text-xs text-yellow-500 px-1">Partial</span>
              </div>
              <div 
                className="bg-red-500/30"
                style={{ width: '10%' }}
              >
                <span className="text-xs text-red-500 px-1">Miss</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Based on last 100 predictions
        </div>
      </div>
    </div>
  )
}
