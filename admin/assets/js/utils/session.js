export function handle_session_expired(eventBus) {
    // 这个函数现在由SessionManager替代
    // 保留用于向后兼容
    if (eventBus && typeof eventBus.emit === 'function') {
        eventBus.emit('toast:show', {
            message: '您的登录已过期，将自动跳转到登录页面',
            type: 'warning'
        });
    }
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2500);
}


