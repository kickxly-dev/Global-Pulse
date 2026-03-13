import { queryDatabase } from '@/lib/server-db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'profile':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        const profile = await queryDatabase(
          'SELECT * FROM user_profiles WHERE id = $1',
          [userId]
        )
        return NextResponse.json(profile[0] || null)

      case 'achievements':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        const achievements = await queryDatabase(`
          SELECT ua.*, a.title, a.description, a.icon, a.rarity, a.points
          FROM user_achievements ua
          LEFT JOIN achievements a ON ua.achievement_id = a.id
          WHERE ua.user_id = $1
        `, [userId])
        return NextResponse.json(achievements)

      case 'leaderboard':
        const limit = parseInt(searchParams.get('limit') || '10')
        const leaderboard = await queryDatabase(`
          SELECT 
            id as user_id,
            name,
            avatar_url,
            points,
            streak,
            ROW_NUMBER() OVER (ORDER BY points DESC, streak DESC) as rank
          FROM user_profiles
          ORDER BY points DESC, streak DESC
          LIMIT $1
        `, [limit])
        return NextResponse.json(leaderboard)

      case 'daily-challenges':
        const challenges = await queryDatabase(`
          SELECT * FROM daily_challenges 
          WHERE active = true AND expires_at > NOW()
          ORDER BY created_at DESC
        `)
        return NextResponse.json(challenges)

      case 'user-challenges':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        const userChallenges = await queryDatabase(`
          SELECT uc.*, dc.title, dc.description, dc.type, dc.target_value, dc.points
          FROM user_challenges uc
          LEFT JOIN daily_challenges dc ON uc.challenge_id = dc.id
          WHERE uc.user_id = $1
        `, [userId])
        return NextResponse.json(userChallenges)

      case 'user-stats':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        const stats = await queryDatabase(
          'SELECT category, read_time, bookmarked, shared, liked FROM article_interactions WHERE user_id = $1',
          [userId]
        )
        
        const categories = new Set(stats.map((item: any) => item.category))
        const userStats = {
          articlesRead: stats.length,
          categoriesRead: categories.size,
          totalReadTime: stats.reduce((sum: number, item: any) => sum + item.read_time, 0),
          bookmarkedCount: stats.filter((item: any) => item.bookmarked).length,
          sharedCount: stats.filter((item: any) => item.shared).length,
          likedCount: stats.filter((item: any) => item.liked).length
        }
        return NextResponse.json(userStats)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Database API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'update-profile':
        if (!userId || !data) {
          return NextResponse.json({ error: 'User ID and data required' }, { status: 400 })
        }
        const fields = Object.keys(data).filter((key: string) => key !== 'id')
        const values = fields.map((field: string) => data[field])
        const setClause = fields.map((field: string, index: number) => `${field} = $${index + 2}`).join(', ')
        
        const updateQuery = `
          INSERT INTO user_profiles (id, ${fields.join(', ')})
          VALUES ($1, ${fields.map((_: string, i: number) => `$${i + 2}`).join(', ')})
          ON CONFLICT (id) DO UPDATE SET ${setClause}, updated_at = NOW()
          RETURNING *
        `
        
        const updatedProfile = await queryDatabase(updateQuery, [userId, ...values])
        return NextResponse.json(updatedProfile[0])

      case 'update-achievement':
        if (!userId || !data?.achievementId || data?.progress === undefined) {
          return NextResponse.json({ error: 'User ID, achievement ID, and progress required' }, { status: 400 })
        }
        
        const achievementUpdate = await queryDatabase(`
          INSERT INTO user_achievements (user_id, achievement_id, progress, max_progress, unlocked, unlocked_at, updated_at)
          VALUES ($1, $2, $3, 100, $4, $5, NOW())
          ON CONFLICT (user_id, achievement_id) 
          DO UPDATE SET 
            progress = $3,
            unlocked = $4,
            unlocked_at = $5,
            updated_at = NOW()
          RETURNING *
        `, [userId, data.achievementId, data.progress, data.progress >= 100, data.progress >= 100 ? new Date().toISOString() : null])
        
        return NextResponse.json(achievementUpdate[0])

      case 'update-challenge':
        if (!userId || !data?.challengeId || data?.progress === undefined) {
          return NextResponse.json({ error: 'User ID, challenge ID, and progress required' }, { status: 400 })
        }
        
        const challengeUpdate = await queryDatabase(`
          INSERT INTO user_challenges (user_id, challenge_id, progress, completed, completed_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (user_id, challenge_id)
          DO UPDATE SET 
            progress = $3,
            completed = $4,
            completed_at = $5
          RETURNING *
        `, [userId, data.challengeId, data.progress, data.progress >= 100, data.progress >= 100 ? new Date().toISOString() : null])
        
        return NextResponse.json(challengeUpdate[0])

      case 'track-interaction':
        if (!userId || !data) {
          return NextResponse.json({ error: 'User ID and interaction data required' }, { status: 400 })
        }
        
        const interaction = await queryDatabase(`
          INSERT INTO article_interactions (user_id, article_url, article_title, article_source, category, read_time, bookmarked, liked, shared, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (user_id, article_url)
          DO UPDATE SET
            article_title = $3,
            article_source = $4,
            category = $5,
            read_time = $6,
            bookmarked = $7,
            liked = $8,
            shared = $9,
            created_at = NOW()
          RETURNING *
        `, [
          userId,
          data.article_url,
          data.article_title,
          data.article_source,
          data.category,
          data.read_time,
          data.bookmarked,
          data.liked,
          data.shared
        ])
        
        return NextResponse.json(interaction[0])

      case 'update-streak':
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        
        const profile = await queryDatabase('SELECT * FROM user_profiles WHERE id = $1', [userId])
        if (!profile[0]) {
          return NextResponse.json({ current: 0, longest: 0, isProtected: false })
        }
        
        const now = new Date()
        const lastActive = new Date(profile[0].last_active)
        const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        
        let newStreak = profile[0].streak
        let isProtected = false
        
        if (daysDiff === 0) {
          isProtected = true
        } else if (daysDiff === 1) {
          newStreak += 1
          isProtected = true
        } else if (daysDiff > 1) {
          newStreak = 1
        }
        
        const newLongest = Math.max(newStreak, profile[0].longest_streak)
        
        await queryDatabase(`
          UPDATE user_profiles 
          SET streak = $1, longest_streak = $2, last_active = $3, updated_at = NOW()
          WHERE id = $4
        `, [newStreak, newLongest, now.toISOString(), userId])
        
        return NextResponse.json({
          current: newStreak,
          longest: newLongest,
          isProtected
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Database API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
