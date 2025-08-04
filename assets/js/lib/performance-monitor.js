// 性能监控和测试工具 - InfinityFree专用
class PerformanceMonitorTool {
  constructor() {
    this.metrics = {
      pageLoad: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0
    };
    
    this.resources = [];
    this.errors = [];
    this.userInteractions = [];
    this.networkInfo = {};
    
    this.init();
  }

  init() {
    this.measureCoreWebVitals();
    this.monitorResources();
    this.trackErrors();
    this.analyzeNetwork();
    this.setupUserInteractionTracking();
    this.scheduleReports();
  }

  // 核心Web指标监控
  measureCoreWebVitals() {
    // First Paint & First Contentful Paint
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
          }
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cumulativeLayoutShift = clsValue;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      }).observe({ type: 'first-input', buffered: true });
    }

    // Page Load Time
    window.addEventListener('load', () => {
      this.metrics.pageLoad = performance.now();
      this.calculateTimeToInteractive();
    });
  }

  calculateTimeToInteractive() {
    // 简化的TTI计算
    setTimeout(() => {
      this.metrics.timeToInteractive = performance.now();
    }, 100);
  }

  // 资源监控
  monitorResources() {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.resources.push({
            name: entry.name,
            type: entry.initiatorType,
            size: entry.transferSize || entry.encodedBodySize,
            duration: entry.duration,
            startTime: entry.startTime,
            blocked: entry.domainLookupStart - entry.fetchStart,
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            connect: entry.connectEnd - entry.connectStart,
            request: entry.responseStart - entry.requestStart,
            response: entry.responseEnd - entry.responseStart
          });
        }
      }).observe({ type: 'resource', buffered: true });
    }
  }

  // 错误监控
  trackErrors() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.errors.push({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    // 未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        type: 'promise',
        message: event.reason,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.errors.push({
          type: 'resource',
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          timestamp: Date.now()
        });
      }
    }, true);
  }

  // 网络分析
  analyzeNetwork() {
    // 网络连接信息
    if ('connection' in navigator) {
      this.networkInfo = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };

      navigator.connection.addEventListener('change', () => {
        this.networkInfo.effectiveType = navigator.connection.effectiveType;
        this.networkInfo.downlink = navigator.connection.downlink;
        this.networkInfo.rtt = navigator.connection.rtt;
      });
    }

    // 测量网络延迟
    this.measureNetworkLatency();
  }

  async measureNetworkLatency() {
    try {
      const start = performance.now();
      await fetch('./ping.txt?' + Date.now(), { mode: 'no-cors' });
      const end = performance.now();
      this.networkInfo.latency = end - start;
    } catch (e) {
      // 如果ping文件不存在，使用当前页面
      const start = performance.now();
      try {
        await fetch(window.location.href, { mode: 'no-cors' });
        const end = performance.now();
        this.networkInfo.latency = end - start;
      } catch (e) {
        this.networkInfo.latency = 'unknown';
      }
    }
  }

  // 用户交互跟踪
  setupUserInteractionTracking() {
    ['click', 'scroll', 'keydown'].forEach(event => {
      document.addEventListener(event, (e) => {
        this.userInteractions.push({
          type: event,
          timestamp: Date.now(),
          target: e.target.tagName,
          className: e.target.className
        });
      }, { passive: true });
    });
  }

  // InfinityFree特定检查
  checkInfinityFreeOptimization() {
    const checks = {
      fileSize: this.checkFileSizes(),
      requestCount: this.checkRequestCount(),
      cpuUsage: this.checkCPUUsage(),
      memoryUsage: this.checkMemoryUsage(),
      cacheHeaders: this.checkCacheHeaders(),
      compression: this.checkCompression()
    };

    return checks;
  }

  checkFileSizes() {
    const largeFiles = this.resources.filter(resource => 
      resource.size > 1024 * 1024 // > 1MB
    );

    return {
      status: largeFiles.length === 0 ? 'pass' : 'warning',
      message: largeFiles.length === 0 
        ? '所有文件大小合适' 
        : `发现 ${largeFiles.length} 个大文件`,
      details: largeFiles.map(file => ({
        name: file.name,
        size: this.formatBytes(file.size)
      }))
    };
  }

  checkRequestCount() {
    const requestCount = this.resources.length;
    return {
      status: requestCount < 50 ? 'pass' : requestCount < 100 ? 'warning' : 'fail',
      message: `总请求数: ${requestCount}`,
      recommendation: requestCount > 50 ? '考虑合并CSS/JS文件或使用CSS Sprites' : null
    };
  }

  checkCPUUsage() {
    // 检查长任务
    const longTasks = this.resources.filter(resource => 
      resource.duration > 50 // >50ms
    );

    return {
      status: longTasks.length < 5 ? 'pass' : 'warning',
      message: `发现 ${longTasks.length} 个长任务`,
      recommendation: longTasks.length > 5 ? '优化JavaScript执行，避免阻塞主线程' : null
    };
  }

  checkMemoryUsage() {
    if (!performance.memory) {
      return {
        status: 'unknown',
        message: '无法检测内存使用情况'
      };
    }

    const memoryUsage = performance.memory.usedJSHeapSize;
    const memoryLimit = performance.memory.jsHeapSizeLimit;
    const usagePercent = (memoryUsage / memoryLimit) * 100;

    return {
      status: usagePercent < 50 ? 'pass' : usagePercent < 80 ? 'warning' : 'fail',
      message: `内存使用: ${this.formatBytes(memoryUsage)} (${usagePercent.toFixed(1)}%)`,
      recommendation: usagePercent > 50 ? '考虑减少全局变量和优化数据结构' : null
    };
  }

  checkCacheHeaders() {
    const uncachedResources = this.resources.filter(resource => {
      const extension = resource.name.split('.').pop();
      return ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension);
    });

    return {
      status: uncachedResources.length === 0 ? 'pass' : 'warning',
      message: `${uncachedResources.length} 个静态资源可能未设置缓存`,
      recommendation: uncachedResources.length > 0 ? '检查.htaccess缓存配置' : null
    };
  }

  checkCompression() {
    const uncompressedResources = this.resources.filter(resource => {
      return resource.size > 1024 && // >1KB
             (resource.name.includes('.css') || 
              resource.name.includes('.js') || 
              resource.name.includes('.html'));
    });

    return {
      status: uncompressedResources.length === 0 ? 'pass' : 'warning',
      message: `${uncompressedResources.length} 个文本资源可能未压缩`,
      recommendation: uncompressedResources.length > 0 ? '启用GZIP压缩' : null
    };
  }

  // 性能评分
  calculatePerformanceScore() {
    const scores = {
      lcp: this.scoreLCP(this.metrics.largestContentfulPaint),
      fid: this.scoreFID(this.metrics.firstInputDelay),
      cls: this.scoreCLS(this.metrics.cumulativeLayoutShift),
      fcp: this.scoreFCP(this.metrics.firstContentfulPaint),
      ttfb: this.scoreTTFB(this.resources[0]?.request || 0)
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    return {
      overall: Math.round(overallScore),
      details: scores,
      grade: this.getPerformanceGrade(overallScore)
    };
  }

  scoreLCP(lcp) {
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 50;
    return 0;
  }

  scoreFID(fid) {
    if (fid <= 100) return 100;
    if (fid <= 300) return 50;
    return 0;
  }

  scoreCLS(cls) {
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 50;
    return 0;
  }

  scoreFCP(fcp) {
    if (fcp <= 1800) return 100;
    if (fcp <= 3000) return 50;
    return 0;
  }

  scoreTTFB(ttfb) {
    if (ttfb <= 600) return 100;
    if (ttfb <= 1500) return 50;
    return 0;
  }

  getPerformanceGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // 生成详细报告
  generateDetailedReport() {
    const performanceScore = this.calculatePerformanceScore();
    const infinityFreeChecks = this.checkInfinityFreeOptimization();

    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      network: this.networkInfo,
      metrics: this.metrics,
      performance: performanceScore,
      optimization: infinityFreeChecks,
      resources: {
        total: this.resources.length,
        totalSize: this.resources.reduce((sum, r) => sum + r.size, 0),
        byType: this.groupResourcesByType()
      },
      errors: this.errors,
      recommendations: this.generateRecommendations(performanceScore, infinityFreeChecks)
    };
  }

  groupResourcesByType() {
    const groups = {};
    this.resources.forEach(resource => {
      if (!groups[resource.type]) {
        groups[resource.type] = { count: 0, size: 0 };
      }
      groups[resource.type].count++;
      groups[resource.type].size += resource.size;
    });
    return groups;
  }

  generateRecommendations(performance, optimization) {
    const recommendations = [];

    if (performance.overall < 80) {
      recommendations.push('整体性能需要改善，重点关注LCP和FID指标');
    }

    if (optimization.fileSize.status !== 'pass') {
      recommendations.push('优化大文件：压缩图片，使用WebP格式');
    }

    if (optimization.requestCount.status !== 'pass') {
      recommendations.push('减少HTTP请求：合并CSS/JS，使用CSS Sprites');
    }

    if (optimization.memoryUsage.status === 'fail') {
      recommendations.push('内存使用过高：清理全局变量，优化数据结构');
    }

    if (this.errors.length > 0) {
      recommendations.push(`修复 ${this.errors.length} 个JavaScript错误`);
    }

    return recommendations;
  }

  // 显示性能仪表板
  showPerformanceDashboard() {
    const report = this.generateDetailedReport();
    
    const dashboard = document.createElement('div');
    dashboard.id = 'performance-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      color: white;
      overflow-y: auto;
      z-index: 10000;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    `;

    dashboard.innerHTML = this.generateDashboardHTML(report);
    document.body.appendChild(dashboard);

    // 添加关闭按钮功能
    dashboard.querySelector('.close-btn').addEventListener('click', () => {
      dashboard.remove();
    });
  }

  generateDashboardHTML(report) {
    return `
      <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>🚀 性能监控仪表板</h1>
          <button class="close-btn" style="background: #ff4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">关闭</button>
        </div>

        <!-- 性能评分 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; text-align: center;">
            <h3>总体评分</h3>
            <div style="font-size: 3rem; color: ${this.getScoreColor(report.performance.overall)};">
              ${report.performance.overall}
            </div>
            <div style="font-size: 1.5rem; color: ${this.getScoreColor(report.performance.overall)};">
              ${report.performance.grade}
            </div>
          </div>
          
          <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px;">
            <h4>核心指标</h4>
            <div>LCP: ${this.metrics.largestContentfulPaint.toFixed(0)}ms</div>
            <div>FID: ${this.metrics.firstInputDelay.toFixed(0)}ms</div>
            <div>CLS: ${this.metrics.cumulativeLayoutShift.toFixed(3)}</div>
          </div>

          <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px;">
            <h4>网络信息</h4>
            <div>连接类型: ${report.network.effectiveType || 'unknown'}</div>
            <div>延迟: ${report.network.latency || 'unknown'}ms</div>
            <div>下载速度: ${report.network.downlink || 'unknown'} Mbps</div>
          </div>
        </div>

        <!-- InfinityFree优化检查 -->
        <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
          <h3>📊 InfinityFree优化检查</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${Object.entries(report.optimization).map(([key, check]) => `
              <div style="border: 1px solid #333; padding: 1rem; border-radius: 4px;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: ${this.getStatusColor(check.status)};">
                    ${this.getStatusIcon(check.status)}
                  </span>
                  <strong>${this.getCheckTitle(key)}</strong>
                </div>
                <div style="margin: 0.5rem 0; color: #ccc;">${check.message}</div>
                ${check.recommendation ? `<div style="color: #ffa500; font-size: 0.9rem;">💡 ${check.recommendation}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 资源分析 -->
        <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
          <h3>📦 资源分析</h3>
          <div>总请求数: ${report.resources.total}</div>
          <div>总大小: ${this.formatBytes(report.resources.totalSize)}</div>
          <div style="margin-top: 1rem;">
            ${Object.entries(report.resources.byType).map(([type, info]) => `
              <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                <span>${type}:</span>
                <span>${info.count} 个 (${this.formatBytes(info.size)})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 错误报告 -->
        ${report.errors.length > 0 ? `
          <div style="background: #2a1a1a; border: 1px solid #ff4444; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3>❌ 错误报告 (${report.errors.length})</h3>
            ${report.errors.slice(0, 5).map(error => `
              <div style="margin: 0.5rem 0; padding: 0.5rem; background: #1a1a1a; border-radius: 4px;">
                <strong style="color: #ff6666;">${error.type}:</strong> ${error.message}
                ${error.filename ? `<br><small style="color: #999;">${error.filename}:${error.line}</small>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 推荐建议 -->
        <div style="background: #1a1a1a; padding: 1rem; border-radius: 8px;">
          <h3>💡 优化建议</h3>
          <ul style="margin: 1rem 0; padding-left: 2rem;">
            ${report.recommendations.map(rec => `<li style="margin: 0.5rem 0;">${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  getScoreColor(score) {
    if (score >= 90) return '#00ff00';
    if (score >= 80) return '#ffff00';
    if (score >= 60) return '#ff8800';
    return '#ff0000';
  }

  getStatusColor(status) {
    switch (status) {
      case 'pass': return '#00ff00';
      case 'warning': return '#ffa500';
      case 'fail': return '#ff0000';
      default: return '#888';
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '❓';
    }
  }

  getCheckTitle(key) {
    const titles = {
      fileSize: '文件大小',
      requestCount: '请求数量',
      cpuUsage: 'CPU使用',
      memoryUsage: '内存使用',
      cacheHeaders: '缓存设置',
      compression: '文件压缩'
    };
    return titles[key] || key;
  }

  // 自动报告调度
  scheduleReports() {
    // 页面加载完成后5秒生成报告
    setTimeout(() => {
      const report = this.generateDetailedReport();
      this.sendReportToConsole(report);
    }, 5000);
  }

  sendReportToConsole(report) {
    console.group('🚀 性能监控报告');
    console.log('总体评分:', report.performance.overall, report.performance.grade);
    console.log('核心指标:', {
      LCP: `${report.metrics.largestContentfulPaint.toFixed(0)}ms`,
      FID: `${report.metrics.firstInputDelay.toFixed(0)}ms`,
      CLS: report.metrics.cumulativeLayoutShift.toFixed(3)
    });
    console.log('资源统计:', report.resources);
    if (report.errors.length > 0) {
      console.warn('发现错误:', report.errors);
    }
    console.log('优化建议:', report.recommendations);
    console.log('查看详细报告: showPerformanceDashboard()');
    console.groupEnd();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 全局函数
window.showPerformanceDashboard = function() {
  if (window.performanceMonitor) {
    window.performanceMonitor.showPerformanceDashboard();
  } else {
    console.log('性能监控器未初始化');
  }
};

window.getPerformanceReport = function() {
  if (window.performanceMonitor) {
    return window.performanceMonitor.generateDetailedReport();
  } else {
    console.log('性能监控器未初始化');
    return null;
  }
};

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
  window.performanceMonitor = new PerformanceMonitorTool();
});

// 全局暴露
window.PerformanceMonitorTool = PerformanceMonitorTool; 