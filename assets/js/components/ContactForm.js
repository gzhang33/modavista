/**
 * 联系表单管理器
 * 处理联系表单的提交和验证
 */
export class ContactForm {
    constructor() {
        this.form = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        // 创建联系表单HTML
        this.createContactForm();
        this.bindEvents();
    }

    createContactForm() {
        // 找到联系区域
        const contactSection = document.getElementById('contact-us');
        if (!contactSection) return;

        // 创建表单HTML
        const formHTML = `
            <div class="contact-form-container" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Invia un Messaggio</h3>
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
                        <textarea id="contact-message" name="message" rows="5" required 
                                  placeholder="Descrivi la tua richiesta o interesse per i nostri prodotti..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" id="contact-submit">
                        <span class="btn-text">Invia Messaggio</span>
                        <span class="btn-loading" style="display: none;">Invio in corso...</span>
                    </button>
                </form>
                <div id="contact-message" class="contact-message" style="display: none;"></div>
            </div>
        `;

        // 添加表单到联系区域
        contactSection.insertAdjacentHTML('beforeend', formHTML);

        // 添加样式
        this.addFormStyles();
    }

    addFormStyles() {
        if (document.getElementById('contact-form-styles')) return;

        const styles = `
        <style id="contact-form-styles">
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid #e9ecef;
        }

        .form-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .form-row .form-group {
            flex: 1;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .contact-form .btn {
            background: #007bff;
            color: white;
            padding: 0.875rem 2rem;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.3s ease;
            width: 100%;
        }

        .contact-form .btn:hover:not(:disabled) {
            background: #0056b3;
        }

        .contact-form .btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }

        .contact-message {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
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
            
            .contact-form {
                padding: 1rem;
            }
        }
        </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        // 等待表单创建后绑定事件
        setTimeout(() => {
            this.form = document.getElementById('contact-form');
            if (this.form) {
                this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        }, 100);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.setButtonLoading(true);

        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            company: formData.get('company') || '',
            message: formData.get('message')
        };

        try {
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showMessage('Messaggio inviato con successo! Ti risponderemo presto.', 'success');
                this.form.reset();
            } else {
                throw new Error(result.message || 'Errore durante l\'invio del messaggio');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showMessage(
                'Errore durante l\'invio del messaggio. Riprova più tardi o contattaci direttamente.', 
                'error'
            );
        } finally {
            this.isSubmitting = false;
            this.setButtonLoading(false);
        }
    }

    setButtonLoading(loading) {
        const submitBtn = document.getElementById('contact-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('contact-message');
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

// 自动初始化联系表单
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ContactForm());
} else {
    new ContactForm();
}

export default ContactForm;