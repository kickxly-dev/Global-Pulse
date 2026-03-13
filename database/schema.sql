-- Database schema for Global Pulse news platform
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 100,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('articles', 'categories', 'time', 'sharing')),
    target_value INTEGER NOT NULL,
    points INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- User challenges junction table
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- Article interactions table
CREATE TABLE IF NOT EXISTS article_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    article_url TEXT NOT NULL,
    article_title TEXT NOT NULL,
    article_source TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time INTEGER DEFAULT 0, -- in minutes
    bookmarked BOOLEAN DEFAULT FALSE,
    liked BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_url)
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    up.id as user_id,
    up.name,
    up.avatar_url,
    up.points,
    up.streak,
    ROW_NUMBER() OVER (ORDER BY up.points DESC, up.streak DESC) as rank,
    LAG(up.points) OVER (ORDER BY up.points DESC, up.streak DESC) as previous_points
FROM user_profiles up
ORDER BY up.points DESC, up.streak DESC;

-- Insert default achievements
INSERT INTO achievements (title, description, icon, rarity, points) VALUES
('News Explorer', 'Read 100 articles', 'news-explorer', 'common', 50),
('Trend Spotter', 'Read 50 trending articles', 'trend-spotter', 'rare', 100),
('Knowledge Seeker', 'Maintain a 7-day streak', 'knowledge-seeker', 'epic', 200),
('Master Reader', 'Read 500 articles', 'master-reader', 'legendary', 500),
('Social Butterfly', 'Share 25 articles', 'social-butterfly', 'rare', 150),
('Category Collector', 'Read from 10 different categories', 'category-collector', 'epic', 250),
('Speed Reader', 'Read for 1000 total minutes', 'speed-reader', 'common', 75),
('Bookmark Enthusiast', 'Bookmark 50 articles', 'bookmark-enthusiast', 'common', 100)
ON CONFLICT DO NOTHING;

-- Insert sample daily challenges
INSERT INTO daily_challenges (title, description, type, target_value, points, expires_at) VALUES
('Daily Reader', 'Read 5 articles', 'articles', 5, 50, NOW() + INTERVAL '1 day'),
('Category Explorer', 'Read from 3 different categories', 'categories', 3, 75, NOW() + INTERVAL '1 day'),
('Time Investment', 'Read for 30 minutes', 'time', 30, 100, NOW() + INTERVAL '1 day'),
('Social Sharer', 'Share 2 articles', 'sharing', 2, 60, NOW() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, unlocked);
CREATE INDEX IF NOT EXISTS idx_article_interactions_user_id ON article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_created_at ON article_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON daily_challenges(active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges" ON user_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions" ON article_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON article_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON article_interactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for achievements and daily challenges
CREATE POLICY "Achievements are publicly readable" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Daily challenges are publicly readable" ON daily_challenges
    FOR SELECT USING (true);

-- Leaderboard is publicly readable
CREATE POLICY "Leaderboard is publicly readable" ON leaderboard_view
    FOR SELECT USING (true);
