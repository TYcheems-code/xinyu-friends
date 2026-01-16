
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Preferences: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(true);
  const [tone, setTone] = useState('Gentle');

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-10">
      <header className="sticky top-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center gap-4">
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">偏好设置</h2>
      </header>

      <main className="p-6 space-y-6">
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft-float border border-slate-100 dark:border-white/5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">陪伴语气</h3>
          <div className="grid grid-cols-2 gap-3">
            {['温柔', '幽默', '严谨', '感性'].map((t) => (
              <button 
                key={t}
                onClick={() => setTone(t)}
                className={`p-4 rounded-2xl border-2 transition-all text-sm font-bold ${tone === t ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 dark:border-slate-700 text-slate-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft-float border border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">心情提醒</h3>
              <p className="text-xs text-slate-400 mt-1">每天定时邀请您记录心情</p>
            </div>
            <button 
              onClick={() => setReminders(!reminders)}
              className={`w-12 h-6 rounded-full transition-colors relative ${reminders ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 size-4 bg-white rounded-full transition-transform ${reminders ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft-float border border-slate-100 dark:border-white/5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">辅助习惯</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>对话自动朗读</span>
              <span className="text-xs text-slate-400 font-bold">已开启</span>
            </div>
            <div className="h-px bg-slate-50 dark:bg-slate-700" />
            <div className="flex items-center justify-between text-sm">
              <span>隐藏历史记录</span>
              <span className="text-xs text-slate-400 font-bold">已关闭</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Preferences;
