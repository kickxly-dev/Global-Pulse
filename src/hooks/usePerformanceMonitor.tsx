'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Clock, Zap, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  status: 'good' | 'warning' | 'error'
}

interface PerformanceStats {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
  fps: number
}

const PERFORMANCE_THRESHOLDS = {
  pageLoadTime: { good: 2000, warning: 4000 },
  apiResponseTime: { good: 500, warning: 1000 },
  renderTime: { good: 100, warning: 200 },
  memoryUsage: { good: 50, warning: 80 },
  fps: { good: 55, warning: 30 },
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Measure page load time
    if (typeof window !== 'undefined' && window.performance) {
      const timing = window.performance.timing
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart

      addMetric('pageLoadTime', pageLoadTime, 'ms')
    }

    // Measure FPS
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime))
        addMetric('fps', fps, 'fps')
        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    animationId = requestAnimationFrame(measureFPS)

    return () => cancelAnimationFrame(animationId)
  }, [])

  const addMetric = useCallback((name: string, value: number, unit: string) => {
    const thresholds = PERFORMANCE_THRESHOLDS[name as keyof typeof PERFORMANCE_THRESHOLDS]
    let status: 'good' | 'warning' | 'error' = 'good'

    if (thresholds) {
      if (value > thresholds.warning) {
        status = 'error'
      } else if (value > thresholds.good) {
        status = 'warning'
      }
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      status,
    }

    setMetrics(prev => {
      const newMetrics = [...prev.filter(m => m.name !== name), metric]
      return newMetrics
    })
  }, [])

  const measureAPICall = useCallback(async <T,>(
    name: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fetchFn()
      const duration = performance.now() - start
      addMetric('apiResponseTime', Math.round(duration), 'ms')
      return result
    } catch (error) {
      const duration = performance.now() - start
      addMetric('apiResponseTime', Math.round(duration), 'ms')
      throw error
    }
  }, [addMetric])

  const measureRender = useCallback((componentName: string, renderFn: () => void) => {
    const start = performance.now()
    renderFn()
    const duration = performance.now() - start
    addMetric('renderTime', Math.round(duration), 'ms')
  }, [addMetric])

  const getOverallStatus = useCallback((): 'good' | 'warning' | 'error' => {
    const hasError = metrics.some(m => m.status === 'error')
    const hasWarning = metrics.some(m => m.status === 'warning')

    if (hasError) return 'error'
    if (hasWarning) return 'warning'
    return 'good'
  }, [metrics])

  return {
    metrics,
    isLoaded,
    addMetric,
    measureAPICall,
    measureRender,
    getOverallStatus,
  }
}

// Performance Display Component
export function PerformanceMonitor({ show = false }: { show?: boolean }) {
  const { metrics, getOverallStatus } = usePerformanceMonitor()
  const overallStatus = getOverallStatus()

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-cyber-dark border border-gray-700 rounded-lg p-4 shadow-xl z-50"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Activity className={`w-5 h-5 ${
          overallStatus === 'good' ? 'text-cyber-green' :
          overallStatus === 'warning' ? 'text-cyber-yellow' : 'text-cyber-red'
        }`} />
        <span className="font-bold text-white">Performance</span>
      </div>

      <div className="space-y-2">
        {metrics.map(metric => (
          <div key={metric.name} className="flex items-center justify-between text-sm">
            <span className="text-gray-400 capitalize">{metric.name.replace(/([A-Z])/g, ' $1')}</span>
            <span className={`font-mono ${
              metric.status === 'good' ? 'text-cyber-green' :
              metric.status === 'warning' ? 'text-cyber-yellow' : 'text-cyber-red'
            }`}>
              {metric.value}{metric.unit}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
