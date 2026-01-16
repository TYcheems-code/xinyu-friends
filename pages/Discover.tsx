
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitialPosts, getConsultants, getFallbackImage, getChibiAvatar } from '../constants';
import { Post, Comment, Affinity } from '../types';
import {
  generateConsultantReply,
  savePosts,
  loadPosts,
  getAffinity,
  updateAffinity,
  getCurrentTimestamp,
  formatRelativeTime
} from '../services/socialService';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const consultants = getConsultants();

  // 露营背景图片
  const discoverBgImage = '/assets/discover_bg.jpg';

  // 状态管理
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [affinityPopup, setAffinityPopup] = useState<{ show: boolean; points: number; consultantId: string } | null>(null);
  const [replyingComments, setReplyingComments] = useState<Set<string>>(new Set());

  // 下拉放大效果相关状态
  const [headerScale, setHeaderScale] = useState(1);
  const [headerHeight, setHeaderHeight] = useState(288); // 默认 h-72 = 288px
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // 初始化帖子数据
  useEffect(() => {
    const savedPosts = loadPosts();
    if (savedPosts && savedPosts.length > 0) {
      setPosts(savedPosts);
    } else {
      const initialPosts = getInitialPosts();
      setPosts(initialPosts);
      savePosts(initialPosts);
    }
  }, []);

  // 显示好感度弹窗
  const showAffinityPopup = useCallback((points: number, consultantId: string) => {
    setAffinityPopup({ show: true, points, consultantId });
    setTimeout(() => setAffinityPopup(null), 2000);
  }, []);

  // 处理点赞
  const handleLike = useCallback((postId: string) => {
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          if (newIsLiked) {
            // 增加好感度
            updateAffinity(post.consultantId, 2);
            showAffinityPopup(2, post.consultantId);
          }
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      });
      savePosts(updated);
      return updated;
    });
  }, [showAffinityPopup]);

  // 展开/收起评论区
  const toggleCommentSection = useCallback((postId: string) => {
    setExpandedPost(prev => prev === postId ? null : postId);
    setCommentText('');
  }, []);

  // 提交评论
  const handleSubmitComment = useCallback(async (postId: string) => {
    if (!commentText.trim() || isSubmitting) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const consultant = consultants.find(c => c.id === post.consultantId);
    if (!consultant) return;

    setIsSubmitting(true);

    // 创建用户评论
    const userComment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: 'user',
      authorName: '我',
      text: commentText.trim(),
      timestamp: getCurrentTimestamp(),
      isConsultantReply: false
    };

    // 更新帖子添加用户评论
    const updatedPosts = posts.map(p =>
      p.id === postId
        ? { ...p, comments: [...p.comments, userComment] }
        : p
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    setCommentText('');

    // 增加好感度 (发表评论 +5)
    updateAffinity(post.consultantId, 5);
    showAffinityPopup(5, post.consultantId);

    // 标记正在生成回复
    setReplyingComments(prev => new Set(prev).add(userComment.id));

    // 生成咨询师回复 (延迟 1-3 秒模拟真实感)
    setTimeout(async () => {
      try {
        const replyText = await generateConsultantReply(
          consultant.name,
          consultant.description,
          post.content,
          userComment.text
        );

        const consultantReply: Comment = {
          id: `reply_${Date.now()}`,
          authorId: consultant.id,
          authorName: consultant.name,
          text: replyText,
          timestamp: getCurrentTimestamp(),
          isConsultantReply: true,
          replyTo: userComment.id
        };

        // 更新帖子添加咨询师回复
        setPosts(prev => {
          const updated = prev.map(p =>
            p.id === postId
              ? { ...p, comments: [...p.comments, consultantReply] }
              : p
          );
          savePosts(updated);
          return updated;
        });

        // 收到回复增加好感度 +3
        updateAffinity(post.consultantId, 3);
        showAffinityPopup(3, post.consultantId);

      } catch (error) {
        console.error('生成回复失败:', error);
      } finally {
        setReplyingComments(prev => {
          const next = new Set(prev);
          next.delete(userComment.id);
          return next;
        });
        setIsSubmitting(false);
      }
    }, 1500 + Math.random() * 1500);

  }, [commentText, isSubmitting, posts, consultants, showAffinityPopup]);

  return (
    <div
      ref={scrollContainerRef}
      className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-y-auto no-scrollbar pb-32"
      onTouchStart={(e) => {
        const scrollTop = scrollContainerRef.current?.scrollTop || 0;
        if (scrollTop <= 0) {
          startY.current = e.touches[0].clientY;
          isDragging.current = true;
        }
      }}
      onTouchMove={(e) => {
        if (!isDragging.current) return;
        const scrollTop = scrollContainerRef.current?.scrollTop || 0;
        if (scrollTop > 0) {
          isDragging.current = false;
          setHeaderScale(1);
          setHeaderHeight(288);
          return;
        }

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
          // 下拉放大效果
          const scale = 1 + diff / 500;
          const height = 288 + diff * 0.8;
          setHeaderScale(Math.min(scale, 1.5));
          setHeaderHeight(Math.min(height, 450));
        }
      }}
      onTouchEnd={() => {
        isDragging.current = false;
        // 弹性回弹动画
        setHeaderScale(1);
        setHeaderHeight(288);
      }}
    >
      {/* 好感度弹窗 */}
      {affinityPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined fill-1 text-[18px]">favorite</span>
            <span className="font-bold">好感度 +{affinityPopup.points}</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3 h-14">
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold">发现</h1>
          <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined fill-1">photo_camera</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* 顶部背景图 - 支持下拉放大 */}
        <div className="relative w-full overflow-hidden">
          <div
            className="w-full overflow-hidden relative transition-all duration-300 ease-out"
            style={{ height: `${headerHeight}px` }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out origin-center"
              style={{
                backgroundImage: `url(${discoverBgImage})`,
                transform: `scale(${headerScale})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

            {/* 下拉提示 */}
            {headerScale > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                松开查看大图
              </div>
            )}
          </div>

          {/* 用户头像区域 */}
          <div className="absolute -bottom-10 right-4 flex flex-col items-end gap-2 z-10">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg drop-shadow-md">Traveler</span>
              <div
                className="w-20 h-20 rounded-xl border-4 border-white dark:border-slate-800 bg-gray-100 overflow-hidden shadow-lg bg-cover bg-center"
                style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Traveler')" }}
              />
            </div>
          </div>
        </div>

        <div className="h-14 w-full" />

        <div className="px-4 flex flex-col gap-6 mt-4">
          {posts.map((post) => {
            const c = consultants.find(con => con.id === post.consultantId);
            const isExpanded = expandedPost === post.id;
            const affinity = getAffinity(post.consultantId);

            return (
              <article key={post.id} className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-md border border-primary/20 rounded-2xl p-4 flex flex-col gap-3 relative shadow-soft-float">
                {/* 帖子头部 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                    <img
                      src={getChibiAvatar(c?.id || 'liana')}
                      className="w-full h-full object-cover"
                      alt={c?.name || '顾问头像'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImage(c?.id || 'liana');
                      }}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold text-base leading-tight">{c?.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full">{affinity.title}</span>
                    </div>
                    <span className="text-xs text-slate-400">{c?.title}</span>
                  </div>
                </div>

                {/* 帖子内容 */}
                <div className="pl-12">
                  <p className="text-sm leading-relaxed mb-3">{post.content}</p>
                  {post.image && (
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm mb-3">
                      <img
                        src={post.image}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        alt={`${c?.name || '顾问'}的分享`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f0f0f0" width="400" height="300"/><text x="200" y="150" font-size="16" fill="#999" text-anchor="middle">图片加载失败</text></svg>`)}`;
                        }}
                      />
                    </div>
                  )}

                  {/* 点赞和评论按钮 */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400 font-medium">{post.time}</span>
                    <div className="flex items-center gap-2">
                      {/* 点赞按钮 */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${post.isLiked
                          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-500'
                          : 'bg-gray-50 dark:bg-slate-700 hover:bg-primary/10'
                          }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${post.isLiked ? 'fill-1' : ''}`}>favorite</span>
                        <span>{post.likes}</span>
                      </button>

                      {/* 评论按钮 */}
                      <button
                        onClick={() => toggleCommentSection(post.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isExpanded
                          ? 'bg-primary/20 text-primary'
                          : 'bg-gray-50 dark:bg-slate-700 hover:bg-primary/10'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        <span>{post.comments.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* 评论区 */}
                  {(post.comments.length > 0 || isExpanded) && (
                    <div className="mt-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                      {/* 评论列表 */}
                      {post.comments.length > 0 && (
                        <div className="flex flex-col gap-2 mb-3">
                          {post.comments.map(comment => (
                            <div key={comment.id} className={`text-xs ${comment.isConsultantReply ? 'ml-4' : ''}`}>
                              <span className={`font-bold ${comment.isConsultantReply ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                                {comment.authorName}
                              </span>
                              {comment.isConsultantReply && (
                                <span className="text-slate-400 mx-1">回复</span>
                              )}
                              <span className="text-slate-400">: </span>
                              <span className="text-slate-600 dark:text-slate-300">{comment.text}</span>
                            </div>
                          ))}
                          {/* 正在生成回复的提示 */}
                          {Array.from(replyingComments).some(id =>
                            post.comments.some(c => c.id === id)
                          ) && (
                              <div className="text-xs text-slate-400 ml-4 flex items-center gap-1">
                                <span className="text-primary font-bold">{c?.name}</span>
                                <span>正在输入</span>
                                <span className="flex gap-0.5">
                                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                                </span>
                              </div>
                            )}
                        </div>
                      )}

                      {/* 评论输入框 */}
                      {isExpanded && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment(post.id);
                              }
                            }}
                            placeholder={`回复 ${c?.name}...`}
                            className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={isSubmitting}
                          />
                          <button
                            onClick={() => handleSubmitComment(post.id)}
                            disabled={!commentText.trim() || isSubmitting}
                            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-primary-dark active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="py-8 flex justify-center items-center gap-2 opacity-50">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:75ms]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]"></div>
        </div>
      </main>
    </div>
  );
};

export default Discover;
