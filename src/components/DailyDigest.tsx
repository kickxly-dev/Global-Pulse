'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Mail, Newspaper, TrendingUp, 
  ExternalLink, X, CheckCircle, Send
} from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface DailyDigestProps {
  isOpen: boolean
  onClose: () => void
  email?: string
}

interface DigestArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  category: string
}

export default function DailyDigest({ isOpen, onClose, email }: DailyDigestProps) {
  const [digest, setDigest] = useState<{
    date: string
    articles: DigestArticle[]
    stats: {
      totalArticles: number
      categories: string[]
      topSources: string[]
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailInput, setEmailInput] = useState(email || '')

  useEffect(() => {
    if (isOpen) {
      fetchDigest()
    }
  }, [isOpen])

  const fetchDigest = async () => {
    setIsLoading(true)
    try {
      // Get today's top stories
      const response = await fetch('/api/news')
      const data = await response.json()
      
      let digestArticles: DigestArticle[] = []
      
      if (data.articles && data.articles.length > 0) {
        digestArticles = data.articles.slice(0, 10).map((article: NewsArticle) => ({
          title: article.title,
          description: article.description || article.content?.substring(0, 150) + '...',
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          category: article.category || 'general'
        }))
      } else {
        // Fallback sample articles if API fails
        digestArticles = [
          {
            title: "Breaking: Major Technology Breakthrough Announced",
            description: "Scientists have made a groundbreaking discovery that could revolutionize how we interact with technology...",
            url: "#",
            source: "Tech News",
            publishedAt: new Date().toISOString(),
            category: "technology"
          },
          {
            title: "Global Markets Show Strong Recovery Signs",
            description: "Economic indicators point to a robust recovery as investors regain confidence in global markets...",
            url: "#",
            source: "Financial Times",
            publishedAt: new Date().toISOString(),
            category: "business"
          },
          {
            title: "New Health Study Reveals Surprising Benefits",
            description: "Research shows promising results from a new approach to wellness and preventive care...",
            url: "#",
            source: "Health Daily",
            publishedAt: new Date().toISOString(),
            category: "health"
          }
        ]
      }

      const categories = Array.from(new Set(digestArticles.map((a: DigestArticle) => a.category)))
      const sources = Array.from(new Set(digestArticles.map((a: DigestArticle) => a.source)))

      setDigest({
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        articles: digestArticles,
        stats: {
          totalArticles: digestArticles.length,
          categories: categories as string[],
          topSources: (sources as string[]).slice(0, 5)
        }
      })
    } catch (error) {
      console.error('Failed to fetch digest:', error)
      // Set fallback digest on error
      setDigest({
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        articles: [
          {
            title: "Sample News Article",
            description: "This is a sample article to demonstrate the digest functionality...",
            url: "#",
            source: "Sample News",
            publishedAt: new Date().toISOString(),
            category: "general"
          }
        ],
        stats: {
          totalArticles: 1,
          categories: ["general"],
          topSources: ["Sample News"]
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendDigest = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput,
          preferences: {
            categories: digest?.stats.categories || ['general'],
            frequency: 'daily'
          }
        })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        console.log('Digest sent successfully:', data)
        alert('Daily Digest subscribed successfully! Check your email.')
        onClose()
      } else {
        alert(data.error || 'Failed to subscribe to digest')
      }
    } catch (error) {
      console.error('Failed to send digest:', error)
      alert('Failed to subscribe. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyber-blue/20 rounded-xl">
                <Mail className="w-6 h-6 text-cyber-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Daily News Digest</h2>
                <p className="text-sm text-gray-400">
                  {digest?.date || new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Email Input */}
          <div className="p-6 border-b border-white/10">
            <div className="flex gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email to receive digest"
                className="flex-1 px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
              />
              <button
                onClick={sendDigest}
                disabled={!emailInput.includes('@')}
                className="px-6 py-3 bg-cyber-blue text-gray-900 rounded-lg font-medium hover:bg-cyber-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Digest
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading today's digest...</p>
              </div>
            ) : digest ? (
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Newspaper className="w-6 h-6 text-cyber-blue mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{digest.stats.totalArticles}</div>
                    <div className="text-sm text-gray-400">Articles</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-cyber-purple mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{digest.stats.categories.length}</div>
                    <div className="text-sm text-gray-400">Categories</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-cyber-green mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">Daily</div>
                    <div className="text-sm text-gray-400">Frequency</div>
                  </div>
                </div>

                {/* Articles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Today's Top Stories</h3>
                  {digest.articles.map((article, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-4 border border-white/5 hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2 line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Newspaper className="w-3 h-3" />
                              {article.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 bg-cyber-blue/20 text-cyber-blue rounded-full">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-cyber-blue transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Top Sources */}
                <div className="mt-6 p-4 bg-gray-800/30 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Top Sources Today</h4>
                  <div className="flex flex-wrap gap-2">
                    {digest.stats.topSources.map((source, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyber-purple/20 text-cyber-purple rounded-full text-sm"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No digest available at the moment</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
