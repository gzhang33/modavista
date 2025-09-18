// admin/assets/js/utils/sessionManager.js - 增强的会话管理
import EventBus from '../components/shared/EventBus.js';

class SessionManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.checkInterval = null;
        this.isChecking = false;
        this.lastActivity = Date.now();
        
        this.init();
    }
    
    init() {
        // 监听用户活动
        this.setupActivityListeners();
        
        // 定期检查会话状态
        this.startSessionCheck();
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkSession();
            }
        });
    }
    
    setupActivityListeners() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, true);
        });
    }
    
    startSessionCheck() {
        // 每5分钟检查一次会话状态
        this.checkInterval = setInterval(() => {
            this.checkSession();
        }, 5 * 60 * 1000);
    }
    
    stopSessionCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
    
    async checkSession() {
        if (this.isChecking) return;
        
        this.isChecking = true;
        
        try {
            const response = await fetch('../api/check_session.php', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.loggedIn) {
                this.handleSessionExpired(data);
            } else {
                // 会话有效，更新最后活动时间
                this.lastActivity = Date.now();
            }
        } catch (error) {
            console.error('Session check failed:', error);
            // 网络错误时不处理，避免误判
        } finally {
            this.isChecking = false;
        }
    }
    
    handleSessionExpired(data) {
        this.stopSessionCheck();
        
        // 显示会话过期提示
        this.showSessionExpiredAlert(data.message || '登录已超时，请重新登录');
    }
    
    showSessionExpiredAlert(message) {
        // 创建模态对话框
        const modal = document.createElement('div');
        modal.className = 'session-expired-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-exclamation-triangle"></i> 登录超时</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <p>系统将自动跳转到登录页面...</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="window.location.href='login.html'">
                            <i class="fas fa-sign-in-alt"></i> 立即登录
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .session-expired-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-content {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                padding: 20px 20px 0;
                border-bottom: 1px solid #eee;
            }
            
            .modal-header h3 {
                margin: 0 0 15px;
                color: #e74c3c;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .modal-body {
                padding: 20px;
                color: #333;
                line-height: 1.5;
            }
            
            .modal-body p {
                margin: 0 0 10px;
            }
            
            .modal-footer {
                padding: 0 20px 20px;
                text-align: right;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                text-decoration: none;
                transition: background-color 0.2s;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // 3秒后自动跳转
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
    }
    
    // 手动检查会话（用于API调用失败时）
    async handleApiError(error) {
        if (error.message === 'SESSION_EXPIRED' || 
            (error.response && error.response.status === 401)) {
            await this.checkSession();
        }
    }
    
    destroy() {
        this.stopSessionCheck();
    }
}

// 导出会话管理器
export default SessionManager;
