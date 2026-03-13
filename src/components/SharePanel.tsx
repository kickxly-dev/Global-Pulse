'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle, Mail, Check, X } from 'lucide-react'

interface SharePanelProps {
  article: {
    title: string
    url: string
    description?: string
    source?: { name: string }
  }
  onClose: () => void
}

const platforms = [
  { id: 'twitter', icon: Twitter, color: 'bg-[#1DA1F2]', label: 'Twitter' },
  { id: 'facebook', icon: Facebook, color: 'bg-[#4267B2]', label: 'Facebook' },
  { id: 'linkedin', icon: Linkedin, color: 'bg-[#0077B5]', label: 'LinkedIn' },
  { id: 'whatsapp', icon: MessageCircle, color: 'bg-[#25D366]', label: 'WhatsApp' },
  { id: 'email', icon: Mail, color: 'bg-gray-600', label: 'Email' },
]

export default function SharePanel({ article, onClose }: SharePanelProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = encodeURIComponent(article.url)
  const shareTitle = encodeURIComponent(article.title)
  const shareText = encodeURIComponent(article.description || '')

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    email: `mailto:?subject=${shareTitle}&body=${shareText}%0A%0A${shareUrl}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-black border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold">Share Article</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Preview */}
        <div className="p-4 bg-white/[0.02]">
          <h4 className="font-medium text-sm line-clamp-2 mb-1">{article.title}</h4>
          <p className="text-xs text-white/40">{article.source?.name}</p>
        </div>

        {/* Platform Grid */}
        <div className="p-4">
          <div className="grid grid-cols-5 gap-3 mb-4">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <motion.a
                  key={platform.id}
                  href={shareLinks[platform.id as keyof typeof shareLinks]}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${platform.color} hover:opacity-90 transition-opacity`}
                >
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-[10px] text-white/80">{platform.label}</span>
                </motion.a>
              )
            })}
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
            <Link2 className="w-4 h-4 text-white/40" />
            <input
              type="text"
              value={article.url}
              readOnly
              className="flex-1 bg-transparent text-sm text-white/60 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                'Copy'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
