export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'reading' | 'exploration' | 'social' | 'streak' | 'special'
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: string
  points: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  goal: number
  progress: number
  reward: number
  expiresAt: string
  completed: boolean
}

export interface UserStats {
  totalPoints: number
  level: number
  rank: string
  achievements: Achievement[]
  challenges: Challenge[]
  dailyStreak: number
  weeklyStreak: number
}

const RANKS = [
  { name: 'Newcomer', minPoints: 0 },
  { name: 'Reader', minPoints: 100 },
  { name: 'News Enthusiast', minPoints: 500 },
  { name: 'Journalist', minPoints: 1000 },
  { name: 'Editor', minPoints: 2500 },
  { name: 'Senior Editor', minPoints: 5000 },
  { name: 'News Director', minPoints: 10000 },
  { name: 'Media Mogul', minPoints: 25000 },
  { name: 'Global Pulse Master', minPoints: 50000 },
]

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Reading achievements
  { id: 'first_read', title: 'First Steps', description: 'Read your first article', icon: '📖', category: 'reading', requirement: 1, progress: 0, unlocked: false, points: 10 },
  { id: 'reader_10', title: 'Getting Started', description: 'Read 10 articles', icon: '📚', category: 'reading', requirement: 10, progress: 0, unlocked: false, points: 50 },
  { id: 'reader_50', title: 'Bookworm', description: 'Read 50 articles', icon: '🐛', category: 'reading', requirement: 50, progress: 0, unlocked: false, points: 150 },
  { id: 'reader_100', title: 'News Junkie', description: 'Read 100 articles', icon: '📰', category: 'reading', requirement: 100, progress: 0, unlocked: false, points: 300 },
  { id: 'reader_500', title: 'Information Sponge', description: 'Read 500 articles', icon: '🧽', category: 'reading', requirement: 500, progress: 0, unlocked: false, points: 1000 },
  { id: 'reader_1000', title: 'Master Reader', description: 'Read 1000 articles', icon: '👑', category: 'reading', requirement: 1000, progress: 0, unlocked: false, points: 2500 },
  
  // Streak achievements
  { id: 'streak_3', title: 'On a Roll', description: '3 day reading streak', icon: '🔥', category: 'streak', requirement: 3, progress: 0, unlocked: false, points: 30 },
  { id: 'streak_7', title: 'Week Warrior', description: '7 day reading streak', icon: '⚔️', category: 'streak', requirement: 7, progress: 0, unlocked: false, points: 100 },
  { id: 'streak_30', title: 'Monthly Master', description: '30 day reading streak', icon: '🏆', category: 'streak', requirement: 30, progress: 0, unlocked: false, points: 500 },
  { id: 'streak_100', title: 'Unstoppable', description: '100 day reading streak', icon: '💪', category: 'streak', requirement: 100, progress: 0, unlocked: false, points: 2000 },
  
  // Exploration achievements
  { id: 'countries_5', title: 'World Traveler', description: 'Explore news from 5 countries', icon: '🌍', category: 'exploration', requirement: 5, progress: 0, unlocked: false, points: 50 },
  { id: 'countries_10', title: 'Globe Trotter', description: 'Explore news from 10 countries', icon: '🌎', category: 'exploration', requirement: 10, progress: 0, unlocked: false, points: 150 },
  { id: 'countries_25', title: 'International Correspondent', description: 'Explore news from 25 countries', icon: '🌐', category: 'exploration', requirement: 25, progress: 0, unlocked: false, points: 500 },
  { id: 'categories_all', title: 'Renaissance Reader', description: 'Read from all categories', icon: '🎨', category: 'exploration', requirement: 8, progress: 0, unlocked: false, points: 200 },
  
  // Social achievements
  { id: 'share_10', title: 'Spreading the News', description: 'Share 10 articles', icon: '📤', category: 'social', requirement: 10, progress: 0, unlocked: false, points: 100 },
  { id: 'share_50', title: 'News Broadcaster', description: 'Share 50 articles', icon: '📡', category: 'social', requirement: 50, progress: 0, unlocked: false, points: 300 },
  { id: 'bookmark_25', title: 'Collector', description: 'Bookmark 25 articles', icon: '🔖', category: 'social', requirement: 25, progress: 0, unlocked: false, points: 100 },
  { id: 'bookmark_100', title: 'Archivist', description: 'Bookmark 100 articles', icon: '📚', category: 'social', requirement: 100, progress: 0, unlocked: false, points: 400 },
  
  // Special achievements
  { id: 'early_bird', title: 'Early Bird', description: 'Read news before 6 AM', icon: '🌅', category: 'special', requirement: 1, progress: 0, unlocked: false, points: 50 },
  { id: 'night_owl', title: 'Night Owl', description: 'Read news after midnight', icon: '🦉', category: 'special', requirement: 1, progress: 0, unlocked: false, points: 50 },
  { id: 'breaking_news', title: 'Breaking News Hunter', description: 'Read 10 breaking news articles', icon: '🚨', category: 'special', requirement: 10, progress: 0, unlocked: false, points: 200 },
  { id: 'trending_catcher', title: 'Trend Spotter', description: 'Read 25 trending articles', icon: '📈', category: 'special', requirement: 25, progress: 0, unlocked: false, points: 250 },
]

function generateDailyChallenges(): Challenge[] {
  const templates = [
    { title: 'Daily Reader', description: 'Read 5 articles today', goal: 5, reward: 20 },
    { title: 'Category Explorer', description: 'Read from 3 different categories', goal: 3, reward: 25 },
    { title: 'World News', description: 'Read news from 3 countries', goal: 3, reward: 30 },
    { title: 'Speed Reader', description: 'Read 10 articles today', goal: 10, reward: 40 },
    { title: 'Deep Dive', description: 'Spend 15 minutes reading', goal: 15, reward: 35 },
  ]
  
  const selected = templates.sort(() => Math.random() - 0.5).slice(0, 3)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  return selected.map((t, i) => ({
    id: `daily_${Date.now()}_${i}`,
    title: t.title,
    description: t.description,
    type: 'daily' as const,
    goal: t.goal,
    progress: 0,
    reward: t.reward,
    expiresAt: tomorrow.toISOString(),
    completed: false,
  }))
}

export function getRank(points: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (points >= RANKS[i].minPoints) {
      return RANKS[i].name
    }
  }
  return RANKS[0].name
}

export function getLevel(points: number): number {
  return Math.floor(points / 100) + 1
}

export { DEFAULT_ACHIEVEMENTS, generateDailyChallenges, RANKS }
