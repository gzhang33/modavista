/**
 * 产品详情组件
 * 负责展示产品的基本信息、变体选择、面包屑导航等功能
 */
import apiClient from '../utils/apiClient.js';
import { get_base_name, extract_color_label } from '../utils/product_name_utils.js';
import { build_image_src } from '../utils/image_utils.js';

export class ProductDetails {
  constructor() {
    this.container = document.getElementById('product-details-content');
    this.currentProduct = null;
    this.variationGroup = null;
    
    this.init();
  }

  /**
   * 初始化产品详情组件
   */
  init() {
    if (!this.container) {
      console.warn('Product details container not found');
      return;
    }

    this.showLoadingState();
  }

  /**
   * 加载并渲染产品详情
   * @param {string} productId - 产品ID
   */
  async loadAndRender(productId) {
    try {
      this.showLoadingState();

      // 获取产品详情
      const product = await apiClient.getProduct(productId);
      this.currentProduct = product;

      // 优先使用后端返回的同组 siblings 构建变体组；回退到同分类聚合
      if (Array.isArray(product.siblings) && product.siblings.length > 0) {
        this.variationGroup = this.buildVariationGroupFromSiblings(product);
      } else {
        const categoryProducts = await apiClient.getProductsByCategory(product.category);
        this.variationGroup = this.buildVariationGroup(product, categoryProducts);
      }

      // 渲染产品详情
      this.renderProductDetails();

      // 返回产品数据供其他组件使用
      return product;
    } catch (error) {
      console.error('Failed to load product details:', error);
      this.showErrorState(error.message);
      throw error;
    }
  }

  /**
   * 渲染产品详情
   */
  renderProductDetails() {
    if (!this.currentProduct) return;

    const product = this.currentProduct;
    
    // 更新页面标题
    document.title = `${product.base_name || product.name} - Moda Italiana`;

    // 准备图片数据
    const images = product.media && product.media.length > 0 ? product.media : [];
    if (product.defaultImage && !images.includes(product.defaultImage)) {
      images.unshift(product.defaultImage);
    }

    // 渲染各个部分
    const breadcrumbsHTML = this.renderBreadcrumbs(product);
    const imageGalleryHTML = this.renderImageGallery(images, product.name);
    const productInfoHTML = this.renderProductInfo(product);

    this.container.innerHTML = `
      ${breadcrumbsHTML}
      <div class="product-layout">
        ${imageGalleryHTML}
        ${productInfoHTML}
      </div>
    `;

    // 设置变体事件监听器
    if (this.variationGroup && this.variationGroup.items.length > 1) {
      this.attachVariationEventListeners();
    }
  }

  /**
   * 渲染面包屑导航
   * @param {Object} product - 产品数据
   * @returns {string} 面包屑HTML
   */
  renderBreadcrumbs(product) {
    return `
      <div class="breadcrumbs">
        <a href="/">Home</a> / 
        <a href="/#collection">Collezione</a> / 
        <span>${product.name}</span>
      </div>
    `;
  }

  /**
   * 渲染图片画廊
   * @param {Array} images - 图片数组
   * @param {string} productName - 产品名称
   * @returns {string} 图片画廊HTML
   */
  renderImageGallery(images, productName) {
    const mainImageSrc = images.length > 0 ? build_image_src(images[0]) : build_image_src('/images/placeholder.svg');
    
    const thumbnailsHTML = images.map((img, index) => `
      <img 
        src="${build_image_src(img)}" 
        alt="Miniatura ${index + 1}" 
        class="thumbnail-image ${index === 0 ? 'active' : ''}" 
        data-src="${build_image_src(img)}"
      >
    `).join('');

    return `
      <div class="product-gallery">
        <div class="main-image-container">
          <img 
            src="${mainImageSrc}" 
            alt="Immagine principale di ${productName}" 
            id="main-product-image" 
            class="main-image loaded"
          >
        </div>
        <div class="product-media-thumbnails" id="thumbnail-images">
          ${thumbnailsHTML}
        </div>
      </div>
    `;
  }

  /**
   * 渲染产品信息
   * @param {Object} product - 产品数据
   * @returns {string} 产品信息HTML
   */
  renderProductInfo(product) {
    return `
      <div class="product-info">
        <h1 class="product-title">${product.base_name || product.name}</h1>
        <div class="product-actions">
          <a class="cta-contact-btn" href="/index.html#contact-us">Contattaci</a>
        </div>
        <div class="product-fabric">
          <h4>Descrizione</h4>
          <p class="product-description">${product.description || 'Nessuna descrizione disponibile.'}</p>
        </div>
        ${this.renderVariationSection()}
      </div>
    `;
  }

  /**
   * 渲染变体选择区域
   * @returns {string} 变体选择HTML
   */
  renderVariationSection() {
    if (!this.variationGroup || !this.variationGroup.items || this.variationGroup.items.length <= 1) {
      return '';
    }

    const swatches = this.variationGroup.items.map(item => {
      const isActive = item.id === this.currentProduct.id;
      const swatchClass = 'swatch image';
      const inner = `<img src="${item.image}" alt="${item.color_label || 'preview'}">`;
      const tooltip = item.color_label ? `<span class="swatch-tooltip">${item.color_label}</span>` : '';
      
      return `
        <button class="${swatchClass} ${isActive ? 'selected' : ''}" 
                data-variant-id="${item.id}" 
                aria-label="${item.color_label || item.name}">
          ${inner}
          ${tooltip}
        </button>
      `;
    }).join('');

    return `
      <div class="variation-section">
        <h4>Colore</h4>
        <div class="color-swatches" role="listbox" aria-label="Colori disponibili">
          ${swatches}
        </div>
      </div>
    `;
  }

  /**
   * 构建变体分组
   * @param {Object} product - 当前产品
   * @param {Array} categoryProducts - 同分类产品
   * @returns {Object|null} 变体分组数据
   */
  buildVariationGroup(product, categoryProducts) {
    if (!Array.isArray(categoryProducts) || categoryProducts.length === 0) return null;
    
    const baseKey = get_base_name(product.name);
    if (!baseKey) return null;

    const siblings = categoryProducts.filter(p => 
      p.id !== product.id && get_base_name(p.name) === baseKey
    );

    const items = [product, ...siblings].map(p => ({
      id: p.id,
      name: p.name,
      color_label: extract_color_label(p.name),
      image: this.buildImageSrc(p.defaultImage || (Array.isArray(p.media) && p.media[0]) || '/images/placeholder.svg')
    }));

    if (items.length <= 1) return null;

    return { key: baseKey, items };
  }

  /**
   * 依据后端 siblings 构建变体分组
   * @param {Object} product
   * @returns {Object|null}
   */
  buildVariationGroupFromSiblings(product) {
    const baseKey = get_base_name(product.name || product.base_name);
    const list = Array.isArray(product.siblings) ? product.siblings : [];
    if (!baseKey || list.length === 0) return null;
    // 保证当前产品在首位
    const items = [product, ...list.filter(s => s.id !== product.id)].map(p => ({
      id: p.id,
      name: p.name,
      color_label: extract_color_label(p.name),
      image: this.buildImageSrc(p.defaultImage || (Array.isArray(p.media) && p.media[0]) || '/images/placeholder.svg')
    }));
    if (items.length <= 1) return null;
    return { key: baseKey, items };
  }

  /**
   * 计算名称"基名"
   * @param {string} name - 产品名称
   * @returns {string} 基名
   */
  // name utils 已抽到 utils/product_name_utils.js

  /**
   * 绑定变体点击事件
   */
  attachVariationEventListeners() {
    const buttons = document.querySelectorAll('.color-swatches .swatch');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const variantId = btn.getAttribute('data-variant-id');
        if (!variantId || variantId === this.currentProduct.id) return;
        
        try {
          // 加载新的变体产品
          await this.switchToVariant(variantId);
        } catch (error) {
          console.error('Failed to switch variant:', error);
          // 降级：直接跳转
          window.location.href = `product.html?id=${variantId}`;
        }
      });
    });
  }

  /**
   * 切换到指定变体
   * @param {string} variantId - 变体ID
   */
  async switchToVariant(variantId) {
    const newProduct = await apiClient.getProduct(variantId);
    this.currentProduct = newProduct;
    if (Array.isArray(newProduct.siblings) && newProduct.siblings.length > 0) {
      this.variationGroup = this.buildVariationGroupFromSiblings(newProduct);
    } else {
      const categoryProducts = await apiClient.getProductsByCategory(newProduct.category);
      this.variationGroup = this.buildVariationGroup(newProduct, categoryProducts);
    }
    
    // 无刷新更新视图
    this.renderProductDetails();
    
    // 更新浏览器历史
    history.replaceState(null, '', `product.html?id=${newProduct.id}`);
    
    // 触发自定义事件通知其他组件
    this.dispatchVariantChangeEvent(newProduct);
  }

  /**
   * 派发变体切换事件
   * @param {Object} newProduct - 新产品数据
   */
  dispatchVariantChangeEvent(newProduct) {
    const event = new CustomEvent('variantChanged', {
      detail: { 
        product: newProduct,
        variationGroup: this.variationGroup
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * 显示加载状态
   */
  showLoadingState() {
    if (this.container) {
      this.container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Caricamento prodotto...</p>
        </div>
      `;
    }
  }

  /**
   * 显示错误状态
   * @param {string} message - 错误消息
   */
  showErrorState(message = 'Errore nel caricamento del prodotto') {
    if (this.container) {
      this.container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Errore</h3>
          <p>${message}</p>
          <div class="error-actions">
            <button onclick="location.reload()" class="retry-btn">Ricarica</button>
            <button onclick="window.history.back()" class="back-btn">Torna Indietro</button>
          </div>
        </div>
      `;
    }

    // 隐藏相关产品部分
    const relatedSection = document.querySelector('.related-products-section');
    if (relatedSection) {
      relatedSection.style.display = 'none';
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
   * 获取当前产品数据
   * @returns {Object|null} 当前产品数据
   */
  getCurrentProduct() {
    return this.currentProduct;
  }

  /**
   * 获取变体分组数据
   * @returns {Object|null} 变体分组数据
   */
  getVariationGroup() {
    return this.variationGroup;
  }

  /**
   * 检查是否有变体
   * @returns {boolean} 是否有变体
   */
  hasVariations() {
    return this.variationGroup && this.variationGroup.items && this.variationGroup.items.length > 1;
  }

  /**
   * 清空组件状态
   */
  clear() {
    this.currentProduct = null;
    this.variationGroup = null;
    
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

export default ProductDetails;