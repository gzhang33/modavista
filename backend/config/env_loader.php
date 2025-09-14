<?php
/**
 * 环境变量加载器
 * 用于加载和管理 .env 文件中的配置
 */

class EnvLoader {
    private static $loaded = false;
    private static $variables = [];

    /**
     * 加载 .env 文件
     */
    public static function load($envFile = null) {
        if (self::$loaded) {
            return;
        }

        if ($envFile === null) {
            // 从项目根目录查找 .env 文件
            $envFile = dirname(__DIR__, 2) . '/.env';
        }

        if (!file_exists($envFile)) {
            // 如果没有 .env 文件，使用默认值
            self::setDefaultValues();
            self::$loaded = true;
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            // 跳过注释行
            if (strpos($line, '#') === 0) {
                continue;
            }
            
            // 解析 KEY=VALUE 格式
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // 移除值两端的引号
                if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                    (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                    $value = substr($value, 1, -1);
                }
                
                self::$variables[$key] = $value;
                
                // 设置环境变量（如果尚未设置）
                if (!getenv($key)) {
                    putenv("$key=$value");
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }

        self::$loaded = true;
    }

    /**
     * 获取环境变量值
     */
    public static function get($key, $default = null) {
        self::load();
        
        $value = getenv($key);
        if ($value === false) {
            $value = self::$variables[$key] ?? $default;
        }
        
        return $value;
    }

    /**
     * 设置默认值（当 .env 文件不存在时）
     */
    private static function setDefaultValues() {
        $defaults = [
            'APP_ENV' => 'development',
            'APP_DEBUG' => 'true',
            'APP_URL' => 'http://localhost',
            'DB_HOST' => 'localhost',
            'DB_USER' => 'root',
            'DB_PASS' => '',
            'DB_NAME' => 'DreaModa',
            'DB_PORT' => '3306',
            'DB_CHARSET' => 'utf8mb4',
            'ADMIN_USERNAME' => 'admin',
            'ADMIN_PASSWORD_HASH' => '$2y$10$bqXiQg5/wn0zYQ3z/ToAhuBAMXhXK/7Iqmp9PkjXSBBOMeBZevYEy',
            'SITE_NAME' => 'DreaModa Fashion Collection',
            'SITE_URL' => 'https://dreamoda.store',
            'FRONTEND_URL' => 'https://dreamoda.store',
            'API_BASE_URL' => 'https://dreamoda.store/api',
            'UPLOAD_MAX_SIZE' => '5242880',
            'UPLOAD_ALLOWED_EXTS' => 'jpg,jpeg,png,gif,webp',
            'UPLOAD_DIR' => 'storage/uploads',
            'SMTP_HOST' => 'smtp.hostinger.com',
            'SMTP_PORT' => '587',
            'CONTACT_EMAIL' => 'Hi@DreaModa.store',
            'CACHE_TTL' => '3600',
            'LOG_LEVEL' => 'debug',
            'CORS_ALLOWED_ORIGINS' => 'https://dreamoda.store,http://localhost:5173',
            'CORS_ALLOWED_METHODS' => 'GET,POST,PUT,DELETE,OPTIONS',
            'CORS_ALLOWED_HEADERS' => 'Content-Type,Authorization,X-Requested-With'
        ];

        foreach ($defaults as $key => $value) {
            if (!getenv($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
                self::$variables[$key] = $value;
            }
        }
    }

    /**
     * 检查是否为生产环境
     */
    public static function isProduction() {
        // 优先检查环境变量
        $app_env = self::get('APP_ENV', 'development');
        if ($app_env === 'production') {
            return true;
        }
        
        // 自动检测生产环境 - 基于HTTP_HOST
        if (isset($_SERVER['HTTP_HOST'])) {
            $host = $_SERVER['HTTP_HOST'];
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
            if (!in_array($host, $local_hosts) && !preg_match('/^192\.168\./', $host) && !preg_match('/^10\./', $host)) {
                // 如果不是本地IP，可能是生产环境
                return true;
            }
        }
        
        return false;
    }

    /**
     * 检查是否启用调试模式
     */
    public static function isDebug() {
        return self::get('APP_DEBUG') === 'true';
    }

    /**
     * 获取所有环境变量
     */
    public static function all() {
        self::load();
        return self::$variables;
    }
}
?>
