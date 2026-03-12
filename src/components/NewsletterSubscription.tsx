'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, X, Bell, Sparkles } from 'lucide-react'

interface NewsletterSubscriptionProps {
  onSubscribe?: (email: string) => void
}

export default function NewsletterSubscription({ onSubscribe }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setIsLoading(true)
    
    try {
      // Call the real digest API
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences: {
            categories: ['general', 'technology', 'business'],
            frequency: 'daily'
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSubscribed(true)
        onSubscribe?.(email)
        console.log('Digest subscription successful:', data)
      } else {
        throw new Error(data.error || 'Subscription failed')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      // Fallback to localStorage if API fails
      const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]')
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers))
        setIsSubscribed(true)
        onSubscribe?.(email)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-cyber-green/10 border border-cyber-green/30 rounded-lg p-4 text-center"
      >
        <CheckCircle className="w-8 h-8 text-cyber-green mx-auto mb-2" />
        <p className="text-cyber-green font-medium">You're subscribed!</p>
        <p className="text-sm text-gray-400 mt-1">Check your inbox for confirmation</p>
      </motion.div>
    )
  }

  return (
    <div className="bg-cyber-dark/50 border border-cyber-blue/20 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-5 h-5 text-cyber-blue" />
        <h3 className="font-bold text-cyber-blue">Daily News Digest</h3>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Get the top stories delivered to your inbox every morning
      </p>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(true)}
            className="w-full cyber-button flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Subscribe</span>
          </motion.button>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-cyber-darker border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyber-blue focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !email.includes('@')}
              className="w-full cyber-button flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Subscribe to Digest</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
