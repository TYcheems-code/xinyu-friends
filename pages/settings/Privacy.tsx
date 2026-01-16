
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-10">
      <header className="sticky top-0 z-50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center gap-4">
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">数据与隐私</h2>
      </header>

      <main className="p-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft-float border border-slate-100 dark:border-white/5">
          <h3 className="text-base font-bold mb-4">账户安全</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">关联手机号</span>
              <span className="text-xs text-slate-400 font-medium">138****8888</span>
            </div>
            <div className="h-px bg-slate-50 dark:bg-slate-700" />
            <div className="flex items-center justify-between">
              <span className="text-sm">两步验证</span>
              <span className="text-xs text-primary font-bold">去开启</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft-float border border-slate-100 dark:border-white/5">
          <h3 className="text-base font-bold mb-4">数据管理</h3>
          <div className="space-y-4">
            <button className="w-full text-left text-sm text-red-500 font-bold py-2">清除所有聊天记录</button>
            <div className="h-px bg-slate-50 dark:bg-slate-700" />
            <button className="w-full text-left text-sm py-2">导出我的个人数据</button>
            <div className="h-px bg-slate-50 dark:bg-slate-700" />
            <button className="w-full text-left text-sm text-slate-400 py-2">注销账号</button>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            我们采用端到端加密技术确保您的咨询记录绝对隐私。任何 AI 模型训练均不包含您的个人身份信息。
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
