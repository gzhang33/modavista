/**
 * 图片画廊组件
 * 负责处理产品详情页的图片展示、缩略图切换、缩放等功能
 */
import { build_image_src } from '../utils/image_utils.js';

export class ImageGallery {
  constructor() {
    this.mainImage = null;
    this.thumbnails = [];
    this.currentImageIndex = 0;
    this.images = [];
    
    this.init();
  }

  /**
   * 初始化图片画廊
   */
  init() {
    this.findGalleryElements();
    if (this.mainImage) {
      this.setupImageGalleryListeners();
      this.setupZoomFunctionality();
    }
  }

  /**
   * 查找画廊相关元素
   */
  findGalleryElements() {
    this.mainImage = document.getElementById('main-product-image');
    this.thumbnails = document.querySelectorAll('.thumbnail-image');
    this.mainImageContainer = document.querySelector('.main-image-container');
  }

  /**
   * 设置图片数据
   * @param {Array} images - 图片URL数组
   * @param {string} defaultImage - 默认图片URL
   */
  setImages(images, defaultImage = null) {
    this.images = [...images];
    // 变更后重新抓取最新的 DOM 元素引用
    this.findGalleryElements();
    
    // 如果有默认图片且不在列表中，添加到开头
    if (defaultImage && !this.images.includes(defaultImage)) {
      this.images.unshift(defaultImage);
    }

    this.currentImageIndex = 0;
    this.renderGallery();
  }

  /**
   * 渲染图片画廊
   */
  renderGallery() {
    if (this.images.length === 0) {
      this.renderNoImages();
      return;
    }

    this.renderMainImage();
    this.renderThumbnails();
    this.setupImageGalleryListeners();
  }

  /**
   * 渲染主图
   */
  renderMainImage() {
    if (!this.mainImage) return;

    const imageSrc = build_image_src(this.images[this.currentImageIndex]);

    // 重置状态
    this.mainImage.classList.remove('loaded');

    this.mainImage.src = imageSrc;
    this.mainImage.alt = `产品图片 ${this.currentImageIndex + 1}`;

    // 设置加载成功处理
    this.mainImage.onload = () => {
      this.mainImage.classList.add('loaded');
      if (this.mainImageContainer) {
        this.mainImageContainer.classList.add('image-loaded');
      }
    };

    // 设置加载错误处理
    this.mainImage.onerror = () => {
      this.mainImage.src = build_image_src('/images/placeholder.svg');
      this.mainImage.classList.add('loaded');
      if (this.mainImageContainer) {
        this.mainImageContainer.classList.add('image-loaded');
      }
    };

    // 如果图片已经加载完成（缓存），立即添加loaded类
    if (this.mainImage.complete && this.mainImage.naturalWidth > 0) {
      this.mainImage.classList.add('loaded');
      if (this.mainImageContainer) {
        this.mainImageContainer.classList.add('image-loaded');
      }
    }
  }

  /**
   * 渲染缩略图
   */
  renderThumbnails() {
    const thumbnailContainer = document.getElementById('thumbnail-images');
    if (!thumbnailContainer) return;

    const thumbnailsHTML = this.images.map((img, index) => `
      <img 
        src="${build_image_src(img)}" 
        alt="Miniatura ${index + 1}" 
        class="thumbnail-image ${index === this.currentImageIndex ? 'active' : ''}" 
        data-index="${index}"
        data-src="${build_image_src(img)}"
      >
    `).join('');

    thumbnailContainer.innerHTML = thumbnailsHTML;
    
    // 重新获取缩略图元素
    this.thumbnails = thumbnailContainer.querySelectorAll('.thumbnail-image');
  }

  /**
   * 渲染无图片状态
   */
  renderNoImages() {
    if (this.mainImage) {
      this.mainImage.src = build_image_src('/images/placeholder.svg');
      this.mainImage.alt = 'Nessuna immagine disponibile';
    }

    const thumbnailContainer = document.getElementById('thumbnail-images');
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = '';
    }
  }

  /**
   * 设置图片画廊事件监听器
   */
  setupImageGalleryListeners() {
    // 主图错误处理
    if (this.mainImage) {
      this.mainImage.onerror = () => { 
        this.mainImage.src = build_image_src('/images/placeholder.svg');
        this.mainImage.classList.add('loaded');
      };
    }

    // 缩略图事件
    this.thumbnails.forEach((thumb, index) => {
      // 添加加载完成事件监听
      thumb.addEventListener('load', () => {
        thumb.classList.add('loaded');
      });

      // 如果图片已经加载完成，立即添加loaded类
      if (thumb.complete && thumb.naturalWidth > 0) {
        thumb.classList.add('loaded');
      }

      // 点击切换主图
      thumb.addEventListener('click', () => {
        this.switchToImage(index);
      });

      // 缩略图错误处理
      thumb.onerror = () => { 
        thumb.src = build_image_src('/images/placeholder.svg'); 
        thumb.classList.add('loaded');
      };
    });
  }

  /**
   * 切换到指定图片
   * @param {number} index - 图片索引
   */
  switchToImage(index) {
    if (index < 0 || index >= this.images.length || index === this.currentImageIndex) {
      return;
    }

    this.currentImageIndex = index;
    const newSrc = build_image_src(this.images[index]);
    
    // 淡出效果
    if (this.mainImage) {
      this.mainImage.classList.remove('loaded');
      this.mainImage.style.opacity = '0';
      
      setTimeout(() => {
        this.mainImage.src = newSrc;
        
        // 等待新图片加载完成后再显示
        const showNewImage = () => {
          this.mainImage.classList.add('loaded');
          this.mainImage.style.opacity = '1';
          this.mainImage.removeEventListener('load', showNewImage);
        };
        
        this.mainImage.addEventListener('load', showNewImage);
      }, 200);
    }
    
    // 更新缩略图状态
    this.updateThumbnailStates();
  }

  /**
   * 更新缩略图激活状态
   */
  updateThumbnailStates() {
    this.thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === this.currentImageIndex);
    });
  }

  /**
   * 设置缩放功能
   */
  setupZoomFunctionality() {
    if (!this.mainImageContainer || !this.mainImage) return;

    if (this.isMobile()) {
      this.setupMobileZoom();
    } else {
      this.setupDesktopZoom();
    }
  }

  /**
   * 设置移动端缩放
   */
  setupMobileZoom() {
    let isZoomed = false;
    
    this.mainImageContainer.addEventListener('click', (e) => {
      e.preventDefault();
      isZoomed = !isZoomed;
      this.mainImage.style.transform = isZoomed ? 'scale(1.5)' : 'scale(1)';
      this.mainImageContainer.style.cursor = isZoomed ? 'zoom-out' : 'zoom-in';
    });
  }

  /**
   * 设置桌面端缩放
   */
  setupDesktopZoom() {
    this.mainImageContainer.addEventListener('mousemove', (e) => {
      const rect = this.mainImageContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.mainImage.style.transformOrigin = `${x}% ${y}%`;
    });

    this.mainImageContainer.addEventListener('mouseleave', () => {
      this.mainImage.style.transformOrigin = 'center center';
    });

    // 鼠标悬停缩放
    this.mainImageContainer.addEventListener('mouseenter', () => {
      this.mainImage.style.transform = 'scale(1.2)';
      this.mainImageContainer.style.cursor = 'zoom-in';
    });

    this.mainImageContainer.addEventListener('mouseleave', () => {
      this.mainImage.style.transform = 'scale(1)';
      this.mainImageContainer.style.cursor = 'default';
    });
  }

  /**
   * 检测是否为移动设备
   * @returns {boolean} 是否为移动设备
   */
  isMobile() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }

  /**
   * 标准化图片路径
   * @param {string|null|undefined} path - 图片路径
   * @returns {string} 标准化后的图片路径
   */
  // 标准化图片路径逻辑移至 utils/image_utils.js

  /**
   * 上一张图片
   */
  previousImage() {
    const newIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.images.length - 1;
    this.switchToImage(newIndex);
  }

  /**
   * 下一张图片
   */
  nextImage() {
    const newIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
    this.switchToImage(newIndex);
  }

  /**
   * 获取当前图片信息
   * @returns {Object} 当前图片信息
   */
  getCurrentImageInfo() {
    return {
      index: this.currentImageIndex,
      src: this.images[this.currentImageIndex],
      total: this.images.length
    };
  }

  /**
   * 预加载图片
   * @param {string} src - 图片源地址
   * @returns {Promise} 加载承诺
   */
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /**
   * 预加载所有图片
   */
  async preloadAllImages() {
    const loadPromises = this.images.map(src => this.preloadImage(build_image_src(src)));
    
    try {
      await Promise.all(loadPromises);
      console.log('All images preloaded successfully');
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    // 清理事件监听器和重置状态
    this.currentImageIndex = 0;
    this.images = [];
    
    if (this.mainImage) {
      this.mainImage.style.transform = '';
      this.mainImage.style.transformOrigin = '';
    }
  }
}

export default ImageGallery;