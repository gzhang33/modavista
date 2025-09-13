// 产品图片处理工具函数 - 修复版本
// 统一处理产品图片路径和fallback逻辑

export interface ImageProcessingOptions {
  enableFallback?: boolean;
  debug?: boolean;
}

export interface ImageErrorHandlerOptions {
  debug?: boolean;
  showToast?: boolean;
  onError?: (error: string) => void;
  t?: (key: string, fallback?: string) => string; // 添加翻译函数参数
}

// 处理单个图片路径
export function processImagePath(imagePath: string | undefined | null, options: ImageProcessingOptions = {}): string {
  const { debug = false } = options;
  
  if (debug) {
    console.log('Processing image path:', imagePath);
  }
  
  // 如果没有图片路径，返回placeholder
  if (!imagePath || imagePath.trim() === '') {
    if (debug) console.log('No image path provided, using placeholder');
    return '/product_images/placeholder-image.svg';
  }
  
  // 如果已经是完整的HTTP URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (debug) console.log('Using HTTP URL:', imagePath);
    return imagePath;
  }
  
  // 如果是placeholder，直接返回
  if (imagePath.includes('placeholder')) {
    return '/product_images/placeholder-image.svg';
  }
  
  // 处理API返回的相对路径，API返回格式：products/media-xxx.jpg
  let finalPath = imagePath;
  
  // 如果以products/开头，移除这个前缀并添加代理前缀
  if (finalPath.startsWith('products/')) {
    finalPath = `/product-images/${finalPath.substring(9)}`; // 移除'products/'并添加代理前缀
  } 
  // 如果以/images/products/开头
  else if (finalPath.startsWith('/images/products/')) {
    finalPath = `/product-images/${finalPath.substring(17)}`; // 移除'/images/products/'并添加代理前缀
  }
  // 如果以images/products/开头
  else if (finalPath.startsWith('images/products/')) {
    finalPath = `/product-images/${finalPath.substring(16)}`; // 移除'images/products/'并添加代理前缀
  }
  // 如果以/images/开头（兼容旧数据）
  else if (finalPath.startsWith('/images/')) {
    finalPath = `/product-images/${finalPath.substring(8)}`; // 移除'/images/'并添加代理前缀
  }
  // 如果以images/开头（兼容旧数据）
  else if (finalPath.startsWith('images/')) {
    finalPath = `/product-images/${finalPath.substring(7)}`; // 移除'images/'并添加代理前缀
  }
  // 如果包含反斜杠（来自数据库的转义字符），替换为正斜杠
  else if (finalPath.includes('\\')) {
    finalPath = finalPath.replace(/\\/g, '/');
    // 再次检查是否以products/或images/开头
    if (finalPath.startsWith('products/')) {
      finalPath = `/product-images/${finalPath.substring(9)}`;
    } else if (finalPath.startsWith('images/')) {
      finalPath = `/product-images/${finalPath.substring(7)}`;
    } else {
      finalPath = `/product-images/${finalPath}`;
    }
  }
  // 其他情况，直接添加代理前缀
  else {
    finalPath = `/product-images/${finalPath}`;
  }
  
  if (debug) {
    console.log('Original path:', imagePath);
    console.log('Final path:', finalPath);
  }
  
  return finalPath;
}

// 处理图片数组
export function processImageArray(images: (string | undefined | null)[] | undefined | null, options: ImageProcessingOptions = {}): string[] {
  const { debug = false } = options;
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    if (debug) console.log('No images provided, using placeholder array');
    return ['/product_images/placeholder-image.svg'];
  }
  
  const processedImages = images
    .filter(img => img != null && img.trim() !== '') // 过滤掉空值
    .map(img => processImagePath(img, options))
    .filter(img => img !== '/product_images/placeholder-image.svg'); // 先过滤掉placeholder
  
  // 如果没有有效图片，返回placeholder
  if (processedImages.length === 0) {
    if (debug) console.log('No valid images after processing, using placeholder');
    return ['/product_images/placeholder-image.svg'];
  }
  
  if (debug) {
    console.log('Processed image array:', processedImages);
  }
  
  return processedImages;
}

// 为img标签创建错误处理函数
export function createImageErrorHandler(options: ImageErrorHandlerOptions = {}) {
  const { debug = false, showToast = false, onError, t } = options;
  
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const originalSrc = target.src;
    
    if (debug) {
      console.error('Image failed to load:', originalSrc);
    }
    
    // 如果已经是placeholder，不要再次设置以避免无限循环
    if (!target.src.includes('placeholder-image.svg')) {
      target.src = '/product_images/placeholder-image.svg';
      
      if (debug) {
        console.log('Fallback to placeholder for:', originalSrc);
      }
      
      // 显示错误提示
      if (showToast || onError) {
        // 使用翻译函数生成多语言错误消息
        const errorMessage = t 
          ? t('errors.images.load_failed', 'Image load failed')
          : 'Image load failed';
        
        if (onError) {
          onError(errorMessage);
        }
      }
    }
  };
}

// 向后兼容的简单版本
export function createSimpleImageErrorHandler(debug: boolean = false) {
  return createImageErrorHandler({ debug });
}

// 预加载图片函数，用于检测图片是否可用
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!src || src.includes('placeholder-image.svg')) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// 批量预加载图片并返回可用的图片列表
export async function preloadImages(images: string[]): Promise<string[]> {
  const results = await Promise.all(
    images.map(async (src) => {
      const isAvailable = await preloadImage(src);
      return isAvailable ? src : null;
    })
  );
  
  const validImages = results.filter((src): src is string => src !== null);
  
  // 如果没有可用图片，返回placeholder
  return validImages.length > 0 ? validImages : ['/product_images/placeholder-image.svg'];
}

// 智能获取分类图片路径的函数
export async function getCategoryImagePath(englishName: string): Promise<string> {
  // 定义可能的文件名变体
  const possibleNames = [
    englishName.toLowerCase(),
    englishName.toLowerCase().replace(/\s+/g, ''),
    englishName.toLowerCase().replace(/[^a-z0-9]/g, ''),
    // 添加一些常见的映射
    ...(englishName.toLowerCase() === 'abiti' ? ['dresses'] : []),
    ...(englishName.toLowerCase() === 'capispalla' ? ['outerwear'] : []),
    ...(englishName.toLowerCase() === 'pantaloni' ? ['bottoms'] : []),
    ...(englishName.toLowerCase() === 'top' ? ['tops'] : []),
  ];

  // 去重
  const uniqueNames = [...new Set(possibleNames)];

  // 尝试预加载每个可能的图片路径
  for (const name of uniqueNames) {
    const imagePath = `/product_images/categories/${name}.jpg`;
    try {
      const isAvailable = await preloadImage(imagePath);
      if (isAvailable) {
        return imagePath;
      }
    } catch (error) {
      // 继续尝试下一个
      continue;
    }
  }

  // 如果所有尝试都失败，返回placeholder
  return '/product_images/placeholder-image.svg';
}

// 创建分类图片错误处理函数
export function createCategoryImageErrorHandler(
  categoryName: string,
  options: {
    showToast?: boolean;
    onError?: (error: string) => void;
    debug?: boolean;
    t?: (key: string, fallback?: string) => string; // 添加翻译函数参数
  } = {}
) {
  const { showToast = false, onError, debug = false, t } = options;
  
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    
    if (debug) {
      console.error('Category image failed to load:', target.src, 'for category:', categoryName);
    }
    
    // 如果已经是placeholder，不要再次设置以避免无限循环
    if (!target.src.includes('placeholder-image.svg')) {
      target.src = '/product_images/placeholder-image.svg';
      
      if (debug) {
        console.log('Fallback to placeholder for category:', categoryName);
      }
      
      // 显示错误提示
      if (showToast || onError) {
        // 使用翻译函数生成多语言错误消息
        const errorMessage = t 
          ? t('errors.images.category_load_failed', `Failed to load image for category: ${categoryName}`)
          : `Failed to load image for category: ${categoryName}`;
        
        if (onError) {
          onError(errorMessage);
        }
      }
    }
  };
}