import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseAutoRefreshOptions {
  interval?: number
  enabled?: boolean
  onRefresh: () => Promise<void>
  notifyOnNewContent?: boolean
}

export function useAutoRefresh({
  interval = 60000,
  enabled = true,
  onRefresh,
  notifyOnNewContent = true,
}: UseAutoRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [newContentCount, setNewContentCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousCountRef = useRef<number>(0)

  const refresh = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
      setLastRefresh(new Date())
      
      if (notifyOnNewContent && newContentCount > 0) {
        toast.success(`${newContentCount} new articles`, {
          description: 'Fresh news just dropped!',
        })
      }
    } catch (error) {
      console.error('Auto-refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing, notifyOnNewContent, newContentCount])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      refresh()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, refresh])

  const startAutoRefresh = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(refresh, interval)
    }
  }

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const manualRefresh = async () => {
    await refresh()
  }

  return {
    isRefreshing,
    lastRefresh,
    newContentCount,
    setNewContentCount,
    manualRefresh,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
