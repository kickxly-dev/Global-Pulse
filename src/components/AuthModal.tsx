'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: { id: string; email: string; name: string }) => void
}

export default function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/users' : '/api/users'
      const method = mode === 'login' ? 'PUT' : 'POST'
      
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, name }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('userToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onAuth(data.user)
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
        onClose()
      } else {
        toast.error(data.error || 'Authentication failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  {mode === 'login' 
                    ? 'Sign in to access your personalized feed' 
                    : 'Join Global Pulse for a personalized experience'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-white/60 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-black text-white/40">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="w-full py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-colors"
              >
                {mode === 'login' ? 'Create new account' : 'Sign in instead'}
              </button>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-xs text-white/30 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
