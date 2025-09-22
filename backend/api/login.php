<?php

declare(strict_types=1);

require_once '../config/app.php';
require_once 'utils.php';
require_once '../lib/SecurityHelper.php';

configure_long_term_session();
handle_cors();

header('Content-Type: application/json; charset=UTF-8');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 600;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, [
        'success' => false,
        'message' => '仅支持 POST 请求',
    ]);
}

$payload = json_decode(file_get_contents('php://input') ?: 'null', true);
if (!is_array($payload)) {
    json_response(400, [
        'success' => false,
        'message' => '请求格式错误',
    ]);
}

$username = trim((string) ($payload['username'] ?? ''));
$password = (string) ($payload['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(422, [
        'success' => false,
        'message' => '请提供账号和密码',
    ]);
}

$clientIp = get_client_ip();
$conn = get_db_connection();

$stmt = $conn->prepare(
    'SELECT id, username, password_hash, email, totp_enabled, totp_secret_enc, totp_secret_iv, totp_secret_tag, last_totp_timestamp, login_failed_count, locked_until, trusted_devices, recovery_codes
     FROM admin WHERE username = ? LIMIT 1'
);

if ($stmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '系统异常，请稍后重试',
    ]);
}

$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$admin) {
    sleep(1);
    json_response(401, [
        'success' => false,
        'message' => '账号或密码错误',
    ]);
}

$adminId = (int) $admin['id'];
$failCount = (int) $admin['login_failed_count'];
$lockedUntil = $admin['locked_until'] ? strtotime((string) $admin['locked_until']) : null;

if ($lockedUntil !== null && $lockedUntil > time()) {
    json_response(423, [
        'success' => false,
        'message' => '账号暂时锁定，请稍后再试',
        'lockedUntil' => date('c', $lockedUntil),
    ]);
}

if (!password_verify($password, (string) $admin['password_hash'])) {
    $failCount++;
    $lockUntilTime = null;
    if ($failCount >= MAX_LOGIN_ATTEMPTS) {
        $lockUntilTime = date('Y-m-d H:i:s', time() + LOCK_DURATION_SECONDS);
    }

    $updateStmt = $conn->prepare('UPDATE admin SET login_failed_count = ?, locked_until = ? WHERE id = ?');
    if ($updateStmt) {
        $updateStmt->bind_param('isi', $failCount, $lockUntilTime, $adminId);
        $updateStmt->execute();
        $updateStmt->close();
    }

    SecurityHelper::recordAdminLog($adminId, 'login_failed', [
        'ip' => $clientIp,
        'reason' => 'invalid_password',
    ]);

    json_response(401, [
        'success' => false,
        'message' => '账号或密码错误',
    ]);
}

// Password verified: clear lock counters when login completes successfully.

$totpEnabled = (int) $admin['totp_enabled'] === 1;
$trustedDevicesJson = $admin['trusted_devices'] ?? null;
$cookieName = SecurityHelper::getTrustedDeviceCookieName();
$trustedToken = $_COOKIE[$cookieName] ?? null;

if ($totpEnabled) {
    $match = SecurityHelper::matchTrustedDevice($trustedDevicesJson, $trustedToken);
    if ($match['found'] ?? false) {
        $updatedJson = SecurityHelper::touchTrustedDevice($match['devices'], (int) $match['index'], $clientIp);
        SecurityHelper::finalizeAdminLogin($admin, $conn, $clientIp, [
            'trusted_devices_json' => $updatedJson,
            'used_2fa' => false,
        ]);

        json_response(200, [
            'success' => true,
            'message' => '已识别可信设备，登录成功',
            'skipped2fa' => true,
        ]);
    }

    $challengeToken = bin2hex(random_bytes(16));
    $_SESSION['pending_2fa'] = [
        'challenge' => $challengeToken,
        'admin_id' => $adminId,
        'username' => $admin['username'],
        'created_at' => time(),
        'attempts' => 0,
    ];

    json_response(200, [
        'success' => false,
        'requires2fa' => true,
        'twoFactorToken' => $challengeToken,
        'message' => '账号已启用二次验证，请输入动态验证码',
    ]);
}

// No 2FA required
SecurityHelper::finalizeAdminLogin($admin, $conn, $clientIp, [
    'used_2fa' => false,
]);

json_response(200, [
    'success' => true,
    'message' => '登录成功，正在跳转后台...'
]);
