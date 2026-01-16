
import { Post, Comment, Affinity, AFFINITY_TITLES } from '../types';

// Storage keys
const POSTS_KEY = 'discover_posts';
const AFFINITY_KEY = 'user_affinity';

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

/**
 * 生成咨询师对用户评论的回复
 */
export const generateConsultantReply = async (
    consultantName: string,
    consultantDescription: string,
    postContent: string,
    userComment: string,
    userName: string = '你'
): Promise<string> => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3001',
                'X-Title': 'Xinyu AI Companion'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    {
                        role: 'system',
                        content: `你是${consultantName}，一位可爱的二次元风格AI情感咨询师。
角色设定：${consultantDescription}

你刚刚在朋友圈发了一条动态："${postContent}"
现在有用户"${userName}"评论了你的动态，你需要用温暖、可爱的语气回复。

重要指南：
- 使用中文回复
- 回复要简短可爱，1-2句话
- 适当使用可爱的表情符号（如 ✨💕🌸😊）
- 像朋友一样亲切地回应
- 根据评论内容给出有趣或温暖的回应`
                    },
                    {
                        role: 'user',
                        content: userComment
                    }
                ],
                temperature: 0.9,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '谢谢你的评论呀~💕';
    } catch (error) {
        console.error('生成回复失败:', error);
        // 返回一些预设的可爱回复
        const defaultReplies = [
            '谢谢你的留言，好开心~✨',
            '嘿嘿，收到啦！💕',
            '感谢关注呀~🌸',
            '你真好呀！😊',
            '谢谢支持~💖'
        ];
        return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
    }
};

/**
 * 保存帖子到 localStorage
 */
export const savePosts = (posts: Post[]): void => {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
        console.error('保存帖子失败:', error);
    }
};

/**
 * 从 localStorage 读取帖子
 */
export const loadPosts = (): Post[] | null => {
    try {
        const saved = localStorage.getItem(POSTS_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('读取帖子失败:', error);
        return null;
    }
};

/**
 * 获取用户对某个咨询师的好感度
 */
export const getAffinity = (consultantId: string): Affinity => {
    try {
        const saved = localStorage.getItem(AFFINITY_KEY);
        const affinities: Record<string, Affinity> = saved ? JSON.parse(saved) : {};

        if (affinities[consultantId]) {
            return affinities[consultantId];
        }

        // 默认初始好感度
        return {
            consultantId,
            level: 1,
            points: 0,
            maxPoints: 100,
            title: AFFINITY_TITLES[1]
        };
    } catch (error) {
        console.error('读取好感度失败:', error);
        return {
            consultantId,
            level: 1,
            points: 0,
            maxPoints: 100,
            title: AFFINITY_TITLES[1]
        };
    }
};

/**
 * 更新好感度
 */
export const updateAffinity = (consultantId: string, pointsToAdd: number): Affinity => {
    const affinity = getAffinity(consultantId);

    affinity.points += pointsToAdd;

    // 检查是否升级
    while (affinity.points >= affinity.maxPoints && affinity.level < 10) {
        affinity.points -= affinity.maxPoints;
        affinity.level++;
        affinity.maxPoints = Math.floor(affinity.maxPoints * 1.5); // 每级需要更多点数
        affinity.title = AFFINITY_TITLES[affinity.level];
    }

    // 最高等级封顶
    if (affinity.level >= 10) {
        affinity.level = 10;
        affinity.points = Math.min(affinity.points, affinity.maxPoints);
        affinity.title = AFFINITY_TITLES[10];
    }

    // 保存到 localStorage
    try {
        const saved = localStorage.getItem(AFFINITY_KEY);
        const affinities: Record<string, Affinity> = saved ? JSON.parse(saved) : {};
        affinities[consultantId] = affinity;
        localStorage.setItem(AFFINITY_KEY, JSON.stringify(affinities));
    } catch (error) {
        console.error('保存好感度失败:', error);
    }

    return affinity;
};

/**
 * 获取所有咨询师的好感度
 */
export const getAllAffinities = (): Record<string, Affinity> => {
    try {
        const saved = localStorage.getItem(AFFINITY_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('读取好感度失败:', error);
        return {};
    }
};

/**
 * 格式化时间为相对时间
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

/**
 * 获取当前时间字符串
 */
export const getCurrentTimestamp = (): string => {
    return new Date().toISOString();
};
