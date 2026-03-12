'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Heart, Flame, Lightbulb, MessageCircle } from 'lucide-react'

export type ReactionType = 'like' | 'dislike' | 'love' | 'fire' | 'idea' | 'comment'

interface Reaction {
  type: ReactionType
  count: number
  userReacted: boolean
}

interface ArticleReactionsProps {
  articleId: string
  onReaction?: (type: ReactionType) => void
}

const REACTION_CONFIG: Record<ReactionType, { icon: any; label: string; color: string }> = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-400' },
  dislike: { icon: ThumbsDown, label: 'Dislike', color: 'text-gray-400' },
  love: { icon: Heart, label: 'Love', color: 'text-pink-400' },
  fire: { icon: Flame, label: 'Hot', color: 'text-orange-400' },
  idea: { icon: Lightbulb, label: 'Insightful', color: 'text-yellow-400' },
  comment: { icon: MessageCircle, label: 'Discuss', color: 'text-cyber-blue' },
}

const STORAGE_KEY = 'articleReactions'

export default function ArticleReactions({ articleId, onReaction }: ArticleReactionsProps) {
  const [reactions, setReactions] = useState<Record<ReactionType, Reaction>>({
    like: { type: 'like', count: 0, userReacted: false },
    dislike: { type: 'dislike', count: 0, userReacted: false },
    love: { type: 'love', count: 0, userReacted: false },
    fire: { type: 'fire', count: 0, userReacted: false },
    idea: { type: 'idea', count: 0, userReacted: false },
    comment: { type: 'comment', count: 0, userReacted: false },
  })
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${articleId}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setReactions(data.reactions || reactions)
      } catch (e) {
        console.error('Failed to load reactions:', e)
      }
    }
  }, [articleId])

  const handleReaction = (type: ReactionType) => {
    setReactions(prev => {
      const newReactions = { ...prev }
      
      // Toggle reaction
      if (newReactions[type].userReacted) {
        newReactions[type] = {
          ...newReactions[type],
          count: newReactions[type].count - 1,
          userReacted: false,
        }
      } else {
        newReactions[type] = {
          ...newReactions[type],
          count: newReactions[type].count + 1,
          userReacted: true,
        }
      }
      
      localStorage.setItem(`${STORAGE_KEY}_${articleId}`, JSON.stringify({ reactions: newReactions }))
      return newReactions
    })
    
    onReaction?.(type)
  }

  return (
    <div className="flex items-center space-x-2">
      {(Object.entries(REACTION_CONFIG) as [ReactionType, typeof REACTION_CONFIG[ReactionType]][]).map(([type, config]) => {
        const Icon = config.icon
        const reaction = reactions[type]
        
        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReaction(type)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${
              reaction.userReacted
                ? `${config.color} bg-current/10 border-current`
                : 'text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            <Icon className="w-4 h-4" />
            {reaction.count > 0 && (
              <span className="text-xs font-medium">{reaction.count}</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
