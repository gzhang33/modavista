// htdocs/admin/assets/js/EventBus.js
export default class EventBus {
    constructor() {
        this.events = {};
    }

    on(eventName, listener) {
        console.log(`EventBus: Registering listener for event: ${eventName}`);
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
        console.log(`EventBus: Total listeners for ${eventName}: ${this.events[eventName].length}`);
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
        console.log(`EventBus: Emitting event: ${eventName} with data:`, data);
        if (!this.events[eventName]) {
            console.log(`EventBus: No listeners found for event: ${eventName}`);
            return;
        }
        console.log(`EventBus: Calling ${this.events[eventName].length} listeners for event: ${eventName}`);
        this.events[eventName].forEach((listener) => listener(data));
    }
}
