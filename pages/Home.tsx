
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConsultants, getFallbackImage } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState(75);
  const consultants = getConsultants();

  useEffect(() => {
    const savedMood = localStorage.getItem('user_mood');
    if (savedMood) setMood(parseInt(savedMood));
  }, []);

  const handleMoodChange = (val: number) => {
    setMood(val);
    localStorage.setItem('user_mood', val.toString());
  };

  const getMoodEmoji = (val: number) => {
    if (val < 25) return '😔';
    if (val < 50) return '😐';
    if (val < 75) return '🙂';
    return '✨';
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-30">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">早安，Traveler</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">心语等级 12</span>
            <div className="flex items-center gap-1 text-amber-500">
              <span className="material-symbols-outlined text-[14px] fill-1">star</span>
              <span className="text-xs font-bold">2,480</span>
            </div>
          </div>
        </div>
        <div className="relative cursor-pointer" onClick={() => navigate('/mine')}>
          <div className="size-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 bg-slate-100 shadow-soft-float">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffb6d3"
              className="size-full object-cover"
              alt="用户头像"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#fc78ab" width="100" height="100"/><text x="50" y="60" font-size="40" fill="white" text-anchor="middle">T</text></svg>`)}`;
              }}
            />
          </div>
          <div className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 font-bold">9+</div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <section className="relative overflow-hidden rounded-[32px] bg-white dark:bg-slate-800 p-6 shadow-soft-float border border-gray-100 dark:border-white/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-lg font-bold">目前的心情</h2>
              <p className="text-xs text-slate-400 mt-1">AI 伙伴会根据此调整陪伴语气</p>
            </div>
            <div className="text-3xl animate-bounce duration-1000">
              {getMoodEmoji(mood)}
            </div>
          </div>
          <div className="relative pt-4 pb-2">
            <input
              type="range"
              min="0" max="100"
              value={mood}
              onChange={(e) => handleMoodChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">
              <span>低沉</span>
              <span>平静</span>
              <span className="text-primary">充沛</span>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary"></span>
              专属顾问
            </h3>
            <button className="text-primary text-xs font-bold hover:underline" onClick={() => navigate('/chat')}>查看全部</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {consultants.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/profile/${c.id}`)}
                className="group relative rounded-[28px] overflow-hidden bg-white dark:bg-slate-800 shadow-soft-float transition-all hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary/20"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={c.avatar}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={c.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage(c.id);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[9px] font-bold tracking-widest text-white/80 uppercase block mb-0.5">{c.title}</span>
                    <h4 className="text-white text-lg font-bold">{c.name}</h4>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-slate-400">活跃中</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-primary">chat_bubble</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
