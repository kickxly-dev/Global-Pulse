// Real database functions using API routes
// These connect to the server-side database via Next.js API routes

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  points: number
  streak: number
  longest_streak: number
  last_active: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  progress: number
  max_progress: number
  unlocked: boolean
  unlocked_at?: string
  created_at: string
  updated_at: string
  achievement?: Achievement
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  avatar_url?: string
  points: number
  streak: number
  rank: number
  previous_rank?: number
}

export interface ArticleInteraction {
  id: string
  user_id: string
  article_url: string
  article_title: string
  article_source: string
  category: string
  read_time: number
  bookmarked: boolean
  liked: boolean
  shared: boolean
  created_at: string
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  type: 'articles' | 'categories' | 'time' | 'sharing'
  target_value: number
  points: number
  active: boolean
  created_at: string
  expires_at: string
}

export interface UserChallenge {
  id: string
  user_id: string
  challenge_id: string
  progress: number
  completed: boolean
  completed_at?: string
  created_at: string
  challenge?: DailyChallenge
}

// Helper function to make API calls
async function apiCall(action: string, method: 'GET' | 'POST' = 'GET', userId?: string, data?: any) {
  const url = new URL('/api/database', window.location.origin)
  url.searchParams.set('action', action)
  if (userId) url.searchParams.set('userId', userId)

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(method === 'POST' && { body: JSON.stringify({ action, userId, data }) })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

// Database functions using real API
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    return await apiCall('profile', 'GET', userId)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    return await apiCall('update-profile', 'POST', userId, updates)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const achievements = await apiCall('achievements', 'GET', userId)
    return achievements.map((ua: any) => ({
      ...ua,
      achievement: ua.achievement_id ? {
        id: ua.achievement_id,
        title: ua.title,
        description: ua.description,
        icon: ua.icon,
        rarity: ua.rarity,
        points: ua.points,
        created_at: ''
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }
}

export async function updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
  try {
    return await apiCall('update-achievement', 'POST', userId, { achievementId, progress })
  } catch (error) {
    console.error('Error updating achievement progress:', error)
    return null
  }
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const url = new URL('/api/database', window.location.origin)
    url.searchParams.set('action', 'leaderboard')
    url.searchParams.set('limit', limit.toString())
    
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch leaderboard')
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  try {
    return await apiCall('daily-challenges', 'GET')
  } catch (error) {
    console.error('Error fetching daily challenges:', error)
    return []
  }
}

export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  try {
    const challenges = await apiCall('user-challenges', 'GET', userId)
    return challenges.map((uc: any) => ({
      ...uc,
      challenge: uc.challenge_id ? {
        id: uc.challenge_id,
        title: uc.title,
        description: uc.description,
        type: uc.type,
        target_value: uc.target_value,
        points: uc.points,
        active: true,
        created_at: '',
        expires_at: ''
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching user challenges:', error)
    return []
  }
}

export async function updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge | null> {
  try {
    return await apiCall('update-challenge', 'POST', userId, { challengeId, progress })
  } catch (error) {
    console.error('Error updating challenge progress:', error)
    return null
  }
}

export async function trackArticleInteraction(userId: string, interaction: Omit<ArticleInteraction, 'id' | 'user_id' | 'created_at'>): Promise<ArticleInteraction | null> {
  try {
    return await apiCall('track-interaction', 'POST', userId, interaction)
  } catch (error) {
    console.error('Error tracking article interaction:', error)
    return null
  }
}

export async function getUserStats(userId: string): Promise<{
  articlesRead: number
  categoriesRead: number
  totalReadTime: number
  bookmarkedCount: number
  sharedCount: number
  likedCount: number
}> {
  try {
    return await apiCall('user-stats', 'GET', userId)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      articlesRead: 0,
      categoriesRead: 0,
      totalReadTime: 0,
      bookmarkedCount: 0,
      sharedCount: 0,
      likedCount: 0
    }
  }
}

export async function updateStreak(userId: string): Promise<{ current: number; longest: number; isProtected: boolean }> {
  try {
    return await apiCall('update-streak', 'POST', userId)
  } catch (error) {
    console.error('Error updating streak:', error)
    return { current: 0, longest: 0, isProtected: false }
  }
}
