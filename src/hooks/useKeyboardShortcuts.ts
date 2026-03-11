import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface ShortcutCallbacks {
  onRefresh?: () => void
  onSearch?: () => void
  onToggleMap?: () => void
  onToggleSettings?: () => void
  onNextCategory?: () => void
  onPrevCategory?: () => void
  onToggleTheme?: () => void
  onToggleNotifications?: () => void
}

export function useKeyboardShortcuts(callbacks: ShortcutCallbacks) {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    // Command/Ctrl based shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch(event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          callbacks.onSearch?.()
          toast.info('Search activated (Ctrl+K)')
          break
        case 'r':
          event.preventDefault()
          callbacks.onRefresh?.()
          toast.success('Refreshing news...')
          break
        case 'm':
          event.preventDefault()
          callbacks.onToggleMap?.()
          toast.info('Map toggled (Ctrl+M)')
          break
        case ',':
          event.preventDefault()
          callbacks.onToggleSettings?.()
          toast.info('Settings toggled (Ctrl+,)')
          break
        case 't':
          event.preventDefault()
          callbacks.onToggleTheme?.()
          toast.info('Theme switched (Ctrl+T)')
          break
      }
    }
    
    // Single key shortcuts (no modifier)
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      switch(event.key.toLowerCase()) {
        case 'r':
          callbacks.onRefresh?.()
          break
        case 'm':
          callbacks.onToggleMap?.()
          break
        case 's':
          callbacks.onSearch?.()
          break
        case 'n':
          callbacks.onToggleNotifications?.()
          break
        case 'arrowleft':
        case 'a':
          callbacks.onPrevCategory?.()
          toast.info('← Previous category')
          break
        case 'arrowright':
        case 'd':
          callbacks.onNextCategory?.()
          toast.info('Next category →')
          break
        case '?':
          showShortcutsHelp()
          break
      }
    }
  }, [callbacks])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const showShortcutsHelp = () => {
    toast.message('⌨️ Keyboard Shortcuts', {
      description: `
        Ctrl+K: Search
        Ctrl+R: Refresh news
        Ctrl+M: Toggle map
        Ctrl+,: Settings
        Ctrl+T: Switch theme
        R: Quick refresh
        M: Toggle map
        S: Focus search
        N: Toggle notifications
        A/←: Previous category
        D/→: Next category
        ?: Show this help
      `,
      duration: 10000,
    })
  }

  return { showShortcutsHelp }
}
