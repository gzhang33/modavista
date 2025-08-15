// htdocs/admin/assets/js/main.js
import EventBus from './EventBus.js';
import ComponentManager from './ComponentManager.js';

// Import all components
import ProductTableComponent from './components/ProductTableComponent.js';
import AdvancedFilterComponent from './components/AdvancedFilterComponent.js';
import ProductFormComponent from './components/ProductFormComponent.js';
import ToastComponent from './components/ToastComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    const eventBus = new EventBus();
    const componentManager = new ComponentManager(eventBus);

    // Register core components
    componentManager.register(ProductTableComponent, '#products-management-section');
    componentManager.register(AdvancedFilterComponent, '#filters-section');
    // form moved to add_product.php; keep registration harmless if present
    componentManager.register(ProductFormComponent, '#product-form-section');
    componentManager.register(ToastComponent, '#toast-notification');

    componentManager.initAll();
    
    setup_navigation(eventBus);
});

function setup_navigation(eventBus) {
    const nav_items = document.querySelectorAll('.nav-item');
    const content_sections = document.querySelectorAll('.content-section');
    
    const add_product_btn = document.getElementById('add-product-btn');
    if(add_product_btn) {
        add_product_btn.addEventListener('click', () => {
             window.location.href = 'add_product.php';
        });
    }

    function handle_navigation(hash) {
        let target_section_name;
        
        // 仅保留单一产品视图
        if (hash === '#products' || hash === '#products-current') {
            target_section_name = 'products';
        } else {
            target_section_name = hash.substring(1);
        }

        // Update nav active state
        const nav_links = document.querySelectorAll('.sidebar-nav a.nav-item');
        nav_links.forEach(link => link.classList.remove('active'));
        const exact_link = document.querySelector(`.sidebar-nav .nav-item[href="${hash}"]`);
        if (exact_link) exact_link.classList.add('active');
        
        content_sections.forEach(section => {
            section.classList.toggle('active', section.getAttribute('data-section') === target_section_name);
        });

        // Dispatch events for product table（固定展示未归档=0）
        const product_section = document.querySelector('#products-management-section');
        if (product_section) {
            product_section.dispatchEvent(new CustomEvent('loadProducts', { detail: { archived: 0 } }));
        }

        // Also trigger bulk actions panel to reflect correct visible buttons
        const products_component = document.querySelector('#products-management-section');
        if (products_component) {
            products_component.dispatchEvent(new CustomEvent('productsViewChanged', { detail: { hash } }));
        }
    }

    // New: Handle dropdown menu
    // simplified: no submenu

    nav_items.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!item.closest('.has-submenu')) { // Prevent multiple handlers on parent
                 e.preventDefault();
            }
           
            const target_hash = item.getAttribute('href');
            if(target_hash && target_hash.startsWith('#')) {
                window.location.hash = target_hash;
            }
        });
    });

    window.addEventListener('hashchange', () => {
        handle_navigation(window.location.hash);
    });

    // Handle initial page load
    const initial_hash = window.location.hash || '#products';
    handle_navigation(initial_hash);
    // no submenu state to set
}
