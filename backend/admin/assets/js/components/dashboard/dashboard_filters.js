// admin/assets/js/components/dashboard/dashboard_filters.js
import BaseComponent from '../shared/BaseComponent.js';
import apiClient from '../../utils/apiClient.js';

export default class FilterComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.state = {
            color: [],
            material: [],
            category: [],
            createdAt: [],
            search: ''
        };
        this.mobileStorageKey = 'admin_mobile_filters';
        this.filter_keys = {
            '颜色': 'color',
            '材质': 'material',
            '分类': 'category',
            '时间': 'createdAt'
        };
        this.reverse_label_map = { color: '颜色', material: '材质', category: '分类', createdAt: '时间' };
        this.init_elements();
        this.init_listeners();
        this.load_filter_options();
        this.apply_mobile_saved_filters();
    }

    init_elements() {
        this.filter_bar = this.element.querySelector('#filter-bar');
        // The clear button is inside the actions container, which is preserved
        this.actions_container = this.filter_bar ? this.filter_bar.querySelector('.filter-bar-actions') : null;
        this.clear_filters_btn = this.actions_container ? this.actions_container.querySelector('#clear-filters-btn') : null;
        this.search_input = this.filter_bar ? this.filter_bar.querySelector('#search-products') : null;
        
        // Filter status display elements
        this.filter_status_panel = document.querySelector('#filter-status-panel');
        this.filter_status_content = document.querySelector('.filter-status-content');
        this.filter_status_count = document.querySelector('.filter-status-count');
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

        this.filter_bar && this.filter_bar.addEventListener('click', (e) => {
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

        // Ensure dropdowns are closed by default on mobile
        this.close_all_dropdowns();

        // Add mouse leave event listener for auto-hide dropdowns
        this.filter_bar && this.filter_bar.addEventListener('mouseleave', (e) => {
            // Only close dropdowns if mouse is leaving the entire filter bar area
            if (!e.relatedTarget || !e.relatedTarget.closest('.filter-group')) {
                this.close_all_dropdowns();
            }
        });

        // Re-apply filters after products have loaded to avoid race conditions
        if (this.eventBus && typeof this.eventBus.on === 'function') {
            this.eventBus.on('products:loaded', () => {
                this.apply_filters();
                this.update_all_button_labels();
            });
        }
    }

    apply_mobile_saved_filters() {
        // Read saved filters from localStorage (set in filters_mobile.php)
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(this.mobileStorageKey) || '{}'); } catch (_) { saved = null; }
        if (!saved || typeof saved !== 'object') return;
        // Merge to state
        ['color','material','category','createdAt'].forEach(k => {
            if (Array.isArray(saved[k])) this.state[k] = saved[k].slice(0);
        });
        this.apply_filters();
        // 通知产品组件刷新（如果首载未触发 products:loaded）
        this.eventBus && this.eventBus.emit && this.eventBus.emit('products:filter-changed', this.build_current_filters());
    }

    build_current_filters() {
        const filters = { logic: 'AND', conditions: [] };
        if (this.state.search) {
            filters.conditions.push({ field: 'name', operator: 'contains', value: this.state.search });
        }
        if (Array.isArray(this.state.createdAt) && this.state.createdAt.length > 0) {
            const preset = this.state.createdAt[0];
            const now = new Date();
            let from = new Date(now);
            const mapCnToPreset = { '今天': 'today', '本周': 'week', '本月': 'month', '今年': 'year' };
            const token = mapCnToPreset[preset] || preset;
            if (token === 'today') from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            else if (token === 'week') from.setDate(now.getDate() - 7);
            else if (token === 'month') from.setMonth(now.getMonth() - 1);
            else if (token === 'year') from.setFullYear(now.getFullYear() - 1);
            filters.conditions.push({ field: 'createdAt', operator: 'after', value: from.toISOString() });
        }
        ['color','material','category'].forEach(key => {
            if (this.state[key] && this.state[key].length > 0) {
                filters.conditions.push({ field: key, operator: 'in', value: this.state[key] });
            }
        });
        return filters;
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
                category: Array.isArray(categories) ? categories.map(c => c && c.name ? c.name : '').filter(name => name) : [],
                createdAt: ['今天', '本周', '本月', '今年']
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

        const options_html = options.length > 0 ? options.map((option, index) => {
            const safe_option = option || '';
            const id = `${key}-${safe_option.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
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
                <span class="filter-button-text" data-filter-key="${key}">${label}</span>
                <span class="filter-count" data-filter-key="${key}" style="display: none;"></span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="${dropdownClass}" data-filter-key="${key}">${options_html}</div>
        `;

        if (this.actions_container) {
            this.filter_bar.insertBefore(group, this.actions_container);
        } else {
            this.filter_bar.appendChild(group);
        }

        // Initialize button label for this group
        this.update_button_label(key);
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
        // also refresh the button label to show current selection
        this.update_button_label(key);
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
        
        // Time filter (createdAt) – use preset to compute threshold
        if (Array.isArray(this.state.createdAt) && this.state.createdAt.length > 0) {
            const preset = this.state.createdAt[0];
            const now = new Date();
            let from = new Date(now);
            const mapCnToPreset = { '今天': 'today', '本周': 'week', '本月': 'month', '今年': 'year' };
            const token = mapCnToPreset[preset] || preset;
            if (token === 'today') {
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (token === 'week') {
                from.setDate(now.getDate() - 7);
            } else if (token === 'month') {
                from.setMonth(now.getMonth() - 1);
            } else if (token === 'year') {
                from.setFullYear(now.getFullYear() - 1);
            }
            filters.conditions.push({ field: 'createdAt', operator: 'after', value: from.toISOString() });
        }

        // Other multi-select filters
        ['color','material','category'].forEach(key => {
            if (this.state[key] && this.state[key].length > 0) {
                filters.conditions.push({ field: key, operator: 'in', value: this.state[key] });
            }
        });
        
        console.log('Applying filters:', filters);
        this.eventBus.emit('products:filter-changed', filters);
        
        // Update filter status display
        this.update_filter_status_display();
        // And reflect selection directly on buttons (desktop UX)
        this.update_all_button_labels();
    }

    // Compute and set the visible text on a filter button based on current selection
    update_button_label(key) {
        if (!this.filter_bar) return;
        const labelEl = this.filter_bar.querySelector(`.filter-button-text[data-filter-key="${key}"]`);
        if (!labelEl) return;
        const base = this.reverse_label_map[key] || '';
        const values = Array.isArray(this.state[key]) ? this.state[key] : [];
        if (!values.length) {
            labelEl.textContent = base;
            return;
        }
        if (key === 'createdAt') {
            const map = { today: '今天', week: '本周', month: '本月', year: '今年' };
            const raw = values[0];
            // state may store CN tokens already
            const cn = map[raw] || raw;
            labelEl.textContent = `${base}: ${cn}`;
            return;
        }
        const first = values[0];
        const extra = values.length > 1 ? ` +${values.length - 1}` : '';
        labelEl.textContent = `${base}: ${first}${extra}`;
    }

    update_all_button_labels() {
        ['color','material','category','createdAt'].forEach(k => this.update_button_label(k));
    }
    
    clear_all_filters() {
        this.state = { color: [], material: [], category: [], createdAt: [], search: '' };
        this.filter_bar.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
        if (this.search_input) {
            this.search_input.value = '';
        }
        Object.values(this.filter_keys).forEach(key => this.update_filter_count(key));
        this.apply_filters();
        this.update_filter_status_display(); // Ensure status display is updated
        this.eventBus.emit('toast:show', { message: '筛选已清除', type: 'info' });
    }

    toggle_dropdown(key) {
        const dropdown = this.filter_bar ? this.filter_bar.querySelector(`.filter-dropdown[data-filter-key="${key}"]`) : null;
        const button = this.filter_bar ? this.filter_bar.querySelector(`.filter-button[data-filter-key="${key}"]`) : null;
        if (!dropdown || !button) return;

        const is_open = dropdown.classList.contains('is-open');
        this.close_all_dropdowns();
        if (!is_open) {
            dropdown.classList.add('is-open');
            button.classList.add('is-open');
        }
    }

    close_all_dropdowns() {
        if (!this.filter_bar) return;
        this.filter_bar.querySelectorAll('.filter-dropdown.is-open').forEach(dd => {
            dd.classList.remove('is-open');
        });
        this.filter_bar.querySelectorAll('.filter-button.is-open').forEach(btn => {
            btn.classList.remove('is-open');
        });
    }

    update_filter_status_display() {
        if (!this.filter_status_panel || !this.filter_status_content || !this.filter_status_count) {
            return;
        }

        const active_filters = [];
        
        // Collect all active filters
        if (this.state.search && this.state.search.trim()) {
            active_filters.push({
                category: '搜索',
                value: this.state.search.trim(),
                icon: 'fas fa-search',
                type: 'search'
            });
        }

        if (Array.isArray(this.state.color) && this.state.color.length > 0) {
            this.state.color.forEach(color => {
                active_filters.push({
                    category: '颜色',
                    value: color,
                    icon: 'fas fa-palette',
                    type: 'color'
                });
            });
        }

        if (Array.isArray(this.state.material) && this.state.material.length > 0) {
            this.state.material.forEach(material => {
                active_filters.push({
                    category: '材质',
                    value: material,
                    icon: 'fas fa-layer-group',
                    type: 'material'
                });
            });
        }

        if (Array.isArray(this.state.category) && this.state.category.length > 0) {
            this.state.category.forEach(category => {
                active_filters.push({
                    category: '分类',
                    value: category,
                    icon: 'fas fa-tags',
                    type: 'category'
                });
            });
        }

        if (Array.isArray(this.state.createdAt) && this.state.createdAt.length > 0) {
            this.state.createdAt.forEach(time => {
                active_filters.push({
                    category: '时间',
                    value: time,
                    icon: 'fas fa-clock',
                    type: 'time'
                });
            });
        }

        // Update display
        if (active_filters.length === 0) {
            this.filter_status_panel.classList.add('hidden');
        } else {
            this.filter_status_panel.classList.remove('hidden');
            this.filter_status_count.textContent = `${active_filters.length} 项`;
            
            // Generate filter tags
            this.filter_status_content.innerHTML = active_filters.map(filter => `
                <div class="filter-status-tag" data-filter-type="${filter.type}" data-filter-value="${filter.value}">
                    <i class="${filter.icon} tag-icon"></i>
                    <span class="tag-category">${filter.category}:</span>
                    <span class="tag-value">${filter.value}</span>
                    <span class="tag-remove" data-type="${filter.type}" data-value="${filter.value}" title="移除">×</span>
                </div>
            `).join('');
        }
        
        // 同时更新网格布局中的筛选状态显示
        this.update_grid_filter_display(active_filters);

        // 点击状态面板中的 × 以移除筛选
        this.filter_status_content.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-type');
                const value = e.currentTarget.getAttribute('data-value');
                this.remove_filter_by_type_and_value(type, value);
                // 阻止事件冒泡避免点到外层
                e.stopPropagation();
            });
        });
    }
    
    // 更新网格布局中的筛选状态显示
    update_grid_filter_display(active_filters) {
        const activeFiltersList = document.getElementById('active-filters-list');
        if (!activeFiltersList) return;
        
        // 清空当前显示
        activeFiltersList.innerHTML = '';
        
        // 添加激活的筛选标签
        active_filters.forEach(filter => {
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.innerHTML = `
                <span class="filter-category">${filter.category}:</span>
                <span class="filter-value">${filter.value}</span>
                <span class="remove-filter" data-type="${filter.type}" data-value="${filter.value}">✕</span>
            `;
            activeFiltersList.appendChild(tag);
        });
        
        // 添加移除筛选标签的事件监听器
        activeFiltersList.querySelectorAll('.remove-filter').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const value = e.target.getAttribute('data-value');
                this.remove_filter_by_type_and_value(type, value);
            });
        });
    }
    
    // 根据类型和值移除筛选
    remove_filter_by_type_and_value(type, value) {
        switch (type) {
            case 'search':
                this.state.search = '';
                const searchInput = this.search_input;
                if (searchInput) searchInput.value = '';
                break;
            case 'color':
                this.state.color = this.state.color.filter(item => item !== value);
                break;
            case 'material':
                this.state.material = this.state.material.filter(item => item !== value);
                break;
            case 'category':
                this.state.category = this.state.category.filter(item => item !== value);
                break;
            case 'time':
                this.state.createdAt = this.state.createdAt.filter(item => item !== value);
                break;
        }
        
        // 更新筛选计数显示
        this.update_filter_count('color');
        this.update_filter_count('material');
        this.update_filter_count('category');
        
        this.apply_filters();
    }
}
