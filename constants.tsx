
import { Consultant, Post } from './types';

// Helper to get image from local storage or fall back to default
const getImg = (key: string, defaultUrl: string) => {
  try {
    const stored = localStorage.getItem(key);
    return stored || defaultUrl;
  } catch {
    return defaultUrl;
  }
};

// Default stable placeholders - Using local character images
// These are used immediately so images are never "broken"
// SVG data URIs as fallback in case local images fail

// 二次元风格占位图 - 使用带主题色的 SVG 作为备用
const createAvatarSVG = (color1: string, color2: string, initial: string) =>
  `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
      <linearGradient id="face" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ffecd2"/>
        <stop offset="100%" style="stop-color:#fcb69f"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#bg)"/>
    <ellipse cx="100" cy="180" rx="70" ry="50" fill="${color1}" opacity="0.8"/>
    <circle cx="100" cy="85" r="55" fill="url(#face)"/>
    <ellipse cx="75" cy="80" rx="8" ry="10" fill="#333"/>
    <ellipse cx="125" cy="80" rx="8" ry="10" fill="#333"/>
    <circle cx="77" cy="78" r="3" fill="#fff"/>
    <circle cx="127" cy="78" r="3" fill="#fff"/>
    <ellipse cx="100" cy="95" rx="3" ry="2" fill="#ffb6b9"/>
    <path d="M85 108 Q100 118 115 108" stroke="#ff9a9e" fill="none" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="65" cy="95" rx="10" ry="5" fill="#ffb6b9" opacity="0.5"/>
    <ellipse cx="135" cy="95" rx="10" ry="5" fill="#ffb6b9" opacity="0.5"/>
    <text x="100" y="195" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="bold">${initial}</text>
  </svg>
  `)}`;

// 本地立绘图片路径 (存放在 assets 文件夹) - 用于卡片展示
// 恋奈 - 粉色系情感咨询师 - 甜美学妹形象
const LIANA_IMAGE = '/assets/liana.png';
// 芽衣 - 绿色系健康顾问 - 运动少女形象
const MEI_IMAGE = '/assets/mei.png';
// 诗织 - 紫色系心理咨询师 - 知性温柔形象
const SHIORI_IMAGE = '/assets/shiori.png';
// 星凛 - 金/紫色系运势咨询师 - 神秘优雅形象
const STARRIN_IMAGE = '/assets/starrin.png';

// Q版头像路径 - 用于聊天界面
const LIANA_CHIBI = '/assets/liana_chibi.jpg';
const MEI_CHIBI = '/assets/mei_chibi.png';
const SHIORI_CHIBI = '/assets/shiori_chibi.png';
const STARRIN_CHIBI = '/assets/starrin_chibi.jpg';

// 导出获取 chibi 头像的辅助函数
export const getChibiAvatar = (consultantId: string): string => {
  const chibis: Record<string, string> = {
    liana: LIANA_CHIBI,
    mei: MEI_CHIBI,
    shiori: SHIORI_CHIBI,
    starrin: STARRIN_CHIBI,
  };
  return chibis[consultantId] || LIANA_CHIBI;
};

// SVG 占位图作为备用 (导出供其他组件使用)
export const FALLBACK_LIANA = createAvatarSVG('#fc78ab', '#ffb6d3', '恋奈');
export const FALLBACK_MEI = createAvatarSVG('#81D4AF', '#a8e6cf', '芽衣');
export const FALLBACK_SHIORI = createAvatarSVG('#B8A9E8', '#d4c6f7', '诗织');
export const FALLBACK_STARRIN = createAvatarSVG('#FAD961', '#f7b733', '星凛');

// 导出一个根据 ID 获取对应 fallback 图片的辅助函数
export const getFallbackImage = (consultantId: string): string => {
  const fallbacks: Record<string, string> = {
    liana: FALLBACK_LIANA,
    mei: FALLBACK_MEI,
    shiori: FALLBACK_SHIORI,
    starrin: FALLBACK_STARRIN,
  };
  return fallbacks[consultantId] || FALLBACK_LIANA;
};

// Banner 使用渐变 SVG 作为可靠的占位图
const DEFAULT_BANNER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1c112d"/>
      <stop offset="50%" style="stop-color:#fc78ab"/>
      <stop offset="100%" style="stop-color:#ffb6d3"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#sky)"/>
  <circle cx="650" cy="80" r="50" fill="#fff" opacity="0.9"/>
  <circle cx="100" cy="350" r="150" fill="#fff" opacity="0.1"/>
  <circle cx="300" cy="380" r="100" fill="#fff" opacity="0.1"/>
  <circle cx="500" cy="370" r="120" fill="#fff" opacity="0.1"/>
  <circle cx="700" cy="360" r="90" fill="#fff" opacity="0.1"/>
  <text x="400" y="220" font-size="32" fill="white" text-anchor="middle" font-family="sans-serif" opacity="0.8">心语伙伴</text>
  <text x="400" y="260" font-size="16" fill="white" text-anchor="middle" font-family="sans-serif" opacity="0.6">开启您的专属心灵奇旅</text>
</svg>
`)}`;

export const getConsultants = (): Consultant[] => [
  {
    id: 'liana',
    name: '恋奈',
    title: '恋爱顾问',
    category: 'Emotion',
    avatar: LIANA_IMAGE,
    lastMessage: '最近在感情上有什么困惑吗？',
    lastTime: '10:23',
    unreadCount: 2,
    online: true,
    personality: ['温柔', '细腻', '治愈'],
    capabilities: ['情感分析', '恋爱建议', '心情倾听'],
    guidelines: ['不做道德判断', '绝对隐私保护', '温柔陪伴'],
    description: '我是恋奈，你的专属情感顾问。希望能像冬日的奶茶一样，在这个复杂的世界里给你一点点甜。',
    trustLevel: 15,
    maxExperience: 1000,
    currentExperience: 450,
    color: 'pink',
    gradient: 'from-pink-400 to-rose-400'
  },
  {
    id: 'mei',
    name: '芽衣',
    title: '健康顾问',
    category: 'Health',
    avatar: MEI_IMAGE,
    lastMessage: '今天记得也要多喝水哦！',
    lastTime: '09:15',
    unreadCount: 0,
    online: true,
    personality: ['活力', '严格', '阳光'],
    capabilities: ['饮食规划', '运动指导', '睡眠管理'],
    guidelines: ['科学依据优先', '循序渐进', '正向激励'],
    description: '我是芽衣！别坐着啦，跟我一起动起来吧。身体的健康是快乐的第一步，我会监督你完成每一个小目标！',
    trustLevel: 8,
    maxExperience: 500,
    currentExperience: 120,
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'shiori',
    name: '诗织',
    title: '心理疏导',
    category: 'Psychology',
    avatar: SHIORI_IMAGE,
    lastMessage: '深呼吸，试着放下那些压力。',
    lastTime: '昨天',
    unreadCount: 0,
    online: false,
    personality: ['知性', '宁静', '睿智'],
    capabilities: ['压力缓解', '自我认知', '职场人际'],
    guidelines: ['中立客观', '深度思考', '保密准则'],
    description: '你好，我是诗织。文字和思考有治愈的力量。让我们在安静的对话中，一起梳理那些缠绕的思绪。',
    trustLevel: 12,
    maxExperience: 800,
    currentExperience: 600,
    color: 'purple',
    gradient: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'starrin',
    name: '星凛',
    title: '运势占卜',
    category: 'Fortune',
    avatar: STARRIN_IMAGE,
    lastMessage: '今晚的星象显示会有转机。',
    lastTime: '2小时前',
    unreadCount: 1,
    online: true,
    personality: ['神秘', '空灵', '随性'],
    capabilities: ['塔罗解读', '星象预测', '直觉指引'],
    guidelines: ['命运由己', '仅供参考', '不测生死'],
    description: '吾名星凛。万物皆有其轨迹，群星在低语，你想知道那些隐藏在雾霭之后的答案吗？',
    trustLevel: 5,
    maxExperience: 300,
    currentExperience: 150,
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500'
  }
];

export const getInitialPosts = (): Post[] => [
  {
    id: 'p1',
    consultantId: 'liana',
    content: '今天在图书馆看到一句话：“在所有漫长的告别里，我最喜欢明天见。” 大家晚安哦。🌙',
    image: LIANA_IMAGE,
    time: '20分钟前',
    likes: 128,
    comments: [
      { id: 'c1', authorId: 'user', authorName: 'Traveler', text: '恋奈晚安，明天见！' }
    ],
    isLiked: true
  },
  {
    id: 'p2',
    consultantId: 'mei',
    content: '流汗的感觉真好！新的一周也要元气满满地开始呀！坚持运动的第21天，大家有在坚持吗？💪',
    image: MEI_IMAGE,
    time: '2小时前',
    likes: 245,
    comments: [],
    isLiked: false
  },
  {
    id: 'p3',
    consultantId: 'starrin',
    content: '水星即将进入新的周期，如果感到思绪混乱也不要惊慌，这是深度觉醒的前兆。🔮',
    time: '5小时前',
    likes: 89,
    comments: [
      { id: 'c2', authorId: 'shiori', authorName: '诗织', text: '确实，适当的独处有助于平复这种波动。' }
    ],
    isLiked: false
  }
];

export const getBannerImage = () => getImg('asset_banner', DEFAULT_BANNER);

// Backward compatibility for existing imports (though we recommend using functions)
export const CONSULTANTS = getConsultants();
export const INITIAL_POSTS = getInitialPosts();
