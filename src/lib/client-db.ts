// Mock database functions for client-side components
// These will be replaced with API calls to the server-side database

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

// Mock data for development
const mockUserProfile: UserProfile = {
  id: 'user1',
  email: 'user@example.com',
  name: 'Demo User',
  avatar_url: '👤',
  points: 2420,
  streak: 7,
  longest_streak: 23,
  last_active: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'News Explorer',
    description: 'Read 100 articles',
    icon: 'news-explorer',
    rarity: 'common',
    points: 50,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Trend Spotter',
    description: 'Read 50 trending articles',
    icon: 'trend-spotter',
    rarity: 'rare',
    points: 100,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Knowledge Seeker',
    description: 'Maintain a 7-day streak',
    icon: 'knowledge-seeker',
    rarity: 'epic',
    points: 200,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Master Reader',
    description: 'Read 500 articles',
    icon: 'master-reader',
    rarity: 'legendary',
    points: 500,
    created_at: new Date().toISOString()
  }
]

const mockUserAchievements: UserAchievement[] = [
  {
    id: 'ua1',
    user_id: 'user1',
    achievement_id: '1',
    progress: 87,
    max_progress: 100,
    unlocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    achievement: mockAchievements[0]
  },
  {
    id: 'ua2',
    user_id: 'user1',
    achievement_id: '2',
    progress: 50,
    max_progress: 50,
    unlocked: true,
    unlocked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    achievement: mockAchievements[1]
  },
  {
    id: 'ua3',
    user_id: 'user1',
    achievement_id: '3',
    progress: 7,
    max_progress: 7,
    unlocked: true,
    unlocked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    achievement: mockAchievements[2]
  },
  {
    id: 'ua4',
    user_id: 'user1',
    achievement_id: '4',
    progress: 234,
    max_progress: 500,
    unlocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    achievement: mockAchievements[3]
  }
]

const mockLeaderboard: LeaderboardEntry[] = [
  { user_id: 'user1', name: 'Alex Chen', avatar_url: '👨‍💻', points: 2840, streak: 45, rank: 1 },
  { user_id: 'user2', name: 'Sarah Miller', avatar_url: '👩‍🔬', points: 2650, streak: 32, rank: 2 },
  { user_id: 'user3', name: 'You', avatar_url: '🌟', points: 2420, streak: 7, rank: 3 },
  { user_id: 'user4', name: 'Mike Johnson', avatar_url: '👨‍🚀', points: 2380, streak: 28, rank: 4 },
  { user_id: 'user5', name: 'Emma Wilson', avatar_url: '👩‍💼', points: 2290, streak: 15, rank: 5 }
]

const mockDailyChallenges: DailyChallenge[] = [
  {
    id: 'dc1',
    title: 'Daily Reader',
    description: 'Read 5 articles',
    type: 'articles',
    target_value: 5,
    points: 50,
    active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dc2',
    title: 'Category Explorer',
    description: 'Read from 3 different categories',
    type: 'categories',
    target_value: 3,
    points: 75,
    active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dc3',
    title: 'Time Investment',
    description: 'Read for 30 minutes',
    type: 'time',
    target_value: 30,
    points: 100,
    active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dc4',
    title: 'Social Sharer',
    description: 'Share 2 articles',
    type: 'sharing',
    target_value: 2,
    points: 60,
    active: true,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockUserChallenges: UserChallenge[] = [
  {
    id: 'uc1',
    user_id: 'user1',
    challenge_id: 'dc1',
    progress: 60,
    completed: false,
    created_at: new Date().toISOString(),
    challenge: mockDailyChallenges[0]
  },
  {
    id: 'uc2',
    user_id: 'user1',
    challenge_id: 'dc2',
    progress: 33,
    completed: false,
    created_at: new Date().toISOString(),
    challenge: mockDailyChallenges[1]
  }
]

// Database functions (mock implementations)
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockUserProfile
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return { ...mockUserProfile, ...updates }
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockUserAchievements
}

export async function updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const achievement = mockUserAchievements.find(ua => ua.achievement_id === achievementId)
  if (achievement) {
    achievement.progress = progress
    achievement.unlocked = progress >= 100
  }
  return achievement || null
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockLeaderboard.slice(0, limit)
}

export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockDailyChallenges
}

export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockUserChallenges
}

export async function updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserChallenge | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  const challenge = mockUserChallenges.find(uc => uc.challenge_id === challengeId)
  if (challenge) {
    challenge.progress = progress
    challenge.completed = progress >= 100
  }
  return challenge || null
}

export async function trackArticleInteraction(userId: string, interaction: Omit<ArticleInteraction, 'id' | 'user_id' | 'created_at'>): Promise<ArticleInteraction | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log('Tracking article interaction:', interaction)
  return {
    id: 'interaction-' + Date.now(),
    user_id: userId,
    ...interaction,
    created_at: new Date().toISOString()
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
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
    articlesRead: 156,
    categoriesRead: 8,
    totalReadTime: 1240,
    bookmarkedCount: 23,
    sharedCount: 12,
    likedCount: 45
  }
}

export async function updateStreak(userId: string): Promise<{ current: number; longest: number; isProtected: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return {
    current: 7,
    longest: 23,
    isProtected: true
  }
}
