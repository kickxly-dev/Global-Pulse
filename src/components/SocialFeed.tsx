'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Share2, Bookmark, TrendingUp, Users, Eye, ThumbsUp, Reply, MoreHorizontal } from 'lucide-react'

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    verified: boolean
  }
  content: string
  timestamp: string
  likes: number
  replies: number
  isLiked: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface SocialFeedProps {
  article: {
    id: string
    title: string
    source: string
    url: string
    image?: string
  }
}

export default function SocialFeed({ article }: SocialFeedProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [showReplies, setShowReplies] = useState<string[]>([])

  useEffect(() => {
    // Simulate fetching comments
    const mockComments: Comment[] = [
      {
        id: '1',
        user: {
          name: 'Sarah Chen',
          avatar: '👩‍💼',
          verified: true
        },
        content: 'This is exactly what I\'ve been following. The implications for the industry are massive!',
        timestamp: '2 minutes ago',
        likes: 42,
        replies: 8,
        isLiked: false,
        sentiment: 'positive'
      },
      {
        id: '2',
        user: {
          name: 'Mike Johnson',
          avatar: '👨‍💻',
          verified: false
        },
        content: 'Interesting perspective, but I think we need to consider the economic impact more carefully.',
        timestamp: '15 minutes ago',
        likes: 28,
        replies: 12,
        isLiked: true,
        sentiment: 'neutral'
      },
      {
        id: '3',
        user: {
          name: 'Emma Wilson',
          avatar: '👩‍🔬',
          verified: true
        },
        content: 'As someone working in this field, I can confirm this is a significant development.',
        timestamp: '1 hour ago',
        likes: 156,
        replies: 23,
        isLiked: false,
        sentiment: 'positive'
      },
      {
        id: '4',
        user: {
          name: 'Alex Kumar',
          avatar: '👨‍🎓',
          verified: false
        },
        content: 'I\'m skeptical about the timeline. These things usually take much longer to implement.',
        timestamp: '2 hours ago',
        likes: 19,
        replies: 31,
        isLiked: false,
        sentiment: 'negative'
      }
    ]

    setTimeout(() => {
      setComments(mockComments)
      setLoading(false)
    }, 800)
  }, [article.id])

  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ))
  }

  const handleComment = () => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: '👤',
        verified: false
      },
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
      isLiked: false,
      sentiment: 'neutral'
    }
    
    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20'
      case 'negative': return 'bg-red-500/20'
      default: return 'bg-yellow-500/20'
    }
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold">Community Discussion</h3>
          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
            {comments.length} comments
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">Trending</span>
        </div>
      </div>

      {/* Article Context */}
      <div className="p-3 bg-white/5 rounded-lg mb-4">
        <h4 className="font-medium text-sm mb-1">{article.title}</h4>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>{article.source}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {Math.floor(Math.random() * 10000 + 1000).toLocaleString()} views
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {Math.floor(Math.random() * 500 + 100)} discussing
          </span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="text-2xl">👤</div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm resize-none focus:outline-none focus:border-cyan-500/30 transition-colors"
              rows={2}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="text-xs text-white/40 hover:text-white transition-colors">
                  😊
                </button>
                <button className="text-xs text-white/40 hover:text-white transition-colors">
                  🎯
                </button>
                <button className="text-xs text-white/40 hover:text-white transition-colors">
                  💡
                </button>
              </div>
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="px-3 py-1.5 bg-cyan-500 text-black text-xs font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="h-3 bg-white/10 rounded w-1/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-full mb-1" />
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: parseInt(comment.id) * 0.05 }}
              className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{comment.user.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.user.name}</span>
                    {comment.user.verified && (
                      <span className="text-xs text-cyan-400">✓</span>
                    )}
                    <span className="text-xs text-white/40">{comment.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getSentimentBg(comment.sentiment)} ${getSentimentColor(comment.sentiment)}`}>
                      {comment.sentiment}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-3">{comment.content}</p>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.isLiked ? 'text-red-400' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likes}
                    </button>
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      {comment.replies}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
                      <Share2 className="w-3 h-3" />
                      Share
                    </button>
                    <button className="text-xs text-white/40 hover:text-white transition-colors">
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Replies */}
                  <AnimatePresence>
                    {showReplies.includes(comment.id) && comment.replies > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pl-4 border-l border-white/10"
                      >
                        <div className="text-xs text-white/40 italic">
                          {comment.replies} replies hidden
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
