import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 检测是否已安装
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // 检测 iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(isIOSDevice);

        // 监听安装提示事件 (Android/Desktop Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // 检查用户是否已经忽略过安装提示
            const dismissed = localStorage.getItem('pwa_install_dismissed');
            if (!dismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 如果是 iOS 且未安装，显示手动安装提示
        if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
            const dismissed = localStorage.getItem('pwa_install_dismissed_ios');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 2000);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem('pwa_install_dismissed_ios', 'true');
        } else {
            localStorage.setItem('pwa_install_dismissed', 'true');
        }
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-[9999] animate-slide-up">
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-4 shadow-2xl border border-white/20">
                <div className="flex items-start gap-3">
                    <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">download</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base">安装心语伙伴 App</h3>
                        <p className="text-white/80 text-sm mt-0.5">
                            {isIOS
                                ? '点击分享按钮 ⬆️ 然后选择"添加到主屏幕"'
                                : '添加到主屏幕，随时与恋奈聊天 💕'
                            }
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="size-8 flex items-center justify-center text-white/60 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {!isIOS && (
                    <button
                        onClick={handleInstall}
                        className="w-full mt-3 h-11 bg-white text-primary rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                        <span className="material-symbols-outlined text-lg">install_mobile</span>
                        立即安装
                    </button>
                )}

                {isIOS && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-white/90 text-sm">
                        <span>Safari 浏览器</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        <span>分享 ⬆️</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        <span>添加到主屏幕</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
