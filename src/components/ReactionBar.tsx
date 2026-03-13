'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Flame, Zap, Frown, ThumbsUp, Angry, Laugh, AlertCircle } from 'lucide-react'

interface ReactionBarProps {
  articleId: string
  initialReactions?: {
    heart: number
    fire: number
    shocked: number
    sad: number
    angry: number
    laugh: number
  }
}

const reactions = [
  { id: 'heart', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Love' },
  { id: 'fire', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Fire' },
  { id: 'shocked', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Shocked' },
  { id: 'sad', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Sad' },
  { id: 'angry', icon: Angry, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Angry' },
  { id: 'laugh', icon: Laugh, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Funny' },
]

export default function ReactionBar({ articleId, initialReactions }: ReactionBarProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [counts, setCounts] = useState(initialReactions || {
    heart: Math.floor(Math.random() * 500),
    fire: Math.floor(Math.random() * 300),
    shocked: Math.floor(Math.random() * 200),
    sad: Math.floor(Math.random() * 150),
    angry: Math.floor(Math.random() * 100),
    laugh: Math.floor(Math.random() * 250),
  })

  const handleReaction = (reactionId: string) => {
    if (selectedReaction === reactionId) {
      setSelectedReaction(null)
      setCounts(prev => ({ ...prev, [reactionId]: prev[reactionId as keyof typeof prev] - 1 }))
    } else {
      if (selectedReaction) {
        setCounts(prev => ({ ...prev, [selectedReaction]: prev[selectedReaction as keyof typeof prev] - 1 }))
      }
      setSelectedReaction(reactionId)
      setCounts(prev => ({ ...prev, [reactionId]: prev[reactionId as keyof typeof prev] + 1 }))
    }
  }

  const visibleReactions = showAll ? reactions : reactions.slice(0, 3)
  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {visibleReactions.map((reaction) => {
          const Icon = reaction.icon
          const isSelected = selectedReaction === reaction.id
          const count = counts[reaction.id as keyof typeof counts]
          
          return (
            <motion.button
              key={reaction.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(reaction.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                isSelected 
                  ? `${reaction.bg} ${reaction.color} ring-1 ring-current` 
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{count}</span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white"
                />
              )}
            </motion.button>
          )
        })}
      </AnimatePresence>
      
      {!showAll && reactions.length > 3 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/5 text-white/40 hover:bg-white/10 text-xs"
        >
          +{reactions.length - 3}
        </motion.button>
      )}
      
      <div className="ml-2 text-xs text-white/30">
        {totalReactions.toLocaleString()} reactions
      </div>
    </div>
  )
}
