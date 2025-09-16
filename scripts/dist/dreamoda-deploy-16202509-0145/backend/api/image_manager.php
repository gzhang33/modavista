<?php
// api/image_manager.php - 图片管理工具类

require_once '../config/app.php';

class ImageManager {
    private $baseDir;
    private $baseUrl;
    
    public function __construct() {
        $this->baseDir = IMAGES_BASE_DIR;
        $this->baseUrl = IMAGES_BASE_URL;
    }
    
    /**
     * 获取图片完整URL
     */
    public function getImageUrl($path, $type = 'products') {
        if (empty($path)) {
            return $this->getPlaceholderUrl();
        }
        
        // 如果已经是完整URL，直接返回
        if (strpos($path, 'http') === 0) {
            return $path;
        }
        
        // 如果是相对路径，添加基础URL
        if (strpos($path, '/') !== 0) {
            $typeUrl = constant('IMAGES_' . strtoupper($type) . '_URL');
            return $typeUrl . $path;
        }
        
        return $path;
    }
    
    /**
     * 获取占位图片URL
     */
    public function getPlaceholderUrl() {
        return $this->baseUrl . 'placeholder.svg';
    }
    
    /**
     * 保存上传的图片
     */
    public function saveUploadedImage($file, $type = 'products') {
        $uploadDir = constant('IMAGES_' . strtoupper($type) . '_DIR');
        
        // 确保目录存在
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // 生成唯一文件名
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = 'media-' . uniqid() . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
        $targetPath = $uploadDir . $filename;
        
        // 移动文件
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $this->getImageUrl($filename, $type);
        }
        
        return false;
    }
    
    /**
     * 删除图片文件
     */
    public function deleteImage($path) {
        $fullPath = $this->baseDir . ltrim($path, '/');
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return true; // 文件不存在也算删除成功
    }
    
    /**
     * 获取图片信息
     */
    public function getImageInfo($path) {
        $fullPath = $this->baseDir . ltrim($path, '/');
        if (!file_exists($fullPath)) {
            return null;
        }
        
        $info = getimagesize($fullPath);
        if (!$info) {
            return null;
        }
        
        return [
            'width' => $info[0],
            'height' => $info[1],
            'type' => $info[2],
            'mime' => $info['mime'],
            'size' => filesize($fullPath),
            'url' => $this->getImageUrl($path)
        ];
    }
    
    /**
     * 批量处理图片路径
     */
    public function processImagePaths($images, $type = 'products') {
        if (is_string($images)) {
            return $this->getImageUrl($images, $type);
        }
        
        if (is_array($images)) {
            return array_map(function($image) use ($type) {
                return $this->getImageUrl($image, $type);
            }, $images);
        }
        
        return $images;
    }
}

// 全局函数
function get_image_url($path, $type = 'products') {
    static $manager = null;
    if ($manager === null) {
        $manager = new ImageManager();
    }
    return $manager->getImageUrl($path, $type);
}

function save_uploaded_image($file, $type = 'products') {
    static $manager = null;
    if ($manager === null) {
        $manager = new ImageManager();
    }
    return $manager->saveUploadedImage($file, $type);
}
?>
