import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        toast.success('Notifications enabled!')
        await subscribeToPush()
      } else {
        toast.error('Notification permission denied')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Failed to enable notifications')
    }
  }, [])

  const subscribeToPush = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return
      }

      const registration = await navigator.serviceWorker.ready
      
      // Check if already subscribed
      let sub = await registration.pushManager.getSubscription()
      
      if (!sub) {
        // Subscribe to push notifications
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        
        if (vapidPublicKey) {
          const uint8Array = urlBase64ToUint8Array(vapidPublicKey)
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: uint8Array.buffer as ArrayBuffer,
          })
        }
      }

      setSubscription(sub)
      
      // Save subscription to localStorage or send to server
      if (sub) {
        localStorage.setItem('pushSubscription', JSON.stringify(sub))
      }
    } catch (error) {
      console.error('Error subscribing to push:', error)
    }
  }, [])

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== 'granted') {
        return
      }

      // Check quiet hours
      const settings = JSON.parse(localStorage.getItem('userPreferences') || '{}')
      if (settings.quietHoursEnabled) {
        const now = new Date()
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        
        if (currentTime >= settings.quietHoursStart && currentTime <= settings.quietHoursEnd) {
          return // Don't send notification during quiet hours
        }
      }

      if ('serviceWorker' in navigator && subscription) {
        // Send through service worker for better reliability
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options,
          })
        })
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options,
        })
      }
    },
    [permission, subscription]
  )

  return {
    permission,
    subscription,
    requestPermission,
    sendNotification,
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
