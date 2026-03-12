'use client'

import { motion } from 'framer-motion'
import { Clock, BookOpen } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface ReadingTimeProps {
  article: NewsArticle
  showIcon?: boolean
  className?: string
}

export function calculateReadingTime(content: string | null): number {
  if (!content) return 1
  
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  
  return Math.max(1, minutes)
}

export default function ReadingTime({ article, showIcon = true, className = '' }: ReadingTimeProps) {
  const minutes = calculateReadingTime(article.content || article.description)
  
  // Determine reading difficulty
  const getDifficulty = (mins: number) => {
    if (mins <= 2) return { label: 'Quick read', color: 'text-green-400' }
    if (mins <= 5) return { label: 'Standard', color: 'text-blue-400' }
    if (mins <= 10) return { label: 'Deep dive', color: 'text-yellow-400' }
    return { label: 'Long read', color: 'text-red-400' }
  }
  
  const difficulty = getDifficulty(minutes)
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showIcon && <BookOpen className="w-3.5 h-3.5 text-gray-400" />}
      <span className="text-xs text-gray-400">
        {minutes} min read
      </span>
      <span className={`text-xs ${difficulty.color}`}>
        • {difficulty.label}
      </span>
    </div>
  )
}

export function DetailedReadingStats({ article }: { article: NewsArticle }) {
  const minutes = calculateReadingTime(article.content || article.description)
  const wordCount = (article.content || article.description || '').trim().split(/\s+/).length
  
  // Reading speeds for different types
  const readingSpeeds = {
    slow: 150,    // Careful reading
    average: 200, // Normal reading
    fast: 300,    // Skimming
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyber-blue" />
        Reading Stats
      </h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Word count</span>
          <span className="text-gray-300">{wordCount.toLocaleString()} words</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Est. reading time</span>
          <span className="text-gray-300">{minutes} minutes</span>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Reading speed estimates:</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Careful reading</span>
              <span className="text-gray-300">
                {Math.ceil(wordCount / readingSpeeds.slow)} min
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Normal reading</span>
              <span className="text-cyber-blue">
                {Math.ceil(wordCount / readingSpeeds.average)} min
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Skimming</span>
              <span className="text-gray-300">
                {Math.ceil(wordCount / readingSpeeds.fast)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
