
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: '首页', icon: 'home_app_logo', path: '/home' },
    { label: '对话', icon: 'chat_bubble', path: '/chat' },
    { label: '发现', icon: 'explore', path: '/discover' },
    { label: '我的', icon: 'person', path: '/mine' },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="glass-panel mx-auto max-w-sm rounded-3xl h-16 flex items-center justify-around px-2 shadow-lg shadow-black/5 border border-white/20 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all group ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-primary'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : 'group-hover:-translate-y-0.5 transition-transform'}`}>
                  {item.icon}
                </span>
                {item.path === '/chat' && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 bg-primary rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
