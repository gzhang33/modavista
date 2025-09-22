<?php require_once '_auth_guard.php'; ?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? '', ENT_QUOTES, 'UTF-8'); ?>">
    <title>二步验证安全设置 - DreamModa 管理后台</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/setup_2fa.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>
<div class="dashboard-container">
    <nav class="admin-nav-bar">
        <div class="nav-container">
            <div class="nav-brand">
                <h3><i class="fas fa-shield-halved"></i> DreamModa 管理后台</h3>
            </div>
            <ul class="nav-links">
                <li><a href="dashboard.php" class="nav-link"><i class="fas fa-box"></i> 商品面板</a></li>
                <li><a href="contact_messages.php" class="nav-link"><i class="fas fa-envelope"></i> 留言管理</a></li>
                <li><a href="translations.php" class="nav-link"><i class="fas fa-language"></i> 翻译助手</a></li>
                <li><a href="setup_2fa.php" class="nav-link active"><i class="fas fa-user-shield"></i> 安全设置</a></li>
                <li>
                    <button type="button" class="nav-link logout logout-btn" data-admin-logout>
                        <i class="fas fa-sign-out-alt"></i> 退出登录
                    </button>
                </li>
            </ul>
        </div>
    </nav>

    <main class="main-content">
        <div class="setup-2fa-container">
            <div class="security-section-title">
                <i class="fas fa-lock"></i>
                <span>后台账户二步验证</span>
                <span class="status-pill inactive" id="totp-status-pill">未启用</span>
            </div>
            <p id="totp-status-text" class="text-muted" style="margin-bottom: 1.5rem; color:#475569;">
                二步验证尚未启用，建议立即配置以提升后台安全性。
            </p>

            <div id="global-message" class="message-box"></div>

            <section class="security-card" id="status-card">
                <h3><i class="fas fa-bullseye"></i> 账户安全概览</h3>
                <p>
                    通过绑定动态验证码应用（如 Google/Microsoft Authenticator），可有效防止密码泄露后的恶意登录。
                </p>
                <div class="security-actions">
                    <button class="security-primary-btn" id="generate-secret-btn">
                        <i class="fas fa-qrcode"></i> 生成绑定二维码
                    </button>
                    <a class="security-secondary-btn" href="https://support.google.com/accounts/answer/1066447" target="_blank" rel="noopener">
                        <i class="fas fa-circle-question"></i> 如何使用验证器
                    </a>
                </div>
            </section>

            <section class="security-card hidden" id="pending-card">
                <h3><i class="fas fa-step-forward"></i> 步骤 1：绑定验证器</h3>
                <div id="pending-message" class="message-box"></div>
                <div class="qr-wrapper">
                    <div class="qr-board">
                        <div id="qr-container"></div>
                    </div>
                    <div class="qr-instruction">
                        <p>打开验证器应用（Google Authenticator、Microsoft Authenticator、Authy 等），扫描左侧二维码或手动输入密钥。</p>
                        <div class="secret-display">
                            <span id="totp-secret">-- -- -- -- -- --</span>
                            <button type="button" id="copy-secret-btn"><i class="fas fa-copy"></i> 复制密钥</button>
                        </div>
                        <p style="font-size:0.9rem;color:#64748b;">如无法扫码，可在应用中选择“手动输入设置密钥”并填写上方密钥。</p>
                    </div>
                </div>

                <form id="activate-form" class="form-grid" autocomplete="off">
                    <div>
                        <label for="totp-code-input">步骤 2：输入 6 位动态验证码</label>
                        <input type="text" id="totp-code-input" maxlength="6" inputmode="numeric" placeholder="请输入验证码">
                    </div>
                    <div class="inline-actions">
                        <button type="submit" class="security-primary-btn">
                            <i class="fas fa-check-circle"></i> 完成绑定
                        </button>
                    </div>
                </form>
                <div id="activate-message" class="message-box"></div>
                <div class="notice-box">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong>提示：</strong> 完成绑定后将生成一组恢复代码，请务必保存至安全位置，一旦丢失将无法找回。
                    </div>
                </div>
            </section>

            <section class="security-card hidden" id="recovery-card">
                <h3><i class="fas fa-key"></i> 恢复代码</h3>
                <p id="recovery-notice">请妥善保管以下恢复代码，单次使用后即失效。</p>
                <ul id="recovery-codes-list" class="recovery-grid"></ul>
                <div class="notice-box">
                    <i class="fas fa-triangle-exclamation"></i>
                    <div>
                        <strong>安全建议：</strong> 将恢复代码打印或写下，存放于安全位置。若验证器不可用，可使用恢复代码登录并重新绑定。
                    </div>
                </div>
            </section>

            <section class="security-card hidden" id="enabled-card">
                <h3><i class="fas fa-shield"></i> 二步验证管理</h3>
                <p>
                    二步验证开启后，登录系统时除密码外还需输入动态验证码。若需要在新设备上登录，请提前准备验证器或恢复代码。
                </p>
                <div id="enabled-message" class="message-box"></div>
                <div class="inline-actions">
                    <button type="button" class="security-secondary-btn" id="toggle-regen-form">
                        <i class="fas fa-rotate"></i> 重新生成恢复代码
                    </button>
                    <button type="button" class="security-danger-btn" id="toggle-disable-form">
                        <i class="fas fa-ban"></i> 关闭二步验证
                    </button>
                </div>
                <p id="recovery-summary" style="margin-top:1rem;color:#475569;"></p>

                <form id="regen-form" class="form-grid hidden" autocomplete="off">
                    <div>
                        <label for="regen-totp-input">请输入当前动态验证码</label>
                        <input type="text" id="regen-totp-input" maxlength="6" inputmode="numeric" placeholder="验证器中的 6 位数字">
                    </div>
                    <div>
                        <label for="regen-count-input">生成代码数量（1-20）</label>
                        <input type="number" id="regen-count-input" min="1" max="20" value="10">
                    </div>
                    <div class="inline-actions">
                        <button type="submit" class="security-primary-btn">
                            <i class="fas fa-sync"></i> 生成新恢复代码
                        </button>
                    </div>
                </form>
                <div id="regen-message" class="message-box"></div>

                <form id="disable-form" class="form-grid hidden" autocomplete="off">
                    <div>
                        <label for="disable-password-input">确认密码</label>
                        <input type="password" id="disable-password-input" placeholder="请输入管理员密码">
                    </div>
                    <div>
                        <label for="disable-totp-input">动态验证码（可选）</label>
                        <input type="text" id="disable-totp-input" maxlength="6" inputmode="numeric" placeholder="验证器中的 6 位数字">
                    </div>
                    <div>
                        <label for="disable-recovery-input">恢复代码（可选）</label>
                        <input type="text" id="disable-recovery-input" placeholder="示例：XXXXXX-XXXXXX">
                    </div>
                    <p style="color:#b91c1c;font-size:0.9rem;">提示：关闭后所有可信设备和恢复代码都会清除，请谨慎操作。</p>
                    <div class="inline-actions">
                        <button type="submit" class="security-danger-btn">
                            <i class="fas fa-unlock"></i> 确认关闭二步验证
                        </button>
                    </div>
                </form>
                <div id="disable-message" class="message-box"></div>
            </section>
        </div>
    </main>
</div>

<script type="module" src="assets/js/setup_2fa.js"></script>
    <script src="assets/js/utils/logout.js" defer></script>
</body>
</html>
