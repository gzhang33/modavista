export function handle_session_expired(eventBus) {
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('toast:show', {
            message: '您的登录已过期，将自动跳转到登录页面',
            type: 'warning'
        });
    }
    setTimeout(() => {
        window.location.href = '/admin/login.html';
    }, 2500);
}


