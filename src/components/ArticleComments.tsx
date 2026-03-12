'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ThumbsUp, Trash2, User, Clock } from 'lucide-react'
import { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  articleId: string
  author: string
  content: string
  timestamp: number
  likes: number
  replies: Comment[]
}

interface ArticleCommentsProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

export default function ArticleComments({ article, isOpen, onClose }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    if (article && isOpen) {
      loadComments(article.id)
    }
  }, [article, isOpen])

  const loadComments = (articleId: string) => {
    try {
      const saved = localStorage.getItem(`comments_${articleId}`)
      if (saved) {
        setComments(JSON.parse(saved))
      } else {
        setComments([])
      }
    } catch (e) {
      console.error('Failed to load comments:', e)
      setComments([])
    }
  }

  const saveComments = (articleId: string, newComments: Comment[]) => {
    try {
      localStorage.setItem(`comments_${articleId}`, JSON.stringify(newComments))
    } catch (e) {
      console.error('Failed to save comments:', e)
    }
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !article) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      articleId: article.id,
      author: authorName.trim() || 'Anonymous',
      content: newComment.trim(),
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    }

    const updated = [comment, ...comments]
    setComments(updated)
    saveComments(article.id, updated)
    setNewComment('')
  }

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim() || !article) return

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      articleId: article.id,
      author: authorName.trim() || 'Anonymous',
      content: replyContent.trim(),
      timestamp: Date.now(),
      likes: 0,
      replies: [],
    }

    const updated = comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...c.replies, reply] }
      }
      return c
    })

    setComments(updated)
    saveComments(article.id, updated)
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleLike = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 }
      }
      // Check replies
      if (c.replies.length > 0) {
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === commentId ? { ...r, likes: r.likes + 1 } : r
          )
        }
      }
      return c
    })

    setComments(updated)
    if (article) saveComments(article.id, updated)
  }

  const handleDelete = (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId).map(c => ({
      ...c,
      replies: c.replies.filter(r => r.id !== commentId)
    }))

    setComments(updated)
    if (article) saveComments(article.id, updated)
  }

  if (!isOpen || !article) return null

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
          className="w-full max-w-2xl max-h-[90vh] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyber-blue/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-cyber-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Comments</h3>
                <p className="text-sm text-gray-400">
                  {comments.length} comment{comments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comment Form */}
          <div className="p-4 border-b border-white/10 bg-gray-800/30">
            <form onSubmit={handleAddComment} className="space-y-3">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
              />
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  rows={2}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue resize-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-cyber-blue text-gray-900 rounded-lg font-medium hover:bg-cyber-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onReply={setReplyingTo}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={handleAddReply}
                  authorName={authorName}
                />
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function CommentItem({ 
  comment, 
  onLike, 
  onDelete, 
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  authorName,
}: {
  comment: Comment
  onLike: (id: string) => void
  onDelete: (id: string) => void
  onReply: (id: string | null) => void
  replyingTo: string | null
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: (id: string) => void
  authorName: string
}) {
  const isReplying = replyingTo === comment.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-white/5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{comment.author}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike(comment.id)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cyber-blue transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.likes || 'Like'}</span>
            </button>
            <button
              onClick={() => onReply(isReplying ? null : comment.id)}
              className="text-sm text-gray-400 hover:text-cyber-blue transition-colors"
            >
              Reply
            </button>
            {comment.author === (authorName || 'Anonymous') && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyber-blue"
                    autoFocus
                  />
                  <button
                    onClick={() => onSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="px-3 py-2 bg-cyber-blue text-gray-900 rounded-lg text-sm font-medium hover:bg-cyber-blue/80 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/10">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-white">{reply.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{reply.content}</p>
                  <button
                    onClick={() => onLike(reply.id)}
                    className="flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-cyber-blue transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{reply.likes || 'Like'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
