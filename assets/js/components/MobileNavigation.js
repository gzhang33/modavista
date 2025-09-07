/**
 * 移动端导航组件
 * 负责处理移动设备上的导航菜单展开/收起逻辑
 */
export class MobileNavigation {
  constructor() {
    this.mobileToggle = document.querySelector('.mobile-nav-toggle');
    this.mainNav = document.querySelector('.main-nav');
    this.handleMobileToggle = null;
    
    this.init();
  }

  /**
   * 初始化移动端导航
   */
  init() {
    if (!this.mobileToggle || !this.mainNav) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    this.setupMobileToggle();
    this.setupNavClickHandler();
    this.setupOutsideClickHandler();
    this.setupResizeHandler();
    this.setupLanguageDropdownListener();
  }

  /**
   * 设置移动端切换按钮
   */
  setupMobileToggle() {
    this.handleMobileToggle = (e) => {
      e.stopPropagation();
      this.toggleNavigation();
    };
    
    this.mobileToggle.addEventListener('click', this.handleMobileToggle);
  }

  /**
   * 切换导航菜单状态
   */
  toggleNavigation() {
    this.mainNav.classList.toggle('active');
    const isActive = this.mainNav.classList.contains('active');
    this.updateToggleButton(isActive);
  }

  /**
   * 更新切换按钮状态
   * @param {boolean} isActive - 导航是否激活
   */
  updateToggleButton(isActive) {
    this.mobileToggle.textContent = isActive ? '✕' : '☰';
    this.mobileToggle.setAttribute('aria-expanded', isActive);
  }

  /**
   * 设置导航链接点击处理
   */
  setupNavClickHandler() {
    this.mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        this.closeNavigation();
      }
    });
  }

  /**
   * 设置外部点击关闭导航
   */
  setupOutsideClickHandler() {
    document.addEventListener('click', (e) => {
      // 如果点击的不是导航相关元素，则关闭导航
      if (!this.mainNav.contains(e.target) && !this.mobileToggle.contains(e.target)) {
        this.closeNavigation();
      }
    });
  }

  /**
   * 设置窗口大小改变处理
   */
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeNavigation();
      }
    });
  }

  /**
   * 关闭导航菜单
   */
  closeNavigation() {
    if (this.mainNav.classList.contains('active')) {
      this.mainNav.classList.remove('active');
      this.updateToggleButton(false);
    }
  }

  /**
   * 打开导航菜单
   */
  openNavigation() {
    if (!this.mainNav.classList.contains('active')) {
      this.mainNav.classList.add('active');
      this.updateToggleButton(true);
    }
  }

  /**
   * 检查导航是否打开
   * @returns {boolean} 导航是否打开
   */
  isNavigationOpen() {
    return this.mainNav.classList.contains('active');
  }

  /**
   * 设置语言下拉菜单监听器（互斥逻辑）
   */
  setupLanguageDropdownListener() {
    if (window.EventBus) {
      // 当语言下拉菜单打开时，关闭移动导航
      window.EventBus.on('language_dropdown_opened', () => {
        this.closeNavigation();
      });

      // 当移动导航打开时，可以通知语言切换器关闭
      // （如果需要的话，这里可以添加相应逻辑）
    }
  }

  /**
   * 销毁组件，清理事件监听器
   */
  destroy() {
    if (this.handleMobileToggle) {
      this.mobileToggle.removeEventListener('click', this.handleMobileToggle);
    }
    
    // 重置导航状态
    this.closeNavigation();
  }
}

export default MobileNavigation;