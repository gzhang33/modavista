<?php
declare(strict_types=1);

if (!isset($_SERVER['REQUEST_METHOD'])) {
    $_SERVER['REQUEST_METHOD'] = 'CLI';
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require_once __DIR__ . '/../../config/app.php';

/**
 * Simple CLI migration helper to enforce admin and admin_logs schema for 2FA rollout.
 */
function println(string $message = ''): void
{
    echo $message . PHP_EOL;
}

function tableExists(mysqli $conn, string $schema, string $table): bool
{
    $stmt = $conn->prepare(
        'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1'
    );
    $stmt->bind_param('ss', $schema, $table);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    return (int) $count > 0;
}

function getColumnInfo(mysqli $conn, string $schema, string $table, string $column): ?array
{
    $stmt = $conn->prepare(
        'SELECT column_type, is_nullable, column_default, extra FROM information_schema.columns '
        . 'WHERE table_schema = ? AND table_name = ? AND column_name = ? LIMIT 1'
    );
    $stmt->bind_param('sss', $schema, $table, $column);
    $stmt->execute();
    $stmt->bind_result($type, $nullable, $default, $extra);
    $exists = $stmt->fetch();
    $stmt->close();

    if (!$exists) {
        return null;
    }

    return [
        'COLUMN_TYPE' => $type,
        'IS_NULLABLE' => $nullable,
        'COLUMN_DEFAULT' => $default,
        'EXTRA' => $extra,
    ];
}

function columnMatchesSpec(array $info, array $expected): bool
{
    foreach ($expected as $key => $value) {
        $actual = $info[$key] ?? null;
        if ($value === null) {
            if ($actual !== null) {
                return false;
            }
            continue;
        }

        if ($actual === null) {
            return false;
        }

        $actualNorm = strtolower((string) $actual);
        $expectedNorm = strtolower((string) $value);

        if ($actualNorm !== $expectedNorm) {
            return false;
        }
    }

    return true;
}

function ensureColumn(mysqli $conn, string $schema, string $table, array $spec): void
{
    $info = getColumnInfo($conn, $schema, $table, $spec['name']);
    $definition = $spec['definition'];
    $position = $spec['position'] ?? '';
    $definitionWithPosition = $position === ''
        ? $definition
        : $definition . ' ' . $position;

    if ($info === null) {
        $sql = sprintf('ALTER TABLE `%s` ADD COLUMN %s;', $table, $definitionWithPosition);
        $conn->query($sql);
        println(sprintf('Added column `%s` to `%s`.', $spec['name'], $table));
        return;
    }

    if (!columnMatchesSpec($info, $spec['match'])) {
        $sql = sprintf('ALTER TABLE `%s` MODIFY COLUMN %s;', $table, $definitionWithPosition);
        $conn->query($sql);
        println(sprintf('Updated column `%s` on `%s`.', $spec['name'], $table));
    }
}

function indexMatchesColumns(mysqli $conn, string $schema, string $table, array $columns, bool $unique): bool
{
    $columnList = implode(',', $columns);
    $nonUnique = $unique ? 0 : 1;

    $sql = <<<SQL
SELECT idx.index_name FROM (
    SELECT index_name, NON_UNIQUE AS idx_non_unique,
           GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') AS cols
    FROM information_schema.statistics
    WHERE table_schema = ? AND table_name = ?
    GROUP BY index_name, NON_UNIQUE
) AS idx
WHERE idx.cols = ? AND idx.idx_non_unique = ?
LIMIT 1
SQL;

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssi', $schema, $table, $columnList, $nonUnique);
    $stmt->execute();
    $stmt->bind_result($indexName);
    $exists = false;
    if ($stmt->fetch()) {
        $exists = true;
    }
    $stmt->close();

    return $exists;
}

function ensureIndex(mysqli $conn, string $schema, string $table, string $indexName, array $columns, bool $unique): void
{
    if (indexMatchesColumns($conn, $schema, $table, $columns, $unique)) {
        return;
    }

    $columnList = '`' . implode('`,`', $columns) . '`';
    $sql = sprintf(
        'ALTER TABLE `%s` ADD %sINDEX `%s` (%s);',
        $table,
        $unique ? 'UNIQUE ' : '',
        $indexName,
        $columnList
    );
    $conn->query($sql);
    $label = $unique ? 'unique index' : 'index';
    println(sprintf('Added %s `%s` on `%s` (%s).', $label, $indexName, $table, implode(',', $columns)));
}

function ensureAdminTable(mysqli $conn, string $schema): void
{
    if (!tableExists($conn, $schema, 'admin')) {
        $createSql = <<<SQL
CREATE TABLE `admin` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(254) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` DATETIME DEFAULT NULL,
  `last_login_ip` VARCHAR(45) DEFAULT NULL,
  `login_failed_count` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `totp_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `totp_secret_enc` VARBINARY(256) DEFAULT NULL,
  `totp_secret_iv` VARBINARY(16) DEFAULT NULL,
  `totp_secret_tag` VARBINARY(16) DEFAULT NULL,
  `last_totp_timestamp` BIGINT DEFAULT NULL,
  `trusted_devices` JSON DEFAULT NULL,
  `recovery_codes` JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;
        $conn->query($createSql);
        println('Created table `admin`.');
    }

    $columns = [
        [
            'name' => 'username',
            'definition' => '`username` VARCHAR(50) NOT NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(50)',
                'IS_NULLABLE' => 'no',
            ],
        ],
        [
            'name' => 'password_hash',
            'definition' => '`password_hash` VARCHAR(255) NOT NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(255)',
                'IS_NULLABLE' => 'no',
            ],
        ],
        [
            'name' => 'email',
            'definition' => '`email` VARCHAR(254) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(254)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'created_at',
            'definition' => '`created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP',
            'match' => [
                'COLUMN_TYPE' => 'timestamp',
                'IS_NULLABLE' => 'yes',
                'COLUMN_DEFAULT' => 'current_timestamp',
            ],
        ],
        [
            'name' => 'updated_at',
            'definition' => '`updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            'match' => [
                'COLUMN_TYPE' => 'timestamp',
                'IS_NULLABLE' => 'yes',
                'COLUMN_DEFAULT' => 'current_timestamp',
                'EXTRA' => 'default_generated on update current_timestamp',
            ],
        ],
        [
            'name' => 'last_login_at',
            'definition' => '`last_login_at` DATETIME NULL',
            'match' => [
                'COLUMN_TYPE' => 'datetime',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'last_login_ip',
            'definition' => '`last_login_ip` VARCHAR(45) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(45)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'login_failed_count',
            'definition' => '`login_failed_count` INT NOT NULL DEFAULT 0',
            'match' => [
                'COLUMN_TYPE' => 'int',
                'IS_NULLABLE' => 'no',
                'COLUMN_DEFAULT' => '0',
            ],
        ],
        [
            'name' => 'locked_until',
            'definition' => '`locked_until` DATETIME NULL',
            'match' => [
                'COLUMN_TYPE' => 'datetime',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'totp_enabled',
            'definition' => '`totp_enabled` TINYINT(1) NOT NULL DEFAULT 0',
            'match' => [
                'COLUMN_TYPE' => 'tinyint(1)',
                'IS_NULLABLE' => 'no',
                'COLUMN_DEFAULT' => '0',
            ],
        ],
        [
            'name' => 'totp_secret_enc',
            'definition' => '`totp_secret_enc` VARBINARY(256) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varbinary(256)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'totp_secret_iv',
            'definition' => '`totp_secret_iv` VARBINARY(16) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varbinary(16)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'totp_secret_tag',
            'definition' => '`totp_secret_tag` VARBINARY(16) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varbinary(16)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'last_totp_timestamp',
            'definition' => '`last_totp_timestamp` BIGINT NULL',
            'match' => [
                'COLUMN_TYPE' => 'bigint',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'trusted_devices',
            'definition' => '`trusted_devices` JSON NULL',
            'match' => [
                'COLUMN_TYPE' => 'json',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'recovery_codes',
            'definition' => '`recovery_codes` JSON NULL',
            'match' => [
                'COLUMN_TYPE' => 'json',
                'IS_NULLABLE' => 'yes',
            ],
        ],
    ];

    foreach ($columns as $spec) {
        ensureColumn($conn, $schema, 'admin', $spec);
    }

    ensureIndex($conn, $schema, 'admin', 'idx_admin_username', ['username'], true);
}

function ensureAdminLogsTable(mysqli $conn, string $schema): void
{
    if (!tableExists($conn, $schema, 'admin_logs')) {
        $createSql = <<<SQL
CREATE TABLE `admin_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT DEFAULT NULL,
  `action` VARCHAR(50) NOT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_action` (`admin_id`, `action`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;
        $conn->query($createSql);
        println('Created table `admin_logs`.');
    }

    $columns = [
        [
            'name' => 'admin_id',
            'definition' => '`admin_id` INT NULL',
            'match' => [
                'COLUMN_TYPE' => 'int',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'action',
            'definition' => '`action` VARCHAR(50) NOT NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(50)',
                'IS_NULLABLE' => 'no',
            ],
        ],
        [
            'name' => 'details',
            'definition' => '`details` JSON NULL',
            'match' => [
                'COLUMN_TYPE' => 'json',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'ip_address',
            'definition' => '`ip_address` VARCHAR(45) NULL',
            'match' => [
                'COLUMN_TYPE' => 'varchar(45)',
                'IS_NULLABLE' => 'yes',
            ],
        ],
        [
            'name' => 'created_at',
            'definition' => '`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
            'match' => [
                'COLUMN_TYPE' => 'datetime',
                'IS_NULLABLE' => 'no',
                'COLUMN_DEFAULT' => 'current_timestamp',
                'EXTRA' => 'default_generated',
            ],
        ],
    ];

    foreach ($columns as $spec) {
        ensureColumn($conn, $schema, 'admin_logs', $spec);
    }

    ensureIndex($conn, $schema, 'admin_logs', 'idx_admin_action', ['admin_id', 'action'], false);
    ensureIndex($conn, $schema, 'admin_logs', 'idx_created_at', ['created_at'], false);
}

function printTableDefinitions(mysqli $conn, string $schema, array $tables): void
{
    foreach ($tables as $table) {
        if (!tableExists($conn, $schema, $table)) {
            println(sprintf('Table `%s` does not exist.', $table));
            continue;
        }

        $sql = sprintf('SHOW CREATE TABLE `%s`', $table);
        $result = $conn->query($sql);
        $row = $result->fetch_array(MYSQLI_NUM);
        println($row[1]);
        println();
    }
}

try {
    $conn = get_db_connection();
    $schema = DB_NAME;
    $conn->set_charset(DB_CHARSET);

    $options = getopt('', ['apply', 'inspect']);
    $shouldApply = isset($options['apply']);
    $shouldInspect = isset($options['inspect']) || !$shouldApply;

    if ($shouldInspect) {
        println('Current schema snapshot:');
        printTableDefinitions($conn, $schema, ['admin', 'admin_logs']);
        if (!$shouldApply) {
            exit(0);
        }
    }

    if ($shouldApply) {
        ensureAdminTable($conn, $schema);
        ensureAdminLogsTable($conn, $schema);
        println('Migration tasks completed.');

        if ($shouldInspect) {
            println('');
            println('Post-migration schema snapshot:');
            printTableDefinitions($conn, $schema, ['admin', 'admin_logs']);
        }
    }
} catch (Throwable $e) {
    fwrite(STDERR, 'Migration failed: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}
