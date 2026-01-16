
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Subscription: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-10">
      <header className="sticky top-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center gap-4">
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">订阅管理</h2>
      </header>

      <main className="p-6 space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-rose-400 rounded-3xl p-6 text-white shadow-glow">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">diamond</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">当前会员</p>
          <h3 className="text-2xl font-extrabold mt-1">心语高级会员</h3>
          <p className="text-sm mt-4 font-medium">有效期至 2024年10月23日</p>
          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold">续费套餐</button>
            <button className="px-4 py-2 bg-white text-primary rounded-xl text-xs font-bold">查看权益</button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">会员特权</h3>
          <div className="grid grid-cols-1 gap-3">
             {[
               { icon: 'bolt', title: '无限次 AI 深度对话', sub: '使用最高性能 Gemini 3 Pro 模型' },
               { icon: 'imagesmode', title: '心情画报无限生成', sub: '每日免费生成高精 AI 疗愈插画' },
               { icon: 'record_voice_over', title: '专属语音音色', sub: '解锁 12 种不同性格的伙伴声音' },
             ].map((feature, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
                 <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <span className="material-symbols-outlined text-lg">{feature.icon}</span>
                 </div>
                 <div>
                   <p className="text-sm font-bold">{feature.title}</p>
                   <p className="text-[10px] text-slate-400 mt-0.5">{feature.sub}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <button className="w-full py-4 text-xs text-slate-400 font-bold hover:text-primary transition-colors">管理自动续费设置</button>
      </main>
    </div>
  );
};

export default Subscription;
