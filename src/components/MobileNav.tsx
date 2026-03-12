'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Home, Globe, TrendingUp, Settings, 
  Bell, Bookmark, User, Search, BarChart3
} from 'lucide-react'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenSearch: () => void
}

export default function MobileNav({ activeTab, onTabChange, onOpenSearch }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: Globe },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'bookmarks', label: 'Saved', icon: Bookmark },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cyber-dark/95 backdrop-blur-lg border-t border-cyber-blue/30 z-40 sm:hidden">
        <div className="flex items-center justify-around py-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center p-2 ${
                  isActive ? 'text-cyber-blue' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 w-12 h-0.5 bg-cyber-blue"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-cyber-dark/95 backdrop-blur-lg border-b border-cyber-blue/30 z-40 sm:hidden">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-6 h-6 text-cyber-blue" />
            <span className="text-lg font-bold font-cyber text-cyber-blue">Global Pulse</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSearch}
              className="p-2 text-gray-400 hover:text-cyber-blue transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-gray-400 hover:text-cyber-blue transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-cyber-dark border-l border-cyber-blue/30 z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold font-cyber text-cyber-blue">Menu</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id)
                          setIsOpen(false)
                        }}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/50' 
                            : 'text-gray-300 hover:bg-cyber-dark/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
                  <div className="space-y-2">
                    <button className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-cyber-dark/50 transition-colors">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-cyber-dark/50 transition-colors">
                      <User className="w-5 h-5" />
                      <span>Account</span>
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    Global Pulse v1.0.0
                  </p>
                  <p className="text-xs text-gray-600 text-center mt-1">
                    Hear the World
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-14 sm:hidden" />
    </>
  )
}
