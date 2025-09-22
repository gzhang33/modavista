import EventBus from './components/shared/EventBus.js';
import SessionManager from './utils/sessionManager.js';
import apiClient from './utils/apiClient.js';

const eventBus = new EventBus();
const sessionManager = new SessionManager(eventBus);
apiClient.setSessionManager(sessionManager);

const state = {
  csrfToken: null,
  totpEnabled: false,
  hasPending: false,
  pendingSecret: null,
  pendingOtpAuth: null,
  pendingQrDataUri: null,
  recoveryCodesCount: 0,
};

const els = {
  statusPill: document.getElementById('totp-status-pill'),
  statusText: document.getElementById('totp-status-text'),
  generateBtn: document.getElementById('generate-secret-btn'),
  pendingCard: document.getElementById('pending-card'),
  pendingMessage: document.getElementById('pending-message'),
  secretField: document.getElementById('totp-secret'),
  copySecretBtn: document.getElementById('copy-secret-btn'),
  qrContainer: document.getElementById('qr-container'),
  otpField: document.getElementById('totp-code-input'),
  activateForm: document.getElementById('activate-form'),
  activateMessage: document.getElementById('activate-message'),
  recoveryCard: document.getElementById('recovery-card'),
  recoveryList: document.getElementById('recovery-codes-list'),
  recoveryNotice: document.getElementById('recovery-notice'),
  enabledCard: document.getElementById('enabled-card'),
  enabledMessage: document.getElementById('enabled-message'),
  regenToggleBtn: document.getElementById('toggle-regen-form'),
  regenForm: document.getElementById('regen-form'),
  regenMessage: document.getElementById('regen-message'),
  regenTotpInput: document.getElementById('regen-totp-input'),
  disableToggleBtn: document.getElementById('toggle-disable-form'),
  disableForm: document.getElementById('disable-form'),
  disableMessage: document.getElementById('disable-message'),
  disablePassword: document.getElementById('disable-password-input'),
  disableTotp: document.getElementById('disable-totp-input'),
  disableRecovery: document.getElementById('disable-recovery-input'),
  globalMessage: document.getElementById('global-message'),
  regenCountField: document.getElementById('regen-count-input'),
  recoverySummary: document.getElementById('recovery-summary'),
};

const selectors = {
  hidden: 'hidden',
  messageBase: 'message-box',
  messageActive: 'active',
  messageSuccess: 'success',
  messageError: 'error',
};

function setMessage(element, type, text) {
  if (!element) return;
  element.className = selectors.messageBase;
  if (!text) {
    element.textContent = '';
    return;
  }
  element.classList.add(selectors.messageActive);
  element.classList.add(type === 'success' ? selectors.messageSuccess : selectors.messageError);
  element.textContent = text;
}

function toggleVisibility(element, show) {
  if (!element) return;
  if (show) {
    element.classList.remove(selectors.hidden);
  } else {
    element.classList.add(selectors.hidden);
  }
}

function chunkSecret(secret) {
  return secret.replace(/(.{4})/g, ' ').trim();
}

async function parseErrorMessage(error, fallback = '请求失败，请稍后重试') {
  if (!error) return fallback;
  if (error.message === 'SESSION_EXPIRED') {
    return '登录状态已过期，请重新登录';
  }
  if (error.response) {
    try {
      const data = await error.response.json();
      if (data && typeof data.message === 'string' && data.message.trim() !== '') {
        return data.message.trim();
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  if (error.message) {
    return error.message;
  }
  return fallback;
}

function updateStatusPill() {
  if (!els.statusPill) return;
  els.statusPill.textContent = state.totpEnabled ? '已启用' : '未启用';
  if (state.totpEnabled) {
    els.statusPill.classList.remove('inactive');
  } else {
    els.statusPill.classList.add('inactive');
  }
  if (els.statusText) {
    els.statusText.textContent = state.totpEnabled
      ? '您的管理员账户已经启用二步验证。'
      : '二步验证尚未启用，建议立即配置以提升后台安全性。';
  }
}

function renderPendingSetup(payload) {
  state.hasPending = true;
  state.pendingSecret = payload.secret;
  state.pendingOtpAuth = payload.otpauth_url;
  state.pendingQrDataUri = payload.qr_svg_data_uri;

  if (els.secretField) {
    els.secretField.textContent = payload.secret ? chunkSecret(payload.secret) : '';
  }
  if (els.qrContainer) {
    if (payload.qr_svg_data_uri) {
      els.qrContainer.innerHTML = '<img src="' + payload.qr_svg_data_uri + '" alt="2FA QR Code" />';
    } else {
      els.qrContainer.innerHTML = '<p class="text-gray">二维码生成失败，请重新生成。</p>';
    }
  }
  if (els.otpField) {
    els.otpField.value = '';
    els.otpField.focus();
  }
  toggleVisibility(els.pendingCard, true);
  setMessage(els.pendingMessage, 'success', '扫描二维码或手动输入密钥后，输入动态验证码完成绑定。');
}

function clearPendingSetup() {
  state.hasPending = false;
  state.pendingSecret = null;
  state.pendingOtpAuth = null;
  state.pendingQrDataUri = null;
  toggleVisibility(els.pendingCard, false);
  if (els.secretField) {
    els.secretField.textContent = '';
  }
  if (els.qrContainer) {
    els.qrContainer.innerHTML = '';
  }
  if (els.otpField) {
    els.otpField.value = '';
  }
}

function renderRecoveryCodes(codes = [], title = '请妥善保管以下恢复代码：') {
  if (!els.recoveryList || !Array.isArray(codes)) return;
  if (codes.length === 0) {
    toggleVisibility(els.recoveryCard, false);
    return;
  }
  els.recoveryList.innerHTML = '';
  codes.forEach(code => {
    const li = document.createElement('li');
    li.className = 'recovery-code';
    li.textContent = code;
    els.recoveryList.appendChild(li);
  });
  if (els.recoveryNotice) {
    els.recoveryNotice.textContent = title;
  }
  toggleVisibility(els.recoveryCard, true);
}

function resetForms() {
  if (els.otpField) els.otpField.value = '';
  if (els.regenTotpInput) els.regenTotpInput.value = '';
  if (els.regenCountField) els.regenCountField.value = '10';
  if (els.disablePassword) els.disablePassword.value = '';
  if (els.disableTotp) els.disableTotp.value = '';
  if (els.disableRecovery) els.disableRecovery.value = '';
  toggleVisibility(els.regenForm, false);
  toggleVisibility(els.disableForm, false);
}

async function refreshStatus(showMessages = false) {
  try {
    const data = await apiClient.get('/generate_2fa_secret.php');
    state.totpEnabled = Boolean(data.totp_enabled);
    state.hasPending = Boolean(data.has_pending_setup);
    state.recoveryCodesCount = data.recovery_codes_count || 0;
    state.csrfToken = data.csrf_token || state.csrfToken;

    updateStatusPill();

    if (state.totpEnabled) {
      toggleVisibility(els.enabledCard, true);
      if (els.recoverySummary) {
        els.recoverySummary.textContent = state.recoveryCodesCount > 0
          ? '已保存 ' + state.recoveryCodesCount + ' 个恢复代码'
          : '尚未生成恢复代码';
      }
      clearPendingSetup();
    } else {
      toggleVisibility(els.enabledCard, false);
    }

    if (!state.totpEnabled && state.hasPending && data.secret) {
      renderPendingSetup(data);
    } else if (!state.totpEnabled) {
      clearPendingSetup();
    }

    if (showMessages) {
      const msg = state.totpEnabled
        ? '当前已启用二步验证。'
        : '当前未启用二步验证，请按照步骤完成绑定。';
      setMessage(els.globalMessage, 'success', msg);
    } else {
      setMessage(els.globalMessage, null, '');
    }
  } catch (error) {
    const message = await parseErrorMessage(error);
    setMessage(els.globalMessage, 'error', message);
  }
}

async function generateSecret() {
  if (!els.generateBtn) return;
  els.generateBtn.disabled = true;
  setMessage(els.globalMessage, null, '');
  setMessage(els.pendingMessage, null, '');
  try {
    const body = state.csrfToken ? { csrf_token: state.csrfToken } : {};
    const data = await apiClient.post('/generate_2fa_secret.php', body);
    state.csrfToken = data.csrf_token || state.csrfToken;
    renderPendingSetup(data);
    setMessage(els.globalMessage, 'success', '已生成新的绑定二维码，请完成后续步骤。');
  } catch (error) {
    const message = await parseErrorMessage(error, '无法生成绑定信息，请稍后再试');
    setMessage(els.globalMessage, 'error', message);
  } finally {
    els.generateBtn.disabled = false;
  }
}

async function activateTotp(event) {
  event.preventDefault();
  if (!els.otpField) return;
  const code = els.otpField.value.trim();
  if (code.length === 0) {
    setMessage(els.activateMessage, 'error', '请输入 6 位动态验证码。');
    return;
  }
  setMessage(els.activateMessage, null, '');
  try {
    const payload = { totpCode: code };
    if (state.csrfToken) payload.csrf_token = state.csrfToken;
    const data = await apiClient.post('/activate_2fa.php', payload);
    state.csrfToken = data.csrf_token || state.csrfToken;
    setMessage(els.activateMessage, 'success', '二步验证已成功启用。');
    renderRecoveryCodes(data.recovery_codes || [], '请立即保存以下恢复代码：');
    await refreshStatus();
  } catch (error) {
    const message = await parseErrorMessage(error, '验证码验证失败，请重试');
    setMessage(els.activateMessage, 'error', message);
  }
}

async function regenerateCodes(event) {
  event.preventDefault();
  if (!state.totpEnabled) {
    setMessage(els.regenMessage, 'error', '当前未启用二步验证。');
    return;
  }
  const code = els.regenTotpInput ? els.regenTotpInput.value.trim() : '';
  if (code.length === 0) {
    setMessage(els.regenMessage, 'error', '请输入当前动态验证码。');
    return;
  }
  const countValue = parseInt(els.regenCountField ? els.regenCountField.value : '10', 10);
  const count = Number.isFinite(countValue) ? Math.min(Math.max(countValue, 1), 20) : 10;
  setMessage(els.regenMessage, null, '');
  try {
    const payload = { totpCode: code, count: count };
    if (state.csrfToken) payload.csrf_token = state.csrfToken;
    const data = await apiClient.post('/regenerate_recovery_codes.php', payload);
    state.csrfToken = data.csrf_token || state.csrfToken;
    renderRecoveryCodes(data.recovery_codes || [], '已生成新的恢复代码，请立即保存：');
    setMessage(els.regenMessage, 'success', '恢复代码已更新。');
    if (els.regenTotpInput) els.regenTotpInput.value = '';
    await refreshStatus();
  } catch (error) {
    const message = await parseErrorMessage(error, '恢复代码生成失败，请重试');
    setMessage(els.regenMessage, 'error', message);
  }
}

async function disableTotp(event) {
  event.preventDefault();
  const password = els.disablePassword ? els.disablePassword.value : '';
  const totpCode = els.disableTotp ? els.disableTotp.value.trim() : '';
  const recoveryCode = els.disableRecovery ? els.disableRecovery.value.trim() : '';

  if (!password) {
    setMessage(els.disableMessage, 'error', '请填写账户密码以确认操作。');
    return;
  }

  if (!totpCode && !recoveryCode) {
    setMessage(els.disableMessage, 'error', '请输入动态验证码或恢复代码。');
    return;
  }

  setMessage(els.disableMessage, null, '');
  try {
    const payload = {
      password: password,
      totpCode: totpCode,
      recoveryCode: recoveryCode,
    };
    if (state.csrfToken) payload.csrf_token = state.csrfToken;
    const data = await apiClient.post('/disable_2fa.php', payload);
    state.csrfToken = data.csrf_token || state.csrfToken;
    setMessage(els.disableMessage, 'success', '二步验证已关闭。');
    renderRecoveryCodes([], '');
    resetForms();
    await refreshStatus(true);
  } catch (error) {
    const message = await parseErrorMessage(error, '关闭二步验证失败，请检查信息后重试');
    setMessage(els.disableMessage, 'error', message);
  }
}

function bindEvents() {
  if (els.generateBtn) {
    els.generateBtn.addEventListener('click', generateSecret);
  }
  if (els.copySecretBtn) {
    els.copySecretBtn.addEventListener('click', async () => {
      if (!state.pendingSecret) return;
      try {
        await navigator.clipboard.writeText(state.pendingSecret);
        setMessage(els.pendingMessage, 'success', '密钥已复制到剪贴板。');
      } catch (error) {
        setMessage(els.pendingMessage, 'error', '无法复制密钥，请手动复制。');
      }
    });
  }
  if (els.activateForm) {
    els.activateForm.addEventListener('submit', activateTotp);
  }
  if (els.regenToggleBtn && els.regenForm) {
    els.regenToggleBtn.addEventListener('click', () => {
      const next = els.regenForm.classList.contains(selectors.hidden);
      toggleVisibility(els.regenForm, next);
      if (next && els.regenTotpInput) {
        els.regenTotpInput.focus();
      }
    });
  }
  if (els.regenForm) {
    els.regenForm.addEventListener('submit', regenerateCodes);
  }
  if (els.disableToggleBtn && els.disableForm) {
    els.disableToggleBtn.addEventListener('click', () => {
      const next = els.disableForm.classList.contains(selectors.hidden);
      toggleVisibility(els.disableForm, next);
      if (next && els.disablePassword) {
        els.disablePassword.focus();
      }
    });
  }
  if (els.disableForm) {
    els.disableForm.addEventListener('submit', disableTotp);
  }
}

window.addEventListener('beforeunload', function () {
  sessionManager.destroy();
});

bindEvents();
refreshStatus(true);
