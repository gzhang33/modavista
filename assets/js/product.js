/**
 * 产品详情页脚本 - 主入口文件
 * 负责导入和初始化产品详情页相关的组件
 */

// 导入所需的组件和工具
import ProductDetails from './components/ProductDetails.js';
import ImageGallery from './components/ImageGallery.js';
import RelatedProducts from './components/RelatedProducts.js';

/**
 * 产品页面应用程序类
 * 协调产品详情页各个组件的初始化和交互
 */
class ProductApp {
  constructor() {
    this.productDetails = null;
    this.imageGallery = null;
    this.relatedProducts = null;
    this.currentProduct = null;
    
    this.init();
  }

  /**
   * 初始化应用程序
   */
  async init() {
    try {
      // 等待 DOM 完全加载
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // 获取产品 ID
      const productId = this.getProductIdFromUrl();
      if (!productId) {
        this.showError('ID prodotto non valido o mancante.');
        return;
      }

      // 初始化组件
      this.initializeComponents();
      
      // 加载产品数据
      await this.loadProduct(productId);
      
      // 设置组件间通信
      this.setupComponentCommunication();
      
      console.log('Product app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize product app:', error);
      this.showError(error.message);
    }
  }

  /**
   * 初始化所有组件
   */
  initializeComponents() {
    // 初始化产品详情组件
    this.productDetails = new ProductDetails();
    
    // 初始化图片画廊组件
    this.imageGallery = new ImageGallery();
    
    // 初始化相关产品组件
    this.relatedProducts = new RelatedProducts();
  }

  /**
   * 加载产品数据
   * @param {string} productId - 产品ID
   */
  async loadProduct(productId) {
    try {
      // 加载产品详情
      const product = await this.productDetails.loadAndRender(productId);
      this.currentProduct = product;

      // 设置图片画廊
      const images = this.prepareImageData(product);
      this.imageGallery.setImages(images, product.defaultImage);

      // 加载相关产品
      await this.relatedProducts.loadAndRender(product.category, product.id);

    } catch (error) {
      throw error;
    }
  }

  /**
   * 准备图片数据
   * @param {Object} product - 产品数据
   * @returns {Array} 图片URL数组
   */
  prepareImageData(product) {
    const images = product.media && product.media.length > 0 ? [...product.media] : [];
    
    // 如果有默认图片且不在媒体列表中，添加到开头
    if (product.defaultImage && !images.includes(product.defaultImage)) {
      images.unshift(product.defaultImage);
    }
    
    return images;
  }

  /**
   * 设置组件间通信
   */
  setupComponentCommunication() {
    // 监听变体切换事件
    document.addEventListener('variantChanged', (event) => {
      const { product, variationGroup } = event.detail;
      this.onVariantChanged(product, variationGroup);
    });

    // 其他组件间通信可以在这里添加
  }

  /**
   * 处理变体切换
   * @param {Object} newProduct - 新的产品数据
   * @param {Object} variationGroup - 变体分组数据
   */
  onVariantChanged(newProduct, variationGroup) {
    this.currentProduct = newProduct;

    // 更新图片画廊
    const images = this.prepareImageData(newProduct);
    this.imageGallery.setImages(images, newProduct.defaultImage);

    // 更新相关产品
    this.relatedProducts.loadAndRender(newProduct.category, newProduct.id);
  }

  /**
   * 从 URL 获取产品 ID
   * @returns {string|null} 产品ID
   */
  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  /**
   * 显示错误信息
   * @param {string} message - 错误消息
   */
  showError(message) {
    const container = document.getElementById('product-details-content');
    if (container) {
      container.innerHTML = `
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
   * 获取当前产品数据
   * @returns {Object|null} 当前产品数据
   */
  getCurrentProduct() {
    return this.currentProduct;
  }

  /**
   * 获取产品详情组件实例
   * @returns {ProductDetails|null} 产品详情组件
   */
  getProductDetails() {
    return this.productDetails;
  }

  /**
   * 获取图片画廊组件实例
   * @returns {ImageGallery|null} 图片画廊组件
   */
  getImageGallery() {
    return this.imageGallery;
  }

  /**
   * 获取相关产品组件实例
   * @returns {RelatedProducts|null} 相关产品组件
   */
  getRelatedProducts() {
    return this.relatedProducts;
  }

  /**
   * 刷新产品数据
   */
  async refresh() {
    const productId = this.getProductIdFromUrl();
    if (productId) {
      await this.loadProduct(productId);
    }
  }

  /**
   * 销毁应用程序，清理资源
   */
  destroy() {
    if (this.productDetails) {
      this.productDetails.destroy?.();
    }
    
    if (this.imageGallery) {
      this.imageGallery.destroy?.();
    }
    
    if (this.relatedProducts) {
      this.relatedProducts.destroy?.();
    }

    // 清理事件监听器
    document.removeEventListener('variantChanged', this.onVariantChanged);
  }
}

// 创建并启动应用程序
const productApp = new ProductApp();

// 将应用程序实例暴露到全局，供调试和其他脚本使用
window.productApp = productApp;

// 导出应用程序类
export { ProductApp };
export default productApp; 