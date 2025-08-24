<?php
/**
 * 翻译内容导入脚本
 * 用于批量导入多语言内容
 */

require_once '../api/config.php';
require_once '../api/utils.php';

// 欧洲主要语言的翻译内容
$translations = [
    'en' => [
        'site_title' => 'Fashion Collection',
        'site_description' => 'Discover our exclusive fashion collection with premium quality materials',
        'nav_home' => 'Home',
        'nav_products' => 'Products',
        'nav_about' => 'About',
        'nav_contact' => 'Contact',
        'hero_title' => 'Discover Your Style',
        'hero_subtitle' => 'Premium fashion for the modern lifestyle',
        'cta_button' => 'Shop Now',
        'footer_copyright' => '© 2025 Fashion Collection. All rights reserved.',
        'footer_company_info' => 'Premium fashion brand offering quality clothing and accessories',
        'filter_all_categories' => 'All Categories',
        'sort_featured' => 'Featured',
        'sort_newest' => 'Newest',
        'reset_filters' => 'Reset',
        'contact_description' => 'If you have questions or collaboration proposals, we would be happy to hear from you.'
    ],
    'it' => [
        'site_title' => 'Collezione Moda',
        'site_description' => 'Scopri la nostra collezione esclusiva di capi di moda premium. Curata per lo stile di vita moderno.',
        'nav_home' => 'Home',
        'nav_products' => 'Prodotti',
        'nav_about' => 'Chi Siamo',
        'nav_contact' => 'Contatti',
        'hero_title' => 'Scopri Il Tuo Stile',
        'hero_subtitle' => 'Moda premium per lo stile di vita moderno',
        'cta_button' => 'Acquista Ora',
        'footer_copyright' => '© 2025 Collezione Moda. Tutti i diritti riservati.',
        'footer_company_info' => 'Marca di moda premium che offre abbigliamento e accessori di qualità',
        'filter_all_categories' => 'Tutte le Categorie',
        'sort_featured' => 'In Evidenza',
        'sort_newest' => 'Più Recenti',
        'reset_filters' => 'Reimposta',
        'contact_description' => 'Se hai domande o proposte di collaborazione, saremo felici di ascoltarti.'
    ],
    'fr' => [
        'site_title' => 'Collection Mode',
        'site_description' => 'Découvrez notre collection exclusive de vêtements de mode premium. Conçue pour le style de vie moderne.',
        'nav_home' => 'Accueil',
        'nav_products' => 'Produits',
        'nav_about' => 'À Propos',
        'nav_contact' => 'Contact',
        'hero_title' => 'Découvrez Votre Style',
        'hero_subtitle' => 'Mode premium pour le style de vie moderne',
        'cta_button' => 'Acheter Maintenant',
        'footer_copyright' => '© 2025 Collection Mode. Tous droits réservés.',
        'footer_company_info' => 'Marque de mode premium offrant des vêtements et accessoires de qualité',
        'filter_all_categories' => 'Toutes les Catégories',
        'sort_featured' => 'En Vedette',
        'sort_newest' => 'Plus Récent',
        'reset_filters' => 'Réinitialiser',
        'contact_description' => 'Si vous avez des questions ou des propositions de collaboration, nous serons heureux de vous écouter.'
    ],
    'de' => [
        'site_title' => 'Mode Kollektion',
        'site_description' => 'Entdecken Sie unsere exklusive Modemarken-Kollektion. Gestaltet für den modernen Lebensstil.',
        'nav_home' => 'Startseite',
        'nav_products' => 'Produkte',
        'nav_about' => 'Über Uns',
        'nav_contact' => 'Kontakt',
        'hero_title' => 'Entdecken Sie Ihren Stil',
        'hero_subtitle' => 'Premium-Mode für den modernen Lebensstil',
        'cta_button' => 'Jetzt Kaufen',
        'footer_copyright' => '© 2025 Mode Kollektion. Alle Rechte vorbehalten.',
        'footer_company_info' => 'Premium-Modemarke, die qualitativ hochwertige Kleidung und Accessoires anbietet',
        'filter_all_categories' => 'Alle Kategorien',
        'sort_featured' => 'Empfohlen',
        'sort_newest' => 'Neueste',
        'reset_filters' => 'Zurücksetzen',
        'contact_description' => 'Wenn Sie Fragen oder Kooperationsvorschläge haben, hören wir gerne von Ihnen.'
    ],
    'es' => [
        'site_title' => 'Colección de Moda',
        'site_description' => 'Descubre nuestra colección exclusiva de prendas de moda premium. Diseñada para el estilo de vida moderno.',
        'nav_home' => 'Inicio',
        'nav_products' => 'Productos',
        'nav_about' => 'Acerca de',
        'nav_contact' => 'Contacto',
        'hero_title' => 'Descubre Tu Estilo',
        'hero_subtitle' => 'Moda premium para el estilo de vida moderno',
        'cta_button' => 'Comprar Ahora',
        'footer_copyright' => '© 2025 Colección de Moda. Todos los derechos reservados.',
        'footer_company_info' => 'Marca de moda premium que ofrece ropa y accesorios de calidad',
        'filter_all_categories' => 'Todas las Categorías',
        'sort_featured' => 'Destacados',
        'sort_newest' => 'Más Recientes',
        'reset_filters' => 'Restablecer',
        'contact_description' => 'Si tienes preguntas o propuestas de colaboración, estaremos encantados de escucharte.'
    ],
    'pt' => [
        'site_title' => 'Coleção de Moda',
        'site_description' => 'Descubra nossa coleção exclusiva de roupas de moda premium. Projetada para o estilo de vida moderno.',
        'nav_home' => 'Início',
        'nav_products' => 'Produtos',
        'nav_about' => 'Sobre',
        'nav_contact' => 'Contato',
        'hero_title' => 'Descubra Seu Estilo',
        'hero_subtitle' => 'Moda premium para o estilo de vida moderno',
        'cta_button' => 'Comprar Agora',
        'footer_copyright' => '© 2025 Coleção de Moda. Todos os direitos reservados.',
        'footer_company_info' => 'Marca de moda premium que oferece roupas e acessórios de qualidade',
        'filter_all_categories' => 'Todas as Categorias',
        'sort_featured' => 'Destaques',
        'sort_newest' => 'Mais Recentes',
        'reset_filters' => 'Redefinir',
        'contact_description' => 'Se você tem perguntas ou propostas de colaboração, ficaremos felizes em ouvir você.'
    ],
    'nl' => [
        'site_title' => 'Mode Collectie',
        'site_description' => 'Ontdek onze exclusieve premium modecollectie. Ontworpen voor de moderne levensstijl.',
        'nav_home' => 'Home',
        'nav_products' => 'Producten',
        'nav_about' => 'Over Ons',
        'nav_contact' => 'Contact',
        'hero_title' => 'Ontdek Je Stijl',
        'hero_subtitle' => 'Premium mode voor de moderne levensstijl',
        'cta_button' => 'Nu Kopen',
        'footer_copyright' => '© 2025 Mode Collectie. Alle rechten voorbehouden.',
        'footer_company_info' => 'Premium modemerk dat kwaliteitskleding en accessoires biedt',
        'filter_all_categories' => 'Alle Categorieën',
        'sort_featured' => 'Uitgelicht',
        'sort_newest' => 'Nieuwste',
        'reset_filters' => 'Resetten',
        'contact_description' => 'Als je vragen of samenwerkingsvoorstellen hebt, horen we graag van je.'
    ],
    'pl' => [
        'site_title' => 'Kolekcja Mody',
        'site_description' => 'Odkryj naszą ekskluzywną kolekcję ubrań premium. Zaprojektowana dla nowoczesnego stylu życia.',
        'nav_home' => 'Strona Główna',
        'nav_products' => 'Produkty',
        'nav_about' => 'O Nas',
        'nav_contact' => 'Kontakt',
        'hero_title' => 'Odkryj Swój Styl',
        'hero_subtitle' => 'Premium moda dla nowoczesnego stylu życia',
        'cta_button' => 'Kup Teraz',
        'footer_copyright' => '© 2025 Kolekcja Mody. Wszystkie prawa zastrzeżone.',
        'footer_company_info' => 'Premium marka modowa oferująca wysokiej jakości ubrania i akcesoria',
        'filter_all_categories' => 'Wszystkie Kategorie',
        'sort_featured' => 'Polecane',
        'sort_newest' => 'Najnowsze',
        'reset_filters' => 'Resetuj',
        'contact_description' => 'Jeśli masz pytania lub propozycje współpracy, chętnie Cię wysłuchamy.'
    ]
];

function import_translations() {
    $conn = get_db_connection();
    
    // 开始事务
    $conn->begin_transaction();
    
    try {
        // 清空现有内容
        $conn->query("DELETE FROM site_content_translations");
        $conn->query("DELETE FROM site_content");
        
        // 插入内容键
        $content_keys = array_keys($translations['en']);
        foreach ($content_keys as $key) {
            $stmt = $conn->prepare("INSERT INTO site_content (content_key) VALUES (?)");
            $stmt->bind_param("s", $key);
            $stmt->execute();
            $stmt->close();
        }
        
        // 插入翻译
        foreach ($translations as $language_code => $lang_translations) {
            foreach ($lang_translations as $content_key => $translated_text) {
                $stmt = $conn->prepare("
                    INSERT INTO site_content_translations (content_id, language_code, translated_text)
                    SELECT id, ?, ? FROM site_content WHERE content_key = ?
                ");
                $stmt->bind_param("sss", $language_code, $translated_text, $content_key);
                $stmt->execute();
                $stmt->close();
            }
        }
        
        // 提交事务
        $conn->commit();
        
        echo "Translations imported successfully!\n";
        echo "Total content keys: " . count($content_keys) . "\n";
        echo "Total languages: " . count($translations) . "\n";
        echo "Total translations: " . (count($content_keys) * count($translations)) . "\n";
        
    } catch (Exception $e) {
        // 回滚事务
        $conn->rollback();
        echo "Error importing translations: " . $e->getMessage() . "\n";
    }
}

// 运行导入
if (php_sapi_name() === 'cli') {
    import_translations();
} else {
    echo "This script should be run from command line.\n";
}
?>

