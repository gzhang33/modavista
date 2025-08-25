/**
 * 联系表单管理器
 * 处理联系表单的提交和验证
 */
export class ContactForm {
    constructor() {
        this.contactButton = null;
        this.contactForm = null;
        this.isExpanded = false;
        this.init();
    }

    init() {
        // 创建可展开的联系表单
        this.createExpandableContactForm();
        this.bindEvents();
    }

    createExpandableContactForm() {
        // 找到联系区域
        const contactSection = document.getElementById('contact-us');
        if (!contactSection) return;

        // 创建可展开的联系表单
        const formHTML = `
            <div class="expandable-contact-form" style="margin-top: 2rem;">
                <!-- 触发按钮 -->
                <div class="contact-form-trigger" id="contact-form-trigger">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>Invia un Messaggio</span>
                    <svg class="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                <!-- 按钮容器，确保可点击区域和布局 -->
                <div role="group" aria-label="Contact actions" style="margin-top:8px"></div>

                </div>

                <!-- 表单容器 -->
                <div class="contact-form-container" id="contact-form-container">
                    <form id="contact-form" class="contact-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contact-name">Nome *</label>
                                <input type="text" id="contact-name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="contact-email">Email *</label>
                                <input type="email" id="contact-email" name="email" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contact-phone">Telefono</label>
                                <input type="tel" id="contact-phone" name="phone">
                            </div>
                            <div class="form-group">
                                <label for="contact-company">Azienda</label>
                                <input type="text" id="contact-company" name="company">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="contact-message">Messaggio *</label>
                            <textarea id="contact-message" name="message" rows="4" required
                                      placeholder="Descrivi la tua richiesta o interesse per i nostri prodotti..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="contact-cancel">Annulla</button>
                            <button type="submit" class="btn btn-primary" id="contact-submit">
                                <span class="btn-text">Invia Messaggio</span>
                                <span class="btn-loading" style="display: none;">Invio in corso...</span>
                            </button>
                        </div>
                    </form>
                    <div id="contact-message" class="contact-message" style="display: none;"></div>
                </div>
            </div>
        `;

        // 添加表单到联系区域
        contactSection.insertAdjacentHTML('beforeend', formHTML);

        // 获取元素引用
        this.contactButton = document.getElementById('contact-form-trigger');
        this.contactForm = document.getElementById('contact-form-container');

        // 添加样式
        this.addFormStyles();
    }



    bindEvents() {
        // 绑定触发按钮事件
        if (this.contactButton) {
            this.contactButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForm();
            });
        }

        // 绑定表单事件
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // 绑定取消按钮事件
        const cancelButton = document.getElementById('contact-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.collapseForm());
        }

        // 绑定ESC键关闭表单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.collapseForm();
            }
        });
    }

    toggleForm() {
        if (this.isExpanded) {
            this.collapseForm();
        } else {
            this.expandForm();
        }
    }

    expandForm() {
        if (!this.contactForm) return;

        this.isExpanded = true;
        this.contactForm.classList.add('expanded');

        // 更新图标
        const icon = this.contactButton.querySelector('.expand-icon');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }

        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = document.getElementById('contact-name');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    collapseForm() {
        if (!this.contactForm) return;

        this.isExpanded = false;
        this.contactForm.classList.remove('expanded');

        // 重置图标
        const icon = this.contactButton.querySelector('.expand-icon');
        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }

        // 清空表单
        const form = document.getElementById('contact-form');
        if (form) {
            form.reset();
        }

        // 隐藏消息
        const messageDiv = document.getElementById('contact-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitBtn = document.getElementById('contact-submit');
        const loadingSpan = submitBtn?.querySelector('.btn-loading');
        const textSpan = submitBtn?.querySelector('.btn-text');

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            company: form.company.value.trim(),
            message: form.message.value.trim(),
        };

        // 简单前端校验
        if (!payload.name || !payload.email || !payload.message) {
            this.showMessage('Per favore compila i campi obbligatori.', 'error');
            return;
        }

        try {
            if (submitBtn) submitBtn.disabled = true;
            if (loadingSpan) loadingSpan.style.display = 'inline';
            if (textSpan) textSpan.style.display = 'none';

            const res = await fetch('/api/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || 'Invio fallito, riprova.');
            }

            this.showMessage(data?.message || 'Messaggio inviato con successo! Ti risponderemo presto.', 'success');

            setTimeout(() => {
                this.collapseForm();
            }, 2000);
        } catch (err) {
            this.showMessage(err.message || 'Errore di rete, riprova più tardi.', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (loadingSpan) loadingSpan.style.display = 'none';
            if (textSpan) textSpan.style.display = 'inline';
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('contact-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `contact-message ${type}`;
            messageDiv.style.display = 'block';

            // 自动隐藏成功消息
            if (type === 'success') {
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }
        }
    }

    addFormStyles() {
        if (document.getElementById('expandable-contact-form-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'expandable-contact-form-styles';
        styles.textContent = `
            .expandable-contact-form {
                max-width: 600px;
                margin: 0 auto;
            }

            .contact-form-trigger {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                background: var(--primary-black);
                color: var(--primary-white);
                border: none;
                border-radius: 12px;
                padding: 16px 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                font-weight: 600;
                text-decoration: none;
            }

            .contact-form-trigger:hover {
                background: #333;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }

            .expand-icon {
                transition: transform 0.3s ease;
            }

            .contact-form-container {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.4s ease, padding 0.4s ease;
                background: rgba(255,255,255,0.95);
                border-radius: 0 0 12px 12px;
                margin-top: -12px;
                padding: 0 24px;
            }

            .contact-form-container.expanded {
                max-height: 600px;
                padding: 24px;
                border: 1px solid rgba(0,0,0,0.1);
            }

            .contact-form {
                background: transparent;
                padding: 0;
                border: none;
            }

            .form-row {
                display: flex;
                gap: 16px;
                margin-bottom: 16px;
            }

            .form-row .form-group {
                flex: 1;
            }

            .form-group {
                margin-bottom: 16px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }

            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }

            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--accent-color);
                box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
            }

            .form-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 20px;
            }

            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }

            .btn-primary {
                background: var(--accent-color);
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #ff5252;
                transform: translateY(-1px);
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background: #5a6268;
            }

            .btn:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
            }

            .contact-message {
                margin-top: 16px;
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                font-weight: 600;
                font-size: 14px;
            }

            .contact-message.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }

            .contact-message.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }

            @media (max-width: 768px) {
                .form-row {
                    flex-direction: column;
                    gap: 0;
                }

                .contact-form-trigger {
                    padding: 14px 20px;
                    font-size: 15px;
                }

                .contact-form-container.expanded {
                    padding: 20px;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}