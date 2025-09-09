// htdocs/admin/assets/js/components/dashboard_filters.js
import BaseComponent from './BaseComponent.js';
import apiClient from '/admin/assets/js/utils/apiClient.js';

export default class AdvancedFilterComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);

        this.init_elements();
        this.init_constants();
        
        this.available_categories = [];
        this.eventBus.on('products:loaded', (products) => this.update_categories(products));

        this.setup_event_listeners();
        this.load_saved_filters();
    }

    init_elements() {
        // Simple filters
        this.search_input = this.element.querySelector('#search-products');
        this.category_filter = this.element.querySelector('#filter-category');
        this.clear_filters_btn = this.element.querySelector('#clear-filters');
        
        // Advanced filters
        this.advanced_filter_btn = this.element.querySelector('#advanced-filter-btn');
        this.advanced_filter_section = this.element.querySelector('#advanced-filter-section');
        this.add_condition_btn = this.element.querySelector('#add-filter-condition');
        this.conditions_container = this.element.querySelector('#filter-conditions-container');
        this.apply_advanced_filters_btn = this.element.querySelector('#apply-advanced-filters');
        this.logic_operator_select = this.element.querySelector('#filter-logic-operator');
        
        // Saved filters
        this.save_filter_btn = this.element.querySelector('#save-filter-btn');
        this.save_filter_name_input = this.element.querySelector('#save-filter-name');
        this.load_filter_btn = this.element.querySelector('#load-filter-btn');
        this.saved_filters_select = this.element.querySelector('#saved-filters-select');
        this.delete_filter_btn = this.element.querySelector('#delete-filter-btn');
    }
    
    init_constants() {
        this.FILTER_FIELDS = {
            'name': { label: '产品名称', type: 'text' },
            'description': { label: '产品描述', type: 'text' },
            'category': { label: '产品分类', type: 'select' },
            'createdAt': { label: '创建日期', type: 'date' }
        };

        this.OPERATORS = {
            text: [
                { value: 'contains', label: '包含' },
                { value: 'equals', label: '等于' },
                { value: 'not_contains', label: '不包含' },
                { value: 'is_empty', label: '为空' },
                { value: 'is_not_empty', label: '不为空' }
            ],
            number: [
                { value: 'equals', label: '=' },
                { value: 'not_equals', label: '!=' },
                { value: 'gt', label: '>' },
                { value: 'lt', label: '<' },
                { value: 'gte', label: '>=' },
                { value: 'lte', label: '<=' },
                { value: 'between', label: '介于' }
            ],
            date: [
                { value: 'equals', label: '等于' },
                { value: 'before', label: '早于' },
                { value: 'after', label: '晚于' },
                { value: 'between', label: '介于' }
            ],
            select: [
                { value: 'equals', label: '是' },
                { value: 'not_equals', label: '不是' }
            ]
        };
    }

    setup_event_listeners() {
        this.search_input.addEventListener('input', () => this.apply_simple_filters());
        this.category_filter.addEventListener('change', () => this.apply_simple_filters());
        
        this.clear_filters_btn.addEventListener('click', () => this.clear_all_filters());
        
        this.advanced_filter_btn.addEventListener('click', () => {
            this.advanced_filter_section.classList.toggle('hidden');
        });
        
        this.add_condition_btn.addEventListener('click', () => this.add_filter_condition_row());
        this.apply_advanced_filters_btn.addEventListener('click', () => this.apply_advanced_filters());
        
        this.save_filter_btn.addEventListener('click', () => this.save_filter());
        this.load_filter_btn.addEventListener('click', () => this.load_filter());
        this.delete_filter_btn.addEventListener('click', () => this.delete_filter());
    }
    
    apply_simple_filters() {
        const filters = {
             logic: 'AND',
             conditions: []
        };
        const search_term = this.search_input.value.trim();
        const category = this.category_filter.value;
        
        if (search_term) {
            filters.conditions.push({ field: 'name', operator: 'contains', value: search_term });
        }
        if (category) {
            filters.conditions.push({ field: 'category', operator: 'equals', value: category });
        }
        
        this.conditions_container.innerHTML = ''; // Clear advanced filters
        this.eventBus.emit('products:filter-changed', filters);
    }
    
    apply_advanced_filters() {
        const filters = {
            logic: this.logic_operator_select.value,
            conditions: []
        };

        this.conditions_container.querySelectorAll('.filter-condition-row').forEach(row => {
            const field = row.querySelector('.filter-field').value;
            const operator = row.querySelector('.filter-operator').value;
            let value;

            if (operator === 'between') {
                const start = row.querySelector('.filter-value-start').value;
                const end = row.querySelector('.filter-value-end').value;
                value = [start, end];
            } else if (operator !== 'is_empty' && operator !== 'is_not_empty') {
                value = row.querySelector('.filter-value').value;
            }
            filters.conditions.push({ field, operator, value });
        });
        
        // Clear simple filters
        this.search_input.value = '';
        this.category_filter.value = '';

        this.eventBus.emit('products:filter-changed', filters);
        this.eventBus.emit('toast:show', { message: '高级筛选已应用', type: 'success' });
    }
    
    clear_all_filters() {
        this.search_input.value = '';
        this.category_filter.value = '';
        this.conditions_container.innerHTML = '';
        this.eventBus.emit('products:reload');
        this.eventBus.emit('toast:show', { message: '筛选已清除', type: 'info' });
    }
    
    async update_categories(products) {
        try {
            const categories = await apiClient.getCategories();
            this.available_categories = categories;
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.available_categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
        }
        const current_val = this.category_filter.value;
        this.category_filter.innerHTML = '<option value="">所有分类</option>';
        this.available_categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.category_filter.appendChild(option);
        });
        this.category_filter.value = current_val;
    }

    // All the helper methods for advanced and saved filters go here
    // (add_filter_condition_row, update_operator_and_value, create_select, create_input, 
    // save_filter, load_saved_filters, load_filter, delete_filter)
    // These are mostly unchanged from admin_script.js
    
    add_filter_condition_row(condition = {}) {
        const row = document.createElement('div');
        row.className = 'filter-condition-row';
        
        const field_select = this.create_select(Object.entries(this.FILTER_FIELDS).map(([value, {label}]) => ({value, label})), 'filter-field');
        if(condition.field) field_select.value = condition.field;

        const operator_select = this.create_select([], 'filter-operator');
        
        const value_container = document.createElement('div');
        value_container.className = 'filter-value-container';

        const remove_btn = document.createElement('button');
        remove_btn.innerHTML = '<i class="fas fa-trash"></i>';
        remove_btn.className = 'btn btn-danger btn-sm';
        remove_btn.onclick = () => row.remove();

        row.append(field_select, operator_select, value_container, remove_btn);
        
        field_select.addEventListener('change', () => {
            this.update_operator_and_value(field_select.value, operator_select, value_container, {});
        });

        this.update_operator_and_value(field_select.value, operator_select, value_container, condition);
        
        this.conditions_container.appendChild(row);
    }

    update_operator_and_value(field_name, operator_select, value_container, condition) {
        const field = this.FILTER_FIELDS[field_name];
        if (!field) return;

        operator_select.innerHTML = '';
        const operators = this.OPERATORS[field.type] || [];
        operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op.value;
            option.textContent = op.label;
            operator_select.appendChild(option);
        });
        if(condition.operator) operator_select.value = condition.operator;

        value_container.innerHTML = '';
        const operator = operator_select.value;

        if (operator === 'is_empty' || operator === 'is_not_empty') {
            return;
        }

        if (field.type === 'select') {
            const select = this.create_select(this.available_categories.map(c => ({value: c, label: c})), 'filter-value');
            if(condition.value) select.value = condition.value;
            value_container.appendChild(select);
        } else if (operator === 'between') {
            const input1 = this.create_input(field.type, 'filter-value-start');
            const input2 = this.create_input(field.type, 'filter-value-end');
            if(Array.isArray(condition.value)) {
                input1.value = condition.value[0] || '';
                input2.value = condition.value[1] || '';
            }
            value_container.append(input1, ' and ', input2);
        } else {
            const input = this.create_input(field.type, 'filter-value');
            if(condition.value) input.value = condition.value;
            value_container.appendChild(input);
        }
    }

    create_select(options, class_name) {
        const select = document.createElement('select');
        select.className = `filter-select-sm ${class_name}`;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            select.appendChild(option);
        });
        return select;
    }

    create_input(type, class_name) {
        const input = document.createElement('input');
        input.type = type === 'number' ? 'number' : (type === 'date' ? 'date' : 'text');
        input.className = `search-input-sm ${class_name}`;
        return input;
    }

    save_filter() {
        const name = this.save_filter_name_input.value.trim();
        if (!name) {
            this.eventBus.emit('toast:show', { message: '请输入筛选名称', type: 'error' });
            return;
        }

        const filters = {
            logic: this.logic_operator_select.value,
            conditions: []
        };
        this.conditions_container.querySelectorAll('.filter-condition-row').forEach(row => {
            const field = row.querySelector('.filter-field').value;
            const operator = row.querySelector('.filter-operator').value;
            let value;
            if (operator === 'between') {
                value = [row.querySelector('.filter-value-start').value, row.querySelector('.filter-value-end').value];
            } else if (operator !== 'is_empty' && operator !== 'is_not_empty') {
                value = row.querySelector('.filter-value').value;
            }
            filters.conditions.push({ field, operator, value });
        });

        const saved_filters = JSON.parse(localStorage.getItem('adminSavedFilters')) || {};
        saved_filters[name] = filters;
        localStorage.setItem('adminSavedFilters', JSON.stringify(saved_filters));

        this.load_saved_filters();
        this.eventBus.emit('toast:show', { message: `筛选 "${name}" 已保存`, type: 'success' });
        this.save_filter_name_input.value = '';
    }

    load_saved_filters() {
        const saved_filters = JSON.parse(localStorage.getItem('adminSavedFilters')) || {};
        this.saved_filters_select.innerHTML = '<option value="">加载已保存的筛选</option>';
        Object.keys(saved_filters).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.saved_filters_select.appendChild(option);
        });
    }

    load_filter() {
        const name = this.saved_filters_select.value;
        if (!name) return;
        const saved_filters = JSON.parse(localStorage.getItem('adminSavedFilters')) || {};
        const filter = saved_filters[name];

        if (filter) {
            this.logic_operator_select.value = filter.logic || 'AND';
            this.conditions_container.innerHTML = '';
            filter.conditions.forEach(condition => this.add_filter_condition_row(condition));
            this.eventBus.emit('toast:show', { message: `已加载筛选 "${name}"`, type: 'success' });
        }
    }

    delete_filter() {
        const name = this.saved_filters_select.value;
        if (!name || !confirm(`确定要删除筛选 "${name}" 吗?`)) return;

        const saved_filters = JSON.parse(localStorage.getItem('adminSavedFilters')) || {};
        delete saved_filters[name];
        localStorage.setItem('adminSavedFilters', JSON.stringify(saved_filters));

        this.load_saved_filters();
        this.eventBus.emit('toast:show', { message: `筛选 "${name}" 已删除`, type: 'success' });
    }
}
