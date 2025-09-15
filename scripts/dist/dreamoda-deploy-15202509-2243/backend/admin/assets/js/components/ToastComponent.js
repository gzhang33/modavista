// htdocs/admin/assets/js/components/ToastComponent.js
import BaseComponent from './BaseComponent.js';

export default class ToastComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.eventBus.on('toast:show', (data) => this.show_toast(data.message, data.type));
    }

    show_toast(message, type = 'success') {
        this.element.textContent = message;
        this.element.className = `toast toast-${type} show`;
        setTimeout(() => {
            this.element.classList.remove('show');
        }, 3000);
    }
}
