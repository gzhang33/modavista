// 图片优化工具类
class ImageOptimizer {
  constructor() {
    this.loadedImages = new Set();
    this.errorImages = new Set();
    this.init();
  }

  init() {
    // 简化初始化流程
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupImageHandling());
    } else {
      this.setupImageHandling();
    }
  }

  // 设置图片处理
  setupImageHandling() {
    // 处理现有图片
    this.processAllImages();
    
    // 设置mutation observer来处理动态添加的图片
    if ('MutationObserver' in window) {
      this.setupMutationObserver();
    }
    
    // 设置懒加载
    this.setupLazyLoading();
  }
  
  // 处理所有图片
  processAllImages() {
    const allImages = document.querySelectorAll('img');
    allImages.forEach(img => this.processImage(img));
  }
  
  // 处理单个图片
  processImage(img) {
    if (img.dataset.processed) return;
    img.dataset.processed = 'true';
    
    // 设置加载事件
    if (!img.complete) {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        this.loadedImages.add(img.src);
      });
      
      img.addEventListener('error', () => {
        this.handleImageError(img);
      });
    } else if (img.naturalHeight === 0) {
      // 图片已完成但加载失败
      this.handleImageError(img);
    } else {
      // 图片已成功加载
      img.classList.add('loaded');
      this.loadedImages.add(img.src);
    }
  }
  
  // 设置mutation observer
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG') {
              this.processImage(node);
            } else if (node.querySelectorAll) {
              const images = node.querySelectorAll('img');
              images.forEach(img => this.processImage(img));
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 设置懒加载（仅对支持IntersectionObserver的浏览器）
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // 降级处理：直接加载所有带data-src的图片
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        delete img.dataset.src;
      });
      return;
    }

    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
            lazyImageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px' // 提前50px开始加载
    });

    // 观察所有带data-src的图片
    document.querySelectorAll('img[data-src]').forEach(img => {
      lazyImageObserver.observe(img);
    });
  }

  // 处理图片加载错误
  handleImageError(img) {
    this.errorImages.add(img.src);
    img.classList.add('error');
    
    // 如果有原始的onerror处理，保持不变
    if (img.getAttribute('onerror')) {
      return;
    }
    
    // 否则使用默认错误处理
    img.src = '/images/placeholder-optimized.svg';
  }

  // 预加载关键图片
  preloadImage(src) {
    if (this.loadedImages.has(src)) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        resolve();
      };
      img.onerror = () => {
        this.errorImages.add(src);
        reject();
      };
      img.src = src;
    });
  }
}

// 图片缩放处理类
class ImageZoom {
  constructor() {
    this.init();
  }

  init() {
    this.setupProductDetailZoom();
    this.setupThumbnailHandling();
  }

  // 设置产品详情页缩放
  setupProductDetailZoom() {
    const mainImage = document.getElementById('main-product-image');
    const container = document.querySelector('.main-image-container');
    
    if (!mainImage || !container) return;

    // 移动端使用点击切换缩放
    if (this.isMobile()) {
      let isZoomed = false;
      container.addEventListener('click', (e) => {
        e.preventDefault();
        isZoomed = !isZoomed;
        mainImage.style.transform = isZoomed ? 'scale(1.5)' : 'scale(1)';
        container.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
      });
    } else {
      // 桌面端使用鼠标悬停
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        mainImage.style.transformOrigin = `${x}% ${y}%`;
      });

      container.addEventListener('mouseleave', () => {
        mainImage.style.transformOrigin = 'center center';
      });
    }
  }

  // 设置缩略图处理
  setupThumbnailHandling() {
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    const mainImage = document.getElementById('main-product-image');
    
    if (!mainImage) return;

    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        // 移除其他缩略图的active类
        thumbnails.forEach(t => t.classList.remove('active'));
        // 添加当前缩略图的active类
        thumb.classList.add('active');
        
        // 更换主图
        const newSrc = thumb.src;
        this.changeMainImage(mainImage, newSrc);
      });
    });
  }

  // 更换主图
  changeMainImage(mainImage, newSrc) {
    // 淡出效果
    mainImage.style.opacity = '0';
    
    setTimeout(() => {
      mainImage.src = newSrc;
      mainImage.onload = () => {
        mainImage.style.opacity = '1';
      };
    }, 150);
  }

  // 检测是否为移动设备
  isMobile() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }
}

// 初始化图片优化
document.addEventListener('DOMContentLoaded', () => {
  window.imageOptimizer = new ImageOptimizer();
  window.imageZoom = new ImageZoom();
});

// 导出工具类供其他脚本使用
window.ImageOptimizer = ImageOptimizer;
window.ImageZoom = ImageZoom; 