'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle, XCircle, AlertTriangle, ExternalLink, Search, ChevronRight } from 'lucide-react'

interface FactCheck {
  id: string
  claim: string
  verdict: 'true' | 'mostly-true' | 'mixed' | 'mostly-false' | 'false'
  explanation: string
  sources: { name: string; url: string }[]
  confidence: number
}

interface FactCheckIntegrationProps {
  article?: {
    title: string
    content: string
    source: string
  }
}

export default function FactCheckIntegration({ article }: FactCheckIntegrationProps) {
  const [factChecks, setFactChecks] = useState<FactCheck[]>([])
  const [checking, setChecking] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const runFactCheck = () => {
    setChecking(true)
    
    // Simulate fact checking
    setTimeout(() => {
      const mockChecks: FactCheck[] = [
        {
          id: '1',
          claim: 'Carbon emissions have decreased by 15% globally',
          verdict: 'mostly-true',
          explanation: 'While emissions have decreased in developed nations, global emissions have only decreased by about 8% according to the latest IEA report.',
          sources: [
            { name: 'IEA Report 2024', url: 'https://iea.org' },
            { name: 'EPA Data', url: 'https://epa.gov' }
          ],
          confidence: 85
        },
        {
          id: '2',
          claim: 'Renewable energy now accounts for 50% of global power',
          verdict: 'false',
          explanation: 'Renewable energy accounts for approximately 30% of global power generation, not 50%. The claim is significantly overstated.',
          sources: [
            { name: 'IRENA Statistics', url: 'https://irena.org' },
            { name: 'World Bank Data', url: 'https://worldbank.org' }
          ],
          confidence: 92
        },
        {
          id: '3',
          claim: 'Electric vehicle sales doubled in 2024',
          verdict: 'true',
          explanation: 'EV sales increased by 103% year-over-year according to multiple industry reports and government statistics.',
          sources: [
            { name: 'Bloomberg NEF', url: 'https://bloomberg.com' },
            { name: 'EV Volumes', url: 'https://ev-volumes.com' }
          ],
          confidence: 95
        },
        {
          id: '4',
          claim: 'The new policy will create 10 million jobs',
          verdict: 'mixed',
          explanation: 'Job creation estimates vary widely between 5-12 million depending on methodology. The 10 million figure is within the range but not confirmed.',
          sources: [
            { name: 'Economic Policy Institute', url: 'https://epi.org' },
            { name: 'Bureau of Labor Statistics', url: 'https://bls.gov' }
          ],
          confidence: 70
        }
      ]
      
      setFactChecks(mockChecks)
      setChecking(false)
    }, 2000)
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true': return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' }
      case 'mostly-true': return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' }
      case 'mixed': return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
      case 'mostly-false': return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
      case 'false': return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
      default: return { text: 'text-white/60', bg: 'bg-white/10', border: 'border-white/10' }
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true':
      case 'mostly-true':
        return <CheckCircle className="w-4 h-4" />
      case 'false':
      case 'mostly-false':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatVerdict = (verdict: string) => {
    return verdict.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold">Fact Check</h3>
        </div>
        <span className="text-xs text-white/40">AI-powered verification</span>
      </div>

      {/* Article Preview */}
      {article && (
        <div className="p-3 bg-white/5 rounded-lg mb-4">
          <span className="text-xs text-blue-400">Checking claims in:</span>
          <h4 className="text-sm font-medium mt-1 line-clamp-2">{article.title}</h4>
        </div>
      )}

      {/* Run Fact Check Button */}
      {factChecks.length === 0 && (
        <button
          onClick={runFactCheck}
          disabled={checking}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
          {checking ? (
            <>
              <Search className="w-4 h-4 animate-pulse" />
              Verifying claims...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Run Fact Check
            </>
          )}
        </button>
      )}

      {/* Fact Check Results */}
      <AnimatePresence>
        {factChecks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-white/60">Claims verified:</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">
                  {factChecks.filter(f => f.verdict === 'true' || f.verdict === 'mostly-true').length}
                </span>
                <span className="text-white/40">/</span>
                <span className="text-sm">{factChecks.length}</span>
              </div>
            </div>

            {/* Individual Checks */}
            {factChecks.map((check, i) => {
              const colors = getVerdictColor(check.verdict)
              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <button
                    onClick={() => setShowDetails(showDetails === check.id ? null : check.id)}
                    className="w-full"
                  >
                    <div className="flex items-start gap-3">
                      <div className={colors.text}>
                        {getVerdictIcon(check.verdict)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${colors.text}`}>
                            {formatVerdict(check.verdict)}
                          </span>
                          <span className="text-xs text-white/40">
                            {check.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{check.claim}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${showDetails === check.id ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {showDetails === check.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <p className="text-xs text-white/70 mb-3">{check.explanation}</p>
                        <div className="space-y-1">
                          <span className="text-xs text-white/40">Sources:</span>
                          {check.sources.map((source, j) => (
                            <a
                              key={j}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {source.name}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {/* Check Another */}
            <button
              onClick={() => setFactChecks([])}
              className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors"
            >
              Check another article
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
