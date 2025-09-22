<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

/**
 * SecurityHelper: encryption helpers, TOTP verification, trusted device management, recovery codes.
 */
final class SecurityHelper
{
    private const DEVICE_COOKIE_NAME = 'admin_trusted_device';
    private const DEVICE_EXPIRATION_DAYS = 30;
    private const MAX_TRUSTED_DEVICES = 5;
    private const TOTP_PERIOD = 30;
    private const TOTP_DIGITS = 6;

    /**
     * Normalize configured encryption key to 32 bytes for AES-256.
     */
    public static function getEncryptionKey(): string
    {
        $key = ENCRYPTION_KEY ?? 'default_encryption_key';
        return hash('sha256', $key, true);
    }

    /**
     * Encrypt plaintext using AES-256-GCM.
     *
     * @return array{ciphertext:string,iv:string,tag:string}
     */
    public static function encryptSecret(string $plaintext): array
    {
        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            self::getEncryptionKey(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Failed to encrypt secret data.');
        }

        return [
            'ciphertext' => $ciphertext,
            'iv' => $iv,
            'tag' => $tag,
        ];
    }

    /**
     * Decrypt AES-256-GCM payload.
     */
    public static function decryptSecret(?string $ciphertext, ?string $iv, ?string $tag): ?string
    {
        if ($ciphertext === null || $iv === null || $tag === null) {
            return null;
        }

        return openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            self::getEncryptionKey(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        ) ?: null;
    }

    /**
     * Generate Base32 encoded TOTP secret.
     */
    public static function generateTotpSecret(int $length = 32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $alphabetLength = strlen($alphabet);
        $secret = '';

        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, $alphabetLength - 1)];
        }

        return $secret;
    }

    /**
     * Verify a TOTP code and return [isValid, timeSliceUsed].
     *
     * @return array{bool, int|null}
     */
    public static function verifyTotpCode(string $secret, string $code, int $window = 1): array
    {
        $normalizedCode = self::normalizeTotpCode($code);
        if ($normalizedCode === null) {
            return [false, null];
        }

        $secretKey = self::base32Decode($secret);
        if ($secretKey === null) {
            return [false, null];
        }

        $currentSlice = self::getTimeSlice();
        for ($i = -$window; $i <= $window; $i++) {
            $slice = $currentSlice + $i;
            if ($slice < 0) {
                continue;
            }

            $generatedCode = self::calculateHotp($secretKey, $slice, self::TOTP_DIGITS);
            if (hash_equals($generatedCode, $normalizedCode)) {
                return [true, $slice];
            }
        }

        return [false, null];
    }

    /**
     * Return current TOTP time slice.
     */
    public static function getTimeSlice(?int $timestamp = null): int
    {
        $timestamp = $timestamp ?? time();
        return (int) floor($timestamp / self::TOTP_PERIOD);
    }

    /**
     * Generate recovery codes (plain + hashed versions).
     *
     * @return array{plain: string[], hashed: string[]}
     */
    public static function generateRecoveryCodes(int $count = 10): array
    {
        $plain = [];
        $hashed = [];

        for ($i = 0; $i < $count; $i++) {
            $code = strtoupper(substr(bin2hex(random_bytes(6)), 0, 12));
            $code = substr($code, 0, 6) . '-' . substr($code, 6, 6);
            $plain[] = $code;
            $hashed[] = password_hash(self::normalizeRecoveryCode($code), PASSWORD_DEFAULT);
        }

        return [
            'plain' => $plain,
            'hashed' => $hashed,
        ];
    }

    /**
     * Verify recovery code and return [isValid, index, normalizedCode].
     *
     * @param string[] $hashedCodes
     * @return array{bool, int|null, string}
     */
    public static function verifyRecoveryCode(array $hashedCodes, string $code): array
    {
        $normalized = self::normalizeRecoveryCode($code);
        if ($normalized === '') {
            return [false, null, $normalized];
        }

        foreach ($hashedCodes as $index => $hash) {
            if (!is_string($hash)) {
                continue;
            }

            if (@password_verify($normalized, $hash)) {
                return [true, (int) $index, $normalized];
            }
        }

        return [false, null, $normalized];
    }

    /**
     * Persist trusted device info, returning [json, cookieValue, expiresAt].
     *
     * @param string|null $trustedDevicesJson
     * @param array{ip?:string,user_agent?:string,label?:string}|null $context
     * @return array{string, string, string}
     */
    public static function storeTrustedDevice(?string $trustedDevicesJson, ?array $context = null): array
    {
        $devices = self::decodeTrustedDevices($trustedDevicesJson);
        $token = bin2hex(random_bytes(32));
        $tokenHash = self::hashDeviceToken($token);

        $now = time();
        $expiresAt = date('c', $now + (self::DEVICE_EXPIRATION_DAYS * 86400));

        $devices[] = [
            'token_hash' => $tokenHash,
            'ip' => $context['ip'] ?? null,
            'user_agent' => isset($context['user_agent']) ? substr($context['user_agent'], 0, 255) : null,
            'label' => $context['label'] ?? '浏览器设备',
            'created_at' => date('c', $now),
            'last_used_at' => date('c', $now),
            'expires_at' => $expiresAt,
        ];

        $devices = self::trimTrustedDevices($devices);
        $json = json_encode($devices, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return [$json ?: '[]', $token, $expiresAt];
    }

    /**
     * Attempt to match cookie token with stored trusted device.
     *
     * @param string|null $trustedDevicesJson
     * @return array{found:bool,index?:int,devices:array<int,array>,reason?:string}
     */
    public static function matchTrustedDevice(?string $trustedDevicesJson, ?string $token): array
    {
        $devices = self::decodeTrustedDevices($trustedDevicesJson);
        if ($token === null || $token === '') {
            return ['found' => false, 'devices' => $devices, 'reason' => 'token_missing'];
        }

        $expectedHash = self::hashDeviceToken($token);
        $now = time();

        foreach ($devices as $index => $device) {
            if (!isset($device['token_hash'])) {
                continue;
            }

            $expiresAt = isset($device['expires_at']) ? strtotime((string) $device['expires_at']) : null;
            if ($expiresAt !== null && $expiresAt <= $now) {
                continue;
            }

            if (hash_equals((string) $device['token_hash'], $expectedHash)) {
                return ['found' => true, 'index' => $index, 'devices' => $devices];
            }
        }

        return ['found' => false, 'devices' => $devices, 'reason' => 'not_matched'];
    }

    /**
     * Update last_used_at timestamp for trusted device.
     *
     * @param array<int,array> $devices
     */
    public static function touchTrustedDevice(array $devices, int $index, ?string $ip = null): string
    {
        if (!isset($devices[$index])) {
            return json_encode($devices, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
        }

        $nowIso = date('c');
        $devices[$index]['last_used_at'] = $nowIso;
        if ($ip !== null) {
            $devices[$index]['ip'] = $ip;
        }

        return json_encode($devices, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
    }

    /**
     * Remove a hashed recovery code by index and return JSON string.
     *
     * @param array<int,string> $hashedCodes
     */
    public static function removeRecoveryCode(array $hashedCodes, int $index): string
    {
        unset($hashedCodes[$index]);
        return json_encode(array_values($hashedCodes), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '[]';
    }

    /**
     * Persist admin action audit record.
     */
    public static function recordAdminLog(int $adminId, string $action, array $details = []): void
    {
        $conn = get_db_connection();
        $stmt = $conn->prepare('INSERT INTO admin_logs (admin_id, action, details, ip_address) VALUES (?, ?, ?, ?)');
        if ($stmt === false) {
            return;
        }

        $jsonDetails = !empty($details)
            ? json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            : null;
        $ip = get_client_ip();

        $stmt->bind_param(
            'isss',
            $adminId,
            $action,
            $jsonDetails,
            $ip
        );

        $stmt->execute();
        $stmt->close();
    }

    /**
     * Finalize login session: update database, set session, and audit log.
     *
     * @param array $admin
     * @param mysqli $conn
     */
    public static function finalizeAdminLogin(array $admin, mysqli $conn, string $ip, array $options = []): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }

        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_username'] = (string) $admin['username'];
        $_SESSION['last_activity'] = time();
        $_SESSION['login_time'] = time();

        $now = date('Y-m-d H:i:s');
        $sql = 'UPDATE admin SET last_login_at = ?, last_login_ip = ?, login_failed_count = 0, locked_until = NULL';
        $types = 'ss';
        $params = [$now, $ip];

        if (array_key_exists('last_totp_timestamp', $options)) {
            if ($options['last_totp_timestamp'] === null) {
                $sql .= ', last_totp_timestamp = NULL';
            } else {
                $sql .= ', last_totp_timestamp = ?';
                $types .= 'i';
                $params[] = (int) $options['last_totp_timestamp'];
            }
        }

        if (array_key_exists('trusted_devices_json', $options)) {
            if ($options['trusted_devices_json'] === null) {
                $sql .= ', trusted_devices = NULL';
            } else {
                $sql .= ', trusted_devices = ?';
                $types .= 's';
                $params[] = (string) $options['trusted_devices_json'];
            }
        }

        if (array_key_exists('recovery_codes_json', $options)) {
            if ($options['recovery_codes_json'] === null) {
                $sql .= ', recovery_codes = NULL';
            } else {
                $sql .= ', recovery_codes = ?';
                $types .= 's';
                $params[] = (string) $options['recovery_codes_json'];
            }
        }

        $sql .= ' WHERE id = ?';
        $types .= 'i';
        $params[] = (int) $admin['id'];

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $stmt->close();
        }

        self::recordAdminLog((int) $admin['id'], 'login_success', [
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            'method' => !empty($options['used_2fa']) ? 'password+2fa' : 'password',
        ]);
    }

    public static function getTrustedDeviceCookieName(): string
    {
        return self::DEVICE_COOKIE_NAME;
    }

    private static function normalizeTotpCode(string $code): ?string
    {
        $digits = preg_replace('/\D/', '', $code);
        if ($digits === null || strlen($digits) !== self::TOTP_DIGITS) {
            return null;
        }

        return $digits;
    }

    private static function normalizeRecoveryCode(string $code): string
    {
        $clean = strtoupper(preg_replace('/[^A-Z0-9]/', '', $code) ?? '');
        return trim($clean);
    }

    private static function base32Decode(string $secret): ?string
    {
        $secret = strtoupper($secret);
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $alphabetFlipped = array_flip(str_split($alphabet));
        $paddingCharCount = substr_count($secret, '=');
        $secret = str_replace('=', '', $secret);

        $binaryString = '';
        foreach (str_split($secret) as $char) {
            if (!isset($alphabetFlipped[$char])) {
                return null;
            }

            $binaryString .= str_pad(decbin($alphabetFlipped[$char]), 5, '0', STR_PAD_LEFT);
        }

        $binaryString = substr($binaryString, 0, strlen($binaryString) - ($paddingCharCount * 5));
        $result = '';
        foreach (str_split($binaryString, 8) as $byte) {
            if (strlen($byte) === 8) {
                $result .= chr(bindec($byte));
            }
        }

        return $result;
    }

    private static function calculateHotp(string $secret, int $counter, int $digits = 6): string
    {
        $binCounter = pack('N*', 0) . pack('N*', $counter);
        $hash = hash_hmac('sha1', $binCounter, $secret, true);
        $offset = ord($hash[19]) & 0xf;
        $value = (
            ((ord($hash[$offset]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        );

        $modulo = 10 ** $digits;
        $code = (string) ($value % $modulo);

        return str_pad($code, $digits, '0', STR_PAD_LEFT);
    }

    /**
     * @return array<int,array>
     */
    private static function decodeTrustedDevices(?string $json): array
    {
        if ($json === null || $json === '') {
            return [];
        }

        $devices = json_decode($json, true);
        if (!is_array($devices)) {
            return [];
        }

        return $devices;
    }

    /**
     * @param array<int,array> $devices
     * @return array<int,array>
     */
    private static function trimTrustedDevices(array $devices): array
    {
        if (count($devices) <= self::MAX_TRUSTED_DEVICES) {
            return $devices;
        }

        usort($devices, static function ($a, $b) {
            $timeA = isset($a['last_used_at']) ? strtotime((string) $a['last_used_at']) : 0;
            $timeB = isset($b['last_used_at']) ? strtotime((string) $b['last_used_at']) : 0;
            return $timeB <=> $timeA;
        });

        return array_slice($devices, 0, self::MAX_TRUSTED_DEVICES);
    }

    private static function hashDeviceToken(string $token): string
    {
        return hash_hmac('sha256', $token, self::getEncryptionKey());
    }
}
