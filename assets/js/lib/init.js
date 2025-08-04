// 页面初始化脚本
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化以确保所有脚本都已加载
  setTimeout(() => {
    initializePage();
  }, 50);
});

function initializePage() {
  // 初始化图片优化器
  if (typeof ImageOptimizer !== 'undefined') {
    window.imageOptimizer = new ImageOptimizer();
  }
  
  // 如果是主页，初始化产品网格
  if (document.getElementById('product-list')) {
    if (typeof ProductGrid !== 'undefined') {
      window.productGrid = new ProductGrid();
    } else {
      // 重试机制
      setTimeout(() => {
        if (typeof ProductGrid !== 'undefined') {
          window.productGrid = new ProductGrid();
        }
      }, 100);
    }
  }
}

// 图片加载错误的全局处理
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
  }
}, true); 