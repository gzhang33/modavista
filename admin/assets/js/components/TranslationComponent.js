// admin/assets/js/components/TranslationComponent.js
import BaseComponent from './BaseComponent.js';
import apiClient from '../utils/apiClient.js';

export default class TranslationComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        
        this.state = {
            isTranslating: false,
            translations: {},
            sourceLanguage: 'cn',
            targetLanguages: ['en', 'de', 'fr', 'it', 'es'],
            supportedLanguages: {
                cn: '中文',
                it: '意大利语',
                en: '英语',
                de: '德语',
                fr: '法语',
                es: '西班牙语'
            }
        };

        this.initComponent();
    }

    initComponent() {
        if (!this.element) return;

        this.render();
        this.bindEvents();
    }

    render() {
        this.element.innerHTML = `
            <div class="translation">
                <div class="translation__header">
                    <h3 class="translation__title">多语言翻译</h3>
                    <p class="translation__description">
                        自动生成产品名称和描述的多语言版本
                    </p>
                </div>

                <div class="translation__controls">
                    <div class="translation__source">
                        <label class="translation__label">源语言:</label>
                        <select class="translation__source-select">
                            <option value="cn">中文</option>
                            <option value="it">意大利语</option>
                            <option value="en">英语</option>
                        </select>
                    </div>

                    <div class="translation__targets">
                        <label class="translation__label">目标语言:</label>
                        <div class="translation__target-info">
                            <span class="translation__target-text">英语、德语、法语、意大利语、西班牙语</span>
                        </div>
                    </div>

                    <button class="translation__generate-btn btn btn--primary">
                        <span class="translation__btn-text">生成多语言版本</span>
                        <div class="translation__loading hidden">
                            <span class="translation__loading-text">翻译中...</span>
                            <div class="translation__progress">
                                <div class="translation__progress-bar"></div>
                            </div>
                        </div>
                    </button>
                </div>

                <div class="translation__results hidden">
                    <h4 class="translation__results-title">翻译预览</h4>
                    <div class="translation__results-content">
                        <!-- 翻译结果将动态插入这里 -->
                    </div>
                    
                    <div class="translation__actions">
                        <button class="translation__apply-btn btn btn--success">应用翻译</button>
                        <button class="translation__cancel-btn btn btn--secondary">取消</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const generateBtn = this.element.querySelector('.translation__generate-btn');
        const sourceSelect = this.element.querySelector('.translation__source-select');
        const applyBtn = this.element.querySelector('.translation__apply-btn');
        const cancelBtn = this.element.querySelector('.translation__cancel-btn');

        generateBtn?.addEventListener('click', () => this.handleGenerateTranslation());
        sourceSelect?.addEventListener('change', (e) => this.handleSourceLanguageChange(e));
        applyBtn?.addEventListener('click', () => this.handleApplyTranslations());
        cancelBtn?.addEventListener('click', () => this.handleCancelTranslations());
    }

    handleSourceLanguageChange(event) {
        this.state.sourceLanguage = event.target.value;
        // 自动更新目标语言列表，排除源语言
        this.updateTargetLanguages();
    }

    updateTargetLanguages() {
        const allLanguages = ['en', 'de', 'fr', 'it', 'es'];
        this.state.targetLanguages = allLanguages.filter(lang => lang !== this.state.sourceLanguage);
    }

    async handleGenerateTranslation() {
        if (this.state.isTranslating) return;

        const content = this.getContentToTranslate();
        if (!content.name && !content.description) {
            this.showError('请填写产品名称或描述后再生成翻译');
            return;
        }

        if (this.state.targetLanguages.length === 0) {
            this.showError('请至少选择一种目标语言');
            return;
        }

        this.startTranslation();

        try {
            const response = await this.callTranslationAPI(content);
            this.handleTranslationSuccess(response);
        } catch (error) {
            this.handleTranslationError(error);
        } finally {
            this.endTranslation();
        }
    }

    getContentToTranslate() {
        // 从页面表单获取内容
        const nameInput = document.querySelector('input[name="base_name"], input[name="name"]');
        const descriptionInput = document.querySelector('textarea[name="description"]');

        return {
            name: nameInput?.value?.trim() || '',
            description: descriptionInput?.value?.trim() || ''
        };
    }

    async callTranslationAPI(content) {
        const requestData = {
            action: 'translate_product',
            content: content,
            source_language: this.state.sourceLanguage,
            target_languages: this.state.targetLanguages,
            product_id: this.getProductId()
        };

        return await apiClient.post('/translation.php', requestData);
    }

    getProductId() {
        // 尝试从页面URL或表单中获取产品ID
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || urlParams.get('product_id');
        if (productId) return parseInt(productId);

        const idInput = document.querySelector('input[name="id"], input[name="product_id"]');
        return idInput?.value ? parseInt(idInput.value) : null;
    }

    startTranslation() {
        this.state.isTranslating = true;
        const btn = this.element.querySelector('.translation__generate-btn');
        const btnText = btn.querySelector('.translation__btn-text');
        const loading = btn.querySelector('.translation__loading');

        btn.disabled = true;
        btnText.classList.add('hidden');
        loading.classList.remove('hidden');

        this.hideResults();
        this.animateProgress();
    }

    endTranslation() {
        this.state.isTranslating = false;
        const btn = this.element.querySelector('.translation__generate-btn');
        const btnText = btn.querySelector('.translation__btn-text');
        const loading = btn.querySelector('.translation__loading');

        btn.disabled = false;
        btnText.classList.remove('hidden');
        loading.classList.add('hidden');

        this.stopProgressAnimation();
    }

    animateProgress() {
        const progressBar = this.element.querySelector('.translation__progress-bar');
        if (!progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            
            progressBar.style.width = `${progress}%`;
            
            if (!this.state.isTranslating) {
                clearInterval(interval);
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 500);
            }
        }, 200);
    }

    stopProgressAnimation() {
        // Progress animation is handled in animateProgress method
    }

    handleTranslationSuccess(response) {
        if (response.success && response.data?.translations) {
            this.state.translations = response.data.translations;
            this.renderTranslationResults();
            this.showResults();
            this.eventBus.emit('translation:generated', response.data.translations);
        } else {
            this.showError('翻译结果格式错误');
        }
    }

    handleTranslationError(error) {
        console.error('Translation error:', error);
        let message = '翻译请求失败';
        
        if (error.message?.includes('SESSION_EXPIRED')) {
            message = '会话已过期，请重新登录';
        } else if (error.message) {
            message = error.message;
        }
        
        this.showError(message);
        this.eventBus.emit('translation:error', error);
    }

    renderTranslationResults() {
        const resultsContent = this.element.querySelector('.translation__results-content');
        if (!resultsContent) return;

        let html = '';
        
        Object.entries(this.state.translations).forEach(([contentType, languages]) => {
            if (Object.keys(languages).length === 0) return;
            
            const isName = contentType === 'name';
            const gridClass = isName ? 'translation__result-grid--3col' : 'translation__result-grid--2col';
            
            html += `
                <div class="translation__result-group">
                    <h5 class="translation__result-type">
                        ${isName ? '产品名称' : '产品描述'}
                    </h5>
                    <div class="translation__result-grid ${gridClass}">
            `;
            
            Object.entries(languages).forEach(([lang, text]) => {
                const langName = this.state.supportedLanguages[lang] || lang;
                html += `
                    <div class="translation__result-item">
                        <div class="translation__result-header">
                            <span class="translation__result-lang">${langName}</span>
                            <button class="translation__edit-btn" data-content="${contentType}" data-lang="${lang}">
                                编辑
                            </button>
                        </div>
                        <div class="translation__result-text" data-content="${contentType}" data-lang="${lang}">
                            ${this.escapeHtml(text)}
                        </div>
                        <textarea class="translation__edit-input hidden" data-content="${contentType}" data-lang="${lang}">${this.escapeHtml(text)}</textarea>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });

        resultsContent.innerHTML = html;
        
        // 绑定编辑按钮事件
        resultsContent.querySelectorAll('.translation__edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditTranslation(e));
        });
    }

    handleEditTranslation(event) {
        const btn = event.target;
        const contentType = btn.dataset.content;
        const lang = btn.dataset.lang;
        const textDiv = this.element.querySelector(`.translation__result-text[data-content="${contentType}"][data-lang="${lang}"]`);
        const textarea = this.element.querySelector(`.translation__edit-input[data-content="${contentType}"][data-lang="${lang}"]`);
        
        if (btn.textContent === '编辑') {
            textDiv.classList.add('hidden');
            textarea.classList.remove('hidden');
            textarea.focus();
            btn.textContent = '保存';
        } else {
            // 保存编辑
            const newText = textarea.value.trim();
            if (newText) {
                this.state.translations[contentType][lang] = newText;
                textDiv.textContent = newText;
            }
            
            textDiv.classList.remove('hidden');
            textarea.classList.add('hidden');
            btn.textContent = '编辑';
        }
    }

    showResults() {
        const results = this.element.querySelector('.translation__results');
        results?.classList.remove('hidden');
    }

    hideResults() {
        const results = this.element.querySelector('.translation__results');
        results?.classList.add('hidden');
    }

    handleApplyTranslations() {
        this.eventBus.emit('translation:apply', this.state.translations);
        this.hideResults();
        this.showSuccess('翻译已应用到表单');
    }

    handleCancelTranslations() {
        this.state.translations = {};
        this.hideResults();
    }

    showError(message) {
        this.eventBus.emit('toast:show', {
            type: 'error',
            message: message
        });
    }

    showSuccess(message) {
        this.eventBus.emit('toast:show', {
            type: 'success',
            message: message
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 公共API方法
    getTranslations() {
        return this.state.translations;
    }

    clearTranslations() {
        this.state.translations = {};
        this.hideResults();
    }

    setSourceLanguage(language) {
        if (this.state.supportedLanguages[language]) {
            this.state.sourceLanguage = language;
            const sourceSelect = this.element.querySelector('.translation__source-select');
            if (sourceSelect) {
                sourceSelect.value = language;
                this.updateTargetLanguageOptions();
            }
        }
    }

}
