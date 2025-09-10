<?php
/**
 * 为剩余语言选项创建对应语言版本的内容
 * 确保数据库中所有i18n表都有完整的数据
 */

require_once 'api/config.php';
require_once 'api/utils.php';

echo "=== 创建语言版本内容 ===\n\n";

try {
    $conn = get_db_connection();

    // 1. 检查并创建语言记录
    echo "1. 检查语言记录...\n";
    $languages = [
        ['code' => 'en-GB', 'name' => 'English', 'native' => 'English', 'sort' => 1],
        ['code' => 'fr-FR', 'name' => 'French', 'native' => 'Français', 'sort' => 2],
        ['code' => 'de-DE', 'name' => 'German', 'native' => 'Deutsch', 'sort' => 3],
        ['code' => 'it-IT', 'name' => 'Italian', 'native' => 'Italiano', 'sort' => 4],
        ['code' => 'es-ES', 'name' => 'Spanish', 'native' => 'Español', 'sort' => 5]
    ];

    foreach ($languages as $lang) {
        $stmt = $conn->prepare("
            INSERT INTO locales (code, language_name, language_name_native, sort_order)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                language_name = VALUES(language_name),
                language_name_native = VALUES(language_name_native),
                sort_order = VALUES(sort_order)
        ");
        $stmt->bind_param('sssi', $lang['code'], $lang['name'], $lang['native'], $lang['sort']);
        $stmt->execute();
        $stmt->close();
        echo "  - {$lang['code']} 已创建/更新\n";
    }
    echo "\n";

    // 2. 检查现有数据并创建i18n记录
    echo "2. 创建产品多语言数据...\n";

    // 获取所有产品
    $products = $conn->query("SELECT id, base_name, description FROM product");
    while ($product = $products->fetch_assoc()) {
        $product_id = $product['id'];
        $base_name = $product['base_name'];
        $description = $product['description'];

        // 为每种语言创建翻译
        foreach ($languages as $lang) {
            $locale = $lang['code'];

            // 生成翻译内容（这里使用简单的替换逻辑，实际项目中可能需要更复杂的翻译逻辑）
            $translated_name = get_product_translation($base_name, $locale);
            $translated_desc = get_product_translation($description, $locale);

            $stmt = $conn->prepare("
                INSERT INTO product_i18n (product_id, locale, name, description)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    description = VALUES(description)
            ");
            $stmt->bind_param('isss', $product_id, $locale, $translated_name, $translated_desc);
            $stmt->execute();
            $stmt->close();
        }
        echo "  - 产品 {$base_name} 的多语言数据已创建\n";
    }

    // 3. 创建分类多语言数据
    echo "\n3. 创建分类多语言数据...\n";
    $categories = $conn->query("SELECT id, category_name_en FROM category");
    while ($category = $categories->fetch_assoc()) {
        $category_id = $category['id'];
        $name_en = $category['category_name_en'];

        foreach ($languages as $lang) {
            $locale = $lang['code'];
            $translated_name = get_category_translation($name_en, $locale);

            $stmt = $conn->prepare("
                INSERT INTO category_i18n (category_id, locale, name)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
            ");
            $stmt->bind_param('iss', $category_id, $locale, $translated_name);
            $stmt->execute();
            $stmt->close();
        }
        echo "  - 分类 {$name_en} 的多语言数据已创建\n";
    }

    // 4. 创建颜色多语言数据
    echo "\n4. 创建颜色多语言数据...\n";
    $colors = $conn->query("SELECT id, color_name FROM color");
    while ($color = $colors->fetch_assoc()) {
        $color_id = $color['id'];
        $name_en = $color['color_name'];

        foreach ($languages as $lang) {
            $locale = $lang['code'];
            $translated_name = get_color_translation($name_en, $locale);

            $stmt = $conn->prepare("
                INSERT INTO color_i18n (color_id, locale, name)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
            ");
            $stmt->bind_param('iss', $color_id, $locale, $translated_name);
            $stmt->execute();
            $stmt->close();
        }
        echo "  - 颜色 {$name_en} 的多语言数据已创建\n";
    }

    // 5. 创建材质多语言数据
    echo "\n5. 创建材质多语言数据...\n";
    $materials = $conn->query("SELECT id, material_name FROM material");
    while ($material = $materials->fetch_assoc()) {
        $material_id = $material['id'];
        $name_en = $material['material_name'];

        foreach ($languages as $lang) {
            $locale = $lang['code'];
            $translated_name = get_material_translation($name_en, $locale);

            $stmt = $conn->prepare("
                INSERT INTO material_i18n (material_id, locale, name)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name)
            ");
            $stmt->bind_param('iss', $material_id, $locale, $translated_name);
            $stmt->execute();
            $stmt->close();
        }
        echo "  - 材质 {$name_en} 的多语言数据已创建\n";
    }

    // 6. 创建网站内容翻译
    echo "\n6. 创建网站内容翻译...\n";
    $site_contents = [
        ['key' => 'home.hero.title', 'en' => 'Premium Wholesale Garment Collection'],
        ['key' => 'home.hero.subtitle', 'en' => 'Discover our curated selection of high-quality garments crafted for discerning wholesale partners'],
        ['key' => 'nav.home', 'en' => 'Home'],
        ['key' => 'nav.collections', 'en' => 'Collections'],
        ['key' => 'nav.about', 'en' => 'About'],
        ['key' => 'nav.contact', 'en' => 'Contact'],
        ['key' => 'footer.copyright', 'en' => '© 2025 DREAMODA. All rights reserved. | Made with passion for fashion in Milano, Italia.']
    ];

    foreach ($site_contents as $content) {
        $content_key = $content['key'];

        // 确保site_content表中有记录
        $stmt = $conn->prepare("
            INSERT INTO site_content (content_key)
            VALUES (?)
            ON DUPLICATE KEY UPDATE content_key = content_key
        ");
        $stmt->bind_param('s', $content_key);
        $stmt->execute();
        $stmt->close();

        // 获取content_id
        $stmt = $conn->prepare("SELECT id FROM site_content WHERE content_key = ?");
        $stmt->bind_param('s', $content_key);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $content_id = $row['id'];
        $stmt->close();

        // 为每种语言创建翻译
        foreach ($languages as $lang) {
            $locale = $lang['code'];
            $translated_text = get_content_translation($content['en'], $locale);

            $stmt = $conn->prepare("
                INSERT INTO site_content_translation (content_id, language_code, translated_text)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE translated_text = VALUES(translated_text)
            ");
            $stmt->bind_param('iss', $content_id, $locale, $translated_text);
            $stmt->execute();
            $stmt->close();
        }
        echo "  - 内容 {$content_key} 的多语言数据已创建\n";
    }

    // 7. 清空缓存
    echo "\n7. 清空翻译缓存...\n";
    require_once 'api/language.php';
    clear_cache();
    echo "缓存已清空\n";

    echo "\n=== 语言内容创建完成 ===\n";

} catch (Exception $e) {
    echo '错误: ' . $e->getMessage() . "\n";
}

// 翻译函数（简化版本）
function get_product_translation($text, $locale) {
    if (empty($text)) return $text;

    // 简单的翻译映射，实际项目中应该使用专业的翻译服务
    $translations = [
        'fr-FR' => [
            'Dress' => 'Robe',
            'Shirt' => 'Chemise',
            'Pants' => 'Pantalon',
            'Skirt' => 'Jupe',
            'Blouse' => 'Blouse',
            'Jacket' => 'Veste',
            'Coat' => 'Manteau',
            'Sweater' => 'Pull',
            'Cardigan' => 'Cardigan',
            'T-shirt' => 'T-shirt'
        ],
        'de-DE' => [
            'Dress' => 'Kleid',
            'Shirt' => 'Hemd',
            'Pants' => 'Hose',
            'Skirt' => 'Rock',
            'Blouse' => 'Bluse',
            'Jacket' => 'Jacke',
            'Coat' => 'Mantel',
            'Sweater' => 'Pullover',
            'Cardigan' => 'Strickjacke',
            'T-shirt' => 'T-Shirt'
        ],
        'it-IT' => [
            'Dress' => 'Vestito',
            'Shirt' => 'Camicia',
            'Pants' => 'Pantaloni',
            'Skirt' => 'Gonna',
            'Blouse' => 'Camicia',
            'Jacket' => 'Giacca',
            'Coat' => 'Cappotto',
            'Sweater' => 'Maglione',
            'Cardigan' => 'Cardigan',
            'T-shirt' => 'Maglietta'
        ],
        'es-ES' => [
            'Dress' => 'Vestido',
            'Shirt' => 'Camisa',
            'Pants' => 'Pantalones',
            'Skirt' => 'Falda',
            'Blouse' => 'Blusa',
            'Jacket' => 'Chaqueta',
            'Coat' => 'Abrigo',
            'Sweater' => 'Suéter',
            'Cardigan' => 'Cardigan',
            'T-shirt' => 'Camiseta'
        ]
    ];

    if (isset($translations[$locale])) {
        foreach ($translations[$locale] as $en => $translated) {
            if (stripos($text, $en) !== false) {
                return str_ireplace($en, $translated, $text);
            }
        }
    }

    return $text; // 如果没有找到翻译，返回原文
}

function get_category_translation($text, $locale) {
    if (empty($text)) return $text;

    $translations = [
        'fr-FR' => [
            'Dresses' => 'Robes',
            'Tops' => 'Hauts',
            'Bottoms' => 'Bas',
            'Outerwear' => 'Vêtements d\'extérieur',
            'Accessories' => 'Accessoires'
        ],
        'de-DE' => [
            'Dresses' => 'Kleider',
            'Tops' => 'Oberteile',
            'Bottoms' => 'Unterteile',
            'Outerwear' => 'Oberbekleidung',
            'Accessories' => 'Accessoires'
        ],
        'it-IT' => [
            'Dresses' => 'Vestiti',
            'Tops' => 'Top',
            'Bottoms' => 'Parte inferiore',
            'Outerwear' => 'Abbigliamento esterno',
            'Accessories' => 'Accessori'
        ],
        'es-ES' => [
            'Dresses' => 'Vestidos',
            'Tops' => 'Parte superior',
            'Bottoms' => 'Parte inferior',
            'Outerwear' => 'Ropa exterior',
            'Accessories' => 'Accesorios'
        ]
    ];

    return $translations[$locale][$text] ?? $text;
}

function get_color_translation($text, $locale) {
    if (empty($text)) return $text;

    $translations = [
        'fr-FR' => [
            'Red' => 'Rouge',
            'Blue' => 'Bleu',
            'Black' => 'Noir',
            'White' => 'Blanc',
            'Green' => 'Vert',
            'Yellow' => 'Jaune',
            'Pink' => 'Rose',
            'Purple' => 'Violet',
            'Brown' => 'Marron',
            'Gray' => 'Gris'
        ],
        'de-DE' => [
            'Red' => 'Rot',
            'Blue' => 'Blau',
            'Black' => 'Schwarz',
            'White' => 'Weiß',
            'Green' => 'Grün',
            'Yellow' => 'Gelb',
            'Pink' => 'Rosa',
            'Purple' => 'Lila',
            'Brown' => 'Braun',
            'Gray' => 'Grau'
        ],
        'it-IT' => [
            'Red' => 'Rosso',
            'Blue' => 'Blu',
            'Black' => 'Nero',
            'White' => 'Bianco',
            'Green' => 'Verde',
            'Yellow' => 'Giallo',
            'Pink' => 'Rosa',
            'Purple' => 'Viola',
            'Brown' => 'Marrone',
            'Gray' => 'Grigio'
        ],
        'es-ES' => [
            'Red' => 'Rojo',
            'Blue' => 'Azul',
            'Black' => 'Negro',
            'White' => 'Blanco',
            'Green' => 'Verde',
            'Yellow' => 'Amarillo',
            'Pink' => 'Rosa',
            'Purple' => 'Morado',
            'Brown' => 'Marrón',
            'Gray' => 'Gris'
        ]
    ];

    return $translations[$locale][$text] ?? $text;
}

function get_material_translation($text, $locale) {
    if (empty($text)) return $text;

    $translations = [
        'fr-FR' => [
            'Cotton' => 'Coton',
            'Silk' => 'Soie',
            'Wool' => 'Laine',
            'Linen' => 'Lin',
            'Polyester' => 'Polyester',
            'Rayon' => 'Rayonne',
            'Nylon' => 'Nylon',
            'Spandex' => 'Spandex',
            'Leather' => 'Cuir',
            'Denim' => 'Denim'
        ],
        'de-DE' => [
            'Cotton' => 'Baumwolle',
            'Silk' => 'Seide',
            'Wool' => 'Wolle',
            'Linen' => 'Leinen',
            'Polyester' => 'Polyester',
            'Rayon' => 'Viskose',
            'Nylon' => 'Nylon',
            'Spandex' => 'Spandex',
            'Leather' => 'Leder',
            'Denim' => 'Denim'
        ],
        'it-IT' => [
            'Cotton' => 'Cotone',
            'Silk' => 'Seta',
            'Wool' => 'Lana',
            'Linen' => 'Lino',
            'Polyester' => 'Poliestere',
            'Rayon' => 'Raggi',
            'Nylon' => 'Nylon',
            'Spandex' => 'Spandex',
            'Leather' => 'Pelle',
            'Denim' => 'Denim'
        ],
        'es-ES' => [
            'Cotton' => 'Algodón',
            'Silk' => 'Seda',
            'Wool' => 'Lana',
            'Linen' => 'Lino',
            'Polyester' => 'Poliéster',
            'Rayon' => 'Rayón',
            'Nylon' => 'Nylon',
            'Spandex' => 'Spandex',
            'Leather' => 'Cuero',
            'Denim' => 'Denim'
        ]
    ];

    return $translations[$locale][$text] ?? $text;
}

function get_content_translation($text, $locale) {
    if (empty($text)) return $text;

    // 对于内容翻译，使用更简单的映射
    $content_translations = [
        'fr-FR' => [
            'Home' => 'Accueil',
            'Collections' => 'Collections',
            'About' => 'À Propos',
            'Contact' => 'Contact',
            'Premium Wholesale Garment Collection' => 'Collection de Vêtements de Gros Premium',
            'Discover our curated selection of high-quality garments crafted for discerning wholesale partners' =>
            'Découvrez notre sélection exclusive de vêtements de haute qualité, conçus pour les partenaires grossistes exigeants'
        ],
        'de-DE' => [
            'Home' => 'Startseite',
            'Collections' => 'Kollektionen',
            'About' => 'Über Uns',
            'Contact' => 'Kontakt',
            'Premium Wholesale Garment Collection' => 'Premium Großhandels-Kleidungskollektion',
            'Discover our curated selection of high-quality garments crafted for discerning wholesale partners' =>
            'Entdecken Sie unsere sorgfältig kuratierte Auswahl an hochwertigen Kleidungsstücken, die für anspruchsvolle Großhandelspartner entwickelt wurden'
        ],
        'it-IT' => [
            'Home' => 'Home',
            'Collections' => 'Collezioni',
            'About' => 'Chi Siamo',
            'Contact' => 'Contatti',
            'Premium Wholesale Garment Collection' => 'Collezione di Abbigliamento all\'Ingrosso Premium',
            'Discover our curated selection of high-quality garments crafted for discerning wholesale partners' =>
            'Scopri la nostra selezione curata di capi di alta qualità, realizzati per partner grossisti esigenti'
        ],
        'es-ES' => [
            'Home' => 'Inicio',
            'Collections' => 'Colecciones',
            'About' => 'Sobre Nosotros',
            'Contact' => 'Contacto',
            'Premium Wholesale Garment Collection' => 'Colección de Ropa al por Mayor Premium',
            'Discover our curated selection of high-quality garments crafted for discerning wholesale partners' =>
            'Descubre nuestra selección curada de prendas de alta calidad, diseñadas para socios mayoristas exigentes'
        ]
    ];

    return $content_translations[$locale][$text] ?? $text;
}
?>



