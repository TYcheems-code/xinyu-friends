
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, uploadAvatar, signOut, User } from '../services/authService';

const Mine: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [user, setUser] = useState<User | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    window.dispatchEvent(new CustomEvent('theme-toggle', { detail: { dark } }));
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const newAvatarUrl = await uploadAvatar(file);
      if (newAvatarUrl && user) {
        setUser({ ...user, avatar_url: newAvatarUrl });
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      alert('上传头像失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理登出
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const settingsItems = [
    { id: 'preferences', icon: 'tune', title: '偏好设置', sub: '语气, 提醒, 习惯', color: 'bg-pink-100', text: 'text-primary' },
    { id: 'privacy', icon: 'shield_person', title: '数据与隐私', sub: '权限, 账户安全', color: 'bg-purple-100', text: 'text-purple-500' },
    { id: 'subscription', icon: 'credit_card_heart', title: '订阅管理', sub: '会员状态, 支付记录', color: 'bg-amber-100', text: 'text-amber-500' },
  ];

  // 默认头像
  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffb6d3";

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-32 transition-colors duration-300">
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <header className="sticky top-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between border-b border-transparent dark:border-white/5">
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">个人中心</h2>
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative group">
            <div
              onClick={handleAvatarClick}
              className={`size-24 rounded-full border-4 border-white dark:border-slate-800 shadow-soft-float overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
            >
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-600">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <img
                  src={user?.avatar_url || defaultAvatar}
                  className="w-full h-full object-cover"
                  alt="用户头像"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultAvatar;
                  }}
                />
              )}
            </div>
            <div
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md text-primary border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                {isUploading ? 'hourglass_empty' : 'photo_camera'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-tight">{user?.nickname || 'Traveler'}</h1>
            <div className="mt-2 bg-gradient-to-r from-primary to-pink-400 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">diamond</span>
              <span>{user?.is_vip ? '心语会员' : '普通用户'}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {user?.phone ? `手机号: ${user.phone.slice(0, 3)}****${user.phone.slice(-4)}` : '点击头像更换照片'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-soft-float border border-slate-100 dark:border-white/5">
          {settingsItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <div
                onClick={() => navigate(`/settings/${item.id}`)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group"
              >
                <div className={`size-11 rounded-xl flex items-center justify-center ${item.color} ${item.text} shadow-sm`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold">{item.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sub}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
              {idx < settingsItems.length - 1 && <div className="h-px bg-slate-50 dark:bg-slate-700/50 mx-4" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-soft-float border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <div>
              <p className="text-base font-bold">外观主题</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">深色 / 浅色模式</p>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-xl flex gap-1 transition-colors">
            <button
              onClick={() => toggleTheme(false)}
              className={`p-2 rounded-lg transition-all ${!isDarkMode ? 'bg-white shadow-sm text-yellow-500' : 'text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-base">light_mode</span>
            </button>
            <button
              onClick={() => toggleTheme(true)}
              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-slate-600 shadow-sm text-indigo-300' : 'text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-base">dark_mode</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 py-4">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border border-primary/20 dark:border-primary/40 text-primary font-bold text-sm bg-white dark:bg-slate-800 hover:bg-primary/5 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            登出
          </button>
          <a href="#" className="text-xs font-medium text-slate-400 dark:text-slate-500 underline underline-offset-4 decoration-slate-200 dark:decoration-slate-700">
            联系我们 / 问题反馈
          </a>
          <p className="text-[10px] text-slate-300 dark:text-slate-600 uppercase tracking-widest">版本 2.4.0</p>
        </div>
      </main>
    </div>
  );
};

export default Mine;
