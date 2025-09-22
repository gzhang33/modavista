<?php

declare(strict_types=1);

require_once '../config/app.php';
require_once 'utils.php';
require_once '../lib/SecurityHelper.php';

configure_long_term_session();
handle_cors();

header('Content-Type: application/json; charset=UTF-8');

const MAX_2FA_ATTEMPTS = 5;
const MAX_PENDING_WINDOW = 600;

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

if (time() - ((int) ($pending['created_at'] ?? 0)) > MAX_PENDING_WINDOW) {
    unset($_SESSION['pending_2fa']);
    json_response(440, [
        'success' => false,
        'message' => '验证超时，请重新登录',
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
$code = (string) ($payload['code'] ?? '');
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
        'message' => '请输入验证码',
    ]);
}

$clientIp = get_client_ip();
$conn = get_db_connection();
$adminId = (int) $pending['admin_id'];

$stmt = $conn->prepare(
    'SELECT id, username, email, totp_enabled, totp_secret_enc, totp_secret_iv, totp_secret_tag, last_totp_timestamp, trusted_devices FROM admin WHERE id = ? LIMIT 1'
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

if (!$admin || (int) $admin['totp_enabled'] !== 1) {
    unset($_SESSION['pending_2fa']);
    json_response(400, [
        'success' => false,
        'message' => '账户未启用二次验证，请重新登录',
    ]);
}

$secret = SecurityHelper::decryptSecret(
    $admin['totp_secret_enc'] ?? null,
    $admin['totp_secret_iv'] ?? null,
    $admin['totp_secret_tag'] ?? null
);

if ($secret === null) {
    unset($_SESSION['pending_2fa']);
    json_response(500, [
        'success' => false,
        'message' => '二次验证配置缺失，请联系管理员',
    ]);
}

[$isValid, $timeSlice] = SecurityHelper::verifyTotpCode($secret, $code, 1);

if (!$isValid || $timeSlice === null) {
    $_SESSION['pending_2fa']['attempts'] = (int) (($_SESSION['pending_2fa']['attempts'] ?? 0) + 1);
    SecurityHelper::recordAdminLog($adminId, '2fa_failed', [
        'ip' => $clientIp,
        'reason' => 'invalid_totp',
    ]);

    if ($_SESSION['pending_2fa']['attempts'] >= MAX_2FA_ATTEMPTS) {
        unset($_SESSION['pending_2fa']);
        json_response(423, [
            'success' => false,
            'message' => '验证码错误次数过多，请重新登录',
        ]);
    }

    json_response(401, [
        'success' => false,
        'message' => '验证码不正确，请重试',
    ]);
}

$lastSlice = isset($admin['last_totp_timestamp']) ? (int) $admin['last_totp_timestamp'] : null;
if ($lastSlice !== null && $timeSlice <= $lastSlice) {
    $_SESSION['pending_2fa']['attempts'] = (int) (($_SESSION['pending_2fa']['attempts'] ?? 0) + 1);
    json_response(409, [
        'success' => false,
        'message' => '验证码已使用，请等待新验证码',
    ]);
}

$trustedDevicesJson = $admin['trusted_devices'] ?? null;
$cookieName = SecurityHelper::getTrustedDeviceCookieName();
$issueCookie = null;
$cookieExpiresAt = null;

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
    'last_totp_timestamp' => $timeSlice,
    'trusted_devices_json' => $trustedDevicesJson,
]);

unset($_SESSION['pending_2fa']);

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
    'message' => '验证通过，正在登录',
]);
