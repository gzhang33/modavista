<?php
// 产品API端点 - endpoints/products.php
// 处理产品相关的API请求

global $pdo, $method, $pathSegments;

switch ($method) {
    case 'GET':
        if (isset($pathSegments[1]) && !empty($pathSegments[1])) {
            // 获取单个产品
            getProductById($pathSegments[1]);
        } else {
            // 获取产品列表
            getProducts();
        }
        break;
        
    case 'POST':
        // 创建新产品 (管理功能)
        createProduct();
        break;
        
    default:
        jsonResponse(false, null, '不支持的请求方法', 405);
        break;
}

function getProducts() {
    global $pdo;
    
    // 获取查询参数
    $page = intval($_GET['page'] ?? 1);
    $limit = intval($_GET['limit'] ?? 12);
    $category = $_GET['category'] ?? '';
    $fabric = $_GET['fabric'] ?? '';
    $season = $_GET['season'] ?? '';
    $style = $_GET['style'] ?? '';
    $search = $_GET['search'] ?? '';
    $featured = $_GET['featured'] ?? '';
    
    $offset = ($page - 1) * $limit;
    
    // 构建查询条件
    $whereConditions = ['1=1'];
    $params = [];
    
    if (!empty($category) && $category !== 'all') {
        $whereConditions[] = 'category = ?';
        $params[] = $category;
    }
    
    if (!empty($fabric) && $fabric !== 'all') {
        $whereConditions[] = 'fabric = ?';
        $params[] = $fabric;
    }
    
    if (!empty($season) && $season !== 'all') {
        $whereConditions[] = 'season = ?';
        $params[] = $season;
    }
    
    if (!empty($style) && $style !== 'all') {
        $whereConditions[] = 'style = ?';
        $params[] = $style;
    }
    
    if (!empty($search)) {
        $whereConditions[] = '(name LIKE ? OR description LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if (!empty($featured) && $featured === 'yes') {
        $whereConditions[] = 'featured = "yes"';
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    try {
        // 获取总数
        $countSql = "SELECT COUNT(*) FROM products WHERE $whereClause";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();
        
        // 获取产品数据
        $sql = "SELECT 
                    id,
                    name,
                    description,
                    category,
                    fabric,
                    style,
                    season,
                    care,
                    origin,
                    sku,
                    images,
                    specifications,
                    featured,
                    created_at as createdAt
                FROM products 
                WHERE $whereClause 
                ORDER BY created_at DESC 
                LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        // 处理images字段 (假设存储为JSON字符串)
        foreach ($products as &$product) {
            $product['images'] = json_decode($product['images'], true) ?: [];
            $product['specifications'] = json_decode($product['specifications'], true) ?: [];
            $product['defaultImage'] = $product['images'][0] ?? null;
        }
        
        $pages = ceil($total / $limit);
        
        $responseData = [
            'products' => $products,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => $pages
            ]
        ];
        
        jsonResponse(true, $responseData, '获取产品列表成功');
        
    } catch (PDOException $e) {
        error_log("获取产品列表失败: " . $e->getMessage());
        jsonResponse(false, null, '获取产品列表失败', 500);
    }
}

function getProductById($id) {
    global $pdo;
    
    try {
        $sql = "SELECT 
                    id,
                    name,
                    description,
                    category,
                    fabric,
                    style,
                    season,
                    care,
                    origin,
                    sku,
                    images,
                    specifications,
                    featured,
                    created_at as createdAt
                FROM products 
                WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            jsonResponse(false, null, '产品不存在', 404);
        }
        
        // 处理JSON字段
        $product['images'] = json_decode($product['images'], true) ?: [];
        $product['specifications'] = json_decode($product['specifications'], true) ?: [];
        $product['defaultImage'] = $product['images'][0] ?? null;
        
        // 获取相关产品 (同类别的其他产品)
        $relatedSql = "SELECT id, name, images, fabric, style 
                       FROM products 
                       WHERE category = ? AND id != ? 
                       LIMIT 4";
        $relatedStmt = $pdo->prepare($relatedSql);
        $relatedStmt->execute([$product['category'], $id]);
        $siblings = $relatedStmt->fetchAll();
        
        // 处理相关产品的images字段
        foreach ($siblings as &$sibling) {
            $sibling['images'] = json_decode($sibling['images'], true) ?: [];
            $sibling['defaultImage'] = $sibling['images'][0] ?? null;
        }
        
        $product['siblings'] = $siblings;
        
        jsonResponse(true, $product, '获取产品详情成功');
        
    } catch (PDOException $e) {
        error_log("获取产品详情失败: " . $e->getMessage());
        jsonResponse(false, null, '获取产品详情失败', 500);
    }
}

function createProduct() {
    global $pdo;
    
    // 获取POST数据
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 验证必需字段
    $requiredFields = ['name', 'description', 'category', 'fabric', 'style', 'season'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            jsonResponse(false, null, "缺少必需字段: $field", 400);
        }
    }
    
    try {
        $sql = "INSERT INTO products (
                    name, description, category, fabric, style, season,
                    care, origin, sku, images, specifications, featured,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['name'],
            $input['description'],
            $input['category'],
            $input['fabric'],
            $input['style'],
            $input['season'],
            $input['care'] ?? '',
            $input['origin'] ?? '',
            $input['sku'] ?? '',
            json_encode($input['images'] ?? []),
            json_encode($input['specifications'] ?? []),
            $input['featured'] ?? 'no'
        ]);
        
        $productId = $pdo->lastInsertId();
        
        jsonResponse(true, ['id' => $productId], '产品创建成功', 201);
        
    } catch (PDOException $e) {
        error_log("创建产品失败: " . $e->getMessage());
        jsonResponse(false, null, '创建产品失败', 500);
    }
}
?>