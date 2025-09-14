<?php
/**
 * 生成多语言sitemap.xml
 * 支持所有语言版本的页面索引
 */

require_once '../backend/api/config.php';
require_once '../backend/api/utils.php';

// 网站基础URL
$baseUrl = 'https://your-domain.com'; // 请替换为实际域名

// 支持的语言配置
$languages = [
    ['code' => 'en', 'locale' => 'en-GB', 'default' => true],
    ['code' => 'fr', 'locale' => 'fr-FR', 'default' => false],
    ['code' => 'de', 'locale' => 'de-DE', 'default' => false],
    ['code' => 'it', 'locale' => 'it-IT', 'default' => false],
    ['code' => 'es', 'locale' => 'es-ES', 'default' => false]
];

// 页面路由配置
$routes = [
    ['path' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
    ['path' => '/products', 'priority' => '0.8', 'changefreq' => 'daily']
];

// 生成sitemap XML
function generateSitemap($baseUrl, $languages, $routes) {
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
    $xml .= '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
    $xml .= '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9' . "\n";
    $xml .= '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"' . "\n";
    $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
    $xml .= "\n";

    foreach ($routes as $route) {
        $xml .= generateUrlEntry($baseUrl, $route, $languages);
    }

    // 添加产品页面（如果有产品数据）
    $xml .= generateProductEntries($baseUrl, $languages);

    $xml .= '</urlset>' . "\n";
    return $xml;
}

// 生成单个URL条目（包含多语言版本）
function generateUrlEntry($baseUrl, $route, $languages) {
    $xml = '';

    foreach ($languages as $lang) {
        if ($lang['default']) {
            // 默认语言版本（无语言前缀）
            $url = $baseUrl . $route['path'];
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$url}</loc>\n";
            $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
            $xml .= "    <changefreq>{$route['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$route['priority']}</priority>\n";

            // 添加多语言链接
            foreach ($languages as $altLang) {
                if (!$altLang['default']) {
                    $altUrl = $baseUrl . '/' . $altLang['code'] . $route['path'];
                    $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLang['locale']}\" href=\"{$altUrl}\"/>\n";
                }
            }

            $xml .= "  </url>\n";
        } else {
            // 非默认语言版本（有语言前缀）
            $url = $baseUrl . '/' . $lang['code'] . $route['path'];
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$url}</loc>\n";
            $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
            $xml .= "    <changefreq>{$route['changefreq']}</changefreq>\n";
            $xml .= "    <priority>" . ($route['priority'] - 0.1) . "</priority>\n";

            // 添加多语言链接
            foreach ($languages as $altLang) {
                if ($altLang['default']) {
                    $altUrl = $baseUrl . $route['path'];
                } else {
                    $altUrl = $baseUrl . '/' . $altLang['code'] . $route['path'];
                }
                $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLang['locale']}\" href=\"{$altUrl}\"/>\n";
            }

            $xml .= "  </url>\n";
        }
    }

    return $xml;
}

// 生成产品页面条目
function generateProductEntries($baseUrl, $languages) {
    $xml = '';

    try {
        $conn = get_db_connection();

        // 获取所有已发布的产品
        $stmt = $conn->prepare("SELECT id FROM product WHERE status = 'published'");
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $productId = $row['id'];

            foreach ($languages as $lang) {
                if ($lang['default']) {
                    // 默认语言版本
                    $url = $baseUrl . "/product/{$productId}";
                    $xml .= "  <url>\n";
                    $xml .= "    <loc>{$url}</loc>\n";
                    $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
                    $xml .= "    <changefreq>weekly</changefreq>\n";
                    $xml .= "    <priority>0.6</priority>\n";

                    // 添加多语言链接
                    foreach ($languages as $altLang) {
                        if (!$altLang['default']) {
                            $altUrl = $baseUrl . '/' . $altLang['code'] . "/product/{$productId}";
                            $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLang['locale']}\" href=\"{$altUrl}\"/>\n";
                        }
                    }

                    $xml .= "  </url>\n";
                } else {
                    // 非默认语言版本
                    $url = $baseUrl . '/' . $lang['code'] . "/product/{$productId}";
                    $xml .= "  <url>\n";
                    $xml .= "    <loc>{$url}</loc>\n";
                    $xml .= "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
                    $xml .= "    <changefreq>weekly</changefreq>\n";
                    $xml .= "    <priority>0.5</priority>\n";

                    // 添加多语言链接
                    foreach ($languages as $altLang) {
                        if ($altLang['default']) {
                            $altUrl = $baseUrl . "/product/{$productId}";
                        } else {
                            $altUrl = $baseUrl . '/' . $altLang['code'] . "/product/{$productId}";
                        }
                        $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"{$altLang['locale']}\" href=\"{$altUrl}\"/>\n";
                    }

                    $xml .= "  </url>\n";
                }
            }
        }

        $stmt->close();
        $conn->close();

    } catch (Exception $e) {
        // 如果数据库连接失败，记录错误但不中断
        error_log('Sitemap generation error: ' . $e->getMessage());
    }

    return $xml;
}

// 生成并保存sitemap
$sitemapContent = generateSitemap($baseUrl, $languages, $routes);

// 保存到文件
$sitemapPath = __DIR__ . '/../frontend/public/sitemap.xml';
file_put_contents($sitemapPath, $sitemapContent);

echo "多语言sitemap已生成: {$sitemapPath}\n";
echo "包含 " . count($routes) . " 个静态页面路由\n";

// 显示sitemap内容预览
echo "\nSitemap内容预览:\n";
echo substr($sitemapContent, 0, 500) . "...\n";

echo "\n生成完成！\n";
echo "请将 sitemap.xml 上传到网站根目录\n";
echo "然后在以下位置提交sitemap:\n";
echo "- Google Search Console: https://search.google.com/search-console\n";
echo "- Bing Webmaster Tools: https://www.bing.com/webmasters\n";
echo "- Yandex Webmaster: https://webmaster.yandex.com\n";
?>



