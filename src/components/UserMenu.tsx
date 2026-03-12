'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, LogIn, Settings, Bookmark, BarChart3 } from 'lucide-react'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full bg-cyber-dark border border-cyber-blue/30 animate-pulse" />
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => router.push('/auth/signin')}
        className="flex items-center space-x-2 px-4 py-2 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg text-cyber-blue hover:bg-cyber-blue/20 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-cyber-dark/50 transition-colors"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-cyber-blue/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-cyber-blue/20 border border-cyber-blue/50 flex items-center justify-center">
            <User className="w-4 h-4 text-cyber-blue" />
          </div>
        )}
        <span className="text-sm text-gray-300 hidden sm:block">{session.user?.name}</span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-56 bg-cyber-dark border border-cyber-blue/30 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-700">
              <p className="text-sm font-medium text-gray-200">{session.user?.name}</p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setShowMenu(false)
                  // Open bookmarks
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
              >
                <Bookmark className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Bookmarks</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false)
                  // Open analytics
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
              >
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Reading Stats</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false)
                  // Open settings
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-cyber-blue/10 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Settings</span>
              </button>
            </div>

            <div className="p-2 border-t border-gray-700">
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded hover:bg-red-500/10 transition-colors text-left text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
