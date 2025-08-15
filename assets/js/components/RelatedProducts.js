/**
 * 相关产品组件
 * 负责获取和渲染产品详情页的"你可能也感兴趣"商品列表
 */
import apiClient from '../utils/apiClient.js';
import { get_base_name } from '../utils/product_name_utils.js';
import { build_image_src } from '../utils/image_utils.js';

export class RelatedProducts {
  constructor() {
    this.container = document.getElementById('related-products-grid');
    this.currentProductId = null;
    this.currentCategory = null;
    this.relatedProducts = [];
    
    this.init();
  }

  /**
   * 初始化相关产品组件
   */
  init() {
    if (!this.container) {
      console.warn('Related products container not found');
      return;
    }

    // 设置初始状态
    this.showLoadingState();
  }

  /**
   * 加载和渲染相关产品
   * @param {string} category - 当前产品的分类
   * @param {string} currentProductId - 当前产品的ID，用于排除
   * @param {number} limit - 显示数量限制，默认为8
   */
  async loadAndRender(category, currentProductId, limit = 8) {
    this.currentCategory = category;
    this.currentProductId = currentProductId;

    try {
      this.showLoadingState();
      
      // 获取同分类的所有产品
      const allCategoryProducts = await apiClient.getProductsByCategory(category);

      // 过滤掉当前产品，只保留同分类的其他产品
      const filteredProducts = allCategoryProducts.filter(product => 
        product.category === category && product.id !== currentProductId
      );

      // 随机排序并限制数量
      this.relatedProducts = this.shuffleArray(filteredProducts).slice(0, limit);

      if (this.relatedProducts.length > 0) {
        this.renderProducts();
      } else {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('Failed to load related products:', error);
      this.showErrorState();
    }
  }

  /**
   * 渲染相关产品列表
   */
  renderProducts() {
    if (!this.container || this.relatedProducts.length === 0) {
      this.showEmptyState();
      return;
    }

    const productsHTML = this.relatedProducts.map(product => 
      this.createProductCard(product)
    ).join('');

    this.container.innerHTML = productsHTML;

    // 设置图片加载处理
    setTimeout(() => {
      this.setupImageLoading();
    }, 10);

    // 设置点击事件
    this.setupProductClickEvents();
  }

  /**
   * 创建单个产品卡片的HTML
   * @param {Object} product - 产品数据
   * @returns {string} HTML字符串
   */
  createProductCard(product) {
    const fallbackFromMedia = Array.isArray(product.media) && product.media.length > 0 ? product.media[0] : null;
    const chosenPath = product.defaultImage || fallbackFromMedia;
    const imageSrc = build_image_src(chosenPath);
    const isNew = this.isNewProduct(product);

    return `
      <article class="product-card related-product" data-product-id="${product.id}">
        <div class="product-image-container spinner">
          ${this.createProductBadges(isNew)}
          <img 
            src="${imageSrc}" 
            alt="${product.name}" 
            class="product-img" 
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
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
   * 设置图片加载处理
   */
  setupImageLoading() {
    const images = this.container.querySelectorAll('img.product-img');
    
    images.forEach((img) => {
      // 加载成功处理
      img.addEventListener('load', () => {
        img.classList.add('loaded');
        const wrapper = img.closest('.product-image-container');
        if (wrapper) {
          wrapper.classList.add('loaded');
          wrapper.classList.remove('spinner');
        }
      });

      // 加载错误处理
      img.addEventListener('error', () => {
        img.src = build_image_src('/images/placeholder.svg');
        img.classList.add('loaded');
        const wrapper = img.closest('.product-image-container');
        if (wrapper) {
          wrapper.classList.add('loaded');
          wrapper.classList.remove('spinner');
        }
      });

      // 如果图片已经完成加载（缓存命中）
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
        const wrapper = img.closest('.product-image-container');
        if (wrapper) {
          wrapper.classList.add('loaded');
          wrapper.classList.remove('spinner');
        }
      }
    });
  }

  /**
   * 设置产品卡片点击事件
   */
  setupProductClickEvents() {
    const productCards = this.container.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = card.dataset.productId;
        if (productId) {
          // 跳转到产品详情页
          window.location.href = `product.html?id=${productId}`;
        }
      });

      // 添加悬停效果
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * 显示加载状态
   */
  showLoadingState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Caricamento prodotti correlati...</p>
        </div>
      `;
    }
  }

  /**
   * 显示空状态
   */
  showEmptyState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p>Nessun prodotto correlato trovato.</p>
        </div>
      `;
    }
  }

  /**
   * 显示错误状态
   */
  showErrorState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <p>Impossibile caricare i prodotti correlati.</p>
          <button onclick="this.parentElement.parentElement.querySelector('.retry-btn')?.click()" class="retry-btn">Riprova</button>
        </div>
      `;

      // 重试按钮事件
      const retryBtn = this.container.querySelector('.retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.loadAndRender(this.currentCategory, this.currentProductId);
        });
      }
    }
  }

  /**
   * 标准化图片路径
   * @param {string|null|undefined} path - 图片路径
   * @returns {string} 标准化后的图片路径
   */
  buildImageSrc(path) {
    if (!path) return '/images/placeholder.svg';
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * 随机打乱数组
   * @param {Array} array - 要打乱的数组
   * @returns {Array} 打乱后的数组
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 获取随机相关产品
   * @param {Array} products - 产品列表
   * @param {number} count - 需要的产品数量
   * @returns {Array} 随机选择的产品
   */
  getRandomProducts(products, count) {
    const shuffled = this.shuffleArray(products);
    return shuffled.slice(0, count);
  }

  /**
   * 刷新相关产品
   */
  async refresh() {
    if (this.currentCategory && this.currentProductId) {
      await this.loadAndRender(this.currentCategory, this.currentProductId);
    }
  }

  /**
   * 获取当前相关产品列表
   * @returns {Array} 当前相关产品列表
   */
  getRelatedProducts() {
    return [...this.relatedProducts];
  }

  /**
   * 检查是否有相关产品
   * @returns {boolean} 是否有相关产品
   */
  hasRelatedProducts() {
    return this.relatedProducts.length > 0;
  }

  /**
   * 清空相关产品
   */
  clear() {
    this.relatedProducts = [];
    this.currentProductId = null;
    this.currentCategory = null;
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.clear();
  }
}

export default RelatedProducts;