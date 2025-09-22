(() => {
    const LOGOUT_ENDPOINT = '../api/logout.php';
    const LOGIN_PAGE = 'login.php';

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content) {
            return meta.content;
        }

        const input = document.querySelector('input[name="csrf_token"]');
        return input ? input.value : '';
    }

    async function performLogout(trigger) {
        const csrfToken = getCsrfToken();
        const headers = { 'Content-Type': 'application/json' };
        const body = {};

        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
            body.csrf_token = csrfToken;
        }

        if (trigger) {
            trigger.setAttribute('aria-busy', 'true');
            trigger.disabled = true;
        }

        try {
            const response = await fetch(LOGOUT_ENDPOINT, {
                method: 'POST',
                credentials: 'include',
                headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const message = data.message || '退出登录失败，请稍后再试';
                console.warn('Logout request failed:', message);
                alert(message);
                if (trigger) {
                    trigger.removeAttribute('aria-busy');
                    trigger.disabled = false;
                }
                return;
            }

            window.location.href = LOGIN_PAGE;
        } catch (error) {
            console.error('Logout request encountered an error:', error);
            alert('网络异常，无法完成退出。请稍后重试。');
            if (trigger) {
                trigger.removeAttribute('aria-busy');
                trigger.disabled = false;
            }
        }
    }

    function bindLogout(element, type) {
        if (!element || element.__logoutBound) return;
        element.__logoutBound = true;

        if (type === 'form') {
            element.addEventListener('submit', (event) => {
                event.preventDefault();
                performLogout(element.querySelector('button, input[type="submit"], [data-admin-logout-trigger]') || null);
            });
        } else {
            element.addEventListener('click', (event) => {
                event.preventDefault();
                performLogout(element);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const explicitTriggers = document.querySelectorAll('[data-admin-logout]');
        explicitTriggers.forEach((el) => {
            if (el.tagName === 'FORM') {
                bindLogout(el, 'form');
            } else {
                bindLogout(el, 'button');
            }
        });

        const fallbackForms = document.querySelectorAll('form[action$="logout.php"], form[action="../api/logout.php"]');
        fallbackForms.forEach((form) => bindLogout(form, 'form'));

        const fallbackLinks = document.querySelectorAll('a[href$="logout.php"], a[href="../api/logout.php"]');
        fallbackLinks.forEach((link) => bindLogout(link, 'button'));
    });
})();
