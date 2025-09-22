<?php
declare(strict_types=1);

if (!isset($_SERVER['REQUEST_METHOD'])) {
    $_SERVER['REQUEST_METHOD'] = 'CLI';
}

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../lib/SecurityHelper.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "This script must be run from the CLI." . PHP_EOL);
    exit(1);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$options = getopt('', [
    'username::',
    'password::',
    'secret::',
    'codes::',
    'dry-run::'
]);

$username = $options['username'] ?? ADMIN_USERNAME;
$plainPassword = $options['password'] ?? null;
if ($plainPassword instanceof SensitiveParameterValue) {
    $plainPassword = $plainPassword->getValue();
}
$plainPassword = is_string($plainPassword) ? trim($plainPassword) : $plainPassword;
$userProvidedSecret = $options['secret'] ?? null;
$codesCount = isset($options['codes']) ? max(1, (int) $options['codes']) : 10;
$dryRun = array_key_exists('dry-run', $options);

if (!is_string($plainPassword) || $plainPassword === '') {
    fwrite(STDERR, "Missing --password option. Provide the new admin password in plain text." . PHP_EOL);
    exit(1);
}

$hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);
if ($hashedPassword === false) {
    fwrite(STDERR, "Failed to hash password." . PHP_EOL);
    exit(1);
}

$totpSecret = $userProvidedSecret !== null && $userProvidedSecret !== ''
    ? strtoupper(preg_replace('/[^A-Z2-7]/', '', $userProvidedSecret) ?? '')
    : SecurityHelper::generateTotpSecret();

if ($totpSecret === '') {
    fwrite(STDERR, "Invalid TOTP secret provided." . PHP_EOL);
    exit(1);
}

$encrypted = SecurityHelper::encryptSecret($totpSecret);
$recoveryBundle = SecurityHelper::generateRecoveryCodes($codesCount);
$hashedRecoveryCodes = json_encode($recoveryBundle['hashed'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if ($hashedRecoveryCodes === false) {
    fwrite(STDERR, "Failed to encode recovery codes." . PHP_EOL);
    exit(1);
}

$conn = get_db_connection();
$conn->set_charset(DB_CHARSET);

$stmt = $conn->prepare('SELECT id FROM admin WHERE username = ? LIMIT 1');
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->bind_result($adminId);
$exists = $stmt->fetch();
$stmt->close();

if (!$exists) {
    fwrite(STDERR, "Admin user '" . $username . "' not found." . PHP_EOL);
    exit(1);
}

if ($dryRun) {
    echo "[DRY-RUN] Target admin ID: {$adminId}" . PHP_EOL;
    echo "[DRY-RUN] Hashed password: {$hashedPassword}" . PHP_EOL;
    echo "[DRY-RUN] TOTP secret: {$totpSecret}" . PHP_EOL;
    echo "[DRY-RUN] Recovery codes (plain):" . PHP_EOL;
    foreach ($recoveryBundle['plain'] as $code) {
        echo "  - {$code}" . PHP_EOL;
    }
    exit(0);
}

$trustedDevicesJson = '[]';

$updateSql = 'UPDATE admin SET password_hash = ?, totp_enabled = 1, totp_secret_enc = ?, totp_secret_iv = ?, '
    . 'totp_secret_tag = ?, last_totp_timestamp = NULL, recovery_codes = ?, trusted_devices = ?, '
    . 'login_failed_count = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param(
    'ssssssi',
    $hashedPassword,
    $encrypted['ciphertext'],
    $encrypted['iv'],
    $encrypted['tag'],
    $hashedRecoveryCodes,
    $trustedDevicesJson,
    $adminId
);
$updateStmt->execute();
$affected = $updateStmt->affected_rows;
$updateStmt->close();

SecurityHelper::recordAdminLog((int) $adminId, 'seed_admin_2fa', [
    'seeded_at' => date('c'),
]);

echo "Seed completed for admin '{$username}'." . PHP_EOL;
echo "Admin ID: {$adminId}" . PHP_EOL;
echo "Plain password: {$plainPassword}" . PHP_EOL;
echo "TOTP secret: {$totpSecret}" . PHP_EOL;
echo "Recovery codes (plain):" . PHP_EOL;
foreach ($recoveryBundle['plain'] as $code) {
    echo "  - {$code}" . PHP_EOL;
}

echo PHP_EOL . 'IMPORTANT: Store the TOTP secret and recovery codes securely. They will not be shown again.' . PHP_EOL;
