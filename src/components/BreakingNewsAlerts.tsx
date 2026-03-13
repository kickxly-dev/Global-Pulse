'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Zap, AlertTriangle, CheckCircle, Info, Volume2, VolumeX, Settings } from 'lucide-react'

interface Alert {
  id: string
  type: 'breaking' | 'urgent' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

interface BreakingNewsAlertsProps {
  onAlertClick?: (alert: Alert) => void
}

export default function BreakingNewsAlerts({ onAlertClick }: BreakingNewsAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Simulate real-time alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'breaking',
        title: 'Breaking: Major Climate Agreement Reached',
        message: 'World leaders announce historic carbon reduction deal at UN summit',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'urgent',
        title: 'Market Alert: Tech Stocks Surge',
        message: 'Major technology stocks hit record highs in early trading',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'info',
        title: 'Space Launch Today',
        message: 'SpaceX scheduled to launch Starship prototype at 2 PM EST',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: true,
        priority: 'medium'
      }
    ]

    setAlerts(mockAlerts)

    // Simulate new alert every 30 seconds
    const interval = setInterval(() => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'breaking' : 'info',
        title: 'Latest Update',
        message: 'New breaking news story developing...',
        timestamp: new Date().toISOString(),
        read: false,
        priority: Math.random() > 0.5 ? 'high' : 'medium'
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
      
      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio('/sounds/alert.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [soundEnabled])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'breaking': return Zap
      case 'urgent': return AlertTriangle
      case 'success': return CheckCircle
      default: return Info
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'breaking': return 'from-red-500 to-orange-500'
      case 'urgent': return 'from-amber-500 to-red-500'
      case 'success': return 'from-emerald-500 to-green-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500'
      case 'medium': return 'border-l-4 border-l-amber-500'
      default: return 'border-l-4 border-l-blue-500'
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const clearAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const clearAllRead = () => {
    setAlerts(prev => prev.filter(alert => !alert.read))
  }

  const unreadCount = alerts.filter(alert => !alert.read).length

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-20 right-4 z-50 w-80 max-h-[600px] bg-black/95 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold">Breaking Alerts</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-white/10 bg-white/[0.02] p-4"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Sound alerts</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Breaking news only</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Desktop notifications</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alerts List */}
          <div className="max-h-[400px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type)
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${getPriorityBorder(alert.priority)} ${
                        !alert.read ? 'bg-white/[0.05]' : ''
                      }`}
                      onClick={() => {
                        markAsRead(alert.id)
                        onAlertClick?.(alert)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getAlertColor(alert.type)}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-white/60 line-clamp-2 mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                clearAlert(alert.id)
                              }}
                              className="text-xs text-white/40 hover:text-red-400 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <button
                onClick={clearAllRead}
                className="w-full text-xs text-white/40 hover:text-white transition-colors"
              >
                Clear all read alerts
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
