 /**
 * 主页脚本 - 主入口文件
 * 负责导入和初始化主页相关的组件
 */

// 导入所需的组件和工具
import ProductGrid from './components/ProductGrid.js';
import MobileNavigation from './components/MobileNavigation.js';
import ContactForm from './components/ContactForm.js';
// import LanguageSwitcher from './components/LanguageSwitcher.js';
import EventBus from './EventBus.js';
import { build_map_link, sanitize_phone_href } from './utils/map_utils.js';

/**
 * 主页应用程序类
 * 协调各个组件的初始化和交互
 */
class MainApp {
  constructor() {
    this.productGrid = null;
    this.mobileNavigation = null;
    this.languageSwitcher = null;
    
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

      // 初始化各个组件
      this.initializeComponents();
      this.setupGlobalHandlers();
      
      console.log('Main app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize main app:', error);
    }
  }

  /**
   * 初始化所有组件
   */
  initializeComponents() {
    // 初始化语言切换组件
    // if (document.getElementById('language-switcher-container')) {
    //   this.languageSwitcher = new LanguageSwitcher(
    //     document.getElementById('language-switcher-container')
    //   );
    // }

    // 初始化产品网格组件
    if (document.getElementById('product-list')) {
      this.productGrid = new ProductGrid();
    }

    // 初始化移动端导航组件
    this.mobileNavigation = new MobileNavigation();
  }

  /**
   * 设置全局事件处理器
   */
  setupGlobalHandlers() {
    // 返回顶部按钮
    this.setupBackToTop();
    
    // 全局错误处理
    this.setupGlobalErrorHandling();
    
    // 页面可见性变化处理
    this.setupVisibilityChangeHandling();

    // 联系方式链接（电话、地址）增强
    this.setupContactLinks();
  }

  /**
   * 设置返回顶部功能
   */
  setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    // 滚动显示/隐藏按钮
    let isScrolling = false;
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          backToTopBtn.style.display = scrollTop > 300 ? 'block' : 'none';
          isScrolling = false;
        });
        isScrolling = true;
      }
    });

    // 点击返回顶部
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * 设置全局错误处理
   */
  setupGlobalErrorHandling() {
    // 图片加载错误的全局处理
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.src = '/images/placeholder-optimized.svg';
        e.target.classList.add('error');
      }
    }, true);

    // 未捕获的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // 可以在这里添加错误报告逻辑
    });
  }

  /**
   * 设置页面可见性变化处理
   */
  setupVisibilityChangeHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，可以刷新数据或恢复某些功能
        this.onPageVisible();
      } else {
        // 页面变为不可见时，可以暂停某些操作
        this.onPageHidden();
      }
    });
  }

  /**
   * 页面变为可见时的处理
   */
  onPageVisible() {
    // 可以在这里添加页面重新获得焦点时的逻辑
    console.log('Page became visible');
  }

  /**
   * 页面变为隐藏时的处理
   */
  onPageHidden() {
    // 可以在这里添加页面失去焦点时的逻辑
    console.log('Page became hidden');
  }

  /**
   * 获取产品网格组件实例
   * @returns {ProductGrid|null} 产品网格组件
   */
  getProductGrid() {
    return this.productGrid;
  }

  /**
   * 获取移动端导航组件实例
   * @returns {MobileNavigation|null} 移动端导航组件
   */
  getMobileNavigation() {
    return this.mobileNavigation;
  }

  /**
   * 设置联系方式链接（电话拨号、地图跳转）
   */
  setupContactLinks() {
    // 电话链接：根据展示文本规范化 tel: href
    document.querySelectorAll('.contact-phone[data-phone]')
      .forEach((el) => {
        const raw = el.getAttribute('data-phone') || el.textContent || '';
        const href = sanitize_phone_href(raw);
        if (href && el.getAttribute('href') !== href) {
          el.setAttribute('href', href);
        }
      });

    // 地址链接：基于 data-address 构建目标地图链接，支持切换地图提供商
    document.querySelectorAll('.contact-address[data-address]')
      .forEach((el) => {
        const address = el.getAttribute('data-address') || el.textContent || '';
        const href = build_map_link(address);
        if (href && el.getAttribute('href') !== href) {
          el.setAttribute('href', href);
        }
        // 默认新窗口打开
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      });
  }

  /**
   * 销毁应用程序，清理资源
   */
  destroy() {
    if (this.productGrid) {
      this.productGrid.destroy?.();
    }
    
    if (this.mobileNavigation) {
      this.mobileNavigation.destroy?.();
    }
  }
}

/**
 * 工具函数 - 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 创建并启动应用程序
const mainApp = new MainApp();

// 将应用程序实例暴露到全局，供调试和其他脚本使用
window.mainApp = mainApp;

// 导出主应用程序类和工具函数
export { MainApp, debounce };
export default mainApp;
