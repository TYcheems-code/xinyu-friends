
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhone, verifyOtp } from '../services/authService';

type AuthStep = 'phone' | 'verify' | 'profile';

const Auth: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<AuthStep>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    // 发送验证码
    const handleSendCode = async () => {
        if (!phone || phone.length < 11) {
            setError('请输入正确的手机号');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await signInWithPhone(phone);

        if (result.success) {
            setStep('verify');
            // 开始倒计时
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setError(result.error || '发送验证码失败');
        }

        setIsLoading(false);
    };

    // 验证验证码
    const handleVerifyCode = async () => {
        if (!code || code.length < 4) {
            setError('请输入验证码');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await verifyOtp(phone, code);

        if (result.success) {
            // 设置用户同意并跳转首页
            localStorage.setItem('user_consent', 'true');
            navigate('/home');
        } else {
            setError(result.error || '验证码错误');
        }

        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-pink-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* 顶部装饰 */}
            <div className="relative h-48 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20" />
                <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-10 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-pink-500 text-4xl fill-1">favorite</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">心语伙伴</h1>
                </div>
            </div>

            {/* 主内容区 */}
            <div className="flex-1 px-6 pt-8">
                {step === 'phone' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">欢迎登录</h2>
                            <p className="text-sm text-slate-500 mt-1">输入手机号开始您的心灵之旅</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">手机号</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">+86</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        placeholder="请输入手机号"
                                        className="w-full pl-14 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-lg"
                                        maxLength={11}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleSendCode}
                                disabled={isLoading || phone.length < 11}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-base shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        发送中...
                                    </>
                                ) : (
                                    '获取验证码'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-slate-400">
                                登录即表示您同意我们的
                                <a href="#" className="text-pink-500 mx-1">服务协议</a>
                                和
                                <a href="#" className="text-pink-500 ml-1">隐私政策</a>
                            </p>
                        </div>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-6">
                        <div>
                            <button
                                onClick={() => setStep('phone')}
                                className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                返回
                            </button>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">输入验证码</h2>
                            <p className="text-sm text-slate-500 mt-1">验证码已发送至 {phone}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">验证码</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="请输入验证码"
                                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-lg text-center tracking-[0.5em]"
                                    maxLength={6}
                                />
                            </div>

                            <div className="flex justify-center">
                                {countdown > 0 ? (
                                    <span className="text-sm text-slate-400">{countdown}秒后可重新获取</span>
                                ) : (
                                    <button onClick={handleSendCode} className="text-sm text-pink-500 font-medium">
                                        重新获取验证码
                                    </button>
                                )}
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm flex items-center gap-1 justify-center">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleVerifyCode}
                                disabled={isLoading || code.length < 4}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-base shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        验证中...
                                    </>
                                ) : (
                                    '登录'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 底部装饰 */}
            <div className="h-20 flex items-center justify-center">
                <p className="text-xs text-slate-300">心语伙伴 v2.4.0</p>
            </div>
        </div>
    );
};

export default Auth;
