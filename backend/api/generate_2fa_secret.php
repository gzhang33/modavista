<?php
declare(strict_types=1);

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use PragmaRX\Google2FA\Google2FA;

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../vendor/autoload.php';
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

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST'], true)) {
    json_response(405, [
        'success' => false,
        'message' => '仅支持 GET 或 POST 请求',
    ]);
}

$payload = [];
if ($method === 'POST') {
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
}

$adminId = (int) ($_SESSION['admin_id'] ?? 0);
if ($adminId <= 0) {
    json_response(401, [
        'success' => false,
        'message' => '管理员身份无效，请重新登录',
    ]);
}

$conn = get_db_connection();
$stmt = $conn->prepare('SELECT id, username, email, totp_enabled, recovery_codes FROM admin WHERE id = ? LIMIT 1');
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

$totpEnabled = (int) ($admin['totp_enabled'] ?? 0) === 1;
$pending = $_SESSION['pending_2fa_setup'] ?? null;
$hasPending = is_array($pending) && (int) ($pending['admin_id'] ?? 0) === $adminId && !empty($pending['secret']);

$decodedRecoveryCodes = json_decode((string) ($admin['recovery_codes'] ?? '[]'), true);
if (!is_array($decodedRecoveryCodes)) {
    $decodedRecoveryCodes = [];
}

$google2fa = new Google2FA();
$renderer = new ImageRenderer(new RendererStyle(256), new SvgImageBackEnd());
$writer = new Writer($renderer);
$issuer = SITE_NAME ?? 'DreamModa Admin';
$accountLabel = (string) ($admin['email'] ?? $admin['username'] ?? 'admin');

if ($method === 'GET') {
    $response = [
        'success' => true,
        'totp_enabled' => $totpEnabled,
        'has_pending_setup' => $hasPending,
        'recovery_codes_count' => $totpEnabled ? count($decodedRecoveryCodes) : 0,
        'csrf_token' => $_SESSION['csrf_token'] ?? null,
    ];

    if (!$totpEnabled && $hasPending) {
        $secret = (string) $pending['secret'];
        $otpAuthUrl = $google2fa->getQRCodeUrl($issuer, $accountLabel, $secret);
        $qrSvg = $writer->writeString($otpAuthUrl);
        $qrBase64 = base64_encode($qrSvg);

        $response['secret'] = $secret;
        $response['otpauth_url'] = $otpAuthUrl;
        $response['qr_svg'] = $qrBase64;
        $response['qr_svg_data_uri'] = 'data:image/svg+xml;base64,' . $qrBase64;
        $response['pending_created_at'] = (int) ($pending['created_at'] ?? time());
    }

    json_response(200, $response);
}

if ($totpEnabled) {
    json_response(409, [
        'success' => false,
        'message' => '账号已启用二次验证，无需重新生成',
    ]);
}

$secret = SecurityHelper::generateTotpSecret();
$otpAuthUrl = $google2fa->getQRCodeUrl($issuer, $accountLabel, $secret);
$qrSvg = $writer->writeString($otpAuthUrl);
$qrBase64 = base64_encode($qrSvg);

$_SESSION['pending_2fa_setup'] = [
    'admin_id' => $adminId,
    'secret' => $secret,
    'created_at' => time(),
    'attempts' => 0,
];

SecurityHelper::recordAdminLog((int) $admin['id'], '2fa_setup_generated', [
    'totp_enabled' => false,
]);

json_response(200, [
    'success' => true,
    'secret' => $secret,
    'otpauth_url' => $otpAuthUrl,
    'qr_svg' => $qrBase64,
    'qr_svg_data_uri' => 'data:image/svg+xml;base64,' . $qrBase64,
    'totp_enabled' => false,
    'has_pending_setup' => true,
    'csrf_token' => $_SESSION['csrf_token'] ?? null,
]);
