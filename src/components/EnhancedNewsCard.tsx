'use client'

import { useState, useEffect } from 'react'
import { NewsArticle } from '@/types/news'
import { analyzeArticle, Sentiment } from '@/lib/aiAnalysis'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookmarkPlus, BookmarkX, Clock, Brain, Zap, 
  SmilePlus, Frown, Meh, Volume2, VolumeX,
  Eye, EyeOff, TrendingUp, AlertCircle, Share2, 
  Twitter, Linkedin, Link2, Check, MessageCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface EnhancedNewsCardProps {
  article: NewsArticle
  index: number
  tldrMode: boolean
  speedReadMode: boolean
  onRead?: (article: NewsArticle) => void
  onBookmark?: (article: NewsArticle) => void
}

export default function EnhancedNewsCard({ 
  article, 
  index, 
  tldrMode,
  speedReadMode,
  onRead,
  onBookmark
}: EnhancedNewsCardProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [readProgress, setReadProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Analyze article for sentiment and summary
    const result = analyzeArticle(article)
    setAnalysis(result)

    // Check if bookmarked
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]')
    setIsBookmarked(bookmarks.some((b: any) => b.id === article.id))
  }, [article])

  const getSentimentIcon = (sentiment: Sentiment) => {
    switch(sentiment) {
      case 'positive': return <SmilePlus className="w-4 h-4 text-green-500" />
      case 'negative': return <Frown className="w-4 h-4 text-red-500" />
      default: return <Meh className="w-4 h-4 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: Sentiment) => {
    switch(sentiment) {
      case 'positive': return 'border-green-500/30 bg-green-500/5'
      case 'negative': return 'border-red-500/30 bg-red-500/5'
      default: return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]')
    
    if (isBookmarked) {
      const filtered = bookmarks.filter((b: any) => b.id !== article.id)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(filtered))
      setIsBookmarked(false)
    } else {
      bookmarks.push(article)
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks))
      setIsBookmarked(true)
    }
    
    onBookmark?.(article)
  }

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = article.url
    const title = article.title
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
    setShowShareMenu(false)
  }

  const highlightImportantWords = (text: string) => {
    if (!speedReadMode) return text

    // Highlight important words for speed reading
    const importantWords = analysis?.keywords || []
    let highlightedText = text

    importantWords.forEach((word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      highlightedText = highlightedText.replace(regex, `<span class="font-bold text-cyber-blue">${word}</span>`)
    })

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  const isBreaking = () => {
    const publishedTime = new Date(article.publishedAt).getTime()
    const now = Date.now()
    return (now - publishedTime) < (2 * 60 * 60 * 1000) // 2 hours
  }

  if (!analysis) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`cyber-card ${getSentimentColor(analysis.sentiment)} relative overflow-hidden`}
    >
      {/* Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-cyber-dark/50">
        <motion.div
          className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
          animate={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header with Sentiment & Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isBreaking() && (
            <span className="px-2 py-1 bg-cyber-red/20 border border-cyber-red/50 rounded text-xs text-cyber-red font-bold uppercase">
              Breaking
            </span>
          )}
          {getSentimentIcon(analysis.sentiment)}
          <span className="text-xs text-gray-400 capitalize">{analysis.mood}</span>
          <span className="text-xs text-gray-500">•</span>
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">{analysis.readTime} min read</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-1 rounded text-gray-500 hover:text-cyber-blue transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {/* Share Menu Dropdown */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 bg-cyber-dark border border-cyber-blue/30 rounded-lg shadow-xl p-2 z-50 min-w-[140px]"
                >
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
                  >
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        <span className="text-sm">Copy Link</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-1 rounded transition-colors ${
              isBookmarked ? 'text-cyber-yellow' : 'text-gray-500 hover:text-cyber-yellow'
            }`}
          >
            {isBookmarked ? <BookmarkX className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TLDR Mode - Show Summary */}
      {tldrMode ? (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-cyber-purple" />
            <span className="text-xs font-bold text-cyber-purple uppercase">AI Summary</span>
          </div>
          <p className="text-sm text-gray-300 italic">
            {highlightImportantWords(analysis.summary)}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500">Source:</span>
            <span className="text-xs text-cyber-blue">{article.source.name}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Full Article Display */}
          <h3 className="text-lg font-bold text-gray-100 mb-2 hover:text-cyber-blue transition-colors cursor-pointer">
            {speedReadMode ? highlightImportantWords(article.title) : article.title}
          </h3>

          {article.urlToImage && !tldrMode && (
            <div className="relative h-48 rounded-lg overflow-hidden mb-3">
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyber-dark to-transparent p-2">
                <span className="text-xs text-white/80">{article.source.name}</span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {(isExpanded || !article.description) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <p className="text-sm text-gray-300 mb-3">
                  {speedReadMode ? highlightImportantWords(article.description || '') : article.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isExpanded && article.description && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-cyber-blue hover:text-cyber-blue/80 mb-3"
            >
              Read more...
            </button>
          )}
        </>
      )}

      {/* AI Keywords */}
      {analysis.keywords && analysis.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {analysis.keywords.slice(0, 3).map((keyword: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-cyber-dark/50 border border-cyber-blue/20 rounded text-xs text-cyber-blue"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* Read Full Article Button */}
      <button
        onClick={() => onRead?.(article)}
        className="w-full cyber-button text-sm py-2 mb-3"
      >
        Read Full Article
      </button>

      {/* Article Actions */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <span className="text-gray-500">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </span>
          {analysis.sentiment === 'positive' && (
            <TrendingUp className="w-4 h-4 text-green-500" />
          )}
        </div>
        
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-blue hover:text-cyber-blue/80 transition-colors"
        >
          Read full article →
        </a>
      </div>
    </motion.div>
  )
}
