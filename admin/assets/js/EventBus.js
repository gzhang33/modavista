// htdocs/admin/assets/js/EventBus.js
export default class EventBus {
    constructor() {
        this.events = {};
    }

    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    off(eventName, listener) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName] = this.events[eventName].filter(
            (l) => l !== listener
        );
    }

    emit(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].forEach((listener) => listener(data));
    }
}
