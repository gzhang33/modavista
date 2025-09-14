// admin/assets/js/components/dashboard_filters.js
import BaseComponent from './BaseComponent.js';
import apiClient from '../utils/apiClient.js';

export default class FilterComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.state = {
            color: [],
            material: [],
            category: [],
            search: ''
        };
        this.filter_keys = {
            '颜色': 'color',
            '材质': 'material',
            '分类': 'category'
        };
        this.init_elements();
        this.init_listeners();
        this.load_filter_options();
    }

    init_elements() {
        this.filter_bar = this.element.querySelector('#filter-bar');
        // The clear button is inside the actions container, which is preserved
        this.actions_container = this.filter_bar.querySelector('.filter-bar-actions');
        this.clear_filters_btn = this.actions_container.querySelector('#clear-filters-btn');
        this.search_input = this.filter_bar.querySelector('#search-products');
    }

    init_listeners() {
        if (this.clear_filters_btn) {
            this.clear_filters_btn.addEventListener('click', () => this.clear_all_filters());
        }

        // Search functionality
        if (this.search_input) {
            this.search_input.addEventListener('input', (e) => {
                this.handle_search_change(e.target.value.trim());
            });
        }

        this.filter_bar.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-button');
            if (button) {
                e.stopPropagation();
                this.toggle_dropdown(button.dataset.filterKey);
                return; // Stop further processing
            }

            const checkbox = e.target.closest('.filter-option input[type="checkbox"]');
            if(checkbox){
                this.handle_checkbox_change(checkbox);
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-group')) {
                this.close_all_dropdowns();
            }
        });

        // Add mouse leave event listener for auto-hide dropdowns
        this.filter_bar.addEventListener('mouseleave', (e) => {
            // Only close dropdowns if mouse is leaving the entire filter bar area
            if (!e.relatedTarget || !e.relatedTarget.closest('.filter-group')) {
                this.close_all_dropdowns();
            }
        });
    }

    async load_filter_options() {
        try {
            const results = await Promise.allSettled([
                apiClient.getColors('it'),
                apiClient.getMaterials('it'),
                apiClient.getCategories('it')
            ]);

            const colors = results[0].status === 'fulfilled' ? results[0].value : [];
            const materials = results[1].status === 'fulfilled' ? results[1].value : [];
            const categories = results[2].status === 'fulfilled' ? results[2].value : [];

            if (results.some(r => r.status === 'rejected')) {
                console.error("One or more filter options failed to load:", results.filter(r => r.status === 'rejected'));
            }

            console.log('Filter data received:', { colors, materials, categories });

            // Handle different API response formats
            this.available_options = {
                color: Array.isArray(colors) ? colors.filter(name => name && typeof name === 'string') : [],
                material: Array.isArray(materials) ? materials.filter(name => name && typeof name === 'string') : [],
                category: Array.isArray(categories) ? categories.map(c => c && c.name ? c.name : '').filter(name => name) : []
            };

            console.log('Processed filter options:', this.available_options);
            
            this.filter_bar.querySelectorAll('.filter-group').forEach(group => group.remove());

            Object.entries(this.filter_keys).forEach(([label, key]) => {
                const options = this.available_options[key] || [];
                // Always render filter groups, even if empty (for future data)
                this.render_filter_group(label, key, options);
            });

        } catch (error) {
            console.error('加载筛选选项时发生意外错误:', error);
            this.filter_bar.insertAdjacentHTML('afterbegin', '<p class="error-message">筛选加载失败</p>');
        }
    }

    render_filter_group(label, key, options) {
        const group = document.createElement('div');
        group.className = 'filter-group';

        const options_html = options.length > 0 ? options.map(option => {
            const safe_option = option || '';
            const id = `${key}-${safe_option.replace(/[^a-zA-Z0-9]/g, '-')}`;
            return `
                <div class="filter-option">
                    <input type="checkbox" id="${id}" data-key="${key}" data-value="${safe_option}">
                    <label for="${id}">${safe_option}</label>
                </div>
            `;
        }).join('') : `<div class="filter-option"><span style="color: #9ca3af; font-style: italic;">暂无选项</span></div>`;

        // Determine if we need multi-column layout (more than 10 options)
        const useMultiColumn = options.length > 10;
        const dropdownClass = useMultiColumn ? 'filter-dropdown filter-dropdown-multicolumn' : 'filter-dropdown';

        group.innerHTML = `
            <button class="filter-button" data-filter-key="${key}">
                <span>${label}</span>
                <span class="filter-count" data-filter-key="${key}" style="display: none;"></span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="${dropdownClass}" data-filter-key="${key}">${options_html}</div>
        `;

        this.filter_bar.insertBefore(group, this.actions_container);
    }

    handle_checkbox_change(checkbox) {
        const { key, value } = checkbox.dataset;
        console.log('Checkbox changed:', { key, value, checked: checkbox.checked });
        if (checkbox.checked) {
            if (!this.state[key].includes(value)) {
                this.state[key].push(value);
            }
        } else {
            this.state[key] = this.state[key].filter(item => item !== value);
        }
        console.log('Updated state:', this.state);
        this.update_filter_count(key);
        this.apply_filters();
    }

    update_filter_count(key) {
        const count = this.state[key].length;
        const count_el = this.filter_bar.querySelector(`.filter-count[data-filter-key="${key}"]`);
        if (count_el) {
            if (count > 0) {
                count_el.textContent = count;
                count_el.style.display = 'inline-block';
            } else {
                count_el.style.display = 'none';
            }
        }
    }

    handle_search_change(search_term) {
        this.state.search = search_term;
        this.apply_filters();
    }

    apply_filters() {
        const filters = { logic: 'AND', conditions: [] };
        
        // Add search filter
        if (this.state.search) {
            filters.conditions.push({ field: 'name', operator: 'contains', value: this.state.search });
        }
        
        // Add category filters
        for (const key in this.state) {
            if (key !== 'search' && this.state[key].length > 0) {
                filters.conditions.push({ field: key, operator: 'in', value: this.state[key] });
            }
        }
        
        console.log('Applying filters:', filters);
        this.eventBus.emit('products:filter-changed', filters);
    }
    
    clear_all_filters() {
        this.state = { color: [], material: [], category: [], search: '' };
        this.filter_bar.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
        if (this.search_input) {
            this.search_input.value = '';
        }
        Object.values(this.filter_keys).forEach(key => this.update_filter_count(key));
        this.apply_filters();
        this.eventBus.emit('toast:show', { message: '筛选已清除', type: 'info' });
    }

    toggle_dropdown(key) {
        const dropdown = this.filter_bar.querySelector(`.filter-dropdown[data-filter-key="${key}"]`);
        const button = this.filter_bar.querySelector(`.filter-button[data-filter-key="${key}"]`);
        if (!dropdown || !button) return;

        const is_open = dropdown.classList.contains('is-open');
        this.close_all_dropdowns();
        if (!is_open) {
            dropdown.classList.add('is-open');
            button.classList.add('is-open');
        }
    }

    close_all_dropdowns() {
        this.filter_bar.querySelectorAll('.filter-dropdown.is-open').forEach(dd => {
            dd.classList.remove('is-open');
        });
        this.filter_bar.querySelectorAll('.filter-button.is-open').forEach(btn => {
            btn.classList.remove('is-open');
        });
    }
}
