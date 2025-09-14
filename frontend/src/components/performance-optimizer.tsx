import { useEffect } from 'react';
import { IMAGE_PATHS } from '@/lib/image-config';

// 性能优化组件
export default function PerformanceOptimizer() {
  useEffect(() => {
    // 预加载关键资源
    const preloadCriticalResources = () => {
      // 预加载关键字体
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);

      // 预加载关键图片
      const imageLink = document.createElement('link');
      imageLink.rel = 'preload';
      imageLink.href = IMAGE_PATHS.DEFAULT_OG;
      imageLink.as = 'image';
      imageLink.onerror = () => imageLink.style.display = 'none';
      document.head.appendChild(imageLink);
    };

    // 添加性能监控
    const addPerformanceMonitoring = () => {
      // 监控页面加载时间
      window.addEventListener('load', () => {
        if (performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          console.log(`Page load time: ${loadTime}ms`);
        }
      });

      // 监控LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.log('LCP monitoring not supported');
        }
      }
    };

    // 优化图片加载
    const optimizeImageLoading = () => {
      // 添加图片懒加载
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    };

    // 添加资源提示
    const addResourceHints = () => {
      // DNS预解析
      const dnsPrefetch = ['fonts.googleapis.com', 'fonts.gstatic.com'];
      dnsPrefetch.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });

      // 预连接
      const preconnect = ['fonts.googleapis.com', 'fonts.gstatic.com'];
      preconnect.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `https://${domain}`;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // 执行优化
    preloadCriticalResources();
    addPerformanceMonitoring();
    optimizeImageLoading();
    addResourceHints();

    // 清理函数
    return () => {
      // 清理观察器
      const observers = document.querySelectorAll('[data-observer]');
      observers.forEach(observer => {
        if (observer instanceof IntersectionObserver) {
          observer.disconnect();
        }
      });
    };
  }, []);

  return null;
}
