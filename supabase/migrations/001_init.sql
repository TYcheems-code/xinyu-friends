-- =====================================================
-- 心语伙伴 Supabase 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本
-- =====================================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  nickname VARCHAR(50) DEFAULT 'Traveler',
  avatar_url TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 好感度表
CREATE TABLE IF NOT EXISTS affinity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consultant_id VARCHAR(50) NOT NULL,
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  points INT DEFAULT 0 CHECK (points >= 0),
  max_points INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, consultant_id)
);

-- 3. 聊天消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consultant_id VARCHAR(50) NOT NULL,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'consultant')),
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 5. 帖子评论表
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_consultant_reply BOOLEAN DEFAULT FALSE,
  reply_to UUID REFERENCES post_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultant ON messages(consultant_id);
CREATE INDEX IF NOT EXISTS idx_affinity_user ON affinity(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);

-- 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- RLS 策略: 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own affinity" ON affinity
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own likes" ON post_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comments" ON post_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create own comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 创建 Storage Buckets (需要在 Supabase 控制台手动创建)
-- 1. avatars - 用户头像
-- 2. chat-images - 聊天图片
-- =====================================================

-- 完成提示
SELECT 'Database initialized successfully!' as status;
