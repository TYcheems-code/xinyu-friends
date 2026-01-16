
import { getSupabase, isSupabaseConfigured, TABLES, STORAGE_BUCKETS } from './supabaseClient';

// 用户类型定义
export interface User {
    id: string;
    phone?: string;
    nickname: string;
    avatar_url?: string;
    is_vip: boolean;
    created_at: string;
}

// 本地存储的用户信息 (离线模式)
const LOCAL_USER_KEY = 'xinyu_user';

/**
 * 获取当前用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
    // 如果 Supabase 已配置，从云端获取
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from(TABLES.USERS)
                    .select('*')
                    .eq('id', user.id)
                    .single();
                return data;
            }
        } catch (error) {
            console.error('获取用户失败:', error);
        }
        return null;
    }

    // 否则使用本地存储
    const saved = localStorage.getItem(LOCAL_USER_KEY);
    if (saved) {
        return JSON.parse(saved);
    }

    // 返回默认用户
    return {
        id: 'local_user',
        nickname: 'Traveler',
        is_vip: true,
        created_at: new Date().toISOString()
    };
};

/**
 * 更新用户信息
 */
export const updateUser = async (updates: Partial<User>): Promise<User | null> => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .update(updates)
                .eq('id', currentUser.id)
                .select()
                .single();

            if (error) {
                console.error('更新用户失败:', error);
                return null;
            }
            return data;
        } catch (error) {
            console.error('更新用户失败:', error);
        }
    }

    // 本地模式
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
};

/**
 * 上传头像
 */
export const uploadAvatar = async (file: File): Promise<string | null> => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) return null;

            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 上传到 Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKETS.AVATARS)
                .upload(filePath, file);

            if (uploadError) {
                console.error('上传头像失败:', uploadError);
                return null;
            }

            // 获取公共 URL
            const { data } = supabase.storage
                .from(STORAGE_BUCKETS.AVATARS)
                .getPublicUrl(filePath);

            // 更新用户头像 URL
            await updateUser({ avatar_url: data.publicUrl });

            return data.publicUrl;
        } catch (error) {
            console.error('上传头像失败:', error);
        }
    }

    // 本地模式：转为 base64
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            await updateUser({ avatar_url: base64 });
            resolve(base64);
        };
        reader.readAsDataURL(file);
    });
};

/**
 * 手机验证码登录 (Supabase OTP)
 */
export const signInWithPhone = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
        // 离线模式：模拟登录成功
        const user: User = {
            id: `user_${Date.now()}`,
            phone,
            nickname: 'Traveler',
            is_vip: false,
            created_at: new Date().toISOString()
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        return { success: true };
    }

    try {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: {
                channel: 'sms'
            }
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
};

/**
 * 验证验证码
 */
export const verifyOtp = async (phone: string, token: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
        // 离线模式：任意验证码都成功
        return { success: true };
    }

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms'
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // 创建或更新用户记录
        if (data.user) {
            const { error: upsertError } = await supabase
                .from(TABLES.USERS)
                .upsert({
                    id: data.user.id,
                    phone,
                    nickname: 'Traveler',
                    is_vip: false
                }, { onConflict: 'id' });

            if (upsertError) {
                console.error('创建用户记录失败:', upsertError);
            }
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
};

/**
 * 登出
 */
export const signOut = async (): Promise<void> => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('登出失败:', error);
        }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem('user_consent');
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = async (): Promise<boolean> => {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    }
    // 离线模式：检查本地存储
    return !!localStorage.getItem(LOCAL_USER_KEY);
};
