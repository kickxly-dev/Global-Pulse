import { useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'cyber'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('cyber')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('cyber')
    }
  }, [])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'cyber')
    
    // Apply new theme
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--primary-bg', '#0a0a0a')
      root.style.setProperty('--primary-text', '#ffffff')
      root.style.setProperty('--accent-color', '#00d4ff')
    } else if (theme === 'light') {
      root.classList.add('light')
      root.style.setProperty('--primary-bg', '#ffffff')
      root.style.setProperty('--primary-text', '#000000')
      root.style.setProperty('--accent-color', '#0066cc')
    } else {
      root.classList.add('cyber', 'dark')
      root.style.setProperty('--primary-bg', '#0a0a0a')
      root.style.setProperty('--primary-text', '#00ff88')
      root.style.setProperty('--accent-color', '#ff0040')
    }
  }

  return { theme, changeTheme }
}
