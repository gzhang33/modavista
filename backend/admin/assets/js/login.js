const endpoints = {
    login: '../api/login.php',
    verify2fa: '../api/verify_2fa.php',
    verifyRecovery: '../api/verify_recovery_code.php',
    checkSession: '../api/check_session.php'
};

const ui = {
    messageBox: document.getElementById('auth-message'),
    messageText: document.getElementById('auth-message-text'),
    stepIndicator: document.querySelector('[data-step-indicator]'),
    stepTitle: document.querySelector('[data-step-title]'),
    stepSubtitle: document.querySelector('[data-step-subtitle]'),
    loginForm: document.getElementById('credentials-form'),
    totpForm: document.getElementById('totp-form'),
    loginButton: document.getElementById('login-submit'),
    totpButton: document.getElementById('totp-submit'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    totpInput: document.getElementById('totp-code'),
    totpLabel: document.querySelector('[data-totp-label]'),
    totpHint: document.querySelector('[data-totp-hint]'),
    recoveryHint: document.querySelector('[data-recovery-hint]'),
    rememberDevice: document.getElementById('remember-device'),
    backToLogin: document.getElementById('back-to-login'),
    useRecovery: document.getElementById('use-recovery-code'),
    forgotPassword: document.getElementById('forgot-password'),
};

const state = {
    pendingTwoFaToken: null,
    lastUsername: '',
    recoveryMode: false
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function configureVerificationField() {
    if (!ui.totpInput || !ui.totpLabel || !ui.totpHint || !ui.recoveryHint) {
        return;
    }

    const isRecovery = state.recoveryMode;
    ui.totpInput.classList.toggle('is-recovery', isRecovery);

    if (isRecovery) {
        ui.totpLabel.textContent = '二次验证 · 恢复代码';
        ui.totpInput.placeholder = 'XXXXXX-XXXXXX';
        ui.totpInput.setAttribute('inputmode', 'text');
        ui.totpInput.setAttribute('maxlength', '13');
        ui.totpInput.setAttribute('autocomplete', 'off');
        ui.recoveryHint.classList.remove('is-hidden');

        const stripped = ui.totpInput.value.toUpperCase().replace(/[^0-9A-F]/g, '');
        const first = stripped.slice(0, 6);
        const second = stripped.slice(6, 12);
        ui.totpInput.value = second ? `${first}-${second}` : first;
    } else {
        ui.totpLabel.textContent = '二次验证 · 动态验证码';
        ui.totpInput.placeholder = '000000';
        ui.totpInput.setAttribute('inputmode', 'numeric');
        ui.totpInput.setAttribute('maxlength', '6');
        ui.totpInput.setAttribute('autocomplete', 'one-time-code');
        ui.totpHint.textContent = '打开认证器 App，输入当前 6 位验证码。验证码每 30 秒更新一次。';
        ui.recoveryHint.classList.add('is-hidden');
        ui.totpInput.value = ui.totpInput.value.replace(/\D/g, '').slice(0, 6);
    }
}

function handleVerificationInput(event) {
    const input = event.target;

    if (state.recoveryMode) {
        const stripped = input.value.toUpperCase().replace(/[^0-9A-F]/g, '');
        const first = stripped.slice(0, 6);
        const second = stripped.slice(6, 12);
        input.value = second ? `${first}-${second}` : first;
    } else {
        input.value = input.value.replace(/\D/g, '').slice(0, 6);
    }
}

function showMessage(type, text) {
    ui.messageBox.dataset.type = type;
    ui.messageText.textContent = text;
    ui.messageBox.classList.remove('is-hidden');
}

function hideMessage() {
    ui.messageBox.classList.add('is-hidden');
    ui.messageText.textContent = '';
}

function switchStep(step) {
    const isLogin = step === 'login';
    ui.loginForm.classList.toggle('is-hidden', !isLogin);
    ui.totpForm.classList.toggle('is-hidden', isLogin);
    ui.stepIndicator.textContent = isLogin ? 'Step 1' : 'Step 2';
    ui.stepTitle.textContent = isLogin ? '账号登录' : (state.recoveryMode ? '恢复代码验证' : '二次验证');
    ui.stepSubtitle.textContent = isLogin
        ? '输入管理员账号与密码进入控制台'
        : (state.recoveryMode
            ? '输入一次性恢复代码以重置二次验证'
            : '输入认证器中的 6 位动态验证码完成登录');

    configureVerificationField();

    hideMessage();

    requestAnimationFrame(() => {
        if (isLogin) {
            ui.usernameInput.focus();
        } else {
            ui.totpInput.focus();
        }
    });
}

function setButtonLoading(button, loading, loadingText = '处理中...') {
    if (!button) return;
    if (loading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        const original = button.dataset.originalText;
        if (original) {
            button.textContent = original;
        }
        button.disabled = false;
    }
}

function persistLoginState() {
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', Date.now().toString());
}

function handleRedirect() {
    setTimeout(() => {
        window.location.href = 'dashboard.php';
    }, 900);
}

function handleLoginSuccess(message) {
    state.pendingTwoFaToken = null;
    state.recoveryMode = false;
    ui.rememberDevice.checked = false;
    ui.totpInput.value = '';
    showMessage('success', message || '登录成功，正在跳转后台...');
    persistLoginState();
    handleRedirect();
}

async function submitLogin(event) {
    event.preventDefault();
    hideMessage();

    const username = ui.usernameInput.value.trim();
    const password = ui.passwordInput.value;

    if (!username) {
        showMessage('error', '请输入管理员账号');
        ui.usernameInput.focus();
        return;
    }

    if (!password) {
        showMessage('error', '请输入密码');
        ui.passwordInput.focus();
        return;
    }

    setButtonLoading(ui.loginButton, true, '正在验证...');

    try {
        const response = await fetch(endpoints.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `登录失败（${response.status}）`);
        }

        if (data.requires2fa) {
            state.pendingTwoFaToken = data.twoFactorToken || null;
            state.lastUsername = username;
            state.recoveryMode = false;
            switchStep('totp');
            showMessage('info', data.message || '账号已开启二次验证，请输入动态验证码');
        } else if (data.success) {
            handleLoginSuccess(data.message);
        } else {
            throw new Error(data.message || '登录失败，请检查账号与密码');
        }
    } catch (error) {
        showMessage('error', error.message || '网络异常，请稍后重试');
    } finally {
        setButtonLoading(ui.loginButton, false);
    }
}

const totpPattern = /^\d{6}$/;
const recoveryPattern = /^[0-9A-F]{6}-[0-9A-F]{6}$/;

async function submitTwoFactor(event) {
    event.preventDefault();
    hideMessage();

    if (!state.pendingTwoFaToken) {
        showMessage('warning', '登录会话已过期，请重新登录');
        switchStep('login');
        return;
    }

    let code = ui.totpInput.value.trim();

    if (state.recoveryMode) {
        code = code.toUpperCase();
        ui.totpInput.value = code;
    }

    const isValid = state.recoveryMode ? recoveryPattern.test(code) : totpPattern.test(code);

    if (!code || !isValid) {
        showMessage('error', state.recoveryMode ? '请输入符合格式的恢复代码，例如 F9AF69-FB2025' : '请输入 6 位数字验证码');
        ui.totpInput.focus();
        return;
    }

    setButtonLoading(ui.totpButton, true, '正在验证...');

    try {
        const endpoint = state.recoveryMode ? endpoints.verifyRecovery : endpoints.verify2fa;
        const payload = {
            token: state.pendingTwoFaToken,
            rememberDevice: Boolean(ui.rememberDevice.checked)
        };

        if (state.recoveryMode) {
            payload.recoveryCode = code;
        } else {
            payload.code = code;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = data.message || '二次验证失败';
            if (response.status === 440 || response.status === 423 || (response.status === 400 && message.includes('重新登录'))) {
                state.pendingTwoFaToken = null;
                state.recoveryMode = false;
                ui.rememberDevice.checked = false;
                ui.totpInput.value = '';
                switchStep('login');
                showMessage('warning', message);
                return;
            }
            throw new Error(message);
        }

        if (data.success) {
            handleLoginSuccess(data.message || '验证通过，欢迎回来');
        } else if (data.requireRecovery) {
            state.recoveryMode = true;
            ui.rememberDevice.checked = false;
            ui.totpInput.value = '';
            switchStep('totp');
            showMessage('warning', data.message || '需要使用恢复代码完成验证');
        } else {
            throw new Error(data.message || '验证码不正确，请重新输入');
        }
    } catch (error) {
        showMessage('error', error.message || '网络异常，请稍后重试');
    } finally {
        setButtonLoading(ui.totpButton, false);
    }
}

async function checkExistingSession() {
    try {
        const response = await fetch(endpoints.checkSession, { credentials: 'include' });
        const data = await response.json().catch(() => ({}));

        if (response.ok && data.loggedIn) {
            showMessage('success', '检测到已登录，会自动跳转');
            persistLoginState();
            await delay(600);
            handleRedirect();
        }
    } catch (_) {
        // 忽略网络错误，继续正常流程
    }
}

function activateRecoveryMode() {
    if (!state.pendingTwoFaToken) {
        showMessage('warning', '请先完成账号密码登录');
        return;
    }
    state.recoveryMode = true;
    ui.rememberDevice.checked = false;
    ui.totpInput.value = '';
    switchStep('totp');
}

function initEventListeners() {
    ui.loginForm.addEventListener('submit', submitLogin);
    ui.totpForm.addEventListener('submit', submitTwoFactor);

    ui.backToLogin.addEventListener('click', () => {
        state.pendingTwoFaToken = null;
        state.recoveryMode = false;
        ui.totpInput.value = '';
        ui.rememberDevice.checked = false;
        switchStep('login');
    });

    ui.totpInput.addEventListener('input', handleVerificationInput);

    ui.useRecovery.addEventListener('click', activateRecoveryMode);

    ui.forgotPassword.addEventListener('click', activateRecoveryMode);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !ui.loginForm.classList.contains('is-hidden')) {
            hideMessage();
        }
    });
}

function init() {
    initEventListeners();
    configureVerificationField();
    switchStep('login');
    checkExistingSession();
}

document.addEventListener('DOMContentLoaded', init);
