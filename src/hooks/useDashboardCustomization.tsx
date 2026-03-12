'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, X, Settings, RotateCcw } from 'lucide-react'

export interface DashboardWidget {
  id: string
  name: string
  enabled: boolean
  order: number
  size: 'small' | 'medium' | 'large'
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'news-feed', name: 'News Feed', enabled: true, order: 0, size: 'large' },
  { id: 'map', name: 'World Map', enabled: true, order: 1, size: 'medium' },
  { id: 'pulse-score', name: 'Pulse Score', enabled: true, order: 2, size: 'small' },
  { id: 'trending', name: 'Trending Topics', enabled: true, order: 3, size: 'small' },
  { id: 'predictions', name: 'AI Predictions', enabled: true, order: 4, size: 'small' },
  { id: 'analytics', name: 'Reading Stats', enabled: false, order: 5, size: 'medium' },
  { id: 'bookmarks', name: 'Bookmarks', enabled: false, order: 6, size: 'small' },
  { id: 'newsletter', name: 'Newsletter', enabled: false, order: 7, size: 'small' },
]

const STORAGE_KEY = 'dashboardWidgets'

export function useDashboardCustomization() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Merge with defaults to handle new widgets
        const merged = DEFAULT_WIDGETS.map(defaultWidget => {
          const savedWidget = data.find((w: DashboardWidget) => w.id === defaultWidget.id)
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget
        })
        setWidgets(merged)
      } catch (e) {
        console.error('Failed to load dashboard config:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets))
  }, [])

  const toggleWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const newWidgets = prev.map(w =>
        w.id === id ? { ...w, enabled: !w.enabled } : w
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets))
      return newWidgets
    })
  }, [])

  const reorderWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      const newWidgets = [...prev]
      const [removed] = newWidgets.splice(fromIndex, 1)
      newWidgets.splice(toIndex, 0, removed)
      const reordered = newWidgets.map((w, i) => ({ ...w, order: i }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered))
      return reordered
    })
  }, [])

  const setWidgetSize = useCallback((id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev => {
      const newWidgets = prev.map(w =>
        w.id === id ? { ...w, size } : w
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets))
      return newWidgets
    })
  }, [])

  const resetToDefaults = useCallback(() => {
    saveWidgets(DEFAULT_WIDGETS)
  }, [saveWidgets])

  const getEnabledWidgets = useCallback(() => {
    return widgets.filter(w => w.enabled).sort((a, b) => a.order - b.order)
  }, [widgets])

  return {
    widgets,
    isLoaded,
    toggleWidget,
    reorderWidgets,
    setWidgetSize,
    resetToDefaults,
    getEnabledWidgets,
  }
}

// UI Component for customization panel
export function DashboardCustomizer({
  widgets,
  onToggle,
  onReorder,
  onReset,
  onClose,
}: {
  widgets: DashboardWidget[]
  onToggle: (id: string) => void
  onReorder: (from: number, to: number) => void
  onReset: () => void
  onClose: () => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-cyber-dark border border-cyber-blue/30 rounded-lg p-4 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyber-blue" />
          <h3 className="font-bold text-cyber-blue">Customize Dashboard</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Drag to reorder, click to toggle visibility
      </p>

      <div className="space-y-2">
        {widgets.sort((a, b) => a.order - b.order).map((widget, index) => (
          <div
            key={widget.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) {
                onReorder(dragIndex, index)
              }
              setDragIndex(null)
            }}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-move ${
              widget.enabled
                ? 'bg-cyber-blue/10 border-cyber-blue/30'
                : 'bg-gray-800/50 border-gray-700'
            } ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
            <span className={`flex-1 ${widget.enabled ? 'text-white' : 'text-gray-500'}`}>
              {widget.name}
            </span>
            <button
              onClick={() => onToggle(widget.id)}
              className={`px-3 py-1 rounded text-xs ${
                widget.enabled
                  ? 'bg-cyber-blue/20 text-cyber-blue'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {widget.enabled ? 'On' : 'Off'}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset to Defaults</span>
      </button>
    </motion.div>
  )
}
