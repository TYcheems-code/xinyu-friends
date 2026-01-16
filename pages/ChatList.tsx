
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultants, getFallbackImage, getChibiAvatar } from '../constants';
import { Category } from '../types';

const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Category | 'All'>('All');

  const consultants = getConsultants();

  const filteredConsultants = filter === 'All'
    ? consultants
    : consultants.filter(c => c.category === filter);

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark pb-32">
      <header className="pt-8 pb-4 px-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              最近咨询记录
              <span className="size-2 rounded-full bg-primary animate-pulse"></span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">与你的伙伴保持联系</p>
          </div>
          <button className="p-2 rounded-full hover:bg-black/5" onClick={() => navigate('/mine')}>
            <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">account_circle</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {(['All', 'Emotion', 'Health', 'Psychology', 'Fortune'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex shrink-0 items-center justify-center h-9 px-5 rounded-full transition-all ${filter === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-slate-400 hover:text-primary'
                }`}
            >
              <span className="text-sm font-semibold">
                {cat === 'All' ? '全部' : cat === 'Emotion' ? '情感' : cat === 'Health' ? '健康' : cat === 'Psychology' ? '心理' : '运势'}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-2 space-y-4 overflow-y-auto no-scrollbar">
        {filteredConsultants.map((c) => (
          <div
            key={c.id}
            onClick={() => navigate(`/chat/${c.id}`)}
            className="group relative flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-slate-800 shadow-soft-float hover:shadow-md transition-all transform active:scale-[0.98] cursor-pointer border border-transparent hover:border-primary/10 overflow-hidden"
          >
            <div className={`absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="relative shrink-0">
              <div className={`size-[60px] rounded-full p-[2px] bg-gradient-to-tr ${c.gradient}`}>
                <div className="size-full rounded-full bg-white dark:bg-slate-800 p-[1.5px]">
                  <div className="size-full rounded-full overflow-hidden bg-slate-100">
                    <img
                      src={getChibiAvatar(c.id)}
                      className="size-full object-cover"
                      alt={c.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImage(c.id);
                      }}
                    />
                  </div>
                </div>
              </div>
              {c.online && (
                <div className="absolute bottom-1 right-1 size-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0 py-1">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-base font-bold truncate">{c.name}</h3>
                <span className={`text-[10px] font-medium ${c.unreadCount ? 'text-primary' : 'text-slate-400'}`}>
                  {c.lastTime}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-snug line-clamp-1">
                {c.lastMessage}
              </p>
            </div>
            {c.unreadCount ? (
              <div className="shrink-0 flex items-center justify-center">
                <div className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-primary shadow-glow shadow-primary/40">
                  <span className="text-[10px] font-bold text-white">{c.unreadCount}</span>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </main>
    </div>
  );
};

export default ChatList;
