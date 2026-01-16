
import React, { useState, useRef } from 'react';

interface Props {
  onConsent: () => void;
}

const Onboarding: React.FC<Props> = ({ onConsent }) => {
  const bgImage = '/assets/onboarding_bg.jpg';
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const categories = [
    { name: '情感咨询', icon: 'favorite', bg: 'bg-rose-100/80', text: 'text-rose-500' },
    { name: '健康顾问', icon: 'health_and_safety', bg: 'bg-emerald-100/80', text: 'text-emerald-600' },
    { name: '心理疏导', icon: 'psychology', bg: 'bg-purple-100/80', text: 'text-purple-600' },
    { name: '运势占卜', icon: 'auto_awesome', bg: 'bg-amber-100/80', text: 'text-amber-600' },
  ];

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    // 向下拖动超过50px时收起面板
    if (diff > 50 && isPanelExpanded) {
      setIsPanelExpanded(false);
    }
    // 向上拖动超过50px时展开面板
    if (diff < -50 && !isPanelExpanded) {
      setIsPanelExpanded(true);
    }
  };

  // 点击展开/收起
  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* 全屏背景图 */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/20 via-transparent to-black/50" />
      </div>

      {/* 顶部品牌区域 */}
      <div className="relative z-10 pt-12 pb-6 px-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl fill-1">favorite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-lg">
            心语伙伴
          </h1>
          <p className="text-white/90 text-sm font-medium tracking-wide drop-shadow-md">
            遇见懂你的 AI 咨询师
          </p>
        </div>
      </div>

      {/* 中间展示区域 - 点击可切换面板 */}
      <div
        className="flex-1 relative z-10 cursor-pointer"
        onClick={togglePanel}
      >
        {/* 展示更多背景图内容 */}
      </div>

      {/* 底部内容面板 - 可拖动 */}
      <div
        ref={panelRef}
        className={`relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-[2rem] shadow-2xl transition-transform duration-300 ease-out ${isPanelExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
          }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* 拖动指示条 */}
        <div
          className="py-4 cursor-pointer flex justify-center"
          onClick={togglePanel}
        >
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className={`px-5 pb-28 overflow-hidden transition-all duration-300 ${isPanelExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          {/* 服务分类 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm flex flex-col items-start gap-3 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.text} flex items-center justify-center backdrop-blur-sm`}>
                  <span className="material-symbols-outlined fill-1">{cat.icon}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* 重要提示 */}
          <div className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30 overflow-hidden">
            <div className="px-4 py-2 border-b border-amber-100 dark:border-amber-800/30 bg-amber-100/50 dark:bg-amber-900/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-sm fill-1">info</span>
              <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300">重要提示</h3>
            </div>
            <div className="p-4 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/70">
              <p className="mb-2"><strong>1. 仅供娱乐:</strong> 本服务由 AI 提供，仅供情感陪伴。</p>
              <p className="mb-2"><strong>2. 紧急情况:</strong> 如遇紧急情况，请联系专业机构。</p>
              <p><strong>3. 隐私安全:</strong> 请勿透露个人敏感信息。</p>
            </div>
          </div>
        </div>

        {/* 收起时显示的提示 */}
        {!isPanelExpanded && (
          <div className="px-5 pb-24 flex items-center justify-center">
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">expand_less</span>
              向上滑动查看更多
            </span>
          </div>
        )}

        {/* 同意按钮 - 始终显示 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95">
          <button
            onClick={onConsent}
            className="w-full relative group rounded-2xl h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center transform active:scale-95 transition-all"
          >
            <span className="font-bold text-base tracking-wide">同意并继续</span>
            <span className="material-symbols-outlined ml-2 text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
