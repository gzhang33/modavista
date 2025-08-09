/**
 * 传统初始化脚本（兼容性保留）
 * 注意：主要的应用程序逻辑已经迁移到 ES6 模块中
 * 此文件仅保留一些基础的兼容性功能
 */

// 图片加载错误的全局处理（备用）
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' && !e.target.src.includes('placeholder')) {
    // 使用内联 SVG 占位符
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
    e.target.classList.add('error');
  }
}, true);

// 浏览器兼容性检查
document.addEventListener('DOMContentLoaded', () => {
  // 检查 ES6 模块支持
  if (!('noModule' in HTMLScriptElement.prototype)) {
    console.warn('ES6 modules not supported. Consider using a polyfill for older browsers.');
  }

  // 检查必要的 API 支持
  const requiredAPIs = ['fetch', 'Promise', 'addEventListener'];
  const missingAPIs = requiredAPIs.filter(api => !(api in window));
  
  if (missingAPIs.length > 0) {
    console.error('Missing required APIs:', missingAPIs);
    
    // 显示降级提示
    const fallbackMessage = document.createElement('div');
    fallbackMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      padding: 10px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    fallbackMessage.textContent = 'Il tuo browser non è completamente supportato. Ti consigliamo di aggiornarlo per una migliore esperienza.';
    document.body.appendChild(fallbackMessage);
    
    // 自动隐藏提示
    setTimeout(() => {
      fallbackMessage.remove();
    }, 8000);
  }
});

// 性能监控（简化版）
if ('performance' in window && 'mark' in performance) {
  window.addEventListener('load', () => {
    performance.mark('app-init-complete');
    
    // 记录加载时间
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    
    // 如果加载时间过长，给出提示
    if (loadTime > 3000) {
      console.warn('Page load time is longer than expected. Consider optimizing resources.');
    }
  });
} 