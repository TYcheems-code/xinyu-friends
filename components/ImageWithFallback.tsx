
import React, { useState, useCallback } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// 默认的二次元风格占位图（使用 SVG 数据 URI）
const DEFAULT_AVATAR_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fc78ab;stop-opacity:0.2"/>
      <stop offset="100%" style="stop-color:#B8A9E8;stop-opacity:0.2"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg)"/>
  <circle cx="50" cy="35" r="18" fill="#fc78ab" opacity="0.6"/>
  <ellipse cx="50" cy="80" rx="28" ry="20" fill="#fc78ab" opacity="0.4"/>
  <circle cx="44" cy="32" r="3" fill="#fff"/>
  <circle cx="56" cy="32" r="3" fill="#fff"/>
  <path d="M45 40 Q50 45 55 40" stroke="#fff" fill="none" stroke-width="2" stroke-linecap="round"/>
</svg>
`)}`;

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_AVATAR_PLACEHOLDER,
  className = '',
  containerClassName = '',
  onLoad,
  onError: onErrorProp,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
    onErrorProp?.();
  }, [currentSrc, fallbackSrc, onErrorProp]);

  // 当 src 改变时重置状态
  React.useEffect(() => {
    if (src !== currentSrc && src !== fallbackSrc) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, currentSrc, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* 加载骨架屏 */}
      {isLoading && (
        <div className="absolute inset-0 img-skeleton" />
      )}
      
      {/* 图片 */}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'img-fade-in'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      
      {/* 错误状态指示 */}
      {hasError && (
        <div className="absolute bottom-1 right-1 bg-yellow-500/80 text-white text-[8px] px-1 py-0.5 rounded">
          备用图
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;

// 导出默认占位图常量供其他组件使用
export { DEFAULT_AVATAR_PLACEHOLDER };
