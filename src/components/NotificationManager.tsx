'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationManager() {
  const { sendNotification } = useNotifications()

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event: CustomEvent) => {
      const { title, body, url } = event.detail
      sendNotification(title, {
        body,
        tag: 'news-update',
        data: { url },
      })
    }

    window.addEventListener('send-notification' as any, handleNotification as any)

    return () => {
      window.removeEventListener('send-notification' as any, handleNotification as any)
    }
  }, [sendNotification])

  return null
}
