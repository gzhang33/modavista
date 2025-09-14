// 图片路径配置
export const IMAGE_PATHS = {
  // 基础路径
  BASE: '/images',
  
  // 各类型图片路径
  PRODUCTS: '/product_images/products',
  CATEGORIES: '/product_images/categories', 
  UPLOADS: '/product_images/uploads',
  
  // 默认图片
  DEFAULT_OG: '/dreamoda-og-image.jpg',
  PLACEHOLDER: '/product_images/placeholder.svg',
  
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

// 图片路径修复工具
export const fixImagePath = (path: string): string => {
  // 修复旧的路径引用
  const pathMappings = [
    { from: '/images/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG },
    { from: '/images/categories/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG },
    { from: '/images/products/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG },
    { from: '/product_images/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG },
    { from: '/product_images/categories/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG },
    { from: '/product_images/products/dreamoda-og-image.jpg', to: IMAGE_PATHS.DEFAULT_OG }
  ];
  
  for (const mapping of pathMappings) {
    if (path.includes(mapping.from)) {
      return path.replace(mapping.from, mapping.to);
    }
  }
  
  return path;
};
