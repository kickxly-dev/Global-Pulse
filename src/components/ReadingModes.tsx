'use client'

import { motion } from 'framer-motion'
import { 
  Brain, Zap, BookOpen, Eye, EyeOff, 
  Bookmark, Filter, Music, Mic
} from 'lucide-react'

interface ReadingModesProps {
  tldrMode: boolean
  speedReadMode: boolean
  zenMode: boolean
  djMode: boolean
  voiceEnabled: boolean
  onTldrToggle: () => void
  onSpeedReadToggle: () => void
  onZenToggle: () => void
  onDjToggle: () => void
  onVoiceToggle: () => void
  bookmarkCount: number
}

export default function ReadingModes({
  tldrMode,
  speedReadMode,
  zenMode,
  djMode,
  voiceEnabled,
  onTldrToggle,
  onSpeedReadToggle,
  onZenToggle,
  onDjToggle,
  onVoiceToggle,
  bookmarkCount
}: ReadingModesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 p-4 bg-cyber-dark/50 backdrop-blur-md border-b border-cyber-blue/20"
    >
      {/* TLDR Mode */}
      <button
        onClick={onTldrToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          tldrMode 
            ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple' 
            : 'bg-cyber-dark border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
        title="AI Summary Mode - Show only summaries"
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">TLDR</span>
      </button>

      {/* Speed Read Mode */}
      <button
        onClick={onSpeedReadToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          speedReadMode 
            ? 'bg-cyber-yellow/20 border-cyber-yellow text-cyber-yellow' 
            : 'bg-cyber-dark border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
        title="Speed Reading - Highlights important words"
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Speed</span>
      </button>

      {/* Zen Mode */}
      <button
        onClick={onZenToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          zenMode 
            ? 'bg-cyber-green/20 border-cyber-green text-cyber-green' 
            : 'bg-cyber-dark border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
        title="Zen Mode - Distraction-free reading"
      >
        {zenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span className="text-sm font-medium">Zen</span>
      </button>

      {/* DJ Mode */}
      <button
        onClick={onDjToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          djMode 
            ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue' 
            : 'bg-cyber-dark border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
        title="DJ Mode - Ambient music based on news mood"
      >
        <Music className="w-4 h-4" />
        <span className="text-sm font-medium">DJ</span>
      </button>

      {/* Voice Control */}
      <button
        onClick={onVoiceToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
          voiceEnabled 
            ? 'bg-cyber-red/20 border-cyber-red text-cyber-red animate-pulse' 
            : 'bg-cyber-dark border-gray-600 text-gray-400 hover:border-gray-500'
        }`}
        title="Voice Control - Say 'Hey Pulse'"
      >
        <Mic className="w-4 h-4" />
        <span className="text-sm font-medium">Voice</span>
      </button>

      {/* Bookmarks */}
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-cyber-dark border border-gray-600">
        <Bookmark className="w-4 h-4 text-cyber-yellow" />
        <span className="text-sm font-medium text-gray-300">
          {bookmarkCount} Saved
        </span>
      </div>

      {/* Filter Indicator */}
      <div className="ml-auto flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">
          {tldrMode ? 'Summaries' : 'Full Articles'} • 
          {speedReadMode ? ' Speed Mode' : ''} 
          {zenMode ? ' • Zen' : ''}
        </span>
      </div>
    </motion.div>
  )
}

// Zen Mode Overlay Component
export function ZenModeOverlay({ 
  article, 
  onClose 
}: { 
  article: any
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-cyber-darker flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-3xl w-full max-h-[80vh] overflow-y-auto bg-cyber-dark p-8 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="float-right text-gray-500 hover:text-gray-300"
        >
          <EyeOff className="w-6 h-6" />
        </button>

        <h1 className="text-3xl font-bold mb-4 text-gray-100">
          {article.title}
        </h1>

        <div className="flex items-center space-x-4 mb-6 text-sm text-gray-400">
          <span>{article.source.name}</span>
          <span>•</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>

        {article.urlToImage && (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-200">
            {article.description}
          </p>
          
          {article.content && (
            <div className="mt-6 text-gray-300 leading-relaxed">
              {article.content}
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-cyber-blue/20">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-blue hover:text-cyber-blue/80"
          >
            Read full article on {article.source.name} →
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
