import { IMAGE_PATHS, fixImagePath } from './image-config';

// 图片路径修复工具类
export class ImagePathFixer {
  private static instance: ImagePathFixer;
  
  static getInstance(): ImagePathFixer {
    if (!ImagePathFixer.instance) {
      ImagePathFixer.instance = new ImagePathFixer();
    }
    return ImagePathFixer.instance;
  }
  
  // 修复页面中所有图片路径
  fixAllImagePaths(): void {
    this.fixImageElements();
    this.fixPreloadLinks();
    this.fixBackgroundImages();
  }
  
  // 修复img元素
  private fixImageElements(): void {
    const images = document.querySelectorAll('img[src*="dreamoda-og-image.jpg"]');
    images.forEach(img => {
      const element = img as HTMLImageElement;
      element.src = fixImagePath(element.src);
    });
  }
  
  // 修复预加载链接
  private fixPreloadLinks(): void {
    const preloadLinks = document.querySelectorAll('link[href*="dreamoda-og-image.jpg"]');
    preloadLinks.forEach(link => {
      const element = link as HTMLLinkElement;
      element.href = fixImagePath(element.href);
    });
  }
  
  // 修复CSS背景图片
  private fixBackgroundImages(): void {
    const elements = document.querySelectorAll('[style*="dreamoda-og-image.jpg"]');
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const style = htmlElement.style.backgroundImage;
      if (style) {
        htmlElement.style.backgroundImage = style.replace(
          /\/images\/(categories\/)?dreamoda-og-image\.jpg/g,
          IMAGE_PATHS.DEFAULT_OG
        );
      }
    });
  }
  
  // 监听新添加的图片元素
  observeNewImages(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // 检查新添加的图片
            const images = element.querySelectorAll?.('img[src*="dreamoda-og-image.jpg"]') || [];
            images.forEach(img => {
              const imgElement = img as HTMLImageElement;
              imgElement.src = fixImagePath(imgElement.src);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// 自动修复函数
export const autoFixImagePaths = (): void => {
  const fixer = ImagePathFixer.getInstance();
  fixer.fixAllImagePaths();
  fixer.observeNewImages();
};
