<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/../lib/SecurityHelper.php';

configure_long_term_session();
handle_cors();

if (!is_session_valid()) {
    json_response(401, [
        'success' => false,
        'message' => '会话已失效，请重新登录',
    ]);
}

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
        'message' => '请求格式无效',
    ]);
}

$csrfToken = $payload['csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
if (!is_csrf_token_valid(is_string($csrfToken) ? $csrfToken : null)) {
    json_response(403, [
        'success' => false,
        'message' => '安全校验失败，请刷新页面后重试',
    ]);
}

$password = (string) ($payload['password'] ?? '');
$totpCode = trim((string) ($payload['totpCode'] ?? ''));
$recoveryCode = trim((string) ($payload['recoveryCode'] ?? ''));

if ($password === '') {
    json_response(422, [
        'success' => false,
        'message' => '请填写管理员密码',
    ]);
}

$adminId = (int) ($_SESSION['admin_id'] ?? 0);
if ($adminId <= 0) {
    json_response(401, [
        'success' => false,
        'message' => '管理员身份无效，请重新登录',
    ]);
}

$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id, username, password_hash, totp_enabled, totp_secret_enc, totp_secret_iv, totp_secret_tag, recovery_codes FROM admin WHERE id = ? LIMIT 1');
if ($stmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '系统无法读取管理员信息',
    ]);
}

$stmt->bind_param('i', $adminId);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result ? $result->fetch_assoc() : null;
$stmt->close();

if (!$admin) {
    json_response(404, [
        'success' => false,
        'message' => '管理员记录不存在',
    ]);
}

if (!password_verify($password, (string) $admin['password_hash'])) {
    json_response(401, [
        'success' => false,
        'message' => '密码不正确，无法关闭二次验证',
    ]);
}

$totpEnabled = (int) $admin['totp_enabled'] === 1;
$verificationMethod = 'password';

if ($totpEnabled) {
    if ($totpCode === '' && $recoveryCode === '') {
        json_response(422, [
            'success' => false,
            'message' => '请提供动态验证码或恢复代码中的任意一种',
        ]);
    }

    $secret = SecurityHelper::decryptSecret(
        $admin['totp_secret_enc'] ?? null,
        $admin['totp_secret_iv'] ?? null,
        $admin['totp_secret_tag'] ?? null
    );

    if ($totpCode !== '' && $secret !== null) {
        [$isValid, $slice] = SecurityHelper::verifyTotpCode($secret, $totpCode, 1);
        if (!$isValid || $slice === null) {
            json_response(401, [
                'success' => false,
                'message' => '动态验证码不正确',
            ]);
        }
        $verificationMethod = 'totp';
    } elseif ($recoveryCode !== '') {
        $codesJson = $admin['recovery_codes'] ?? '[]';
        $decoded = json_decode((string) $codesJson, true);
        $decoded = is_array($decoded) ? $decoded : [];

        [$isValid, $index, $normalized] = SecurityHelper::verifyRecoveryCode($decoded, $recoveryCode);
        if (!$isValid || $index === null) {
            json_response(401, [
                'success' => false,
                'message' => '恢复代码不正确',
            ]);
        }

        SecurityHelper::recordAdminLog((int) $admin['id'], '2fa_recovery_used', [
            'during' => 'disable_2fa',
            'code_suffix' => substr($normalized, -4),
        ]);
        $verificationMethod = 'recovery_code';
    } else {
        json_response(401, [
            'success' => false,
            'message' => '缺少二次验证凭证，无法继续',
        ]);
    }
}

$cleanupStmt = $conn->prepare('UPDATE admin SET totp_enabled = 0, totp_secret_enc = NULL, totp_secret_iv = NULL, totp_secret_tag = NULL, last_totp_timestamp = NULL, recovery_codes = NULL, trusted_devices = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1');
if ($cleanupStmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '关闭二次验证失败，请稍后重试',
    ]);
}

$cleanupStmt->bind_param('i', $adminId);
$cleanupStmt->execute();
$cleanupStmt->close();

unset($_SESSION['pending_2fa_setup']);

global $is_production;
$secureFlag = !empty($is_production);

$cookieName = SecurityHelper::getTrustedDeviceCookieName();
if (isset($_COOKIE[$cookieName])) {
    setcookie($cookieName, '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => $secureFlag,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

SecurityHelper::recordAdminLog((int) $admin['id'], '2fa_disabled', [
    'method' => $verificationMethod,
]);

json_response(200, [
    'success' => true,
    'message' => '已关闭二次验证',
    'csrf_token' => $_SESSION['csrf_token'] ?? null,
]);
