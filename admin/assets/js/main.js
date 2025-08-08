// htdocs/admin/assets/js/main.js
import EventBus from './EventBus.js';
import ComponentManager from './ComponentManager.js';

// Import all components
import ProductTableComponent from './components/ProductTableComponent.js';
import AdvancedFilterComponent from './components/AdvancedFilterComponent.js';
import StatsComponent from './components/StatsComponent.js';
import ProductFormComponent from './components/ProductFormComponent.js';
import ToastComponent from './components/ToastComponent.js';

document.addEventListener('DOMContentLoaded', () => {
    const eventBus = new EventBus();
    const componentManager = new ComponentManager(eventBus);

    // Register all components
    componentManager.register(ProductTableComponent, '#products-management-section');
    componentManager.register(AdvancedFilterComponent, '#filters-section');
    componentManager.register(StatsComponent, '#dashboard-stats-section');
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
             eventBus.emit('product:edit', null);
        });
    }

    function handle_navigation(hash) {
        let target_section_name;
        
        // Map new hashes to the main products section
        if (hash === '#products-current' || hash === '#products-archived') {
            target_section_name = 'products';
        } else {
            target_section_name = hash.substring(1);
        }

        // Update nav active states with exact-match for submenu items
        const nav_links = document.querySelectorAll('.sidebar-nav a.nav-item, .sidebar-nav .nav-link');
        nav_links.forEach(link => link.classList.remove('active'));

        if (hash.startsWith('#products')) {
            const parent_link = document.querySelector('.nav-item.has-submenu > .nav-link');
            if (parent_link) parent_link.classList.add('active');
            const submenu_link = document.querySelector(`.submenu .nav-item[href="${hash}"]`);
            if (submenu_link) submenu_link.classList.add('active');
        } else {
            const exact_link = document.querySelector(`.sidebar-nav .nav-item[href="${hash}"]`);
            if (exact_link) exact_link.classList.add('active');
        }
        
        content_sections.forEach(section => {
            section.classList.toggle('active', section.getAttribute('data-section') === target_section_name);
        });

        // Dispatch events for product table
        const product_section = document.querySelector('#products-management-section');
        if (product_section) {
            if (hash === '#products-current') {
                product_section.dispatchEvent(new CustomEvent('loadProducts', { detail: { archived: 0 } }));
            } else if (hash === '#products-archived') {
                product_section.dispatchEvent(new CustomEvent('loadProducts', { detail: { archived: 1 } }));
            }
        }

        // Also trigger bulk actions panel to reflect correct visible buttons
        const products_component = document.querySelector('#products-management-section');
        if (products_component) {
            products_component.dispatchEvent(new CustomEvent('productsViewChanged', { detail: { hash } }));
        }
    }

    // New: Handle dropdown menu
    const dropdown = document.querySelector('.has-submenu');
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
                 e.preventDefault();
                 this.classList.toggle('open');
            }
        });
    }

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
    const initial_hash = window.location.hash || '#dashboard';
    handle_navigation(initial_hash);
    // Also set the correct initial state for the dropdown
    if (initial_hash.startsWith('#products')) {
        dropdown.classList.add('open');
    }
}
