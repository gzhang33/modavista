<?php
/**
 * 环境适配器 - 统一管理开发和生产环境差异
 */

class EnvironmentAdapter {
    private static $instance = null;
    private $environment;
    private $config;

    private function __construct() {
        $this->environment = $this->detectEnvironment();
        $this->config = $this->loadEnvironmentConfig();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * 检测当前环境
     */
    private function detectEnvironment() {
        // 优先从环境变量获取
        $env = EnvLoader::get('APP_ENV');
        if ($env) {
            return $env;
        }

        // 从HTTP_HOST判断
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if (in_array($host, ['localhost', '127.0.0.1', '::1']) || 
            strpos($host, 'localhost') !== false || 
            strpos($host, '127.0.0.1') !== false) {
            return 'development';
        }

        return 'production';
    }

    /**
     * 加载环境配置
     */
    private function loadEnvironmentConfig() {
        $config = [
            'development' => [
                'debug' => true,
                'error_reporting' => E_ALL,
                'display_errors' => true,
                'log_errors' => true,
                'session_secure' => false,
                'cors_allow_localhost' => true,
                'cache_enabled' => false,
                'log_level' => 'debug'
            ],
            'production' => [
                'debug' => false,
                'error_reporting' => 0,
                'display_errors' => false,
                'log_errors' => true,
                'session_secure' => true,
                'cors_allow_localhost' => false,
                'cache_enabled' => true,
                'log_level' => 'error'
            ]
        ];

        return $config[$this->environment] ?? $config['production'];
    }

    /**
     * 获取当前环境
     */
    public function getEnvironment() {
        return $this->environment;
    }

    /**
     * 是否为开发环境
     */
    public function isDevelopment() {
        return $this->environment === 'development';
    }

    /**
     * 是否为生产环境
     */
    public function isProduction() {
        return $this->environment === 'production';
    }

    /**
     * 获取配置值
     */
    public function getConfig($key, $default = null) {
        return $this->config[$key] ?? $default;
    }

    /**
     * 应用环境配置
     */
    public function applyEnvironmentSettings() {
        // 错误报告配置
        if ($this->getConfig('error_reporting') !== null) {
            error_reporting($this->getConfig('error_reporting'));
        }
        
        if ($this->getConfig('display_errors') !== null) {
            ini_set('display_errors', $this->getConfig('display_errors') ? '1' : '0');
        }
        
        if ($this->getConfig('log_errors') !== null) {
            ini_set('log_errors', $this->getConfig('log_errors') ? '1' : '0');
        }

        // 会话安全配置
        if ($this->getConfig('session_secure') !== null) {
            ini_set('session.cookie_secure', $this->getConfig('session_secure') ? '1' : '0');
        }

        // 设置时区
        date_default_timezone_set('Europe/Rome');
    }

    /**
     * 获取数据库配置
     */
    public function getDatabaseConfig() {
        $env = $this->environment;
        
        if ($env === 'development') {
            return [
                'host' => EnvLoader::get('DB_HOST', 'localhost'),
                'user' => EnvLoader::get('DB_USER', 'root'),
                'pass' => EnvLoader::get('DB_PASS', ''),
                'name' => EnvLoader::get('DB_NAME', 'DreaModa'),
                'port' => EnvLoader::get('DB_PORT', '3306'),
                'charset' => EnvLoader::get('DB_CHARSET', 'utf8mb4')
            ];
        } else {
            // 生产环境配置
            return [
                'host' => EnvLoader::get('DB_HOST', 'localhost'),
                'user' => EnvLoader::get('DB_USER'),
                'pass' => EnvLoader::get('DB_PASS'),
                'name' => EnvLoader::get('DB_NAME'),
                'port' => EnvLoader::get('DB_PORT', '3306'),
                'charset' => EnvLoader::get('DB_CHARSET', 'utf8mb4')
            ];
        }
    }

    /**
     * 获取上传配置
     */
    public function getUploadConfig() {
        return [
            'max_size' => EnvLoader::get('UPLOAD_MAX_SIZE', '5242880'),
            'allowed_exts' => explode(',', EnvLoader::get('UPLOAD_ALLOWED_EXTS', 'jpg,jpeg,png,gif,webp')),
            'upload_dir' => EnvLoader::get('UPLOAD_DIR', 'storage/uploads'),
            'base_url' => EnvLoader::get('SITE_URL', 'http://localhost')
        ];
    }

    /**
     * 获取CORS配置
     */
    public function getCorsConfig() {
        $origins = explode(',', EnvLoader::get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173'));
        
        // 开发环境自动添加localhost
        if ($this->isDevelopment() && $this->getConfig('cors_allow_localhost')) {
            $origins = array_merge($origins, [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ]);
            $origins = array_unique($origins);
        }

        return [
            'allowed_origins' => $origins,
            'allowed_methods' => EnvLoader::get('CORS_ALLOWED_METHODS', 'GET,POST,PUT,DELETE,OPTIONS'),
            'allowed_headers' => EnvLoader::get('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With')
        ];
    }

    /**
     * 获取缓存配置
     */
    public function getCacheConfig() {
        return [
            'enabled' => $this->getConfig('cache_enabled', false),
            'ttl' => EnvLoader::get('CACHE_TTL', '3600'),
            'driver' => EnvLoader::get('CACHE_DRIVER', 'file')
        ];
    }

    /**
     * 获取日志配置
     */
    public function getLogConfig() {
        return [
            'level' => $this->getConfig('log_level', 'debug'),
            'file' => EnvLoader::get('LOG_FILE', 'storage/logs/app.log'),
            'enabled' => true
        ];
    }

    /**
     * 处理CORS请求（环境感知）
     */
    public function handleCors() {
        $corsConfig = $this->getCorsConfig();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // 检查允许的来源
        if (in_array($origin, $corsConfig['allowed_origins'])) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } elseif ($this->isDevelopment() && 
                  (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
            header('Access-Control-Allow-Origin: ' . $origin);
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
     * 获取环境信息（用于调试）
     */
    public function getEnvironmentInfo() {
        return [
            'environment' => $this->environment,
            'config' => $this->config,
            'database' => $this->getDatabaseConfig(),
            'upload' => $this->getUploadConfig(),
            'cors' => $this->getCorsConfig(),
            'cache' => $this->getCacheConfig(),
            'log' => $this->getLogConfig()
        ];
    }
}

// 全局函数：获取环境适配器实例
function getEnvironment() {
    return EnvironmentAdapter::getInstance();
}

// 全局函数：检查环境
function isDevelopment() {
    return getEnvironment()->isDevelopment();
}

function isProduction() {
    return getEnvironment()->isProduction();
}

// 全局函数：应用环境设置
function applyEnvironmentSettings() {
    getEnvironment()->applyEnvironmentSettings();
}
?>
