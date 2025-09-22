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

$totpCode = trim((string) ($payload['totpCode'] ?? ''));
$count = isset($payload['count']) ? (int) $payload['count'] : 10;
$count = $count > 0 ? min($count, 20) : 10;

if ($totpCode === '') {
    json_response(422, [
        'success' => false,
        'message' => '请输入动态验证码',
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
$stmt = $conn->prepare('SELECT id, username, totp_enabled, totp_secret_enc, totp_secret_iv, totp_secret_tag FROM admin WHERE id = ? LIMIT 1');
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

if ((int) $admin['totp_enabled'] !== 1) {
    json_response(409, [
        'success' => false,
        'message' => '账号尚未启用二次验证',
    ]);
}

$secret = SecurityHelper::decryptSecret(
    $admin['totp_secret_enc'] ?? null,
    $admin['totp_secret_iv'] ?? null,
    $admin['totp_secret_tag'] ?? null
);

if ($secret === null) {
    json_response(500, [
        'success' => false,
        'message' => '二次验证配置缺失，请重新绑定',
    ]);
}

[$isValid, $timeSlice] = SecurityHelper::verifyTotpCode($secret, $totpCode, 1);
if (!$isValid || $timeSlice === null) {
    json_response(401, [
        'success' => false,
        'message' => '动态验证码不正确',
    ]);
}

$recoveryBundle = SecurityHelper::generateRecoveryCodes($count);
$hashedJson = json_encode($recoveryBundle['hashed'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($hashedJson === false) {
    json_response(500, [
        'success' => false,
        'message' => '无法生成恢复代码，请稍后重试',
    ]);
}

$updateStmt = $conn->prepare('UPDATE admin SET recovery_codes = ?, last_totp_timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? LIMIT 1');
if ($updateStmt === false) {
    json_response(500, [
        'success' => false,
        'message' => '更新恢复代码失败',
    ]);
}

$lastSlice = (int) $timeSlice;
$updateStmt->bind_param('sii', $hashedJson, $lastSlice, $adminId);
$updateStmt->execute();
$updateStmt->close();

SecurityHelper::recordAdminLog($adminId, '2fa_recovery_regenerated', [
    'count' => $count,
]);

json_response(200, [
    'success' => true,
    'message' => '恢复代码已重新生成',
    'recovery_codes' => $recoveryBundle['plain'],
    'csrf_token' => $_SESSION['csrf_token'] ?? null,
]);
