/**
 * 缓存管理工具
 * 提供前端数据缓存功能，减少API调用
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5分钟
        this.maxSize = 100; // 最大缓存条目数
    }

    /**
     * 生成缓存键
     */
    generateKey(url, params = {}) {
        const paramString = new URLSearchParams(params).toString();
        return paramString ? `${url}?${paramString}` : url;
    }

    /**
     * 存储数据到缓存
     */
    set(key, data, ttl = this.defaultTTL) {
        // 如果缓存太大，删除最老的条目
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
    }

    /**
     * 从缓存获取数据
     */
    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * 清除指定键或所有缓存
     */
    clear(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * 缓存装饰器 - 为API调用添加缓存
     */
    async cachedFetch(url, options = {}, ttl = this.defaultTTL) {
        const key = this.generateKey(url, options.params);
        
        // 尝试从缓存获取
        const cached = this.get(key);
        if (cached) {
            console.log(`Cache hit for: ${key}`);
            return cached;
        }

        try {
            // 构建实际请求URL
            let fetchUrl = url;
            if (options.params) {
                const params = new URLSearchParams(options.params);
                fetchUrl = `${url}?${params.toString()}`;
            }

            // 发起请求
            console.log(`Cache miss, fetching: ${key}`);
            const response = await fetch(fetchUrl, {
                ...options,
                params: undefined // 移除params，因为已经添加到URL中
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // 存储到缓存
            this.set(key, data, ttl);
            
            return data;
        } catch (error) {
            console.error(`Fetch error for ${key}:`, error);
            throw error;
        }
    }
}

/**
 * 图片懒加载优化器
 */
class LazyImageLoader {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: '50px',
                    threshold: 0.1
                }
            );
            this.observeImages();
        } else {
            // 降级处理：立即加载所有图片
            this.loadAllImages();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.observer.observe(img));
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            // 创建新图片预加载
            const newImg = new Image();
            newImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
            };
            newImg.onerror = () => {
                img.classList.add('error');
                console.error(`Failed to load image: ${src}`);
            };
            newImg.src = src;
        }
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }

    // 为新添加的图片添加观察
    observeNewImages() {
        if (this.observer) {
            const newImages = document.querySelectorAll('img[data-src]:not(.observed)');
            newImages.forEach(img => {
                img.classList.add('observed');
                this.observer.observe(img);
            });
        }
    }
}

/**
 * 性能监控器
 */
class PerformanceTracker {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // 监控页面加载性能
        if ('performance' in window) {
            this.trackPageLoad();
            this.trackResourceTiming();
        }
    }

    trackPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.metrics.pageLoad = {
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                        totalTime: navigation.loadEventEnd - navigation.navigationStart
                    };
                    
                    console.log('Page Load Metrics:', this.metrics.pageLoad);
                }
            }, 0);
        });
    }

    trackResourceTiming() {
        // 监控资源加载
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.initiatorType === 'fetch' && entry.name.includes('/api/')) {
                        console.log(`API Call: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    // 手动记录自定义指标
    mark(name) {
        if ('performance' in window && performance.mark) {
            performance.mark(name);
        }
    }

    measure(name, startMark, endMark) {
        if ('performance' in window && performance.measure) {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
            return measure.duration;
        }
    }
}

// 创建全局实例
export const cacheManager = new CacheManager();
export const lazyLoader = new LazyImageLoader();
export const performanceTracker = new PerformanceTracker();

// 为 window 对象添加性能工具，方便调试
if (typeof window !== 'undefined') {
    window.performanceUtils = {
        cache: cacheManager,
        lazyLoader: lazyLoader,
        tracker: performanceTracker
    };
}