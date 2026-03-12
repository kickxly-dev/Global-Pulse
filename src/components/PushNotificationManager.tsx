'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Settings, X, Check } from 'lucide-react'

interface PushNotificationManagerProps {
  isOpen: boolean
  onClose: () => void
}

export default function PushNotificationManager({ isOpen, onClose }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      setIsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const requestPermission = async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        showNotificationToast('Notifications not supported in this browser')
        return
      }

      const result = await Notification.requestPermission()
      setPermission(result)
      setIsEnabled(result === 'granted')

      if (result === 'granted') {
        showNotificationToast('Push notifications enabled!')
        // Send a test notification
        new Notification('Global Pulse', {
          body: 'You will now receive breaking news alerts!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'welcome'
        })
      } else if (result === 'denied') {
        showNotificationToast('Please enable notifications in browser settings')
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e)
      showNotificationToast('Failed to enable notifications')
    }
  }

  const showNotificationToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isEnabled ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                {isEnabled ? (
                  <Bell className="w-6 h-6 text-green-400" />
                ) : (
                  <BellOff className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-sm text-gray-500">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Status Card */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-medium ${
                  permission === 'granted' ? 'text-green-400' :
                  permission === 'denied' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {permission === 'granted' ? 'Active' :
                   permission === 'denied' ? 'Blocked' :
                   'Not Set'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {permission === 'granted' 
                  ? 'You will receive breaking news alerts'
                  : 'Enable to get instant breaking news alerts'}
              </p>
            </div>

            {/* Enable/Disable Button */}
            <button
              onClick={requestPermission}
              disabled={permission === 'granted'}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                permission === 'granted'
                  ? 'bg-green-500/20 text-green-400 cursor-default'
                  : 'bg-cyber-blue hover:bg-cyber-blue/80 text-white'
              }`}
            >
              {permission === 'granted' ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Notifications Enabled
                </span>
              ) : permission === 'denied' ? (
                'Open Browser Settings'
              ) : (
                'Enable Push Notifications'
              )}
            </button>

            {/* Features List */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-sm font-medium text-white mb-3">You'll receive alerts for:</h3>
              <ul className="space-y-2">
                {[
                  'Breaking news stories',
                  'Major market movements',
                  'Technology announcements',
                  'Weather emergencies',
                  'Sports highlights'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="px-4 py-2 bg-gray-800 border border-white/10 rounded-full shadow-lg">
                <p className="text-sm text-white">{toastMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook to send notifications
export function usePushNotifications() {
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
    }
    return null
  }

  return { sendNotification }
}
