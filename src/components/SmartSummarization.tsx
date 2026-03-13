'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, Zap, BookOpen, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

interface SummaryLayer {
  duration: string
  label: string
  wordCount: number
  content: string
  keyPoints: string[]
}

interface SmartSummarizationProps {
  article?: {
    title: string
    content: string
  }
}

export default function SmartSummarization({ article }: SmartSummarizationProps) {
  const [selectedLayer, setSelectedLayer] = useState<'30sec' | '2min' | '5min' | null>(null)
  const [summary, setSummary] = useState<SummaryLayer | null>(null)
  const [loading, setLoading] = useState(false)
  const [showKeyPoints, setShowKeyPoints] = useState(true)

  const layers: { id: '30sec' | '2min' | '5min'; label: string; icon: any; time: string }[] = [
    { id: '30sec', label: 'Quick Read', icon: Zap, time: '30 sec' },
    { id: '2min', label: 'Brief', icon: Clock, time: '2 min' },
    { id: '5min', label: 'Full Summary', icon: BookOpen, time: '5 min' }
  ]

  const generateSummary = (layer: '30sec' | '2min' | '5min') => {
    setSelectedLayer(layer)
    setLoading(true)
    
    setTimeout(() => {
      const summaries: Record<string, SummaryLayer> = {
        '30sec': {
          duration: '30 seconds',
          label: 'Quick Read',
          wordCount: 75,
          content: 'World leaders reached a historic climate agreement at the UN summit, committing to 50% carbon reduction by 2030. The deal includes provisions for developing nations and establishes a global carbon market.',
          keyPoints: ['50% carbon reduction by 2030', 'Support for developing nations', 'Global carbon market established']
        },
        '2min': {
          duration: '2 minutes',
          label: 'Brief Summary',
          wordCount: 250,
          content: 'In a landmark decision at the UN Climate Summit, 142 nations agreed to unprecedented carbon reduction targets. The agreement mandates a 50% reduction in emissions by 2030, with developed nations bearing the primary responsibility. Key provisions include financial support for developing countries, establishment of a global carbon trading market, and annual progress reviews. The deal represents the most ambitious climate action in history, though critics argue it may not be sufficient to limit warming to 1.5°C.',
          keyPoints: ['142 nations signed the agreement', '50% emissions reduction by 2030', 'Global carbon market created', 'Annual progress reviews mandated', 'Financial aid for developing nations']
        },
        '5min': {
          duration: '5 minutes',
          label: 'Full Summary',
          wordCount: 500,
          content: 'The historic UN Climate Summit concluded with a groundbreaking agreement that will reshape global environmental policy for decades to come. After two weeks of intense negotiations, 142 nations committed to reducing carbon emissions by 50% before 2030, marking the most ambitious climate target ever adopted internationally.\n\nThe agreement, dubbed the "Global Climate Accord," establishes a three-tier system of responsibility. Developed nations must achieve 60% reduction, emerging economies 45%, and developing nations receive support to meet 35% targets. A $100 billion annual fund will assist vulnerable nations in transitioning to renewable energy.\n\nThe accord also creates the world\'s first unified carbon market, allowing nations to trade emissions credits. This mechanism aims to make carbon reduction economically viable while preventing "carbon leakage" where companies relocate to countries with weaker regulations.\n\nCritics, including several climate scientists, argue the targets may still fall short of limiting global warming to 1.5°C above pre-industrial levels. However, supporters hail it as a turning point in humanity\'s fight against climate change.',
          keyPoints: ['142 nations committed to 50% reduction by 2030', 'Three-tier responsibility system created', '$100B annual fund established', 'Unified global carbon market launched', 'Annual compliance reviews mandated', 'Critics warn targets may be insufficient', 'Supporters call it a historic turning point']
        }
      }
      
      setSummary(summaries[layer])
      setLoading(false)
    }, 1000)
  }

  const getLayerColor = (id: string) => {
    switch (id) {
      case '30sec': return 'from-yellow-500 to-orange-500'
      case '2min': return 'from-blue-500 to-cyan-500'
      case '5min': return 'from-purple-500 to-pink-500'
      default: return 'from-gray-500 to-gray-400'
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold">Smart Summary</h3>
        </div>
        <span className="text-xs text-white/40">AI-generated</span>
      </div>

      {/* Layer Buttons */}
      <div className="flex gap-2 mb-4">
        {layers.map((layer) => {
          const Icon = layer.icon
          const isActive = selectedLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => generateSummary(layer.id)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                isActive
                  ? `bg-gradient-to-r ${getLayerColor(layer.id)} text-white`
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{layer.time}</span>
            </button>
          )
        })}
      </div>

      {/* Summary Content */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center"
          >
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-white/40">Generating summary...</p>
          </motion.div>
        )}
        
        {summary && !loading && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* TL;DR Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">TL;DR - {summary.duration} read</span>
              <span className="text-xs text-white/40">({summary.wordCount} words)</span>
            </div>

            {/* Summary Text */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm leading-relaxed whitespace-pre-line">{summary.content}</p>
            </div>

            {/* Key Points */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <button
                onClick={() => setShowKeyPoints(!showKeyPoints)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-xs font-medium text-emerald-400">Key Points</span>
                {showKeyPoints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {showKeyPoints && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2"
                  >
                    {summary.keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-xs text-white/70">{point}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">
                Copy Summary
              </button>
              <button className="flex-1 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10 transition-colors">
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Article Selected */}
      {!article && !summary && (
        <div className="py-6 text-center text-white/40">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an article to generate summaries</p>
        </div>
      )}
    </div>
  )
}
