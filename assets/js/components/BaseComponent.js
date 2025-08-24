// htdocs/assets/js/components/BaseComponent.js
export default class BaseComponent {
    constructor(container) {
        this.container = container;
        this.eventBus = window.EventBus;

        if (!this.container) {
            console.error('Container element not provided to BaseComponent.');
            return;
        }
    }

    show() {
        this.container.classList.remove('hidden');
    }

    hide() {
        this.container.classList.add('hidden');
    }

    destroy() {
        // 清理事件监听器和其他资源
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

