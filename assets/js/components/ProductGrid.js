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
    this.currentCategory = 'all';

    this.categoryFilter = document.getElementById('category-filter');
    this.sortFilter = document.getElementById('sort-filter');
    this.resetBtn = document.getElementById('reset-filters');
    this.searchInput = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear');
    
    this.init();
  }

  async init() {
    // 并行加载产品和分类数据
    await Promise.all([this.loadProducts(), this.loadCategories()]);

    this.filteredProducts = [...this.products];
    this.renderProducts();
    this.setupDynamicContent();
    this.handleInitialRoute();
    this.setupBrowserNavigation();

    if (this.categoryFilter && this.sortFilter && this.resetBtn) {
      this.setupFilters();
    }

    if (this.searchInput) {
      this.setupSearch();
    }
  }

  /**
   * 加载产品数据
   */
  async loadProducts() {
    try {
      this.products = await apiClient.getProducts();
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
      const categories = await apiClient.getCategories();
      this.renderNavigation(categories);
      this.renderCategorySelect(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      const navContainer = document.querySelector('.main-nav ul');
      if (navContainer) {
        navContainer.innerHTML = '<li data-categories="all" class="active"><a href="#">Tutti i Prodotti</a></li>';
        this.setupNavigationFilters(); 
      }
      // 回退下拉
      if (this.categoryFilter) {
        this.categoryFilter.innerHTML = '<option value="all">Tutte le categorie</option>';
      }
    }
  }

  /**
   * 渲染导航菜单
   * @param {Array} categories - 分类列表
   */
  renderNavigation(categories) {
    const navContainer = document.querySelector('.main-nav ul');
    if (!navContainer) return;

    const allProductsHTML = '<li data-categories="all" class="active"><a href="#">Tutti i Prodotti</a></li>';
    const categoriesHTML = categories.map(category => `
      <li data-categories="${category}"><a href="#">${category}</a></li>
    `).join('');

    navContainer.innerHTML = allProductsHTML + categoriesHTML;
    this.setupNavigationFilters();
  }

  /**
   * 渲染分类下拉
   * @param {Array} categories
   */
  renderCategorySelect(categories) {
    if (!this.categoryFilter) return;
    const options = ['<option value="all">Tutte le categorie</option>']
      .concat(categories.map(c => `<option value="${c}">${c}</option>`))
      .join('');
    this.categoryFilter.innerHTML = options;
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
   */
  showError() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    
    grid.innerHTML = `
      <div class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>Impossibile caricare i prodotti</h3>
          <p>Controlla la connessione internet e riprova, oppure torna più tardi.</p>
          <div class="error-actions">
            <button onclick="location.reload()" class="retry-btn">Ricarica</button>
            <button onclick="window.history.back()" class="back-btn">Torna Indietro</button>
          </div>
        </div>
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
            <button onclick="document.querySelector('[data-categories=\\"all\\"]').click()" class="show-all-btn">Mostra Tutti i Prodotti</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 设置筛选器事件监听
   */
  setupFilters() {
    if(!this.categoryFilter || !this.sortFilter || !this.resetBtn) return;
    this.categoryFilter.addEventListener('change', () => this.applyFilters());
    this.sortFilter.addEventListener('change', () => this.applyFilters());
    this.resetBtn.addEventListener('click', () => this.resetFilters());
  }
  
  /**
   * 应用筛选器
   */
  applyFilters() {
    const category = this.categoryFilter.value;
    const sortValue = this.sortFilter.value;
    const term = (this.searchInput?.value || '').trim().toLowerCase();

    let tempProducts = [...this.products];

    if (term) {
      // 搜索时忽略分类过滤
      tempProducts = tempProducts.filter(p => {
        const base = (p.base_name || '').toLowerCase();
        return base.includes(term);
      });
      this.clearNavigationActiveState();
    } else if (category !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === category);
    }

    if (sortValue === 'newest') {
      tempProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    this.filteredProducts = tempProducts;
    this.renderProducts();
  }
  
  /**
   * 重置筛选器
   */
  resetFilters() {
    this.categoryFilter.value = 'all';
    this.sortFilter.value = 'featured';
    this.filteredProducts = [...this.products];
    this.renderProducts();
  }

  /**
   * 设置导航筛选器
   */
  setupNavigationFilters() {
    const navContainer = document.querySelector('.main-nav ul');
    if(navContainer) {
      navContainer.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
          e.preventDefault();
          const navItem = link.closest('li');
          if (navItem && navItem.dataset.categories) {
            const category = navItem.dataset.categories;
            this.filterByCategory(category);
            this.updateNavigationState(navItem);
            this.updateURL(category);
            // 同步下拉
            if (this.categoryFilter) {
              this.categoryFilter.value = category || 'all';
            }
            // 清空搜索确保分类生效
            if (this.searchInput && this.searchInput.value) {
              this.searchInput.value = '';
              this.toggleSearchClear(false);
            }
          }
        }
      });
    }
  }

  /**
   * 按分类筛选
   * @param {string} category - 分类名称
   */
  filterByCategory(category) {
    this.currentCategory = category || 'all';
    
    if (this.currentCategory === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === this.currentCategory
      );
    }

    // 如果存在搜索词，继续应用搜索过滤
    const term = (this.searchInput?.value || '').trim().toLowerCase();
    if (term) {
      this.filteredProducts = this.filteredProducts.filter(p => {
        const base = (p.base_name || '').toLowerCase();
        return base.includes(term);
      });
      this.clearNavigationActiveState();
    }
    
    this.renderProducts();
  }

  /**
   * 更新导航状态
   * @param {Element} activeItem - 激活的导航项
   */
  updateNavigationState(activeItem) {
    document.querySelectorAll('.main-nav ul li').forEach(item => {
      item.classList.remove('active');
    });
    
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  /**
   * 设置浏览器导航
   */
  setupBrowserNavigation() {
    window.addEventListener('popstate', (event) => {
      const category = event.state?.category || this.getCategoryFromURL();
      this.filterByCategory(category);
      
      const navItem = document.querySelector(`[data-categories="${category}"]`) || document.querySelector('[data-categories="all"]');
      
      if (navItem) {
        this.updateNavigationState(navItem);
      }
    });
  }

  /**
   * 从 URL 获取分类
   * @returns {string} 分类名称
   */
  getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category') || 'all';
  }

  /**
   * 更新 URL
   * @param {string} category - 分类名称
   */
  updateURL(category) {
    const url = category && category !== 'all' 
      ? `${window.location.origin}${window.location.pathname}?category=${encodeURIComponent(category)}`
      : `${window.location.origin}${window.location.pathname}`;
    
    window.history.pushState({ category }, '', url);
  }

  /**
   * 处理初始路由
   */
  handleInitialRoute() {
    const category = this.getCategoryFromURL();
    
    const navItem = document.querySelector(`[data-categories="${category}"]`) || document.querySelector('[data-categories="all"]');
    if (navItem) {
        this.filterByCategory(category);
        this.updateNavigationState(navItem);
        if (this.categoryFilter) {
          this.categoryFilter.value = category || 'all';
        }
    }
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

  /**
   * 实时搜索
   */
  setupSearch() {
    let timer = null;
    const handler = () => this.applyFilters();
    this.searchInput.addEventListener('input', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handler, 200);
      this.toggleSearchClear(Boolean(this.searchInput.value.trim()));
    });

    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.toggleSearchClear(false);
        this.applyFilters();
      });
    }
  }

  toggleSearchClear(show) {
    if (!this.searchClearBtn) return;
    this.searchClearBtn.style.visibility = show ? 'visible' : 'hidden';
    this.searchClearBtn.style.opacity = show ? '1' : '0';
  }

  clearNavigationActiveState() {
    document.querySelectorAll('.main-nav ul li').forEach(item => item.classList.remove('active'));
  }
}

export default ProductGrid;