// 图片路径配置
export const IMAGE_PATHS = {
  // 基础路径
  BASE: '/storage/uploads',
  
  // 各类型图片路径
  PRODUCTS: '/storage/uploads/product_images',
  CATEGORIES: '/storage/uploads/product_images', 
  FLAGS: '/storage/uploads/flags',
  UPLOADS: '/storage/uploads',
  
  // 默认图片
  DEFAULT_OG: '/storage/uploads/dreamoda-og-image.jpg',
  PLACEHOLDER: '/storage/uploads/placeholder-image.svg',
  COMPANY_INFO: '/storage/uploads/company-info.jpg',
  DREAMODA_LOGO: '/storage/uploads/dreamoda-logo.png',
  INDEX_BACKGROUND: '/storage/uploads/index_background.png',
  
  // 动态生成路径的函数
  getProductImage: (filename: string) => `${IMAGE_PATHS.PRODUCTS}/${filename}`,
  getCategoryImage: (filename: string) => `${IMAGE_PATHS.CATEGORIES}/${filename}`,
  getUploadImage: (filename: string) => `${IMAGE_PATHS.UPLOADS}/${filename}`,
  
  // 图片URL处理
  getFullUrl: (path: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  }
} as const;
