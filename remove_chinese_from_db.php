<?php
// 从数据库中删除中文语言记录和翻译

require_once 'api/config.php';
require_once 'api/utils.php';

try {
    $conn = get_db_connection();
    
    echo "=== 删除中文语言记录 ===\n";
    
    // 先删除所有相关的外键记录
    echo "删除相关外键记录...\n";
    
    // 删除category_i18n中的中文记录
    $result = $conn->query("DELETE FROM category_i18n WHERE locale = 'zh-CN'");
    echo "删除category_i18n中文记录: " . ($result ? '成功' : '失败') . "\n";
    
    // 删除color_i18n中的中文记录
    $result = $conn->query("DELETE FROM color_i18n WHERE locale = 'zh-CN'");
    echo "删除color_i18n中文记录: " . ($result ? '成功' : '失败') . "\n";
    
    // 删除material_i18n中的中文记录
    $result = $conn->query("DELETE FROM material_i18n WHERE locale = 'zh-CN'");
    echo "删除material_i18n中文记录: " . ($result ? '成功' : '失败') . "\n";
    
    // 删除site_content_translation中的中文记录
    $result = $conn->query("DELETE FROM site_content_translation WHERE language_code = 'zh-CN'");
    echo "删除site_content_translation中文记录: " . ($result ? '成功' : '失败') . "\n";
    
    // 最后删除中文语言记录
    $result = $conn->query("DELETE FROM locales WHERE code = 'zh-CN'");
    echo "删除中文语言记录: " . ($result ? '成功' : '失败') . "\n";
    
    // 更新默认语言为英文
    $result = $conn->query("UPDATE locales SET sort_order = 1 WHERE code = 'en-GB'");
    echo "设置英文为默认语言: " . ($result ? '成功' : '失败') . "\n";
    
    // 显示剩余语言
    $result = $conn->query("SELECT * FROM locales ORDER BY sort_order");
    echo "\n剩余语言:\n";
    while ($row = $result->fetch_assoc()) {
        echo json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
    }
    
    // 清空翻译缓存
    require_once 'api/language.php';
    clear_cache();
    echo "\n清空翻译缓存: 成功\n";
    
    echo "\n=== 操作完成 ===\n";
    
} catch (Exception $e) {
    echo '错误: ' . $e->getMessage() . "\n";
}
?>
