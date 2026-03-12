'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Eye, Type, Monitor } from 'lucide-react'

interface NightModeConfig {
  enabled: boolean
  sepia: boolean
  fontSize: 'small' | 'normal' | 'large'
  contrast: 'normal' | 'high'
}

export function useNightMode() {
  const [config, setConfig] = useState<NightModeConfig>({
    enabled: false,
    sepia: false,
    fontSize: 'normal',
    contrast: 'normal'
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('nightModeConfig')
        if (saved) {
          setConfig(JSON.parse(saved))
        }
      }
    } catch (e) {
      console.error('Error loading night mode config:', e)
    }
  }, [])

  const updateConfig = (updates: Partial<NightModeConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('nightModeConfig', JSON.stringify(newConfig))
      }
    } catch (e) {
      console.error('Error saving night mode config:', e)
    }
  }

  const toggleNightMode = () => updateConfig({ enabled: !config.enabled })

  return { config, updateConfig, toggleNightMode }
}

export function NightModeToggle() {
  const { config, toggleNightMode } = useNightMode()

  return (
    <motion.button
      onClick={toggleNightMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-full transition-all ${
        config.enabled 
          ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400' 
          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-yellow-400'
      }`}
      title={config.enabled ? 'Disable Night Mode' : 'Enable Night Mode'}
    >
      {config.enabled ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </motion.button>
  )
}

export function NightModeSettings({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const { config, updateConfig } = useNightMode()

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
          <h2 className="text-xl font-bold text-white mb-6">Reading Preferences</h2>
          
          {/* Night Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="font-medium text-white">Night Mode</p>
                <p className="text-xs text-gray-500">Easier on the eyes in dark environments</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ enabled: !config.enabled })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.enabled ? 'bg-indigo-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: config.enabled ? 24 : 4 }}
                className="w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Sepia Mode */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-white">Sepia Mode</p>
                <p className="text-xs text-gray-500">Warm tone for comfortable reading</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ sepia: !config.sepia })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.sepia ? 'bg-amber-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: config.sepia ? 24 : 4 }}
                className="w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Font Size */}
          <div className="p-4 bg-white/5 rounded-xl mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Type className="w-5 h-5 text-cyber-blue" />
              <p className="font-medium text-white">Font Size</p>
            </div>
            <div className="flex gap-2">
              {(['small', 'normal', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateConfig({ fontSize: size })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.fontSize === size
                      ? 'bg-cyber-blue text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium text-white">High Contrast</p>
                <p className="text-xs text-gray-500">Better visibility for accessibility</p>
              </div>
            </div>
            <button
              onClick={() => updateConfig({ contrast: config.contrast === 'high' ? 'normal' : 'high' })}
              className={`w-12 h-6 rounded-full transition-all ${
                config.contrast === 'high' ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: config.contrast === 'high' ? 24 : 4 }}
                className="w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function applyNightModeStyles(config: NightModeConfig): string {
  if (!config.enabled) return ''
  
  let styles = 'bg-gray-950 text-gray-200 '
  
  if (config.sepia) {
    styles += 'sepia-[.3] '
  }
  
  if (config.contrast === 'high') {
    styles += 'contrast-125 '
  }
  
  switch (config.fontSize) {
    case 'small':
      styles += 'text-sm '
      break
    case 'large':
      styles += 'text-lg '
      break
    default:
      styles += 'text-base '
  }
  
  return styles
}
