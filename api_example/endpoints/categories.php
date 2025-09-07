<?php
// 分类API端点 - endpoints/categories.php
// 处理分类、材质、季节等过滤选项的API请求

global $pdo, $method;

switch ($method) {
    case 'GET':
        getFilterOptions();
        break;
        
    default:
        jsonResponse(false, null, '不支持的请求方法', 405);
        break;
}

function getFilterOptions() {
    global $pdo;
    
    try {
        // 获取所有唯一的分类选项
        $categorySql = "SELECT DISTINCT category as value, category as label 
                       FROM products 
                       WHERE category IS NOT NULL AND category != '' 
                       ORDER BY category";
        $categoryStmt = $pdo->prepare($categorySql);
        $categoryStmt->execute();
        $categories = $categoryStmt->fetchAll();
        
        // 获取所有唯一的材质选项
        $fabricSql = "SELECT DISTINCT fabric as value, fabric as label 
                     FROM products 
                     WHERE fabric IS NOT NULL AND fabric != '' 
                     ORDER BY fabric";
        $fabricStmt = $pdo->prepare($fabricSql);
        $fabricStmt->execute();
        $fabrics = $fabricStmt->fetchAll();
        
        // 获取所有唯一的季节选项
        $seasonSql = "SELECT DISTINCT season as value, season as label 
                     FROM products 
                     WHERE season IS NOT NULL AND season != '' 
                     ORDER BY season";
        $seasonStmt = $pdo->prepare($seasonSql);
        $seasonStmt->execute();
        $seasons = $seasonStmt->fetchAll();
        
        // 获取所有唯一的风格选项
        $styleSql = "SELECT DISTINCT style as value, style as label 
                    FROM products 
                    WHERE style IS NOT NULL AND style != '' 
                    ORDER BY style";
        $styleStmt = $pdo->prepare($styleSql);
        $styleStmt->execute();
        $styles = $styleStmt->fetchAll();
        
        // 添加"全部"选项
        array_unshift($categories, ['value' => 'all', 'label' => 'All Categories']);
        array_unshift($fabrics, ['value' => 'all', 'label' => 'All Fabrics']);
        array_unshift($seasons, ['value' => 'all', 'label' => 'All Seasons']);
        array_unshift($styles, ['value' => 'all', 'label' => 'All Styles']);
        
        // 获取产品统计信息
        $statsSql = "SELECT 
                        COUNT(*) as total_products,
                        COUNT(CASE WHEN featured = 'yes' THEN 1 END) as featured_products,
                        COUNT(DISTINCT category) as total_categories
                     FROM products";
        $statsStmt = $pdo->prepare($statsSql);
        $statsStmt->execute();
        $stats = $statsStmt->fetch();
        
        $responseData = [
            'categories' => $categories,
            'fabrics' => $fabrics,
            'seasons' => $seasons,
            'styles' => $styles,
            'stats' => $stats,
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
        
        jsonResponse(true, $responseData, '获取过滤选项成功');
        
    } catch (PDOException $e) {
        error_log("获取过滤选项失败: " . $e->getMessage());
        jsonResponse(false, null, '获取过滤选项失败', 500);
    }
}
?>