<?php

declare(strict_types=1);

require_once '../config/app.php';
require_once 'utils.php';
require_once '../lib/SecurityHelper.php';

configure_long_term_session();
handle_cors();

header('Content-Type: application/json; charset=UTF-8');

const MAX_RECOVERY_ATTEMPTS = 5;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, [
        'success' => false,
        'message' => '仅支持 POST 请求',
    ]);
}

$pending = $_SESSION['pending_2fa'] ?? null;
if (!$pending || !is_array($pending)) {
    json_response(440, [
        'success' => false,
        'message' => '会话已过期，请重新登录',
    ]);
}

$payload = json_decode(file_get_contents('php://input') ?: 'null', true);
if (!is_array($payload)) {
    json_response(400, [
        'success' => false,
        'message' => '请求格式错误',
    ]);
}

$token = (string) ($payload['token'] ?? '');
$code = (string) ($payload['recoveryCode'] ?? '');
$rememberDevice = !empty($payload['rememberDevice']);

if ($token === '' || !hash_equals((string) $pending['challenge'], $token)) {
    unset($_SESSION['pending_2fa']);
    json_response(400, [
        'success' => false,
        'message' => '验证令牌无效，请重新登录',
    ]);
}

if ($code === '') {
    json_response(422, [
        'success' => false,
        'message' => '请输入恢复代码',
    ]);
}

$clientIp = get_client_ip();
$conn = get_db_connection();
$adminId = (int) $pending['admin_id'];

$stmt = $conn->prepare(
    'SELECT id, username, recovery_codes, trusted_devices FROM admin WHERE id = ? LIMIT 1'
);

if ($stmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '系统异常，请稍后重试',
    ]);
}

$stmt->bind_param('i', $adminId);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$admin) {
    unset($_SESSION['pending_2fa']);
    json_response(400, [
        'success' => false,
        'message' => '账户信息不存在，请重新登录',
    ]);
}

$codes = $admin['recovery_codes'] ?? '[]';
$decoded = json_decode((string) $codes, true);
$decoded = is_array($decoded) ? $decoded : [];

[$isValid, $index, $normalized] = SecurityHelper::verifyRecoveryCode($decoded, $code);

if (!$isValid || $index === null) {
    $_SESSION['pending_2fa']['attempts'] = (int) (($_SESSION['pending_2fa']['attempts'] ?? 0) + 1);
    SecurityHelper::recordAdminLog($adminId, '2fa_failed', [
        'ip' => $clientIp,
        'reason' => 'invalid_recovery_code',
    ]);

    if ($_SESSION['pending_2fa']['attempts'] >= MAX_RECOVERY_ATTEMPTS) {
        unset($_SESSION['pending_2fa']);
        json_response(423, [
            'success' => false,
            'message' => '恢复代码尝试次数过多，请重新登录',
        ]);
    }

    json_response(401, [
        'success' => false,
        'message' => '恢复代码无效，请重新输入',
    ]);
}

$remainingCodes = SecurityHelper::removeRecoveryCode($decoded, $index);
$trustedDevicesJson = $admin['trusted_devices'] ?? null;
$issueCookie = null;
$cookieExpiresAt = null;
$cookieName = SecurityHelper::getTrustedDeviceCookieName();

if ($rememberDevice) {
    [$trustedDevicesJson, $issuedToken, $expiresAt] = SecurityHelper::storeTrustedDevice($trustedDevicesJson, [
        'ip' => $clientIp,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
    ]);

    $issueCookie = $issuedToken;
    $cookieExpiresAt = strtotime($expiresAt) ?: (time() + (30 * 86400));
}

SecurityHelper::finalizeAdminLogin($admin, $conn, $clientIp, [
    'used_2fa' => true,
    'trusted_devices_json' => $trustedDevicesJson,
    'recovery_codes_json' => $remainingCodes,
]);

unset($_SESSION['pending_2fa']);

SecurityHelper::recordAdminLog($adminId, '2fa_recovery_used', [
    'ip' => $clientIp,
    'code_suffix' => substr($normalized, -4),
]);

if ($issueCookie !== null) {
    global $is_production;

    setcookie(
        $cookieName,
        $issueCookie,
        [
            'expires' => $cookieExpiresAt,
            'path' => '/',
            'domain' => '',
            'secure' => $is_production,
            'httponly' => true,
            'samesite' => 'Lax',
        ]
    );
}

json_response(200, [
    'success' => true,
    'message' => '恢复代码验证成功，已完成登录',
]);
