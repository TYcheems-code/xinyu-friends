
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import ChatList from './pages/ChatList';
import ChatDetail from './pages/ChatDetail';
import Discover from './pages/Discover';
import Mine from './pages/Mine';
import Auth from './pages/Auth';
import Preferences from './pages/settings/Preferences';
import Privacy from './pages/settings/Privacy';
import Subscription from './pages/settings/Subscription';
import ConsultantProfile from './pages/ConsultantProfile';
import Navigation from './components/Navigation';
import { generateImage } from './services/geminiService';

// Asset Generator Component
const AssetGenerator: React.FC = () => {
  useEffect(() => {
    const generateAssets = async () => {
      if (localStorage.getItem('assets_generated_v1') === 'true') return;

      const assets = [
        {
          key: 'asset_liana',
          prompt: 'Anime style portrait of a cute girl with pink hair holding a notebook, school uniform, soft pastel colors, high quality, 2d art, sweet smile'
        },
        {
          key: 'asset_mei',
          prompt: 'Anime style portrait of an energetic girl with a high ponytail, holding a sports water bottle, wearing a white and cyan track jacket, active, bright lighting, high quality'
        },
        {
          key: 'asset_shiori',
          prompt: 'Anime style portrait of a gentle girl with long purple hair holding a book, intellectual look, lavender cardigan, quiet library atmosphere, high quality'
        },
        {
          key: 'asset_starrin',
          prompt: 'Anime style portrait of a mysterious girl holding a folding fan, starry night background, elegant dress, dark blue and gold theme, magical atmosphere'
        },
        {
          key: 'asset_banner',
          prompt: 'Anime style illustration landscape of four girls standing on a beach at sunset, chatting happily, golden hour lighting, beautiful clouds, high quality art'
        }
      ];

      for (const asset of assets) {
        if (!localStorage.getItem(asset.key)) {
          console.log(`Generating asset: ${asset.key}...`);
          const base64 = await generateImage(asset.prompt);
          if (base64) {
            localStorage.setItem(asset.key, base64);
            window.dispatchEvent(new Event('assets-updated'));
          }
        }
      }

      localStorage.setItem('assets_generated_v1', 'true');
    };

    const timer = setTimeout(generateAssets, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

const AppContent: React.FC = () => {
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [_, setTick] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const storedConsent = localStorage.getItem('user_consent');
    if (storedConsent === 'true') {
      setHasConsented(true);
    } else if (location.pathname !== '/') {
      navigate('/');
    }

    const handleUpdate = () => setTick(t => t + 1);
    const handleThemeChange = (e: any) => setIsDarkMode(e.detail.dark);

    window.addEventListener('assets-updated', handleUpdate);
    window.addEventListener('theme-toggle', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('assets-updated', handleUpdate);
      window.removeEventListener('theme-toggle', handleThemeChange as EventListener);
    };
  }, [navigate, location.pathname]);

  const handleConsent = () => {
    localStorage.setItem('user_consent', 'true');
    setHasConsented(true);
    navigate('/home');
  };

  const noNavPaths = ['/', '/chat/', '/profile/', '/settings/'];
  const showNav = !noNavPaths.some(path => location.pathname.startsWith(path)) || ['/chat', '/home', '/discover', '/mine'].includes(location.pathname);
  // Special handling for chat details which shouldn't show main nav
  const isChatDetail = location.pathname.startsWith('/chat/') && location.pathname !== '/chat';
  const finalShowNav = showNav && !isChatDetail && !location.pathname.includes('/settings/');

  return (
    <div className="relative h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      <AssetGenerator />
      <Routes>
        <Route path="/" element={<Onboarding onConsent={handleConsent} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:id" element={<ChatDetail />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/mine" element={<Mine />} />
        <Route path="/settings/preferences" element={<Preferences />} />
        <Route path="/settings/privacy" element={<Privacy />} />
        <Route path="/settings/subscription" element={<Subscription />} />
        <Route path="/profile/:id" element={<ConsultantProfile />} />
      </Routes>
      {finalShowNav && <Navigation />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      {/* 外层容器 - 在桌面端显示时居中并添加手机框效果 */}
      <div className="phone-container">
        <div className="phone-frame">
          <AppContent />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
