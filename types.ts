
export type Category = 'All' | 'Emotion' | 'Health' | 'Psychology' | 'Fortune';

export interface Consultant {
  id: string;
  name: string;
  title: string;
  category: Category;
  avatar: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
  online?: boolean;
  personality: string[];
  capabilities: string[];
  guidelines: string[];
  description: string;
  trustLevel: number;
  maxExperience: number;
  currentExperience: number;
  color: string;
  gradient: string;
  // 新增详细角色设定
  mbti?: string;
  archetype?: string;
  signaturePhrases?: string[];
  systemPrompt?: string;
}

export interface Message {
  id: string;
  senderId: 'user' | string;
  text?: string;
  image?: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface Post {
  id: string;
  consultantId: string;
  content: string;
  image?: string;
  time: string;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  authorId: string;        // 'user' 或 consultant id
  authorName: string;
  text: string;
  timestamp: string;       // 评论时间
  isConsultantReply?: boolean;  // 是否为咨询师回复
  replyTo?: string;        // 回复的评论 ID (可选)
}

// 好感度系统
export interface Affinity {
  consultantId: string;
  level: number;           // 好感度等级 (1-10)
  points: number;          // 当前点数
  maxPoints: number;       // 升级所需点数
  title: string;           // 关系称号
}

// 好感度等级对应称号
export const AFFINITY_TITLES: Record<number, string> = {
  1: '初识',
  2: '熟悉',
  3: '朋友',
  4: '好友',
  5: '密友',
  6: '知己',
  7: '挚友',
  8: '心灵伙伴',
  9: '灵魂知己',
  10: '命中注定',
};
