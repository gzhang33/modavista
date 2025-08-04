// 字体加载监测和优化脚本
class FontLoader {
  constructor() {
    this.loadTimeout = 3000; // 3秒超时
    this.fallbackApplied = false;
    this.init();
  }

  init() {
    // 添加字体加载中的类
    document.documentElement.classList.add('fonts-loading');
    
    // 检测字体是否支持
    if (this.supportsFontLoading()) {
      this.loadWithFontFaceAPI();
    } else {
      this.loadWithTimeout();
    }
  }

  // 检测是否支持Font Loading API
  supportsFontLoading() {
    return 'fonts' in document;
  }

  // 使用Font Loading API加载字体
  loadWithFontFaceAPI() {
    // 检查字体是否已经通过Google Fonts CSS加载
    if (document.querySelector('link[href*="fonts.googleapis.com"]')) {
      // 等待Google Fonts CSS加载完成
      setTimeout(() => {
        this.onFontsLoaded();
      }, 1000);
      return;
    }

    // 如果没有Google Fonts CSS，使用备用加载方式
    this.onFontsFailure();
  }

  // 使用超时机制加载字体
  loadWithTimeout() {
    setTimeout(() => {
      if (this.checkFontLoaded('Inter') && this.checkFontLoaded('Playfair Display')) {
        this.onFontsLoaded();
      } else {
        this.onFontsFailure();
      }
    }, this.loadTimeout);
  }

  // 检测字体是否已加载
  checkFontLoaded(fontFamily) {
    const testString = 'abcdefghijklmnopqrstuvwxyz';
    const testSize = '72px';
    const fallbackFont = 'Arial';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // 测量fallback字体
    context.font = `${testSize} ${fallbackFont}`;
    const fallbackWidth = context.measureText(testString).width;

    // 测量目标字体
    context.font = `${testSize} ${fontFamily}, ${fallbackFont}`;
    const targetWidth = context.measureText(testString).width;

    return fallbackWidth !== targetWidth;
  }

  // 字体加载成功
  onFontsLoaded() {
    document.documentElement.classList.remove('fonts-loading');
    document.documentElement.classList.add('fonts-loaded');
  }

  // 字体加载失败，应用回退方案
  onFontsFailure() {
    if (!this.fallbackApplied) {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('font-fallback');
      this.fallbackApplied = true;
      
      // 加载本地回退CSS
      this.loadFallbackCSS();
    }
  }

  // 加载回退CSS
  loadFallbackCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/font-fallback.css';
    document.head.appendChild(link);
  }
}

// 资源预加载优化
class ResourcePreloader {
  constructor() {
    this.criticalResources = [
      'assets/css/style.css',
      'assets/js/script.js'
    ];
    this.init();
  }

  init() {
    // 预加载关键资源
    this.preloadCriticalResources();
    
    // 预连接到重要的第三方域名
    this.preconnectDomains();
  }

  preloadCriticalResources() {
    this.criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.json')) {
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  preconnectDomains() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

// CDN故障检测和回退
class CDNFallback {
  constructor() {
    this.cdnResources = {
      'fontawesome': {
        primary: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        fallback: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.0.0/css/all.min.css'
      }
    };
    this.init();
  }

  init() {
    this.checkCDNAvailability();
  }

  async checkCDNAvailability() {
    for (const [name, urls] of Object.entries(this.cdnResources)) {
      try {
        await this.testResource(urls.primary);
      } catch (error) {
        this.loadFallback(urls.fallback);
      }
    }
  }

  testResource(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = resolve;
      link.onerror = reject;
      
      // 设置短超时
      setTimeout(reject, 2000);
      
      document.head.appendChild(link);
    });
  }

  loadFallback(fallbackUrl) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fallbackUrl;
    document.head.appendChild(link);
  }
}

// 网络状况监测
class NetworkOptimizer {
  constructor() {
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    this.init();
  }

  init() {
    if (this.connection) {
      this.optimizeForConnection();
      this.connection.addEventListener('change', () => this.optimizeForConnection());
    }
  }

  optimizeForConnection() {
    const effectiveType = this.connection.effectiveType;
    
    // 根据网络状况调整资源加载策略
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      document.documentElement.classList.add('slow-connection');
      this.enableDataSaver();
    } else if (effectiveType === '3g') {
      document.documentElement.classList.add('medium-connection');
    } else {
      document.documentElement.classList.add('fast-connection');
    }
  }

  enableDataSaver() {
    // 禁用非关键资源
    const nonCriticalImages = document.querySelectorAll('img[loading="lazy"]');
    nonCriticalImages.forEach(img => {
      img.style.display = 'none';
    });

    // 简化动画
    const style = document.createElement('style');
    style.textContent = `
      .slow-connection * {
        animation-duration: 0.1s !important;
        animation-delay: 0s !important;
        transition-duration: 0.1s !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// 初始化所有优化器
document.addEventListener('DOMContentLoaded', () => {
  new FontLoader();
  new ResourcePreloader();
  new CDNFallback();
  new NetworkOptimizer();
});

// 全局暴露
window.FontLoader = FontLoader;
window.ResourcePreloader = ResourcePreloader;
window.CDNFallback = CDNFallback;
window.NetworkOptimizer = NetworkOptimizer; 