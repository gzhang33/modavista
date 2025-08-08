// htdocs/admin/assets/js/ComponentManager.js
export default class ComponentManager {
    constructor(eventBus) {
        this.components = [];
        this.eventBus = eventBus;
    }

    register(ComponentClass, ...args) {
        try {
            const component = new ComponentClass(...args, this.eventBus);
            this.components.push(component);
            console.log(`Component ${ComponentClass.name} registered and initialized.`);
        } catch (error) {
            console.error(`Failed to initialize component ${ComponentClass.name}:`, error);
        }
    }

    initAll() {
        // This can be expanded if components need a specific init lifecycle hook
        console.log('All components initialized.');
    }
}
