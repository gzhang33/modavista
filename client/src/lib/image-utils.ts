// 产品图片处理工具函数 - 修复版本
// 统一处理产品图片路径和fallback逻辑

export interface ImageProcessingOptions {
  enableFallback?: boolean;
  debug?: boolean;
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
    return '/placeholder-image.svg';
  }
  
  // 如果已经是完整的HTTP URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (debug) console.log('Using HTTP URL:', imagePath);
    return imagePath;
  }
  
  // 如果是placeholder，直接返回
  if (imagePath.includes('placeholder')) {
    return '/placeholder-image.svg';
  }
  
  // 处理API返回的相对路径，API返回格式：images/media-xxx.jpg
  let finalPath = imagePath;
  
  // 如果以images/开头，移除这个前缀并添加代理前缀
  if (finalPath.startsWith('images/')) {
    finalPath = `/product-images/${finalPath.substring(7)}`; // 移除'images/'并添加代理前缀
  } 
  // 如果以/images/开头
  else if (finalPath.startsWith('/images/')) {
    finalPath = `/product-images/${finalPath.substring(8)}`; // 移除'/images/'并添加代理前缀
  }
  // 如果包含反斜杠（来自数据库的转义字符），替换为正斜杠
  else if (finalPath.includes('\\')) {
    finalPath = finalPath.replace(/\\/g, '/');
    // 再次检查是否以images/开头
    if (finalPath.startsWith('images/')) {
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
    return ['/placeholder-image.svg'];
  }
  
  const processedImages = images
    .filter(img => img != null && img.trim() !== '') // 过滤掉空值
    .map(img => processImagePath(img, options))
    .filter(img => img !== '/placeholder-image.svg'); // 先过滤掉placeholder
  
  // 如果没有有效图片，返回placeholder
  if (processedImages.length === 0) {
    if (debug) console.log('No valid images after processing, using placeholder');
    return ['/placeholder-image.svg'];
  }
  
  if (debug) {
    console.log('Processed image array:', processedImages);
  }
  
  return processedImages;
}

// 为img标签创建错误处理函数
export function createImageErrorHandler(debug: boolean = false) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const originalSrc = target.src;
    
    if (debug) {
      console.error('Image failed to load:', originalSrc);
    }
    
    // 如果已经是placeholder，不要再次设置以避免无限循环
    if (!target.src.includes('placeholder-image.svg')) {
      target.src = '/placeholder-image.svg';
      
      if (debug) {
        console.log('Fallback to placeholder for:', originalSrc);
      }
    }
  };
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
  return validImages.length > 0 ? validImages : ['/placeholder-image.svg'];
}