<?php
/**
 * 多语言系统测试脚本
 * 测试混合模式（静态文件 + 数据库）的功能
 */

// 包含必要的文件
require_once 'api/config.php';
require_once 'api/utils.php';
require_once 'api/language.php';

echo "=== 多语言系统测试 ===\n\n";

// 1. 测试语言列表获取
echo "1. 测试语言列表获取\n";
$languages = get_available_languages();
echo "可用语言数量: " . count($languages) . "\n";
foreach ($languages as $lang) {
    echo "  - {$lang['language_code']}: {$lang['language_name_native']}\n";
}
echo "\n";

// 2. 测试缓存功能
echo "2. 测试缓存功能\n";
$cache_key = get_cache_key('test', 'en', 'sample_key');
echo "缓存键: $cache_key\n";

// 设置缓存
set_cache($cache_key, '测试缓存值', 300);
echo "设置缓存成功\n";

// 获取缓存
$cached_value = get_from_cache($cache_key);
echo "获取缓存值: " . ($cached_value ?: '无') . "\n";
echo "\n";

// 3. 测试翻译功能
echo "3. 测试翻译功能\n";
$test_keys = [
    'nav.home',
    'home.hero.title',
    'nonexistent.key',  // 测试不存在的键
    'footer.copyright'
];

foreach ($test_keys as $key) {
    $en_translation = get_translation($key, 'en');
    $zh_translation = get_translation($key, 'zh');

    echo "键: $key\n";
    echo "  英文: " . ($en_translation ?: '未找到') . "\n";
    echo "  中文: " . ($zh_translation ?: '未找到') . "\n";
    echo "\n";
}

// 4. 测试静态翻译文件
echo "4. 测试静态翻译文件\n";
$static_files = [
    'client/src/assets/locales/en.json',
    'client/src/assets/locales/zh.json'
];

foreach ($static_files as $file) {
    if (file_exists($file)) {
        $size = filesize($file);
        echo "文件 $file 存在，大小: {$size} 字节\n";

        // 读取并解析JSON
        $content = json_decode(file_get_contents($file), true);
        if ($content) {
            echo "  JSON格式正确\n";

            // 统计翻译键数量
            $key_count = count_flat_keys($content);
            echo "  翻译键数量: $key_count\n";
        } else {
            echo "  JSON格式错误\n";
        }
    } else {
        echo "文件 $file 不存在\n";
    }
}
echo "\n";

// 5. 测试缓存目录
echo "5. 测试缓存目录\n";
$cache_dir = __DIR__ . '/cache/translations/';
if (is_dir($cache_dir)) {
    echo "缓存目录存在: $cache_dir\n";
    $files = glob($cache_dir . '*.cache');
    echo "缓存文件数量: " . count($files) . "\n";

    foreach ($files as $file) {
        $basename = basename($file);
        $size = filesize($file);
        echo "  $basename: {$size} 字节\n";
    }
} else {
    echo "缓存目录不存在\n";
}
echo "\n";

// 6. 性能测试
echo "6. 性能测试\n";
$start_time = microtime(true);

for ($i = 0; $i < 100; $i++) {
    get_translation('home.hero.title', 'en');
    get_translation('nav.home', 'zh');
}

$end_time = microtime(true);
$duration = $end_time - $start_time;
echo "100次翻译查询耗时: " . number_format($duration, 4) . " 秒\n";
echo "平均每次查询耗时: " . number_format($duration / 100 * 1000, 2) . " 毫秒\n";
echo "\n";

// 辅助函数：计算嵌套数组中的键数量
function count_flat_keys($array, $prefix = '') {
    $count = 0;
    foreach ($array as $key => $value) {
        $full_key = $prefix ? $prefix . '.' . $key : $key;
        if (is_array($value)) {
            $count += count_flat_keys($value, $full_key);
        } else {
            $count++;
        }
    }
    return $count;
}

echo "=== 测试完成 ===\n";
?>
