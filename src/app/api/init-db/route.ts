import { queryDatabase } from '@/lib/server-db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Starting database initialization...')

    // Create user_profiles table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        points INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✓ user_profiles table created')

    // Create achievements table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
        points INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✓ achievements table created')

    // Create user_achievements table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        max_progress INTEGER DEFAULT 100,
        unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, achievement_id)
      )
    `)
    console.log('✓ user_achievements table created')

    // Create daily_challenges table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('articles', 'categories', 'time', 'sharing')),
        target_value INTEGER NOT NULL,
        points INTEGER NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `)
    console.log('✓ daily_challenges table created')

    // Create user_challenges table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, challenge_id)
      )
    `)
    console.log('✓ user_challenges table created')

    // Create article_interactions table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS article_interactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        article_url TEXT NOT NULL,
        article_title TEXT NOT NULL,
        article_source TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time INTEGER DEFAULT 0,
        bookmarked BOOLEAN DEFAULT FALSE,
        liked BOOLEAN DEFAULT FALSE,
        shared BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, article_url)
      )
    `)
    console.log('✓ article_interactions table created')

    // Seed default achievements
    const achievementsCount = await queryDatabase('SELECT COUNT(*) as count FROM achievements')
    if (achievementsCount[0].count === '0' || achievementsCount[0].count === 0) {
      await queryDatabase(`
        INSERT INTO achievements (title, description, icon, rarity, points) VALUES
        ('News Explorer', 'Read 100 articles', 'news-explorer', 'common', 50),
        ('Trend Spotter', 'Read 50 trending articles', 'trend-spotter', 'rare', 100),
        ('Knowledge Seeker', 'Maintain a 7-day streak', 'knowledge-seeker', 'epic', 200),
        ('Master Reader', 'Read 500 articles', 'master-reader', 'legendary', 500),
        ('Social Butterfly', 'Share 25 articles', 'social-butterfly', 'rare', 150),
        ('Category Collector', 'Read from 10 different categories', 'category-collector', 'epic', 250),
        ('Speed Reader', 'Read for 1000 total minutes', 'speed-reader', 'common', 75),
        ('Bookmark Enthusiast', 'Bookmark 50 articles', 'bookmark-enthusiast', 'common', 100)
      `)
      console.log('✓ Default achievements seeded')
    } else {
      console.log('✓ Achievements already exist')
    }

    // Seed default daily challenges
    const challengesCount = await queryDatabase('SELECT COUNT(*) as count FROM daily_challenges WHERE active = true AND expires_at > NOW()')
    if (challengesCount[0].count === '0' || challengesCount[0].count === 0) {
      await queryDatabase(`
        INSERT INTO daily_challenges (title, description, type, target_value, points, expires_at) VALUES
        ('Daily Reader', 'Read 5 articles', 'articles', 5, 50, NOW() + INTERVAL '1 day'),
        ('Category Explorer', 'Read from 3 different categories', 'categories', 3, 75, NOW() + INTERVAL '1 day'),
        ('Time Investment', 'Read for 30 minutes', 'time', 30, 100, NOW() + INTERVAL '1 day'),
        ('Social Sharer', 'Share 2 articles', 'sharing', 2, 60, NOW() + INTERVAL '1 day')
      `)
      console.log('✓ Default daily challenges seeded')
    } else {
      console.log('✓ Daily challenges already exist')
    }

    // Create sample user if none exists
    const usersCount = await queryDatabase('SELECT COUNT(*) as count FROM user_profiles')
    if (usersCount[0].count === '0' || usersCount[0].count === 0) {
      await queryDatabase(`
        INSERT INTO user_profiles (id, email, name, points, streak, longest_streak)
        VALUES ('demo-user-1', 'demo@globalpulse.com', 'Demo User', 1250, 7, 23)
      `)
      console.log('✓ Sample user created')
    }

    // Create news_articles table for AI training
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        url TEXT UNIQUE NOT NULL,
        image_url TEXT,
        source TEXT,
        category TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        sentiment TEXT,
        keywords JSONB,
        embedding JSONB,
        training_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✓ news_articles table created')

    // Create ai_model_training table
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS ai_model_training (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        model_version TEXT NOT NULL,
        training_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        article_count INTEGER DEFAULT 0,
        categories JSONB,
        accuracy_score DECIMAL(4,3) DEFAULT 0.000,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    console.log('✓ ai_model_training table created')

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables: [
        'user_profiles',
        'achievements',
        'user_achievements',
        'daily_challenges',
        'user_challenges',
        'article_interactions',
        'news_articles',
        'ai_model_training'
      ]
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
