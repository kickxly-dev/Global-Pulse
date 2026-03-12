'use client'

import { useState, useEffect, useCallback } from 'react'

interface ReadingGoal {
  id: string
  type: 'daily' | 'weekly' | 'monthly'
  target: number
  current: number
  unit: 'articles' | 'minutes'
  category?: string
}

interface ReadingGoalsState {
  goals: ReadingGoal[]
  streak: number
  longestStreak: number
  lastCompletedDate: string | null
}

const STORAGE_KEY = 'readingGoals'

const DEFAULT_GOALS: ReadingGoal[] = [
  { id: 'daily-articles', type: 'daily', target: 5, current: 0, unit: 'articles' },
  { id: 'weekly-articles', type: 'weekly', target: 25, current: 0, unit: 'articles' },
  { id: 'daily-minutes', type: 'daily', target: 15, current: 0, unit: 'minutes' },
]

export function useReadingGoals() {
  const [state, setState] = useState<ReadingGoalsState>({
    goals: DEFAULT_GOALS,
    streak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setState({
          goals: data.goals || DEFAULT_GOALS,
          streak: data.streak || 0,
          longestStreak: data.longestStreak || 0,
          lastCompletedDate: data.lastCompletedDate || null,
        })
      } catch (e) {
        console.error('Failed to load reading goals:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveState = useCallback((newState: ReadingGoalsState) => {
    setState(newState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  }, [])

  const updateGoal = useCallback((goalId: string, increment: number = 1) => {
    setState(prev => {
      const today = new Date().toDateString()
      const newGoals = prev.goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, current: Math.min(goal.current + increment, goal.target * 2) }
        }
        return goal
      })

      // Check if daily goal completed
      const dailyGoal = newGoals.find(g => g.type === 'daily' && g.id === 'daily-articles')
      let newStreak = prev.streak
      let newLongestStreak = prev.longestStreak

      if (dailyGoal && dailyGoal.current >= dailyGoal.target && prev.lastCompletedDate !== today) {
        newStreak = prev.streak + 1
        newLongestStreak = Math.max(newStreak, prev.longestStreak)
      }

      const newState = {
        goals: newGoals,
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: dailyGoal && dailyGoal.current >= dailyGoal.target ? today : prev.lastCompletedDate,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return newState
    })
  }, [])

  const setGoal = useCallback((goalId: string, target: number) => {
    setState(prev => {
      const newGoals = prev.goals.map(goal => {
        if (goal.id === goalId) {
          return { ...goal, target }
        }
        return goal
      })
      const newState = { ...prev, goals: newGoals }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return newState
    })
  }, [])

  const resetDailyGoals = useCallback(() => {
    setState(prev => {
      const today = new Date().toDateString()
      if (prev.lastCompletedDate === today) return prev

      const newGoals = prev.goals.map(goal => {
        if (goal.type === 'daily') {
          return { ...goal, current: 0 }
        }
        return goal
      })

      // Check if streak should be broken
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      let newStreak = prev.streak
      if (prev.lastCompletedDate && prev.lastCompletedDate !== yesterdayStr && prev.lastCompletedDate !== today) {
        newStreak = 0
      }

      const newState = {
        ...prev,
        goals: newGoals,
        streak: newStreak,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return newState
    })
  }, [])

  const getProgress = useCallback((goalId: string): number => {
    const goal = state.goals.find(g => g.id === goalId)
    if (!goal) return 0
    return Math.min((goal.current / goal.target) * 100, 100)
  }, [state.goals])

  const isGoalComplete = useCallback((goalId: string): boolean => {
    const goal = state.goals.find(g => g.id === goalId)
    return goal ? goal.current >= goal.target : false
  }, [state.goals])

  return {
    goals: state.goals,
    streak: state.streak,
    longestStreak: state.longestStreak,
    isLoaded,
    updateGoal,
    setGoal,
    resetDailyGoals,
    getProgress,
    isGoalComplete,
  }
}
