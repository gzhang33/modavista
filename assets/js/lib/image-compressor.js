// 智能图片压缩工具类 - 专为InfinityFree优化
class ImageCompressor {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB 最大文件大小
    this.targetFileSize = 2 * 1024 * 1024; // 2MB 目标文件大小
    this.maxWidth = 1920; // 最大宽度
    this.maxHeight = 1080; // 最大高度
    this.quality = 0.85; // 默认质量
    this.progressCallback = null;
  }

  // 设置进度回调
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // 更新进度
  updateProgress(percent, message) {
    if (this.progressCallback) {
      this.progressCallback(percent, message);
    }
  }

  // 主压缩方法
  async compressImage(file, options = {}) {
    try {
      this.updateProgress(10, '开始压缩图片...');
      
      const config = {
        maxWidth: options.maxWidth || this.maxWidth,
        maxHeight: options.maxHeight || this.maxHeight,
        quality: options.quality || this.quality,
        targetSize: options.targetSize || this.targetFileSize
      };

      // 检查文件类型
      if (!this.isValidImageType(file.type)) {
        throw new Error('不支持的图片格式。请使用 JPG, PNG, WebP 格式。');
      }

      this.updateProgress(20, '读取图片数据...');

      // 如果文件已经小于目标大小且尺寸合适，直接返回
      if (file.size <= config.targetSize) {
        const dimensions = await this.getImageDimensions(file);
        if (dimensions.width <= config.maxWidth && dimensions.height <= config.maxHeight) {
          this.updateProgress(100, '图片无需压缩');
          return {
            file: file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 1,
            dimensions: dimensions
          };
        }
      }

      this.updateProgress(30, '创建画布...');
      
      // 创建画布并压缩
      const compressedBlob = await this.processImage(file, config);
      
      this.updateProgress(90, '生成压缩文件...');
      
      // 创建新的File对象
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now()
      });

      const compressionRatio = compressedFile.size / file.size;
      
      this.updateProgress(100, '压缩完成');
      
      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: compressionRatio,
        dimensions: await this.getImageDimensions(compressedFile)
      };

    } catch (error) {
      throw new Error(`图片压缩失败: ${error.message}`);
    }
  }

  // 处理图片的核心方法
  async processImage(file, config) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          this.updateProgress(40, '计算最佳尺寸...');
          
          // 计算新尺寸
          const { width, height } = this.calculateOptimalSize(
            img.width, 
            img.height, 
            config.maxWidth, 
            config.maxHeight
          );

          this.updateProgress(50, '创建画布...');
          
          // 创建高质量画布
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = width;
          canvas.height = height;

          // 启用图像平滑以保持清晰度
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          this.updateProgress(60, '绘制图片...');
          
          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height);

          this.updateProgress(70, '开始压缩...');
          
          // 智能质量调整
          this.compressWithAdaptiveQuality(canvas, config, resolve);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 自适应质量压缩
  compressWithAdaptiveQuality(canvas, config, resolve) {
    let quality = config.quality;
    let attempts = 0;
    const maxAttempts = 5;

    const tryCompress = () => {
      this.updateProgress(70 + (attempts * 4), `尝试压缩 (质量: ${Math.round(quality * 100)}%)...`);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(canvas.toDataURL('image/jpeg', quality));
          return;
        }

        // 如果文件大小合适或已达到最大尝试次数，返回结果
        if (blob.size <= config.targetSize || attempts >= maxAttempts || quality <= 0.3) {
          resolve(blob);
          return;
        }

        // 如果文件太大，降低质量后重试
        if (blob.size > config.targetSize) {
          attempts++;
          quality = Math.max(0.3, quality - 0.1);
          setTimeout(tryCompress, 10); // 短暂延迟避免UI阻塞
        } else {
          resolve(blob);
        }
      }, 'image/jpeg', quality);
    };

    tryCompress();
  }

  // 计算最佳尺寸
  calculateOptimalSize(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // 如果图片尺寸在限制范围内，保持原尺寸
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // 计算缩放比例
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  // 获取图片尺寸
  getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => reject(new Error('无法获取图片尺寸'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 检查图片类型
  isValidImageType(mimeType) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(mimeType);
  }

  // 批量压缩多个图片
  async compressMultiple(files, options = {}) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      try {
        this.updateProgress(0, `处理图片 ${i + 1}/${total}...`);
        const result = await this.compressImage(files[i], options);
        results.push({
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          originalFile: files[i]
        });
      }
    }

    return results;
  }

  // 格式化文件大小
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 获取压缩统计信息
  static getCompressionStats(results) {
    const successful = results.filter(r => r.success);
    const totalOriginalSize = successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = successful.reduce((sum, r) => sum + r.compressedSize, 0);
    const averageCompression = totalOriginalSize > 0 ? totalCompressedSize / totalOriginalSize : 1;

    return {
      totalFiles: results.length,
      successfulCompressions: successful.length,
      failedCompressions: results.length - successful.length,
      totalOriginalSize,
      totalCompressedSize,
      totalSizeSaved: totalOriginalSize - totalCompressedSize,
      averageCompressionRatio: averageCompression,
      percentageSaved: Math.round((1 - averageCompression) * 100)
    };
  }
}

// 全局实例
window.ImageCompressor = ImageCompressor; 