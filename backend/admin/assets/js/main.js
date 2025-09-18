// htdocs/admin/assets/js/main.js
import EventBus from './components/shared/EventBus.js';
import ComponentManager from './components/shared/ComponentManager.js';
import SessionManager from './utils/sessionManager.js';
import apiClient from './utils/apiClient.js';

// Import all components
import ProductTableComponent from './components/dashboard/dashboard_products.js';
import FilterComponent from './components/dashboard/dashboard_filters.js'; // Import the new filter component
import ToastComponent from './components/shared/ToastComponent.js';

// Initialize immediately since DOM is already loaded
console.log('Main.js executing...');
const eventBus = new EventBus();
console.log('EventBus created:', eventBus);
const componentManager = new ComponentManager(eventBus);

// Initialize session manager
const sessionManager = new SessionManager(eventBus);

// Set session manager for API client
apiClient.setSessionManager(sessionManager);

// Register core components
componentManager.register(ProductTableComponent, '#products-management-section');
componentManager.register(FilterComponent, '#products-management-section'); // Register the new filter component
componentManager.register(ToastComponent, '#toast-notification');

componentManager.initAll();

setup_navigation(eventBus);

// Cleanup session manager on page unload
window.addEventListener('beforeunload', () => {
    sessionManager.destroy();
});

function setup_navigation(eventBus) {
    const add_product_btn = document.getElementById('add-product-btn');
    if(add_product_btn) {
        add_product_btn.addEventListener('click', () => {
             window.location.href = 'add_product.php';
        });
    }

    // Simplified navigation: directly load product data
    const product_section = document.querySelector('#products-management-section');
    if (product_section) {
        product_section.dispatchEvent(new CustomEvent('loadProducts', { detail: { archived: 0 } }));
    }

    // Search functionality is now handled by the FilterComponent
}

