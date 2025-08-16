// htdocs/admin/assets/js/components/dashboard_products.js
import BaseComponent from './BaseComponent.js';
import apiClient from '/assets/js/utils/apiClient.js';
import { get_base_name, extract_color_label, color_name_to_hex } from '/assets/js/utils/product_name_utils.js';
import { handle_session_expired } from '../utils/session.js';

// Tiny inline placeholder to avoid missing asset references
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">\
      <rect width="50" height="50" fill="#f1f5f9"/>\
      <path d="M10 35l10-12 8 9 6-7 6 10H10z" fill="#cbd5e1"/>\
    </svg>'
);

export default class ProductTableComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.table = this.element.querySelector('#products-table');
        this.tableBody = this.element.querySelector('#products-table-body');
        this.selectAllCheckbox = this.element.querySelector('#select-all-checkbox');
        
        // Bulk actions
        this.bulkActionsPanel = document.querySelector('#bulk-actions-panel');
        this.selectionCountSpan = document.querySelector('#selection-count');
        this.bulkDeleteBtn = document.querySelector('#bulk-delete-btn');
        
        this.api_url = '../api/products.php';
        this.all_products = [];
        this.filtered_products = null;
        this.selected_product_ids = new Set();

        this.init_listeners();
        
        // 初始加载（不区分归档）
        this.load_products({ archived: 0 });
    }

    init_listeners() {
        this.eventBus.on('products:reload', () => {
            this.load_products({ archived: 0 });
        });

        this.eventBus.on('products:filter-changed', (filters) => {
            this.apply_filters(filters);
        });

        this.element.addEventListener('click', (e) => this.handle_table_actions(e));
        this.selectAllCheckbox.addEventListener('change', () => this.handle_select_all());
        this.bulkDeleteBtn.addEventListener('click', () => this.handle_bulk_delete());
        

        
        // Listen for the custom event from main.js
        this.element.addEventListener('loadProducts', (e) => {
            this.load_products(e.detail);
        });

    }

    async load_products(filters = { archived: 0 }) {
        try {
            this.all_products = await apiClient.get('/products.php', { archived: filters.archived });
            this.filtered_products = null;
            this.render();
            this.apply_list_animation();
            this.update_bulk_actions_panel();
            this.eventBus.emit('products:loaded', this.all_products);
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `加载产品数据失败: ${error.message}`, type: 'error' });
            this.all_products = [];
            this.filtered_products = null;
            this.render();
            this.apply_list_animation();
        }
    }

    render() {
        this.tableBody.innerHTML = '';
        const list = this.get_current_list();
        if (!list || list.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 2rem; color: #666;">没有找到符合条件的产品</td></tr>';
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.disabled = true;
            return;
        }
        
        this.selectAllCheckbox.disabled = false;

        list.forEach(p => {
            const image_src = p.defaultImage ? `../${p.defaultImage}` : PLACEHOLDER_IMAGE;
            const is_checked = this.selected_product_ids.has(p.id) ? 'checked' : '';
            
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            if(is_checked) row.classList.add('selected');

            // 获取颜色名称
            const color_name = p.color || this.extract_color_label(p.name) || '—';
            const name = p.base_name; // Use only base_name
            
            row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-id="${p.id}" ${is_checked}></td>
                <td><img src="${image_src}" alt="${p.name}" class="product-thumbnail"></td>
                <td class="product-name-cell">${name}</td>
                <td class="product-color-cell">${color_name}</td>
                <td><span class="product-category-cell">${p.category || '未分类'}</span></td>
                <td class="product-description-cell">${p.description ? this.escape_html(p.description) : '—'}</td>
                <td class="product-created-at-cell">${this.format_created_at(p.createdAt)}</td>
                <td class="product-actions-cell sticky-right">
                    <button class="action-btn edit-btn" data-id="${p.id}">编辑</button>
                    <button class="action-btn delete-btn" data-id="${p.id}">删除</button>
                </td>`;
            this.tableBody.appendChild(row);
        });
        
        this.update_select_all_checkbox_state();
    }



    get_base_name(name) { return get_base_name(name); }

    extract_color_label(name) { return extract_color_label(name); }

    color_name_to_hex(color_name) { return color_name_to_hex(color_name); }

    apply_list_animation() {
        const table = this.element.querySelector('#products-table');
        if (!table) return;
        // hard reset animation class to re-trigger
        table.classList.remove('products-list-animate');
        // Force reflow
        void table.offsetWidth;
        table.classList.add('products-list-animate');
        // Staggered row animations
        const rows = Array.from(this.tableBody.querySelectorAll('tr'));
        // reset
        rows.forEach(tr => {
            tr.classList.remove('products-list-animate-soft');
            tr.style.animationDelay = '';
        });
        void this.tableBody.offsetWidth;
        // apply stagger: cap max delay steps to avoid overly long delays on huge lists
        const max_steps = 20;
        const step_ms = 50;
        rows.forEach((tr, index) => {
            const step_index = Math.min(index, max_steps);
            tr.style.animationDelay = `${step_index * step_ms}ms`;
            tr.classList.add('products-list-animate-soft');
        });
    }

    escape_html(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    
    format_created_at(value) {
        if (!value) return '—';
        const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
        const d = new Date(normalized);
        if (Number.isNaN(d.getTime())) {
            return typeof value === 'string' ? value : '—';
        }
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    
    handle_table_actions(e) {
        const target = e.target;
        const product_id = target.dataset.id;
        const product_id_num = product_id ? parseInt(product_id, 10) : null;

        if (target.classList.contains('edit-btn')) {
            const product = this.all_products.find(p => p.id === product_id_num);
            if (product_id_num != null) {
                // 重定向到独立编辑页（复用 add_product.php）
                window.location.href = `add_product.php?id=${product_id_num}`;
            }
        } else if (target.classList.contains('delete-btn')) {
            const product = this.all_products.find(p => p.id === product_id_num);
            if (product && confirm(`确定要删除产品 "${product.name}" 吗？`)) {
                this.delete_product(product_id_num);
            }
        } else if (target.classList.contains('row-checkbox')) {
            this.toggle_row_selection(product_id);
        } else if (target.closest('tr') && !target.closest('.product-actions-cell')) {
            const row = target.closest('tr');
            const checkbox = row.querySelector('.row-checkbox');
            if(checkbox) {
                checkbox.checked = !checkbox.checked;
                this.toggle_row_selection(checkbox.dataset.id);
            }
        }
    }
    
    toggle_row_selection(product_id) {
        const checkbox = this.tableBody.querySelector(`.row-checkbox[data-id="${product_id}"]`);
        if (!checkbox) return;

        if (checkbox.checked) {
            this.selected_product_ids.add(product_id);
            checkbox.closest('tr').classList.add('selected');
        } else {
            this.selected_product_ids.delete(product_id);
            checkbox.closest('tr').classList.remove('selected');
        }
        
        this.update_select_all_checkbox_state();
        this.update_bulk_actions_panel();
    }
    
    update_select_all_checkbox_state() {
        const all_visible_ids = this.get_current_list().map(p => p.id);
        const all_visible_selected = all_visible_ids.every(id => this.selected_product_ids.has(id));
        this.selectAllCheckbox.checked = all_visible_ids.length > 0 && all_visible_selected;
    }
    
    handle_select_all() {
        const is_checked = this.selectAllCheckbox.checked;
        this.get_current_list().forEach(p => {
            const checkbox = this.tableBody.querySelector(`.row-checkbox[data-id="${p.id}"]`);
            if(checkbox) checkbox.checked = is_checked;
            
            if (is_checked) {
                this.selected_product_ids.add(p.id);
                checkbox.closest('tr').classList.add('selected');
            } else {
                this.selected_product_ids.delete(p.id);
                 checkbox.closest('tr').classList.remove('selected');
            }
        });
        this.update_bulk_actions_panel();
    }

    get_current_list() {
        return Array.isArray(this.filtered_products) && this.filtered_products.length >= 0
            ? this.filtered_products
            : this.all_products;
    }
    
    update_bulk_actions_panel() {
        const count = this.selected_product_ids.size;

        if (count > 0) {
            this.bulkActionsPanel.classList.remove('hidden');
            this.selectionCountSpan.textContent = `已选择 ${count} 个项目`;
            this.bulkDeleteBtn.disabled = false;
        } else {
            this.bulkActionsPanel.classList.add('hidden');
            this.bulkDeleteBtn.disabled = true;
        }
    }

    async delete_product(id) {
        try {
            await apiClient.delete(`/products.php?id=${id}`);
            this.eventBus.emit('toast:show', { message: '产品删除成功！', type: 'success' });
            this.load_products(); // Reload products
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `删除产品失败: ${error.message}`, type: 'error' });
        }
    }
    
        // 移除归档相关方法
        
    handle_bulk_delete() {
        const selected_ids = Array.from(this.selected_product_ids);
        if (selected_ids.length === 0) {
            this.eventBus.emit('toast:show', { message: '请先选择要删除的产品', type: 'error' });
            return;
        }
        
        if (confirm(`确定要删除选中的 ${selected_ids.length} 个产品吗？`)) {
            this.bulk_delete_products(selected_ids);
        }
    }

    async bulk_delete_products(ids) {
        try {
            const result = await apiClient.request('/products.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            this.eventBus.emit('toast:show', { message: `成功删除 ${result.deleted_count || 0} 个产品`, type: 'success' });
            this.selected_product_ids.clear();
            this.update_bulk_actions_panel();
            this.load_products({ archived: 0 });
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `批量删除失败: ${error.message}`, type: 'error' });
        }
    }
    

    
    // 统一由 utils/session.js 处理
}

// Filtering utilities
ProductTableComponent.prototype.apply_filters = function(filters) {
    if (!filters || !Array.isArray(filters.conditions) || filters.conditions.length === 0) {
        this.filtered_products = null;
        this.selected_product_ids.clear();
        this.render();
        this.update_bulk_actions_panel();
        return;
    }

    const list = this.all_products || [];
    const logic = (filters.logic || 'AND').toUpperCase();

    const normalize_text = (v) => (v == null ? '' : String(v)).toLowerCase();
    const parse_date = (v) => {
        if (!v) return null;
        const d = new Date(typeof v === 'string' ? v.replace(' ', 'T') : v);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const match_condition = (p, cond) => {
        const field = cond.field;
        const operator = cond.operator;
        const value = cond.value;
        let actual = null;
        switch (field) {
            case 'name': actual = p.name; break;
            case 'description': actual = p.description; break;
            case 'category': actual = p.category; break;
            case 'createdAt': actual = p.createdAt; break;
            default: actual = null;
        }

        // Text/select comparisons
        if (field === 'name' || field === 'description' || field === 'category') {
            const a = normalize_text(actual);
            const b = normalize_text(value);
            if (operator === 'contains') return a.includes(b);
            if (operator === 'equals') return a === b;
            if (operator === 'not_contains') return !a.includes(b);
            if (operator === 'is_empty') return a.length === 0;
            if (operator === 'is_not_empty') return a.length > 0;
            if (operator === 'not_equals') return a !== b;
            return true;
        }

        // Date comparisons
        if (field === 'createdAt') {
            const a = parse_date(actual);
            if (!a) return false;
            if (operator === 'equals') {
                const b = parse_date(value);
                if (!b) return false;
                return a.toDateString() === b.toDateString();
            }
            if (operator === 'before') {
                const b = parse_date(value);
                return b ? a < b : false;
            }
            if (operator === 'after') {
                const b = parse_date(value);
                return b ? a > b : false;
            }
            if (operator === 'between') {
                const start = parse_date(Array.isArray(value) ? value[0] : null);
                const end = parse_date(Array.isArray(value) ? value[1] : null);
                if (!start || !end) return false;
                return a >= start && a <= end;
            }
            return true;
        }

        return true;
    };

    const passes = (p) => {
        if (logic === 'OR') {
            return filters.conditions.some((c) => match_condition(p, c));
        }
        // AND default
        return filters.conditions.every((c) => match_condition(p, c));
    };

    this.filtered_products = list.filter(passes);
    this.selected_product_ids.clear();
    this.render();
    this.apply_list_animation();
    this.update_bulk_actions_panel();
};
