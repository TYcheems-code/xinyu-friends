
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultants, getFallbackImage, getChibiAvatar } from '../constants';
import { Message } from '../types';
import { sendMessageToAI, speakMessage, decode, decodeAudioData } from '../services/geminiService';

const ChatDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 使用 useMemo 缓存 consultants 和 consultant，避免每次渲染都重新计算
  const consultants = useMemo(() => getConsultants(), []);
  const consultant = useMemo(() => consultants.find(c => c.id === id), [consultants, id]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false); // 防止重复初始化

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);

  // 初始化消息 - 只在 id 变化时执行一次
  useEffect(() => {
    if (!id || !consultant) return;

    // 防止重复初始化
    if (initializedRef.current) return;
    initializedRef.current = true;

    const saved = localStorage.getItem(`chat_history_${id}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // 解析失败时使用初始消息
        setMessages([{
          id: 'm1',
          senderId: consultant.id,
          text: consultant.lastMessage || '嘿！最近怎么样？',
          timestamp: '10:23'
        }]);
      }
    } else {
      setMessages([{
        id: 'm1',
        senderId: consultant.id,
        text: consultant.lastMessage || '嘿！最近怎么样？',
        timestamp: '10:23'
      }]);
    }

    // 清理函数：当 id 变化时重置
    return () => {
      initializedRef.current = false;
    };
  }, [id]); // 只依赖 id，不依赖 consultant

  // 保存消息到 localStorage
  useEffect(() => {
    if (id && messages.length > 0 && initializedRef.current) {
      localStorage.setItem(`chat_history_${id}`, JSON.stringify(messages));
    }
  }, [id, messages]);

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  if (!consultant) return null;

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !consultant) return;

    const currentInput = inputValue;
    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: currentInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 使用当前 messages 的快照
      const currentMessages = messages;
      const history = currentMessages.slice(-10).map(m => ({
        role: m.senderId === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '' }]
      }));

      const result = await sendMessageToAI(
        consultant.name,
        history,
        currentInput,
        consultant.description,
        consultant.systemPrompt
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: consultant.id,
        text: result.text,
        image: result.image,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('发送消息失败:', error);
      // 发送失败时添加错误提示消息
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: consultant.id,
        text: '抱歉，消息发送失败了，请稍后重试~',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, consultant, messages]);

  const handleSpeak = async (msg: Message) => {
    if (!msg.text || isPlayingId) return;

    setIsPlayingId(msg.id);
    try {
      const base64 = await speakMessage(msg.text);
      if (base64) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const data = decode(base64);
        const buffer = await decodeAudioData(data, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlayingId(null);
        source.start();
      } else {
        setIsPlayingId(null);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingId(null);
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-64 bg-primary blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-accent-lavender blur-[120px] rounded-full" />
      </div>

      <header className="glass-panel sticky top-0 z-50 p-4 pb-3 flex flex-col gap-2 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button className="p-2 -ml-2 rounded-full hover:bg-black/5" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold tracking-wide">{consultant.name}</h1>
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] text-slate-400 font-medium">{consultant.title} 在线</span>
            </div>
          </div>
          <button className="p-2 -mr-2 rounded-full hover:bg-black/5" onClick={() => navigate(`/profile/${consultant.id}`)}>
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </header>

      <div className="relative flex-1 p-4 px-3 overflow-y-auto no-scrollbar space-y-6 z-10" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 w-full ${m.senderId === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.senderId !== 'user' && (
              <div className="shrink-0 mt-1">
                <div className="size-10 rounded-full border-2 border-primary/20 p-0.5 bg-white shadow-sm overflow-hidden">
                  <img
                    src={getChibiAvatar(consultant.id)}
                    className="size-full object-cover rounded-full"
                    alt={consultant.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getFallbackImage(consultant.id);
                    }}
                  />
                </div>
              </div>
            )}
            <div className={`flex flex-col gap-1.5 max-w-[80%] ${m.senderId === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`relative p-3.5 rounded-2xl shadow-soft border group ${m.senderId === 'user'
                ? 'bg-primary text-white rounded-tr-none border-primary/10'
                : 'bg-white dark:bg-slate-800 rounded-tl-none border-gray-100 dark:border-white/5'
                }`}>
                {m.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                {m.image && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                    <img
                      src={m.image}
                      alt="AI 生成的图片"
                      className="w-full max-h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="#f0f0f0" width="300" height="200"/><text x="150" y="100" font-size="14" fill="#999" text-anchor="middle">图片加载失败</text></svg>`)}`;
                      }}
                    />
                  </div>
                )}
                {m.senderId !== 'user' && m.text && (
                  <button
                    onClick={() => handleSpeak(m)}
                    className={`absolute -right-10 top-0 size-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${isPlayingId === m.id ? 'text-primary opacity-100' : 'text-slate-400'}`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isPlayingId === m.id ? 'animate-pulse' : ''}`}>
                      {isPlayingId === m.id ? 'volume_up' : 'campaign'}
                    </span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
                  {m.timestamp}
                </span>
                {m.senderId === 'user' && (
                  <span className="material-symbols-outlined text-[10px] text-primary fill-1">check_circle</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-gray-100 border-2 border-primary/20 p-0.5 overflow-hidden">
              <img
                src={getChibiAvatar(consultant.id)}
                className="size-full object-cover rounded-full grayscale opacity-50"
                alt={consultant.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getFallbackImage(consultant.id);
                }}
              />
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 w-full z-50 bg-gradient-to-t from-background-light via-background-light dark:from-background-dark dark:via-background-dark to-transparent pt-8 pb-10 px-4">
        <div className="flex items-end gap-3 p-2 rounded-[28px] bg-white/95 dark:bg-slate-800/95 border border-gray-100 dark:border-white/10 shadow-glass backdrop-blur-md">
          <button className="flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-gray-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="flex-1 py-3">
            <textarea
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-transparent border-0 p-0 text-sm placeholder:text-gray-400 focus:ring-0 resize-none max-h-32"
              placeholder={`给 ${consultant.name} 发消息...`}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="flex shrink-0 items-center justify-center w-11 h-11 rounded-full bg-primary hover:bg-primary-dark text-white shadow-glow transition-all transform active:scale-90 disabled:opacity-50 disabled:grayscale"
          >
            <span className="material-symbols-outlined text-[20px] fill-1">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
