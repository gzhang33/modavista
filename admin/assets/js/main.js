// htdocs/admin/assets/js/main.js
import EventBus from './EventBus.js';
import ComponentManager from './ComponentManager.js';

// Import all components
import ProductTableComponent from './components/dashboard_products.js';
import AdvancedFilterComponent from './components/dashboard_filters.js';
import ToastComponent from './components/ToastComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    const eventBus = new EventBus();
    const componentManager = new ComponentManager(eventBus);

    // Register core components
    componentManager.register(ProductTableComponent, '#products-management-section');
    componentManager.register(AdvancedFilterComponent, '#filters-section');
    componentManager.register(ToastComponent, '#toast-notification');

    componentManager.initAll();
    
    setup_navigation(eventBus);
});

function setup_navigation(eventBus) {
    const add_product_btn = document.getElementById('add-product-btn');
    if(add_product_btn) {
        add_product_btn.addEventListener('click', () => {
             window.location.href = 'add_product.php';
        });
    }

    // 简化导航：直接加载产品数据
    const product_section = document.querySelector('#products-management-section');
    if (product_section) {
        product_section.dispatchEvent(new CustomEvent('loadProducts', { detail: { archived: 0 } }));
    }
}
