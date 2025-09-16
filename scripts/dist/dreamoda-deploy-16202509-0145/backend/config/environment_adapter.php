<?php
/**
 * 环境适配器 - 支持开发和生产环境自动切换
 * 基于您提供的Hostinger生产环境配置
 */

// 确保EnvLoader已加载
if (!class_exists('EnvLoader')) {
    require_once __DIR__ . '/env_loader.php';
    EnvLoader::load();
}

class EnvironmentAdapter {
    private $isProduction;
    private $config;

    public function __construct() {
        $this->isProduction = $this->detectProductionEnvironment();
        $this->loadConfig();
    }

    /**
     * 检测是否为生产环境
     * 基于您提供的配置逻辑
     */
    private function detectProductionEnvironment() {
        // 优先检查环境变量
        $app_env = EnvLoader::get('APP_ENV', 'development');
        if ($app_env === 'production') {
            return true;
        }

        // 自动检测 - 基于HTTP_HOST（与您提供的配置一致）
        if (isset($_SERVER['HTTP_HOST'])) {
            $host = $_SERVER['HTTP_HOST'];
            
            // 生产域名列表
            $production_domains = [
                'dreamoda.store',
                'www.dreamoda.store'
            ];
            
            // 检查是否为生产域名
            foreach ($production_domains as $domain) {
                if (strpos($host, $domain) !== false) {
                    return true;
                }
            }
            
            // 检查是否为非本地域名
            $local_hosts = ['localhost', '127.0.0.1', '::1'];
            if (!in_array($host, $local_hosts)) {
                // 如果不是本地域名，可能是生产环境
                return true;
            }
        }

        return false;
    }

    /**
     * 加载环境配置
     */
    private function loadConfig() {
        if ($this->isProduction) {
            // 生产环境配置 (Hostinger)
            $this->config = [
                'db' => [
                    'host' => EnvLoader::get('DB_HOST_PROD', 'localhost'),
                    'user' => EnvLoader::get('DB_USER_PROD', 'u705464511_gianni'),
                    'pass' => EnvLoader::get('DB_PASS_PROD', 'V2[qfN+;;5+2'),
                    'name' => EnvLoader::get('DB_NAME_PROD', 'u705464511_Dreamoda'),
                    'port' => EnvLoader::get('DB_PORT_PROD', '3306'),
                    'charset' => 'utf8mb4'
                ],
                'site' => [
                    'url' => EnvLoader::get('SITE_URL_PROD', 'https://dreamoda.store'),
                    'frontend_url' => EnvLoader::get('FRONTEND_URL_PROD', 'https://dreamoda.store'),
                    'api_base_url' => EnvLoader::get('API_BASE_URL_PROD', 'https://dreamoda.store/backend/api')
                ],
                'upload' => [
                    'dir' => EnvLoader::get('UPLOAD_DIR_PROD', 'storage/uploads'),
                    'allowed_exts' => ['jpg','jpeg','png','gif','webp'],
                    'max_size' => EnvLoader::get('UPLOAD_MAX_SIZE', '5242880')
                ],
                'error' => [
                    'reporting' => E_ALL,
                    'display' => false,  // Hostinger生产环境关闭错误显示
                    'log' => true,
                    'log_file' => __DIR__ . '/../../storage/logs/php_errors.log'
                ],
                'session' => [
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ],
                'cors' => [
                    'allowed_origins' => explode(',', EnvLoader::get('CORS_ALLOWED_ORIGINS_PROD', 'https://dreamoda.store,https://www.dreamoda.store')),
                    'allowed_methods' => 'GET,POST,PUT,DELETE,OPTIONS',
                    'allowed_headers' => 'Content-Type,Authorization,X-Requested-With'
                ]
            ];
        } else {
            // 开发环境配置 (本地 XAMPP)
            $this->config = [
                'db' => [
                    'host' => EnvLoader::get('DB_HOST', 'localhost'),
                    'user' => EnvLoader::get('DB_USER', 'root'),
                    'pass' => EnvLoader::get('DB_PASS', ''),
                    'name' => EnvLoader::get('DB_NAME', 'DreaModa'),
                    'port' => EnvLoader::get('DB_PORT', '3306'),
                    'charset' => 'utf8mb4'
                ],
                'site' => [
                    'url' => EnvLoader::get('SITE_URL', 'http://localhost'),
                    'frontend_url' => EnvLoader::get('FRONTEND_URL', 'http://localhost'),
                    'api_base_url' => EnvLoader::get('API_BASE_URL', 'http://localhost/backend/api')
                ],
                'upload' => [
                    'dir' => EnvLoader::get('UPLOAD_DIR', 'storage/uploads'),
                    'allowed_exts' => ['jpg','jpeg','png','gif','webp'],
                    'max_size' => EnvLoader::get('UPLOAD_MAX_SIZE', '5242880')
                ],
                'error' => [
                    'reporting' => E_ALL,
                    'display' => true,
                    'log' => true,
                    'log_file' => __DIR__ . '/../../storage/logs/php_errors.log'
                ],
                'session' => [
                    'secure' => false,
                    'httponly' => true,
                    'samesite' => 'Lax'
                ],
                'cors' => [
                    'allowed_origins' => explode(',', EnvLoader::get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')),
                    'allowed_methods' => 'GET,POST,PUT,DELETE,OPTIONS',
                    'allowed_headers' => 'Content-Type,Authorization,X-Requested-With'
                ]
            ];
        }
    }

    /**
     * 是否为生产环境
     */
    public function isProduction() {
        return $this->isProduction;
    }

    /**
     * 是否为开发环境
     */
    public function isDevelopment() {
        return !$this->isProduction;
    }

    /**
     * 获取数据库配置
     */
    public function getDatabaseConfig() {
        return $this->config['db'];
    }

    /**
     * 获取网站配置
     */
    public function getSiteConfig() {
        return $this->config['site'];
    }

    /**
     * 获取上传配置
     */
    public function getUploadConfig() {
        return [
            'upload_dir' => $this->config['upload']['dir'],
            'allowed_exts' => $this->config['upload']['allowed_exts'],
            'max_size' => $this->config['upload']['max_size'],
            'base_url' => $this->config['site']['url']
        ];
    }

    /**
     * 获取错误配置
     */
    public function getErrorConfig() {
        return $this->config['error'];
    }

    /**
     * 获取会话配置
     */
    public function getSessionConfig() {
        return $this->config['session'];
    }

    /**
     * 获取CORS配置
     */
    public function getCorsConfig() {
        return $this->config['cors'];
    }

    /**
     * 应用环境设置
     */
    public function applySettings() {
        // 错误报告设置
        $errorConfig = $this->getErrorConfig();
        error_reporting($errorConfig['reporting']);
        ini_set('display_errors', $errorConfig['display'] ? 1 : 0);
        ini_set('log_errors', $errorConfig['log'] ? 1 : 0);
        
        if ($errorConfig['log_file']) {
            ini_set('error_log', $errorConfig['log_file']);
        }

        // 会话设置 - 只在会话未启动时设置
        if (session_status() === PHP_SESSION_NONE) {
            $sessionConfig = $this->getSessionConfig();
            ini_set('session.cookie_httponly', $sessionConfig['httponly'] ? 1 : 0);
            ini_set('session.cookie_secure', $sessionConfig['secure'] ? 1 : 0);
            ini_set('session.cookie_samesite', $sessionConfig['samesite']);
        }

        // CORS设置
        $corsConfig = $this->getCorsConfig();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if ($this->isProduction()) {
            if (in_array($origin, $corsConfig['allowed_origins'])) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
        } else {
            // 开发环境允许localhost
            if (strpos($origin, 'localhost') !== false || 
                strpos($origin, '127.0.0.1') !== false || 
                in_array($origin, $corsConfig['allowed_origins'])) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
        }

        header('Access-Control-Allow-Methods: ' . $corsConfig['allowed_methods']);
        header('Access-Control-Allow-Headers: ' . $corsConfig['allowed_headers']);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // 处理OPTIONS预检请求
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    /**
     * 获取配置值
     */
    public function getConfig($key, $default = null) {
        $keys = explode('.', $key);
        $value = $this->config;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }
        
        return $value;
    }
}

/**
 * 获取环境适配器实例
 */
function getEnvironmentAdapter() {
    static $adapter = null;
    if ($adapter === null) {
        $adapter = new EnvironmentAdapter();
    }
    return $adapter;
}

/**
 * 应用环境设置
 */
function applyEnvironmentSettings() {
    $adapter = getEnvironmentAdapter();
    $adapter->applySettings();
}
