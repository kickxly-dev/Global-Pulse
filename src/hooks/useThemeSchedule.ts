'use client'

import { useState, useEffect, useCallback } from 'react'

interface ThemeSchedule {
  enabled: boolean
  lightStart: string // HH:MM format
  darkStart: string // HH:MM format
}

const STORAGE_KEY = 'themeSchedule'
const DEFAULT_SCHEDULE: ThemeSchedule = {
  enabled: false,
  lightStart: '06:00',
  darkStart: '18:00',
}

export function useThemeSchedule(
  currentTheme: string,
  changeTheme: (theme: string) => void
) {
  const [schedule, setSchedule] = useState<ThemeSchedule>(DEFAULT_SCHEDULE)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSchedule(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load theme schedule:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveSchedule = useCallback((newSchedule: ThemeSchedule) => {
    setSchedule(newSchedule)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedule))
  }, [])

  // Check and apply theme based on schedule
  useEffect(() => {
    if (!schedule.enabled || !isLoaded) return

    const checkTheme = () => {
      const now = new Date()
      const currentTime = now.getHours() * 60 + now.getMinutes()

      const [lightH, lightM] = schedule.lightStart.split(':').map(Number)
      const [darkH, darkM] = schedule.darkStart.split(':').map(Number)

      const lightMinutes = lightH * 60 + lightM
      const darkMinutes = darkH * 60 + darkM

      if (currentTime >= lightMinutes && currentTime < darkMinutes) {
        if (currentTheme !== 'light') {
          changeTheme('light')
        }
      } else {
        if (currentTheme === 'light') {
          changeTheme('dark')
        }
      }
    }

    checkTheme()
    const interval = setInterval(checkTheme, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [schedule, currentTheme, changeTheme, isLoaded])

  const enableSchedule = useCallback((enabled: boolean) => {
    saveSchedule({ ...schedule, enabled })
  }, [schedule, saveSchedule])

  const setTimes = useCallback((lightStart: string, darkStart: string) => {
    saveSchedule({ ...schedule, lightStart, darkStart })
  }, [schedule, saveSchedule])

  return {
    schedule,
    isLoaded,
    enableSchedule,
    setTimes,
  }
}
