import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
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

// Database functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }
  
  return data
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user achievements:', error)
    return []
  }
  
  return data
}

export async function updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
  const { data, error } = await supabase
    .from('user_achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      progress,
      unlocked: progress >= 100,
      unlocked_at: progress >= 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error updating achievement progress:', error)
    return null
  }
  
  return data
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('*')
    .order('points', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  
  return data
}

export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('active', true)
    .gte('expires_at', new Date().toISOString())
  
  if (error) {
    console.error('Error fetching daily challenges:', error)
    return []
  }
  
  return data
}

export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge:daily_challenges(*)
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user challenges:', error)
    return []
  }
  
  return data
}

export async function updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge | null> {
  const { data, error } = await supabase
    .from('user_challenges')
    .upsert({
      user_id: userId,
      challenge_id: challengeId,
      progress,
      completed: progress >= 100,
      completed_at: progress >= 100 ? new Date().toISOString() : null
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error updating challenge progress:', error)
    return null
  }
  
  return data
}

export async function trackArticleInteraction(userId: string, interaction: Omit<ArticleInteraction, 'id' | 'user_id' | 'created_at'>): Promise<ArticleInteraction | null> {
  const { data, error } = await supabase
    .from('article_interactions')
    .upsert({
      user_id: userId,
      ...interaction,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error tracking article interaction:', error)
    return null
  }
  
  return data
}

export async function getUserStats(userId: string): Promise<{
  articlesRead: number
  categoriesRead: number
  totalReadTime: number
  bookmarkedCount: number
  sharedCount: number
  likedCount: number
}> {
  const { data, error } = await supabase
    .from('article_interactions')
    .select('category, read_time, bookmarked, shared, liked')
    .eq('user_id', userId)
  
  if (error) {
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
  
  const categories = new Set(data?.map(item => item.category) || [])
  
  return {
    articlesRead: data?.length || 0,
    categoriesRead: categories.size,
    totalReadTime: data?.reduce((sum, item) => sum + item.read_time, 0) || 0,
    bookmarkedCount: data?.filter(item => item.bookmarked).length || 0,
    sharedCount: data?.filter(item => item.shared).length || 0,
    likedCount: data?.filter(item => item.liked).length || 0
  }
}

export async function updateStreak(userId: string): Promise<{ current: number; longest: number; isProtected: boolean }> {
  const profile = await getUserProfile(userId)
  if (!profile) return { current: 0, longest: 0, isProtected: false }
  
  const now = new Date()
  const lastActive = new Date(profile.last_active)
  const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
  
  let newStreak = profile.streak
  let isProtected = false
  
  if (daysDiff === 0) {
    // Already active today
    isProtected = true
  } else if (daysDiff === 1) {
    // Next day, increment streak
    newStreak += 1
    isProtected = true
  } else if (daysDiff > 1) {
    // Streak broken, reset to 1
    newStreak = 1
  }
  
  const newLongest = Math.max(newStreak, profile.longest_streak)
  
  await updateUserProfile(userId, {
    streak: newStreak,
    longest_streak: newLongest,
    last_active: now.toISOString()
  })
  
  return {
    current: newStreak,
    longest: newLongest,
    isProtected
  }
}
