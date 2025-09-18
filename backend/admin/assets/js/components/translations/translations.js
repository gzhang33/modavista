/**
 * translations.js - Handles translation form functionality
 */

class TranslationsManager {
    constructor() {
        this.form = document.querySelector('form.translation-form');
        this.changed = false;
        this.maxLen = 4000;
        this.textAreas = [];
        
        if (!this.form) return;
        
        this.initAutoSize();
        this.initEventListeners();
        this.ensureMobilePageSize();
        this.restoreScrollPosition();
    }
    
    /**
     * Initialize auto-resize for textareas
     */
    initAutoSize() {
        this.textAreas = Array.from(document.querySelectorAll('.js-autosize'));
        
        this.textAreas.forEach(el => {
            this.resizeTextArea(el);
            el.addEventListener('input', () => {
                this.resizeTextArea(el);
                this.changed = true;
            });
        });
    }
    
    /**
     * Resize textarea to fit content
     * @param {HTMLElement} el - Textarea element
     */
    resizeTextArea(el) {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight + 2) + 'px';
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.changed) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Form submit
        this.form.addEventListener('submit', () => {
            this.changed = false;
        });
        
        // Ctrl+Enter to save
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.form.submit();
            }
        });
        
        // Alt+Up/Down for navigation between textareas
        document.addEventListener('keydown', (e) => {
            if (!e.altKey || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
            
            const idx = this.textAreas.indexOf(document.activeElement);
            if (idx === -1) return;
            
            const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
            if (next >= 0 && next < this.textAreas.length) {
                this.textAreas[next].focus();
                e.preventDefault();
            }
        });
    }
    
    /**
     * Submit search form while maintaining scroll position
     * @param {Event} event - Form submit event
     */
    submitSearchForm(event) {
        if (event) {
            event.preventDefault();
        }
        
        this.saveScrollPosition();
        document.getElementById('search-form').submit();
    }
    
    /**
     * Handle language change on mobile
     * @param {string} lang - Selected language code
     */
    onMobileLangChange(lang) {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
    }
    
    /**
     * Ensure mobile devices use page_size=10
     */
    ensureMobilePageSize() {
        const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile) return;
        
        // Hide desktop controls
        const pcControls = document.getElementById('desktop-page-controls');
        if (pcControls) {
            pcControls.style.display = 'none';
        }
        
        const url = new URL(window.location.href);
        if (url.searchParams.get('page_size') !== '10') {
            url.searchParams.set('page_size', '10');
            url.searchParams.set('page', '1');
            window.location.replace(url.toString());
        }
    }
    
    /**
     * Handle page size change
     * @param {Event} event - Click event
     * @param {HTMLElement} element - Clicked element
     */
    submitPageSizeChange(event, element) {
        event.preventDefault();
        this.saveScrollPosition();
        window.location.href = element.href;
    }
    
    /**
     * Save current scroll position to session storage
     */
    saveScrollPosition() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        sessionStorage.setItem('scrollPosition', scrollPosition);
    }
    
    /**
     * Restore scroll position from session storage
     */
    restoreScrollPosition() {
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition !== null) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScrollPosition));
                sessionStorage.removeItem('scrollPosition');
            }, 100);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const translationsManager = new TranslationsManager();
    
    // Expose functions to global scope for HTML attribute handlers
    window.submitSearchForm = (event) => translationsManager.submitSearchForm(event);
    window.onMobileLangChange = (lang) => translationsManager.onMobileLangChange(lang);
    window.submitPageSizeChange = (event, element) => translationsManager.submitPageSizeChange(event, element);
});
