/**
 * 产品网格组件
 * 负责渲染和管理主页的商品列表、筛选和排序功能
 */
import apiClient from '../utils/apiClient.js';

export class ProductGrid {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.loading = true;
    this.currentLanguage = 'en';

    this.searchInput = null; // 搜索功能已移除
    this.searchClearBtn = null; // 搜索功能已移除

    this.init();
    this.setupLanguageListener();
  }

  async init() {
    // 并行加载产品和分类数据
    await Promise.all([this.loadProducts(), this.loadCategories()]);

    this.filteredProducts = [...this.products];
    this.renderProducts();
    this.setupDynamicContent();
    this.handleInitialRoute();
    this.setupBrowserNavigation();
  }

  /**
   * 加载产品数据
   */
  async loadProducts() {
    try {
      this.products = await apiClient.getProducts({}, this.currentLanguage);
      this.loading = false;
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError();
    }
  }

  /**
   * 加载分类数据并渲染导航
   */
  async loadCategories() {
    try {
      const categories = await apiClient.getCategories(this.currentLanguage);
      this.renderNavigation(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      const navContainer = document.querySelector('.main-nav ul');
      if (navContainer) {
        navContainer.innerHTML = '<li class="active"><a href="#collection">All Products</a></li>';
      }
    }
  }

  /**
   * 设置语言切换监听器
   */
  setupLanguageListener() {
    // 监听语言切换事件
    if (window.EventBus) {
      window.EventBus.on('language_changed', async (data) => {
        this.currentLanguage = data.language_code;
        await this.reloadData();
      });
    }
  }

  /**
   * 重新加载数据
   */
  async reloadData() {
    this.loading = true;
    await Promise.all([this.loadProducts(), this.loadCategories()]);
    this.filteredProducts = [...this.products];
    this.renderProducts();
    this.loading = false;
  }

  /**
   * 渲染导航菜单
   * @param {Array} categories - 分类列表
   */
  renderNavigation(categories) {
    const navContainer = document.querySelector('.main-nav ul');
    if (!navContainer) return;

    // 去除重复分类并限制数量（最多显示8个分类）
    const uniqueCategories = [...new Set(categories)].slice(0, 8);

    // 根据当前语言获取"所有产品"的文本
    const allProductsText = this.getLocalizedText('nav_products', 'Tutti i Prodotti');
    const allProductsHTML = `<li data-categories="all" class="active">
      <a href="#collection">
        ${allProductsText}
      </a>
    </li>`;

    const categoriesHTML = uniqueCategories.map(category => `
      <li data-categories="${category}">
        <a href="#collection">
          ${category}
        </a>
      </li>
    `).join('');

    navContainer.innerHTML = allProductsHTML + categoriesHTML;

    // 添加导航点击事件处理
    this.setupNavigationHandlers();
  }

  /**
   * 设置导航点击事件处理器
   */
  setupNavigationHandlers() {
    const navContainer = document.querySelector('.main-nav ul');
    if (!navContainer) return;

    navContainer.addEventListener('click', (e) => {
      e.preventDefault();

      const clickedItem = e.target.closest('li');
      if (!clickedItem) return;

      // 移除所有活动状态
      navContainer.querySelectorAll('li').forEach(item => {
        item.classList.remove('active');
      });

      // 添加活动状态到点击的项目
      clickedItem.classList.add('active');

      // 获取分类并过滤产品
      const category = clickedItem.getAttribute('data-categories');
      this.filterByCategory(category);

      // 更新面包屑导航
      this.updateBreadcrumb(category);

      // 滚动到产品区域
      const productSection = document.getElementById('collection');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /**
   * 根据分类过滤产品
   * @param {string} category - 分类名称，'all' 表示显示所有产品
   */
  async filterByCategory(category) {
    try {
      this.showLoading();

      let products;
      if (category === 'all') {
        // 修复参数顺序：filters对象在前，语言在后
        products = await apiClient.getProducts({}, this.currentLanguage);
      } else {
        // 为分类过滤也添加语言支持
        products = await apiClient.get('/products.php', {
          category: category,
          lang: this.currentLanguage
        });
      }

      this.filteredProducts = products;
      this.renderProducts();
    } catch (error) {
      console.error('Failed to filter products by category:', error);
      this.showError('Failed to load products. Please try again.');
    }
  }

  /**
   * 获取本地化文本
   * @param {string} key - 翻译键
   * @param {string} fallback - 默认文本
   * @returns {string} 本地化文本
   */
  getLocalizedText(key, fallback) {
    // 这里可以集成翻译系统
    // 暂时返回默认文本
    return fallback;
  }

  /**
   * 获取分类图标
   * @param {string} category - 分类名称
   * @returns {string} 空字符串（已移除emoji图标）
   */
  getCategoryIcon(category) {
    // 已移除emoji图标，返回空字符串
    return '';
  }

  /**
   * 渲染产品列表
   */
  renderProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) return;

    const productsToRender = this.filteredProducts;

    if (!productsToRender || productsToRender.length === 0) {
      grid.innerHTML = this.getEmptyState();
      return;
    }

    const cardsHTML = productsToRender.map(product => this.createProductCard(product)).join('');
    grid.innerHTML = cardsHTML;

    // 延迟验证图片
    setTimeout(() => {
      this.verifyAndFixImages();
    }, 10);

    this.setupDynamicContent();
  }

  /**
   * 验证和修复图片加载
   */
  verifyAndFixImages() {
    const grid = document.getElementById('product-list');
    if (!grid) return;

    const images = grid.querySelectorAll('img');

    images.forEach((img) => {
      if (img.dataset.verified) return;
      img.dataset.verified = 'true';

      if (!img.src || img.src === window.location.href || img.src === '') {
        img.src = './images/placeholder-optimized.svg';
      }

      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else if (img.complete && img.naturalHeight === 0) {
        img.src = './images/placeholder-optimized.svg';
        img.classList.add('error');
      }
    });
  }

  /**
   * 创建产品卡片 HTML
   * @param {Object} product - 产品数据
   * @returns {string} 产品卡片 HTML
   */
  createProductCard(product) {
    const isNew = this.isNewProduct(product);
    let imageSrc = product.defaultImage || 'images/placeholder-optimized.svg';

    return `
      <article class="product-card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-image-container image-container">
          ${this.createProductBadges(isNew)}
          <img
            src="${imageSrc}"
            alt="${product.name}"
            class="product-img"
            loading="lazy"
            decoding="async"
            onload="this.classList.add('loaded')"
            onerror="this.src='images/placeholder-optimized.svg'; this.classList.add('error');"
          >
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
        </div>
      </article>
    `;
  }

  /**
   * 创建产品徽章
   * @param {boolean} isNew - 是否为新产品
   * @returns {string} 徽章 HTML
   */
  createProductBadges(isNew) {
    let badges = '';
    if (isNew) badges += '<span class="product-badge badge-new">New</span>';
    return badges ? `<div class="product-badges">${badges}</div>` : '';
  }

  /**
   * 判断是否为新产品
   * @param {Object} product - 产品数据
   * @returns {boolean} 是否为新产品
   */
  isNewProduct(product) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return product.createdAt && new Date(product.createdAt) > thirtyDaysAgo;
  }

  /**
   * 显示错误状态
   * @param {string} message 可选的错误消息
   */
  showError(message = 'Impossibile caricare i prodotti') {
    const grid = document.getElementById('product-list');
    if (!grid) return;

    grid.innerHTML = `
      <div class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>${message}</h3>
          <p>Controlla la connessione internet e riprova, oppure torna più tardi.</p>
          <div class="error-actions">
            <button onclick=\"location.reload()\" class="retry-btn">Ricarica</button>
            <button onclick=\"window.history.back()\" class="back-btn">Torna Indietro</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    grid.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner" aria-hidden="true"></div>
        <div class="loading-text">Caricamento in corso…</div>
      </div>
    `;
  }

  /**
   * 获取空状态 HTML
   * @returns {string} 空状态 HTML
   */
  getEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-content">
          <div class="empty-icon">📦</div>
          <h3>Nessun prodotto disponibile</h3>
          <p>Non ci sono prodotti in questa categoria, prova altre categorie o torna più tardi.</p>
          <div class="empty-actions">
            <button onclick=\"document.querySelector('[data-categories=\\\"all\\\"]').click()\" class="show-all-btn">Mostra Tutti i Prodotti</button>
          </div>
        </div>
      </div>
    `;
  }













  /**
   * 设置浏览器导航（简化版）
   */
  setupBrowserNavigation() {
    // 导航功能已简化
  }

  /**
   * 处理初始路由（简化版）
   */
  handleInitialRoute() {
    // 路由功能已简化
  }

  /**
   * 设置动态内容
   */
  setupDynamicContent() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        try {
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (error) {
          console.warn(`Invalid selector for smooth scroll: ${targetId}`);
        }
      });
    });

    // 滚动动画观察器
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elementsToObserve = document.querySelectorAll('.section-title, .section-subtitle, .contact-info-item, .footer-section, .product-card');
    elementsToObserve.forEach(el => observer.observe(el));
  }

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      });
    }, 3000);
  }



  clearNavigationActiveState() {
    document.querySelectorAll('.main-nav ul li').forEach(item => item.classList.remove('active'));
  }

  /**
   * 更新面包屑导航
   * @param {string} category - 当前选中的分类，'all' 表示所有产品
   */
  updateBreadcrumb(category) {
    const breadcrumbList = document.getElementById('breadcrumb-list');
    if (!breadcrumbList) return;

    const homeItem = `
      <li class="breadcrumb-item">
        <a href="/" class="breadcrumb-link">
          Home
        </a>
      </li>
    `;

    if (category === 'all') {
      // 显示所有产品
      breadcrumbList.innerHTML = homeItem + `
        <li class="breadcrumb-item active" aria-current="page">
          <span class="breadcrumb-text">Collezione</span>
        </li>
      `;
    } else {
      // 显示特定分类
      breadcrumbList.innerHTML = homeItem + `
        <li class="breadcrumb-item">
          <a href="#collection" class="breadcrumb-link" onclick="document.querySelector('[data-categories=\\"all\\"]').click()">
            Collezione
          </a>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          <span class="breadcrumb-text">
            ${category}
          </span>
        </li>
      `;
    }
  }
}

export default ProductGrid;