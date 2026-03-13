'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, ArrowLeftRight, CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'

interface NewsSource {
  id: string
  name: string
  url: string
  bias: 'left' | 'center' | 'right'
  reliability: number
  article: {
    title: string
    summary: string
    keyPoints: string[]
  }
}

interface NewsComparisonProps {
  topic?: string
}

export default function NewsComparison({ topic = 'Climate Policy' }: NewsComparisonProps) {
  const [selectedSources, setSelectedSources] = useState<NewsSource[]>([])
  const [comparing, setComparing] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const sources: NewsSource[] = [
    {
      id: '1',
      name: 'CNN',
      url: 'cnn.com',
      bias: 'left',
      reliability: 85,
      article: {
        title: 'New Climate Initiative Announced',
        summary: 'The administration unveiled a comprehensive plan to reduce carbon emissions by 50% over the next decade.',
        keyPoints: ['Focus on renewable energy', 'Electric vehicle incentives', 'International cooperation']
      }
    },
    {
      id: '2',
      name: 'Fox News',
      url: 'foxnews.com',
      bias: 'right',
      reliability: 78,
      article: {
        title: 'Climate Plan Faces Opposition',
        summary: 'Critics argue the new climate regulations could hurt economic growth and lead to job losses.',
        keyPoints: ['Economic concerns raised', 'Industry pushback', 'Alternative proposals']
      }
    },
    {
      id: '3',
      name: 'Reuters',
      url: 'reuters.com',
      bias: 'center',
      reliability: 92,
      article: {
        title: 'Climate Agreement Details Released',
        summary: 'The new climate framework includes provisions for both environmental protection and economic transition.',
        keyPoints: ['Balanced approach', 'Timeline extended', 'Stakeholder input included']
      }
    },
    {
      id: '4',
      name: 'BBC',
      url: 'bbc.com',
      bias: 'center',
      reliability: 90,
      article: {
        title: 'Global Climate Summit Results',
        summary: 'World leaders reached a consensus on climate action with specific targets and accountability measures.',
        keyPoints: ['International agreement', 'Measurable targets', 'Annual review process']
      }
    }
  ]

  const toggleSource = (source: NewsSource) => {
    setSelectedSources(prev => {
      const isSelected = prev.find(s => s.id === source.id)
      if (isSelected) {
        return prev.filter(s => s.id !== source.id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, source]
    })
  }

  const runComparison = () => {
    setComparing(true)
    setTimeout(() => {
      setComparing(false)
      setShowComparison(true)
    }, 1500)
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'left': return 'text-blue-400 bg-blue-500/20'
      case 'right': return 'text-red-400 bg-red-500/20'
      default: return 'text-purple-400 bg-purple-500/20'
    }
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 85) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold">Compare Coverage</h3>
        </div>
        <span className="text-xs text-white/40">Select 2-3 sources</span>
      </div>

      {/* Topic */}
      <div className="p-3 bg-white/5 rounded-lg mb-4">
        <span className="text-xs text-indigo-400">Comparing coverage of:</span>
        <h4 className="font-medium mt-1">{topic}</h4>
      </div>

      {/* Source Selection */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {sources.map((source) => {
          const isSelected = selectedSources.find(s => s.id === source.id)
          return (
            <motion.button
              key={source.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSource(source)}
              className={`p-3 rounded-lg border transition-all group relative ${
                isSelected
                  ? 'bg-indigo-500/20 border-indigo-500/30'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Hover Preview */}
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-black/90 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="text-xs text-white/80 mb-1">{source.article.title}</p>
                <p className="text-xs text-white/60 line-clamp-2">{source.article.summary}</p>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{source.name}</span>
                {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${getBiasColor(source.bias)}`}>
                  {source.bias}
                </span>
                <span className={`text-xs ${getReliabilityColor(source.reliability)}`}>
                  {source.reliability}% reliable
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Bias Spectrum */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg">
        <div className="text-xs text-white/40 mb-2">Political Bias Spectrum</div>
        <div className="relative h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full">
          {sources.map((source, i) => {
            const position = source.bias === 'left' ? 20 : source.bias === 'right' ? 80 : 50
            const isSelected = selectedSources.find(s => s.id === source.id)
            return (
              <div
                key={source.id}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-black cursor-pointer hover:scale-125 transition-transform"
                style={{ left: `${position}%` }}
                title={`${source.name}: ${source.bias}`}
              >
                {isSelected && <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping" />}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={runComparison}
        disabled={selectedSources.length < 2 || comparing}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {comparing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <ArrowLeftRight className="w-4 h-4" />
            Compare {selectedSources.length} Sources
          </>
        )}
      </button>

      {/* Comparison Results */}
      <AnimatePresence>
        {showComparison && selectedSources.length >= 2 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="text-xs text-white/40 mb-2">Key differences in coverage:</div>
            
            {selectedSources.map((source, i) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-white/5 rounded-lg border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{source.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getBiasColor(source.bias)}`}>
                      {source.bias}
                    </span>
                    <ExternalLink className="w-3 h-3 text-white/40" />
                  </div>
                </div>
                <h4 className="text-sm mb-2">{source.article.title}</h4>
                <p className="text-xs text-white/60 mb-3">{source.article.summary}</p>
                <div className="space-y-1">
                  {source.article.keyPoints.map((point, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-white/50">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                      {point}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Analysis */}
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-400">Analysis</span>
              </div>
              <p className="text-xs text-white/60">
                Sources differ in framing: left-leaning outlets emphasize environmental benefits, 
                while right-leaning sources focus on economic implications. Center sources provide 
                more balanced coverage of both aspects.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
