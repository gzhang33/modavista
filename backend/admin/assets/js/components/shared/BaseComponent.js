// htdocs/admin/assets/js/components/BaseComponent.js
export default class BaseComponent {
    constructor(selector, eventBus) {
        this.element = document.querySelector(selector);
        this.eventBus = eventBus;

        if (!this.element) {
            console.error(`Element with selector "${selector}" not found.`);
            return;
        }
    }

    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
