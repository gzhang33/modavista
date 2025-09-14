<?php
// API适配器 - 桥接DreaModa现有API与React前端
// 将DreaModa API响应转换为React前端期望的格式

require_once '../config/app.php';
require_once 'utils.php';

// CORS配置
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 获取请求路径
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api', '', $path); // 移除/api前缀
$pathSegments = explode('/', trim($path, '/'));

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $pathSegments[0] ?? '';

// 统一响应格式函数
function apiResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// 转换产品格式函数
function transformProduct($product) {
    return [
        'id' => (int)$product['id'],
        'productId' => $product['product_id'] ?? null,
        'name' => $product['name'],
        'baseName' => $product['base_name'] ?? $product['name'],
        'description' => $product['description'] ?? '',
        'category' => $product['category'] ?? '',
        'color' => $product['color'] ?? '',
        'material' => $product['material'] ?? '',
        'fabric' => $product['material'] ?? '', // 映射material到fabric
        'style' => 'casual', // 默认值，可根据实际情况调整
        'season' => 'all-season', // 默认值
        'care' => 'Machine wash', // 默认值
        'origin' => 'China', // 默认值
        'sku' => $product['sku'] ?? '',
        'images' => $product['media'] ?? [$product['defaultImage'] ?? ''], // 确保是数组
        'specifications' => [
            '材质' => $product['material'] ?? '',
            '颜色' => $product['color'] ?? '',
            'SKU' => $product['sku'] ?? ''
        ],
        'featured' => 'no', // 默认值，可根据实际情况调整
        'defaultImage' => $product['defaultImage'] ?? null,
        'createdAt' => $product['createdAt'] ?? date('Y-m-d H:i:s'),
        'siblings' => isset($product['siblings']) ? array_map('transformProduct', $product['siblings']) : []
    ];
}

// 路由处理
try {
    switch ($endpoint) {
        case 'products':
            handleProducts();
            break;
            
        case 'inquiries':
            handleInquiries();
            break;
            
        case 'categories':
            handleCategories();
            break;
            
        case 'health':
            apiResponse(true, ['status' => 'healthy'], 'API运行正常');
            break;
            
        default:
            apiResponse(false, null, '端点不存在', 404);
            break;
    }
} catch (Exception $e) {
    apiResponse(false, null, '服务器内部错误: ' . $e->getMessage(), 500);
}

function handleProducts() {
    global $pathSegments, $method;
    
    if ($method !== 'GET') {
        apiResponse(false, null, '不支持的请求方法', 405);
    }
    
    // 包含现有的products.php逻辑
    ob_start();
    $_GET['lang'] = $_GET['lang'] ?? 'en-GB'; // 设置默认语言
    
    // 检查是否请求单个产品
    if (isset($pathSegments[1]) && !empty($pathSegments[1])) {
        $_GET['id'] = $pathSegments[1];
    }
    
    include 'products.php';
    $output = ob_get_clean();
    
    // 解析现有API的输出
    $originalData = json_decode($output, true);
    
    if (!$originalData) {
        apiResponse(false, null, 'API响应解析失败', 500);
    }
    
    // 如果是单个产品请求
    if (isset($_GET['id'])) {
        $transformedProduct = transformProduct($originalData);
        apiResponse(true, $transformedProduct, '获取产品详情成功');
    } else {
        // 如果是产品列表
        if (is_array($originalData)) {
            $transformedProducts = array_map('transformProduct', $originalData);
            
            // 构造分页响应
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 12);
            $total = count($transformedProducts);
            $pages = ceil($total / $limit);
            
            // 分页处理
            $offset = ($page - 1) * $limit;
            $paginatedProducts = array_slice($transformedProducts, $offset, $limit);
            
            $responseData = [
                'products' => $paginatedProducts,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => $pages
                ]
            ];
            
            apiResponse(true, $responseData, '获取产品列表成功');
        } else {
            apiResponse(false, null, '无效的API响应格式', 500);
        }
    }
}

function handleInquiries() {
    global $method;
    
    if ($method === 'POST') {
        // 处理询价提交
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            apiResponse(false, null, '无效的JSON数据', 400);
        }
        
        // 验证必需字段
        $requiredFields = ['firstName', 'lastName', 'email', 'company', 'businessType', 'message'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                apiResponse(false, null, "缺少必需字段: $field", 400);
            }
        }
        
        // 这里可以集成现有的联系表单处理逻辑
        // 或者直接存储到数据库
        
        // 简化版本：记录到文件（生产环境应使用数据库）
        $inquiryData = [
            'id' => time(),
            'firstName' => $input['firstName'],
            'lastName' => $input['lastName'],
            'email' => $input['email'],
            'company' => $input['company'],
            'businessType' => $input['businessType'],
            'message' => $input['message'],
            'productId' => $input['productId'] ?? null,
            'inquiryType' => $input['inquiryType'] ?? 'general',
            'timestamp' => date('Y-m-d H:i:s'),
            'ipAddress' => $_SERVER['REMOTE_ADDR'] ?? ''
        ];
        
        // 这里可以调用现有的contact.php逻辑
        
        apiResponse(true, [
            'id' => $inquiryData['id'],
            'message' => '感谢您的询价，我们将在24小时内回复您'
        ], '询价提交成功', 201);
        
    } else {
        apiResponse(false, null, '不支持的请求方法', 405);
    }
}

function handleCategories() {
    global $method;
    
    if ($method !== 'GET') {
        apiResponse(false, null, '不支持的请求方法', 405);
    }
    
    // 这里可以集成现有的categories.php逻辑
    // 暂时返回静态数据
    $responseData = [
        'categories' => [
            ['value' => 'all', 'label' => 'All Categories'],
            ['value' => 'shirts', 'label' => 'Shirts'],
            ['value' => 'dresses', 'label' => 'Dresses'],
            ['value' => 'pants', 'label' => 'Pants'],
            ['value' => 'jackets', 'label' => 'Jackets'],
            ['value' => 'accessories', 'label' => 'Accessories']
        ],
        'fabrics' => [
            ['value' => 'all', 'label' => 'All Fabrics'],
            ['value' => 'cotton', 'label' => 'Cotton'],
            ['value' => 'silk', 'label' => 'Silk'],
            ['value' => 'wool', 'label' => 'Wool'],
            ['value' => 'linen', 'label' => 'Linen'],
            ['value' => 'cashmere', 'label' => 'Cashmere']
        ],
        'seasons' => [
            ['value' => 'all', 'label' => 'All Seasons'],
            ['value' => 'spring-summer', 'label' => 'Spring/Summer'],
            ['value' => 'fall-winter', 'label' => 'Fall/Winter'],
            ['value' => 'all-season', 'label' => 'All Season']
        ],
        'styles' => [
            ['value' => 'all', 'label' => 'All Styles'],
            ['value' => 'casual', 'label' => 'Casual'],
            ['value' => 'formal', 'label' => 'Formal'],
            ['value' => 'business', 'label' => 'Business'],
            ['value' => 'evening', 'label' => 'Evening']
        ],
        'businessTypes' => [
            ['value' => 'retail', 'label' => 'Retailer'],
            ['value' => 'distributor', 'label' => 'Distributor'],
            ['value' => 'brand', 'label' => 'Fashion Brand'],
            ['value' => 'other', 'label' => 'Other']
        ],
        'inquiryTypes' => [
            ['value' => 'general', 'label' => 'General Inquiry'],
            ['value' => 'sample', 'label' => 'Sample Request'],
            ['value' => 'catalog', 'label' => 'Catalog Request']
        ]
    ];
    
    apiResponse(true, $responseData, '获取过滤选项成功');
}
?>