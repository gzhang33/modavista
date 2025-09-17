<?php
// i18n表格分析脚本
require_once 'config/app.php';

function analyze_i18n_tables() {
    $conn = get_db_connection();

    // 定义i18n相关表格
    $i18n_tables = [
        'product_i18n' => [
            'fields' => ['product_id', 'locale', 'name', 'description', 'slug', 'status', 'translation_timestamp'],
            'primary_key' => 'product_id, locale',
            'foreign_key' => 'product_id'
        ],
        'category_i18n' => [
            'fields' => ['category_id', 'locale', 'name'],
            'primary_key' => 'category_id, locale',
            'foreign_key' => 'category_id'
        ],
        'color_i18n' => [
            'fields' => ['color_id', 'locale', 'name'],
            'primary_key' => 'color_id, locale',
            'foreign_key' => 'color_id'
        ],
        'material_i18n' => [
            'fields' => ['material_id', 'locale', 'name'],
            'primary_key' => 'material_id, locale',
            'foreign_key' => 'material_id'
        ],
        'site_content_translation' => [
            'fields' => ['content_id', 'language_code', 'translated_text', 'translation_timestamp'],
            'primary_key' => 'content_id, language_code',
            'foreign_key' => 'content_id'
        ],
        'locales' => [
            'fields' => ['code', 'language_name', 'language_name_native', 'sort_order'],
            'primary_key' => 'code',
            'foreign_key' => null
        ]
    ];

    $missing_chinese_tables = [];
    $sql_insert_statements = [];

    foreach ($i18n_tables as $table_name => $table_info) {
        // 检查表格是否存在
        $check_result = $conn->query("SHOW TABLES LIKE '$table_name'");
        if ($check_result->num_rows == 0) {
            continue;
        }

        // 获取表格结构
        $struct_result = $conn->query("DESCRIBE $table_name");
        $actual_fields = [];
        while ($field = $struct_result->fetch_assoc()) {
            $actual_fields[] = $field['Field'];
        }

        // 检查中文内容
        $locale_field = in_array('locale', $actual_fields) ? 'locale' : 'language_code';
        $count_result = $conn->query("SELECT COUNT(*) as total FROM $table_name WHERE $locale_field LIKE 'zh%'");
        $zh_count = $count_result->fetch_assoc()['total'];

        $total_result = $conn->query("SELECT COUNT(*) as total FROM $table_name");
        $total_count = $total_result->fetch_assoc()['total'];

        // 如果没有中文内容，添加到缺失列表
        if ($zh_count == 0 && $total_count > 0) {
            $missing_chinese_tables[$table_name] = [
                'total_records' => $total_count,
                'missing_fields' => $table_info['fields'],
                'locale_field' => $locale_field,
                'primary_key' => $table_info['primary_key'],
                'foreign_key' => $table_info['foreign_key']
            ];

            // 生成SQL插入语句
            $sql_insert_statements[$table_name] = generate_sql_inserts($conn, $table_name, $table_info, $actual_fields, $locale_field);
        }
    }

    $conn->close();

    return [
        'missing_chinese_tables' => $missing_chinese_tables,
        'sql_insert_statements' => $sql_insert_statements
    ];
}

function generate_sql_inserts($conn, $table_name, $table_info, $actual_fields, $locale_field) {
    $inserts = [];

    // 获取一些示例数据来生成插入语句模板
    $sample_result = $conn->query("SELECT * FROM $table_name LIMIT 3");

    while ($row = $sample_result->fetch_assoc()) {
        $zh_locale = ($locale_field == 'locale') ? 'zh-CN' : 'zh-CN';

        // 为每条记录生成中文版本的插入语句
        $insert_values = [];
        foreach ($actual_fields as $field) {
            if ($field == $locale_field) {
                $insert_values[] = "'$zh_locale'";
            } elseif ($field == 'translation_timestamp') {
                $insert_values[] = 'CURRENT_TIMESTAMP';
            } elseif (in_array($field, ['name', 'description', 'translated_text'])) {
                // 这些字段需要翻译，需要用户提供中文内容
                $insert_values[] = "'[需要提供中文翻译内容]'";
            } elseif (strpos($field, '_id') !== false || is_numeric($row[$field])) {
                $insert_values[] = $row[$field];
            } else {
                $insert_values[] = "'" . $conn->real_escape_string($row[$field]) . "'";
            }
        }

        $insert_sql = "INSERT INTO `$table_name` (`" . implode('`, `', $actual_fields) . "`) VALUES (" . implode(', ', $insert_values) . ");";

        // 为了避免重复插入，使用ON DUPLICATE KEY UPDATE
        if ($table_info['primary_key']) {
            $update_parts = [];
            foreach ($actual_fields as $field) {
                if ($field != $locale_field && !in_array($field, explode(', ', $table_info['primary_key']))) {
                    $update_parts[] = "`$field` = VALUES(`$field`)";
                }
            }
            if (!empty($update_parts)) {
                $insert_sql .= "\nON DUPLICATE KEY UPDATE " . implode(', ', $update_parts) . ";";
            }
        }

        $inserts[] = $insert_sql;
    }

    return $inserts;
}

// 执行分析
$result = analyze_i18n_tables();

// 输出结果
echo "待补充中文的i18n表格清单\n";
echo "========================\n\n";

foreach ($result['missing_chinese_tables'] as $table_name => $info) {
    echo "表格名称: $table_name\n";
    echo "总记录数: {$info['total_records']}\n";
    echo "缺失中文内容的核心字段:\n";
    foreach ($info['missing_fields'] as $field) {
        echo "  - $field\n";
    }
    echo "语言标识字段: {$info['locale_field']}\n";
    echo "主键: {$info['primary_key']}\n";
    if ($info['foreign_key']) {
        echo "外键: {$info['foreign_key']}\n";
    }
    echo "\n";
}

echo "\n对应SQL插入语句\n";
echo "===============\n\n";

foreach ($result['sql_insert_statements'] as $table_name => $inserts) {
    echo "-- $table_name 表格的中文翻译插入语句\n";
    echo "-- ==========================================\n\n";

    foreach ($inserts as $insert_sql) {
        echo $insert_sql . "\n\n";
    }
}
?>
