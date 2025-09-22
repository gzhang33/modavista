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

$code = trim((string) ($payload['totpCode'] ?? ''));
if ($code === '') {
    json_response(422, [
        'success' => false,
        'message' => '请输入动态验证码',
    ]);
}

$pending = $_SESSION['pending_2fa_setup'] ?? null;
if (!is_array($pending) || empty($pending['secret']) || (int) ($pending['admin_id'] ?? 0) <= 0) {
    json_response(409, [
        'success' => false,
        'message' => '当前没有待启用的二次验证请求',
    ]);
}

if ((int) $pending['admin_id'] !== (int) ($_SESSION['admin_id'] ?? 0)) {
    json_response(409, [
        'success' => false,
        'message' => '二次验证请求不属于当前账号',
    ]);
}

$attempts = (int) ($pending['attempts'] ?? 0);
if ($attempts >= 5) {
    unset($_SESSION['pending_2fa_setup']);
    json_response(423, [
        'success' => false,
        'message' => '验证码尝试次数过多，请重新生成二维码',
    ]);
}

[$isValid, $timeSlice] = SecurityHelper::verifyTotpCode((string) $pending['secret'], $code, 1);
if (!$isValid || $timeSlice === null) {
    $_SESSION['pending_2fa_setup']['attempts'] = $attempts + 1;
    json_response(401, [
        'success' => false,
        'message' => '验证码不正确，请重试',
    ]);
}

$encrypted = SecurityHelper::encryptSecret((string) $pending['secret']);
$recoveryBundle = SecurityHelper::generateRecoveryCodes(10);
$hashedRecoveryCodes = json_encode($recoveryBundle['hashed'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($hashedRecoveryCodes === false) {
    json_response(500, [
        'success' => false,
        'message' => '无法生成恢复代码，请稍后重试',
    ]);
}

$conn = get_db_connection();
$stmt = $conn->prepare('UPDATE admin SET totp_enabled = 1, totp_secret_enc = ?, totp_secret_iv = ?, totp_secret_tag = ?, last_totp_timestamp = ?, recovery_codes = ?, trusted_devices = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1');
if ($stmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '更新二次验证配置失败',
    ]);
}

$trustedDevicesJson = '[]';
$lastSlice = (string) $timeSlice;
$adminId = (int) $_SESSION['admin_id'];
$stmt->bind_param(
    'sssissi',
    $encrypted['ciphertext'],
    $encrypted['iv'],
    $encrypted['tag'],
    $lastSlice,
    $hashedRecoveryCodes,
    $trustedDevicesJson,
    $adminId
);
$stmt->execute();
$stmt->close();

SecurityHelper::recordAdminLog($adminId, '2fa_enabled', [
    'method' => 'totp',
]);

unset($_SESSION['pending_2fa_setup']);

json_response(200, [
    'success' => true,
    'message' => '二次验证已成功启用',
    'recovery_codes' => $recoveryBundle['plain'],
    'csrf_token' => $_SESSION['csrf_token'] ?? null,
]);
