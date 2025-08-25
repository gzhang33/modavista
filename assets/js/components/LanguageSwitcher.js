/**
 * 现代语言切换组件
 * 提供下拉菜单式的语言选择功能
 */
import BaseComponent from './BaseComponent.js';

export default class LanguageSwitcher extends BaseComponent {
    constructor(container) {
        super(container);
        this.currentLanguage = 'it-IT'; // 默认意大利语
        this.languages = [
            { code: 'en-GB', name: 'English', flag: 'en' },
            { code: 'it-IT', name: 'Italian', flag: 'it' },
            { code: 'fr-FR', name: 'French', flag: 'fr' },
            { code: 'de-DE', name: 'German', flag: 'de' },
            { code: 'es-ES', name: 'Spanish', flag: 'es' }
        ];

        // 多语言文本数据
        this.translations = this.initTranslations();

        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.loadSavedLanguage();
        this.translatePage();
    }

    initTranslations() {
        return {
            'it-IT': {
                'site_title': 'Collezione Moda',
                'site_description': 'Scopri la nostra collezione esclusiva di capi di moda premium',
                'nav_contact': 'Contatti',
                'nav_products': 'Tutti i Prodotti',
                'contact_description': 'Se hai domande o proposte di collaborazione, saremo felici di sentirti.',
                'footer_shop': 'Negozio',
                'footer_collection': 'Collezione',
                'footer_support': 'Assistenza Clienti',
                'footer_contact': 'Contattaci',
                'breadcrumb_home': 'Home',
                'breadcrumb_collection': 'Collezione'
            },
            'en-GB': {
                'site_title': 'Fashion Collection',
                'site_description': 'Discover our exclusive fashion collection with premium quality materials',
                'nav_contact': 'Contact',
                'nav_products': 'All Products',
                'contact_description': 'If you have questions or collaboration proposals, we would be happy to hear from you.',
                'footer_shop': 'Shop',
                'footer_collection': 'Collection',
                'footer_support': 'Customer Support',
                'footer_contact': 'Contact Us',
                'breadcrumb_home': 'Home',
                'breadcrumb_collection': 'Collection'
            },
            'de-DE': {
                'site_title': 'Mode Kollektion',
                'site_description': 'Entdecken Sie unsere exklusive Modekollektion mit hochwertigen Materialien',
                'nav_contact': 'Kontakt',
                'nav_products': 'Alle Produkte',
                'contact_description': 'Wenn Sie Fragen oder Kooperationsvorschläge haben, freuen wir uns auf Ihre Nachricht.',
                'footer_shop': 'Shop',
                'footer_collection': 'Kollektion',
                'footer_support': 'Kundensupport',
                'footer_contact': 'Kontakt',
                'breadcrumb_home': 'Startseite',
                'breadcrumb_collection': 'Kollektion'
            },
            'fr-FR': {
                'site_title': 'Collection Mode',
                'site_description': 'Découvrez notre collection exclusive de mode avec des matériaux de qualité premium',
                'nav_contact': 'Contact',
                'nav_products': 'Tous les Produits',
                'contact_description': 'Si vous avez des questions ou des propositions de collaboration, nous serions heureux de vous entendre.',
                'footer_shop': 'Boutique',
                'footer_collection': 'Collection',
                'footer_support': 'Support Client',
                'footer_contact': 'Nous Contacter',
                'breadcrumb_home': 'Accueil',
                'breadcrumb_collection': 'Collection'
            },
            'es-ES': {
                'site_title': 'Colección de Moda',
                'site_description': 'Descubre nuestra colección exclusiva de moda con materiales de calidad premium',
                'nav_contact': 'Contacto',
                'nav_products': 'Todos los Productos',
                'contact_description': 'Si tienes preguntas o propuestas de colaboración, estaremos encantados de escucharte.',
                'footer_shop': 'Tienda',
                'footer_collection': 'Colección',
                'footer_support': 'Atención al Cliente',
                'footer_contact': 'Contáctanos',
                'breadcrumb_home': 'Inicio',
                'breadcrumb_collection': 'Colección'
            }
        };
    }

    render() {
        const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);

        this.container.innerHTML = `
            <div class="language-switcher">
                <button class="language-switcher__trigger" aria-haspopup="true" aria-expanded="false">
                    <span class="language-switcher__flag language-switcher__flag--${currentLang.flag}"></span>
                    <span class="language-switcher__name">${currentLang.name}</span>
                    <svg class="language-switcher__arrow" width="12" height="12" viewBox="0 0 12 12">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    </svg>
                </button>
                <div class="language-switcher__dropdown">
                    ${this.languages.map(lang => `
                        <button class="language-switcher__option ${lang.code === this.currentLanguage ? 'active' : ''}"
                                data-lang="${lang.code}">
                            <span class="language-switcher__flag language-switcher__flag--${lang.flag}"></span>
                            <span class="language-switcher__name">${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('language-switcher-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'language-switcher-styles';
        styles.textContent = `
            .language-switcher {
                position: relative;
                display: inline-block;
            }

            .language-switcher__trigger {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: transparent;
                border: 1px solid rgba(0,0,0,0.1);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                color: var(--text-primary, #333);
            }

            .language-switcher__trigger:hover {
                background: rgba(0,0,0,0.05);
                border-color: rgba(0,0,0,0.2);
            }

            .language-switcher__flag {
                width: 20px;
                height: 14px;
                background-size: cover;
                background-position: 50% 50%;
                border-radius: 2px;
                display: inline-block;
            }
            .language-switcher__flag--en { background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 30%22%3E%3CclipPath id=%22a%22%3E%3Cpath d=%22M0,0 v30 h60 V0 z%22/%3E%3C/clipPath%3E%3Cg clip-path=%22url(%23a)%22%3E%3Cpath d=%22M0 0h60v30H0z%22 fill=%22%23012169%22/%3E%3Cpath d=%22M0 0L60 30m0-30L0 30%22 stroke=%22%23fff%22 stroke-width=%226%22/%3E%3Cpath d=%22M0 0L60 30m0-30L0 30%22 stroke=%22%23C8102E%22 stroke-width=%224%22/%3E%3Cpath d=%22M30 0v30M0 15h60%22 stroke=%22%23fff%22 stroke-width=%2210%22/%3E%3Cpath d=%22M30 0v30M0 15h60%22 stroke=%22%23C8102E%22 stroke-width=%226%22/%3E%3C/g%3E%3C/svg%3E'); }
            .language-switcher__flag--it { background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 2%22%3E%3Crect width=%223%22 height=%222%22 fill=%22%23009246%22/%3E%3Crect width=%222%22 height=%222%22 x=%221%22 fill=%22%23fff%22/%3E%3Crect width=%221%22 height=%222%22 x=%222%22 fill=%22%23CE2B37%22/%3E%3C/svg%3E'); }
            .language-switcher__flag--fr { background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 2%22%3E%3Crect width=%223%22 height=%222%22 fill=%22%23ED2939%22/%3E%3Crect width=%222%22 height=%222%22 x=%221%22 fill=%22%23fff%22/%3E%3Crect width=%221%22 height=%222%22 x=%222%22 fill=%22%23002395%22/%3E%3C/svg%3E'); }
            .language-switcher__flag--de { background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 5 3%22%3E%3Crect width=%225%22 height=%223%22 fill=%22%23FFCE00%22/%3E%3Crect width=%225%22 height=%222%22 y=%221%22 fill=%22%23D00%22/%3E%3Crect width=%225%22 height=%221%22 y=%222%22 fill=%22%23000%22/%3E%3C/svg%3E'); }


            .language-switcher__name {
                font-weight: 500;
            }

            .language-switcher__arrow {
                transition: transform 0.2s ease;
            }

            .language-switcher__trigger[aria-expanded="true"] .language-switcher__arrow {
                transform: rotate(180deg);
            }

            .language-switcher__dropdown {
                position: absolute;
                top: calc(100% + 6px);
                right: 0;
                min-width: 160px;
                background: #fff;
                border: 1px solid rgba(0,0,0,0.12);
                border-radius: 10px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px);
                transition: opacity .2s ease, transform .2s ease, visibility .2s ease;
                z-index: 9999; /* overlay above header and content */
                margin-top: 0;
                overflow: hidden;
            }

            .language-switcher__trigger[aria-expanded="true"] + .language-switcher__dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .language-switcher__option {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 10px 12px;
                background: none;
                border: none;
                cursor: pointer;
                transition: background-color 0.2s ease;
                font-size: 14px;
                color: var(--text-primary, #333);
            }

            .language-switcher__option:hover {
                background: rgba(0,0,0,0.05);
            }

            .language-switcher__option.active {
                background: rgba(0,0,0,0.1);
                font-weight: 600;
            }

            .language-switcher__option:first-child {
                border-radius: 7px 7px 0 0;
            }

            .language-switcher__option:last-child {
                border-radius: 0 0 7px 7px;
            }

            @media (max-width: 768px) {
                .language-switcher__name {
                    display: none;
                }

                .language-switcher__trigger {
                    padding: 6px 8px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        const trigger = this.container.querySelector('.language-switcher__trigger');
        const dropdown = this.container.querySelector('.language-switcher__dropdown');
        const options = this.container.querySelectorAll('.language-switcher__option');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Language selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const langCode = option.dataset.lang;
                this.changeLanguage(langCode);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        const trigger = this.container.querySelector('.language-switcher__trigger');
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const trigger = this.container.querySelector('.language-switcher__trigger');
        trigger.setAttribute('aria-expanded', 'true');
    }

    closeDropdown() {
        const trigger = this.container.querySelector('.language-switcher__trigger');
        trigger.setAttribute('aria-expanded', 'false');
    }

    changeLanguage(langCode) {
        if (langCode === this.currentLanguage) {
            this.closeDropdown();
            return;
        }

        this.currentLanguage = langCode;
        this.saveLanguage(langCode);
        this.render();
        this.setupEventListeners();

        // 翻译页面内容并同步全局翻译缓存
        this.translatePage();

        // 同步服务器会话/Cookie，便于后端记住语言（异步，忽略错误）
        fetch('/api/language.php?action=set_language', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language_code: langCode })
        }).catch(() => {});

        // Emit language change event（附带翻译数据，供其他组件使用）
        if (window.EventBus) {
            const payload = { language_code: langCode };
            if (window.__translations) { payload.translations = window.__translations; }
            window.EventBus.emit('language_changed', payload);
        }

        this.closeDropdown();
    }

    saveLanguage(langCode) {
        try {
            localStorage.setItem('preferred_language', langCode);
        } catch (e) {
            console.warn('Could not save language preference:', e);
        }
    }

    loadSavedLanguage() {
        try {
            const saved = localStorage.getItem('preferred_language');
            if (saved && this.languages.find(lang => lang.code === saved)) {
                this.currentLanguage = saved;
                this.render();
                this.setupEventListeners();
            }
        } catch (e) {
            console.warn('Could not load language preference:', e);
        }
    }

    async translatePage() {
        try {
            // 获取当前语言的所有翻译
            const translations = await this.fetchTranslations();
            // 缓存到全局，供其他组件即时使用
            window.__translations = translations;

            // 翻译所有带有data-translate属性的元素
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.placeholder = translations[key];
                    } else if (element.tagName === 'META') {
                        element.content = translations[key];
                    } else {
                        element.textContent = translations[key];
                    }
                }
            });

            // 更新页面标题
            if (translations['site_title']) {
                document.title = translations['site_title'];
            }

            // 更新meta描述
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && translations['site_description']) {
                metaDescription.content = translations['site_description'];
            }

            // 更新footer内容
            this.updateFooterContent(translations);

            // 更新联系表单标签
            this.updateContactFormLabels(translations);
        } catch (error) {
            console.error('Failed to translate page:', error);
        }
    }

    async fetchTranslations() {
        const langCode = this.currentLanguage; // 使用完整的locale代码，如 'it-IT'
        const response = await fetch(`/api/language.php?action=translations&lang=${langCode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch translations');
        }
        const data = await response.json();
        return data.translations || {};
    }

    updateFooterContent(translations) {
        // 更新footer section标题
        const footerSections = document.querySelectorAll('.footer-section h3');
        if (footerSections.length >= 2) {
            if (translations['footer_shop']) {
                footerSections[0].textContent = translations['footer_shop'];
            }
            if (translations['footer_support']) {
                footerSections[1].textContent = translations['footer_support'];
            }
        }

        // 更新footer链接
        const footerLinks = document.querySelectorAll('.footer-section a');
        footerLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#collection' && translations['footer_collection']) {
                link.textContent = translations['footer_collection'];
            } else if (href === '#contact' && translations['footer_contact']) {
                link.textContent = translations['footer_contact'];
            }
        });
    }

    updateContactFormLabels(translations) {
        // 更新联系表单的标签和按钮文本
        const labelMappings = {
            'contact-name': 'contact_form_name',
            'contact-email': 'contact_form_email',
            'contact-phone': 'contact_form_phone',
            'contact-company': 'contact_form_company',
            'contact-message': 'contact_form_message'
        };

        Object.entries(labelMappings).forEach(([inputId, translationKey]) => {
            const input = document.getElementById(inputId);
            if (input && translations[translationKey]) {
                const label = document.querySelector(`label[for="${inputId}"]`);
                if (label) {
                    label.textContent = translations[translationKey] + (input.required ? ' *' : '');
                }
            }
        });

        // 更新按钮文本
        const submitBtn = document.getElementById('contact-submit');
        if (submitBtn && translations['contact_form_send']) {
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = translations['contact_form_send'];
            }
        }

        const cancelBtn = document.getElementById('contact-cancel');
        if (cancelBtn && translations['contact_form_cancel']) {
            cancelBtn.textContent = translations['contact_form_cancel'];
        }

        // 更新触发按钮文本
        const triggerBtn = document.getElementById('contact-form-trigger');
        if (triggerBtn && translations['contact_form_send']) {
            const span = triggerBtn.querySelector('span');
            if (span) {
                span.textContent = translations['contact_form_send'];
            }
        }
    }
}
