'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, X, Link2, Twitter, Facebook, Linkedin, Mail, Check } from 'lucide-react'
import { NewsArticle } from '@/types/news'

interface ShareModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ article, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !article) return null

  const shareUrl = article.url || typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this article: ${article.title}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Link2,
      action: handleCopyLink,
      color: 'bg-gray-600',
      label: copied ? 'Copied!' : 'Copy Link',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
      },
      color: 'bg-blue-500',
      label: 'Twitter',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
      },
      color: 'bg-blue-600',
      label: 'Facebook',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
      },
      color: 'bg-blue-700',
      label: 'LinkedIn',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(article.title)
        const body = encodeURIComponent(`Check out this article: ${shareUrl}`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`
      },
      color: 'bg-red-500',
      label: 'Email',
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Article
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-white font-medium line-clamp-2">{article.title}</p>
            <p className="text-gray-400 text-sm mt-1">{article.source.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className={`flex items-center gap-3 p-3 rounded-xl ${option.color}/20 hover:${option.color}/30 border border-${option.color}/30 transition-all group`}
              >
                <option.icon className={`w-5 h-5 ${option.color.replace('bg-', 'text-')}`} />
                <span className="text-white text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
