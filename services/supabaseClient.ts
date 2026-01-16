
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 配置
// 请在 .env.local 中设置这些值
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// 检查 Supabase 是否已配置
export const isSupabaseConfigured = (): boolean => {
    return supabaseUrl !== '' &&
        supabaseUrl !== 'YOUR_SUPABASE_URL' &&
        supabaseAnonKey !== '' &&
        supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

// 创建 Supabase 客户端 (只在配置有效时)
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    if (!supabaseInstance) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }

    return supabaseInstance;
};

// 向后兼容的导出 (可能为 null)
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

// 数据库表名称
export const TABLES = {
    USERS: 'users',
    AFFINITY: 'affinity',
    MESSAGES: 'messages',
    POST_COMMENTS: 'post_comments',
    POST_LIKES: 'post_likes'
} as const;

// Storage bucket 名称
export const STORAGE_BUCKETS = {
    AVATARS: 'avatars',
    CHAT_IMAGES: 'chat-images'
} as const;
