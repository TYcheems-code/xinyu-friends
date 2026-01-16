
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultants, getFallbackImage } from '../constants';

const ConsultantProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const consultants = getConsultants();
  const c = consultants.find(con => con.id === id);

  if (!c) return null;

  return (
    <div className="relative h-full flex flex-col bg-background-dark overflow-y-auto no-scrollbar pb-32 text-white">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          className="size-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md active:scale-90 transition-transform"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-3">
          <button
            className="size-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md active:scale-90 transition-transform text-white"
            onClick={() => navigate('/home')}
            aria-label="回到主页"
          >
            <span className="material-symbols-outlined">home</span>
          </button>
          <button
            className="size-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md active:scale-90 transition-transform text-white"
            onClick={() => navigate('/home')}
            aria-label="关闭详情"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="relative h-[65vh] w-full overflow-hidden shrink-0 bg-slate-900">
        <img
          src={c.avatar}
          className="absolute inset-0 size-full object-cover"
          alt={c.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getFallbackImage(c.id);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent" />
        <div className="absolute bottom-16 left-0 w-full px-6 z-10">
          <div className="flex flex-col items-start gap-1">
            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              {c.category === 'Emotion' ? '情感咨询' : c.category === 'Health' ? '健康管理' : c.category === 'Psychology' ? '心理健康' : '运势指引'}
            </span>
            <h1 className="text-5xl font-extrabold tracking-tight">{c.name}</h1>
            <p className="text-lg text-white/90 font-medium">{c.title}，{c.personality.slice(0, 2).join('')}的倾听者</p>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-10 flex flex-col gap-6 px-4">
        <div className="bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-sm text-slate-400 font-medium">信任等级</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">Lv.{c.trustLevel}</span>
                <span className="text-xs text-primary font-medium">亲密伙伴</span>
              </div>
            </div>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">verified</span>
            </div>
          </div>
          <div className="relative w-full h-3 bg-black/40 rounded-full overflow-hidden mb-2">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary-light shadow-[0_0_10px_rgba(252,120,171,0.5)]"
              style={{ width: `${(c.currentExperience / c.maxExperience) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>当前经验</span>
            <span>{c.currentExperience} / {c.maxExperience}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold">能力范围</h3>
          </div>
          <div className="bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <ul className="space-y-4">
              {c.capabilities.map((cap, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 size-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[10px] text-green-400 font-bold">check</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium">{cap}</p>
                    <p className="text-xs text-slate-500 mt-0.5">为您提供专业的{cap}指导与支持。</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold">行为准则</h3>
          </div>
          <div className="bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <ul className="space-y-4">
              {c.guidelines.map((guide, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 size-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[10px] text-red-400 font-bold">close</span>
                  </div>
                  <p className="text-sm text-slate-300">{guide}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold px-1">性格特点</h3>
          <div className="flex gap-2 flex-wrap">
            {c.personality.map((p, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">#{p}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-40">
        <button
          onClick={() => navigate(`/chat/${c.id}`)}
          className="w-full h-14 bg-white text-background-dark rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-glow transform active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          开始对话
        </button>
      </div>
    </div>
  );
};

export default ConsultantProfile;
