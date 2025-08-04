// InfinityFree 特定优化器
class InfinityFreeOptimizer {
  constructor() {
    this.maxConcurrentRequests = 3; // 限制并发请求数
    this.domUpdateBatch = []; // DOM更新批处理队列
    this.memoryThreshold = 50 * 1024 * 1024; // 50MB内存阈值
    this.performanceMonitor = new PerformanceMonitor();
    
    this.init();
  }

  init() {
    this.optimizeDOMOperations();
    this.implementRequestThrottling();
    this.setupMemoryMonitoring();
    this.optimizeEventListeners();
    this.setupResourceCleanup();
  }

  // 优化DOM操作 - 批处理更新
  optimizeDOMOperations() {
    // 重写常用的DOM操作方法
    const originalAppendChild = Element.prototype.appendChild;
    const originalInsertBefore = Element.prototype.insertBefore;
    const originalRemoveChild = Element.prototype.removeChild;

    Element.prototype.appendChild = function(child) {
      if (this.classList && this.classList.contains('batch-update')) {
        this.optimizer.domUpdateBatch.push(() => originalAppendChild.call(this, child));
        this.optimizer.scheduleBatchUpdate();
      } else {
        return originalAppendChild.call(this, child);
      }
    };

    // 创建DocumentFragment工厂
    this.createFragmentBuilder();
  }

  createFragmentBuilder() {
    window.createOptimizedFragment = function(htmlString) {
      const template = document.createElement('template');
      template.innerHTML = htmlString;
      return template.content;
    };
  }

  scheduleBatchUpdate() {
    if (this.batchUpdateScheduled) return;
    
    this.batchUpdateScheduled = true;
    requestIdleCallback(() => {
      this.processBatchUpdates();
      this.batchUpdateScheduled = false;
    }, { timeout: 50 });
  }

  processBatchUpdates() {
    if (this.domUpdateBatch.length === 0) return;

    // 批量执行DOM更新
    requestAnimationFrame(() => {
      this.domUpdateBatch.forEach(update => update());
      this.domUpdateBatch = [];
    });
  }

  // 请求节流 - 防止过多并发请求
  implementRequestThrottling() {
    const originalFetch = window.fetch;
    let activeRequests = 0;
    const requestQueue = [];

    window.fetch = async function(...args) {
      return new Promise((resolve, reject) => {
        const executeRequest = async () => {
          activeRequests++;
          try {
            const response = await originalFetch(...args);
            resolve(response);
          } catch (error) {
            reject(error);
          } finally {
            activeRequests--;
            if (requestQueue.length > 0) {
              const nextRequest = requestQueue.shift();
              setTimeout(nextRequest, 10); // 小延迟避免CPU峰值
            }
          }
        };

        if (activeRequests < this.maxConcurrentRequests) {
          executeRequest();
        } else {
          requestQueue.push(executeRequest);
        }
      });
    }.bind(this);
  }

  // 内存监控和清理
  setupMemoryMonitoring() {
    setInterval(() => {
      if (performance.memory && performance.memory.usedJSHeapSize > this.memoryThreshold) {
        this.performMemoryCleanup();
      }
    }, 30000); // 每30秒检查一次
  }

  performMemoryCleanup() {
    // 清理缓存
    if (window.imageOptimizer && window.imageOptimizer.imageCache) {
      window.imageOptimizer.imageCache.clear();
    }

    // 清理事件监听器
    this.cleanupEventListeners();

    // 强制垃圾回收（如果支持）
    if (window.gc) {
      window.gc();
    }

    // 清理DOM中的临时元素
    this.cleanupTempElements();
  }

  cleanupTempElements() {
    // 移除临时创建的元素
    const tempElements = document.querySelectorAll('[data-temp="true"]');
    tempElements.forEach(el => el.remove());

    // 清理已断开连接的事件监听器
    const disconnectedElements = document.querySelectorAll('*');
    disconnectedElements.forEach(el => {
      if (!el.isConnected && el._eventListeners) {
        el._eventListeners.forEach(listener => {
          el.removeEventListener(listener.type, listener.handler);
        });
        delete el._eventListeners;
      }
    });
  }

  // 优化事件监听器
  optimizeEventListeners() {
    const originalAddEventListener = Element.prototype.addEventListener;
    const originalRemoveEventListener = Element.prototype.removeEventListener;

    Element.prototype.addEventListener = function(type, handler, options) {
      // 记录事件监听器便于清理
      if (!this._eventListeners) {
        this._eventListeners = [];
      }
      this._eventListeners.push({ type, handler, options });

      // 对于频繁触发的事件使用节流
      if (['scroll', 'resize', 'mousemove', 'touchmove'].includes(type)) {
        handler = this.throttle(handler, 16); // 60fps
      }

      return originalAddEventListener.call(this, type, handler, options);
    };

    Element.prototype.removeEventListener = function(type, handler, options) {
      if (this._eventListeners) {
        this._eventListeners = this._eventListeners.filter(
          listener => !(listener.type === type && listener.handler === handler)
        );
      }
      return originalRemoveEventListener.call(this, type, handler, options);
    };
  }

  // 节流函数
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function(...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // 资源清理
  setupResourceCleanup() {
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
      this.performMemoryCleanup();
    });

    // 页面隐藏时减少活动
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseNonEssentialOperations();
      } else {
        this.resumeOperations();
      }
    });
  }

  pauseNonEssentialOperations() {
    // 暂停动画
    const animations = document.getAnimations();
    animations.forEach(anim => anim.pause());

    // 减缓定时器
    this.originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay) {
      return this.originalSetInterval(callback, Math.max(delay * 2, 1000));
    };
  }

  resumeOperations() {
    // 恢复动画
    const animations = document.getAnimations();
    animations.forEach(anim => anim.play());

    // 恢复正常定时器
    if (this.originalSetInterval) {
      window.setInterval = this.originalSetInterval;
    }
  }

  cleanupEventListeners() {
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el._eventListeners && el._eventListeners.length > 10) {
        // 如果事件监听器过多，清理旧的
        const oldListeners = el._eventListeners.splice(0, el._eventListeners.length - 5);
        oldListeners.forEach(listener => {
          el.removeEventListener(listener.type, listener.handler, listener.options);
        });
      }
    });
  }
}

// 性能监控器
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      loadTime: 0,
      renderTime: 0
    };
    this.init();
  }

  init() {
    this.measureLoadTime();
    this.monitorRenderPerformance();
    this.setupPerformanceObserver();
  }

  measureLoadTime() {
    window.addEventListener('load', () => {
      this.metrics.loadTime = performance.now();
    });
  }

  monitorRenderPerformance() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          this.metrics.renderTime = entry.duration;
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // 监控长任务
          if (entry.entryType === 'longtask') {
            this.handleLongTask(entry);
          }
          
          // 监控导航时间
          if (entry.entryType === 'navigation') {
            this.analyzeNavigation(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask', 'navigation'] });
    }
  }

  handleLongTask(entry) {
    if (entry.duration > 50) { // 超过50ms的任务
      // 分解长任务
      this.breakLongTask();
    }
  }

  breakLongTask() {
    // 使用时间切片技术分解长任务
    const scheduler = (callback) => {
      const timeSlice = 5; // 5ms时间片
      const startTime = performance.now();
      
      const runSlice = () => {
        const currentTime = performance.now();
        if (currentTime - startTime < timeSlice) {
          callback();
          setTimeout(runSlice, 0);
        } else {
          setTimeout(() => runSlice(), 0);
        }
      };
      
      runSlice();
    };

    window.scheduleWork = scheduler;
  }

  analyzeNavigation(entry) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      processing: entry.domComplete - entry.responseEnd
    };

    // 如果任何指标过高，触发优化
    if (metrics.processing > 3000) { // 3秒
      this.triggerOptimization();
    }
  }

  triggerOptimization() {
    // 触发激进优化模式
    document.documentElement.classList.add('performance-mode');
    
    // 禁用非必要功能
    const style = document.createElement('style');
    style.textContent = `
      .performance-mode * {
        animation: none !important;
        transition: none !important;
      }
      .performance-mode img[loading="lazy"] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  getMetrics() {
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
    return this.metrics;
  }
}

// 初始化InfinityFree优化器
document.addEventListener('DOMContentLoaded', () => {
  new InfinityFreeOptimizer();
});

// 全局暴露
window.InfinityFreeOptimizer = InfinityFreeOptimizer;
window.PerformanceMonitor = PerformanceMonitor; 