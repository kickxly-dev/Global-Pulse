'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Eye, Filter, ChevronRight } from 'lucide-react'

interface SourceAnalysis {
  id: string
  name: string
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  biasScore: number
  sentiment: 'alarmist' | 'neutral' | 'dismissive'
  sentimentScore: number
  emphasized: string[]
  omitted: string[]
  headline: string
  quotes: string[]
  reliability: number
}

interface BiasDetectionProps {
  article?: {
    title: string
    topic: string
  }
}

export default function BiasDetection({ article }: BiasDetectionProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SourceAnalysis[] | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [showGaps, setShowGaps] = useState(false)

  const runAnalysis = () => {
    setAnalyzing(true)
    
    setTimeout(() => {
      const mockAnalysis: SourceAnalysis[] = [
        {
          id: '1',
          name: 'CNN',
          bias: 'center-left',
          biasScore: -25,
          sentiment: 'neutral',
          sentimentScore: 10,
          emphasized: ['Environmental benefits', 'International cooperation', 'Scientific consensus'],
          omitted: ['Economic costs', 'Job impact', 'Industry concerns'],
          headline: 'Historic Climate Deal Marks Turning Point for Planet',
          quotes: ['"This is the moment we\'ve been waiting for" - UN Secretary General'],
          reliability: 85
        },
        {
          id: '2',
          name: 'Fox News',
          bias: 'right',
          biasScore: 45,
          sentiment: 'alarmist',
          sentimentScore: -30,
          emphasized: ['Economic impact', 'Job losses', 'Government overreach', 'Energy prices'],
          omitted: ['Environmental benefits', 'Scientific consensus', 'International support'],
          headline: 'New Climate Regulations Could Cost Thousands of Jobs',
          quotes: ['"This will devastate American workers" - Industry Representative'],
          reliability: 72
        },
        {
          id: '3',
          name: 'Reuters',
          bias: 'center',
          biasScore: 5,
          sentiment: 'neutral',
          sentimentScore: 5,
          emphasized: ['Agreement details', 'Participant numbers', 'Timeline', 'Key provisions'],
          omitted: ['Opinion', 'Editorial commentary'],
          headline: '142 Nations Sign Climate Agreement with 50% Reduction Target',
          quotes: ['"The agreement includes provisions for..." - Official Statement'],
          reliability: 92
        },
        {
          id: '4',
          name: 'MSNBC',
          bias: 'left',
          biasScore: -40,
          sentiment: 'neutral',
          sentimentScore: 15,
          emphasized: ['Climate urgency', 'Political implications', 'Activist response'],
          omitted: ['Economic considerations', 'Implementation challenges'],
          headline: 'Climate Victory: Activists Celebrate Historic Agreement',
          quotes: ['"A win for the planet and future generations" - Climate Activist'],
          reliability: 78
        }
      ]
      
      setAnalysis(mockAnalysis)
      setAnalyzing(false)
    }, 2000)
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'left': return 'text-blue-400'
      case 'center-left': return 'text-blue-300'
      case 'center': return 'text-purple-400'
      case 'center-right': return 'text-red-300'
      case 'right': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  const getBiasPosition = (score: number) => {
    // -50 to 50 scale, position as percentage
    return ((score + 50) / 100) * 100
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'alarmist': return <AlertTriangle className="w-3 h-3 text-red-400" />
      case 'dismissive': return <TrendingDown className="w-3 h-3 text-yellow-400" />
      default: return <Minus className="w-3 h-3 text-green-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'alarmist': return 'text-red-400 bg-red-500/20'
      case 'dismissive': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-green-400 bg-green-500/20'
    }
  }

  // Find coverage gaps
  const findGaps = () => {
    if (!analysis) return { covered: [], gaps: [] }
    
    const allTopics = new Set<string>()
    analysis.forEach(s => s.emphasized.forEach(t => allTopics.add(t)))
    
    const gaps: { topic: string; missing: string[] }[] = []
    allTopics.forEach(topic => {
      const missing = analysis.filter(s => !s.emphasized.includes(topic)).map(s => s.name)
      if (missing.length > 0 && missing.length < analysis.length) {
        gaps.push({ topic, missing })
      }
    })
    
    return { covered: Array.from(allTopics), gaps }
  }

  const gaps = findGaps()

  return (
    <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-rose-400" />
          <h3 className="font-semibold">Bias Detection</h3>
        </div>
        <span className="text-xs text-white/40">AI-powered analysis</span>
      </div>

      {!analysis ? (
        <button
          onClick={runAnalysis}
          disabled={analyzing || !article}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <Scale className="w-4 h-4 animate-pulse" />
              Analyzing sources...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Analyze Coverage
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Bias Spectrum */}
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/40 mb-2">Political Bias Spectrum</div>
            <div className="relative h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full">
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white/80">
                <span>Left</span>
                <span>Center</span>
                <span>Right</span>
              </div>
              {analysis.map((source) => (
                <div
                  key={source.id}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-black cursor-pointer hover:scale-125 transition-transform"
                  style={{ left: `calc(${getBiasPosition(source.biasScore)}% - 6px)` }}
                  title={`${source.name}: ${source.bias}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-1">
              {analysis.map(s => (
                <span key={s.id} className={getBiasColor(s.bias)}>{s.name}</span>
              ))}
            </div>
          </div>

          {/* Source Cards */}
          <div className="grid grid-cols-2 gap-2">
            {analysis.map((source) => (
              <motion.button
                key={source.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedSource(selectedSource === source.id ? null : source.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedSource === source.id
                    ? 'bg-rose-500/20 border-rose-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{source.name}</span>
                  <span className={`text-xs ${getBiasColor(source.bias)}`}>{source.bias}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {getSentimentIcon(source.sentiment)}
                  <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(source.sentiment)}`}>
                    {source.sentiment}
                  </span>
                </div>

                <p className="text-xs text-white/50 line-clamp-2">{source.headline}</p>

                <AnimatePresence>
                  {selectedSource === source.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 space-y-2"
                    >
                      <div>
                        <div className="text-xs text-green-400 mb-1">Emphasized</div>
                        <div className="flex flex-wrap gap-1">
                          {source.emphasized.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-red-400 mb-1">Omitted</div>
                        <div className="flex flex-wrap gap-1">
                          {source.omitted.map((t, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-white/40">
                        Reliability: {source.reliability}%
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Coverage Gaps */}
          <button
            onClick={() => setShowGaps(!showGaps)}
            className="w-full p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-rose-400" />
              <span className="text-xs">Coverage Gaps</span>
            </div>
            <span className="text-xs text-white/40">{gaps.gaps.length} topics</span>
          </button>

          <AnimatePresence>
            {showGaps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                {gaps.gaps.map((gap, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{gap.topic}</span>
                      <span className="text-xs text-rose-400">Not covered by {gap.missing.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setAnalysis(null)}
            className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors"
          >
            Reset analysis
          </button>
        </motion.div>
      )}
    </div>
  )
}
