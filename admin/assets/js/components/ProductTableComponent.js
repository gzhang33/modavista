// htdocs/admin/assets/js/components/ProductTableComponent.js
import BaseComponent from './BaseComponent.js';

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
        this.bulkArchiveBtn = document.querySelector('#bulk-archive-btn');
        this.bulkUnarchiveBtn = document.querySelector('#bulk-unarchive-btn');
        
        this.api_url = '../api/products.php';
        this.all_products = [];
        this.selected_product_ids = new Set();

        this.init_listeners();
        
        // Initial load based on current hash
        const current_hash = window.location.hash;
        if (current_hash === '#products-current' || !current_hash) {
            this.load_products({ archived: 0 });
        } else if (current_hash === '#products-archived') {
            this.load_products({ archived: 1 });
        }
    }

    init_listeners() {
        this.eventBus.on('products:reload', () => {
            const current_hash = window.location.hash;
            const archived = current_hash === '#products-archived' ? 1 : 0;
            this.load_products({ archived });
        });

        this.element.addEventListener('click', (e) => this.handle_table_actions(e));
        this.selectAllCheckbox.addEventListener('change', () => this.handle_select_all());
        this.bulkDeleteBtn.addEventListener('click', () => this.handle_bulk_delete());
        
        if (this.bulkArchiveBtn) {
            this.bulkArchiveBtn.addEventListener('click', () => this.handle_bulk_archive('archive'));
        }
        if (this.bulkUnarchiveBtn) {
            this.bulkUnarchiveBtn.addEventListener('click', () => this.handle_bulk_archive('unarchive'));
        }
        
        // Listen for the custom event from main.js
        this.element.addEventListener('loadProducts', (e) => {
            this.load_products(e.detail);
        });
        this.element.addEventListener('productsViewChanged', () => {
            this.update_bulk_actions_panel();
        });
    }

    async load_products(filters = { archived: 0 }) {
        try {
            let url = new URL(this.api_url, window.location.origin);
            url.searchParams.set('archived', filters.archived);
            
            const response = await fetch(url);
            if (!response.ok) {
                const error_data = await response.json();
                throw new Error(error_data.message || `HTTP error! status: ${response.status}`);
            }
            this.all_products = await response.json();
            this.render();
            this.apply_list_animation();
            this.update_bulk_actions_panel();
            this.eventBus.emit('products:loaded', this.all_products);
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `加载产品数据失败: ${error.message}`, type: 'error' });
            this.all_products = [];
            this.render();
            this.apply_list_animation();
        }
    }

    render() {
        this.tableBody.innerHTML = '';
        
        if (!this.all_products || this.all_products.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="9" class="text-center" style="padding: 2rem; color: #666;">没有找到符合条件的产品</td></tr>';
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.disabled = true;
            return;
        }
        
        this.selectAllCheckbox.disabled = false;

        this.all_products.forEach(p => {
            const image_src = p.defaultImage ? `../${p.defaultImage}` : '../images/placeholder.svg';
            const is_checked = this.selected_product_ids.has(p.id) ? 'checked' : '';
            
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            if(is_checked) row.classList.add('selected');

            const archive_btn_text = p.archived == 1 ? '恢复' : '归档';
            const archive_btn_class = p.archived == 1 ? 'unarchive-btn' : 'archive-btn';
            
            row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-id="${p.id}" ${is_checked}></td>
                <td><img src="${image_src}" alt="${p.name}" class="product-thumbnail"></td>
                <td class="product-name-cell">${p.name}</td>
                <td><span class="product-category-cell">${p.category || '未分类'}</span></td>
                <td class="product-description-cell">${p.description ? this.escape_html(p.description) : '—'}</td>
                <td class="product-created-at-cell">${this.format_created_at(p.createdAt)}</td>
                <td class="product-actions-cell sticky-right">
                    <button class="action-btn edit-btn" data-id="${p.id}">编辑</button>
                    <button class="action-btn ${archive_btn_class}" data-id="${p.id}">${archive_btn_text}</button>
                    <button class="action-btn delete-btn" data-id="${p.id}">删除</button>
                </td>`;
            this.tableBody.appendChild(row);
        });
        
        this.update_select_all_checkbox_state();
    }

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

        if (target.classList.contains('edit-btn')) {
            const product = this.all_products.find(p => p.id === product_id);
            if (product) this.eventBus.emit('product:edit', product);
        } else if (target.classList.contains('delete-btn')) {
            const product = this.all_products.find(p => p.id === product_id);
            if (product && confirm(`确定要删除产品 "${product.name}" 吗？`)) {
                this.delete_product(product_id);
            }
        } else if (target.classList.contains('archive-btn')) {
            const product = this.all_products.find(p => p.id === product_id);
            if (product && confirm(`确定要归档产品 "${product.name}" 吗？`)) {
                this.archive_product(product_id, 'archive');
            }
        } else if (target.classList.contains('unarchive-btn')) {
            const product = this.all_products.find(p => p.id === product_id);
            if (product && confirm(`确定要恢复产品 "${product.name}" 吗？`)) {
                this.archive_product(product_id, 'unarchive');
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
        const all_visible_ids = this.all_products.map(p => p.id);
        const all_visible_selected = all_visible_ids.every(id => this.selected_product_ids.has(id));
        this.selectAllCheckbox.checked = all_visible_ids.length > 0 && all_visible_selected;
    }
    
    handle_select_all() {
        const is_checked = this.selectAllCheckbox.checked;
        this.all_products.forEach(p => {
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
    
    update_bulk_actions_panel() {
        const count = this.selected_product_ids.size;
        const current_hash = window.location.hash;
        const is_archived_view = current_hash === '#products-archived';

        // Toggle which bulk buttons are visible based on current view
        if (this.bulkArchiveBtn) this.bulkArchiveBtn.classList.toggle('hidden', is_archived_view);
        if (this.bulkUnarchiveBtn) this.bulkUnarchiveBtn.classList.toggle('hidden', !is_archived_view);

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
            const response = await fetch(`${this.api_url}?id=${id}`, { method: 'DELETE' });
            
            if (!response.ok) {
                // 处理 401 错误 - 会话过期
                if (response.status === 401) {
                    this.handle_session_expired();
                    return;
                }
                
                const result = await response.json();
                throw new Error(result.message || '删除失败');
            }
            
            await response.json();
            this.eventBus.emit('toast:show', { message: '产品删除成功！', type: 'success' });
            this.load_products(); // Reload products
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `删除产品失败: ${error.message}`, type: 'error' });
        }
    }
    
    async archive_product(id, action) {
        const current_archived_status = window.location.hash === '#products-archived' ? 1 : 0;
        try {
            const response = await fetch(this.api_url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action, id: id })
            });
            
            if (!response.ok) {
                // 处理 401 错误 - 会话过期
                if (response.status === 401) {
                    this.handle_session_expired();
                    return;
                }
                
                const result = await response.json();
                throw new Error(result.message || `${action}失败`);
            }

            const result = await response.json();
            const action_text = action === 'archive' ? '归档' : '恢复';
            this.eventBus.emit('toast:show', { message: `产品${action_text}成功！`, type: 'success' });
            this.load_products({ archived: current_archived_status }); // Reload products with current filter
        } catch (error) {
            const action_text = action === 'archive' ? '归档' : '恢复';
            this.eventBus.emit('toast:show', { message: `产品${action_text}失败: ${error.message}`, type: 'error' });
        }
    }
    
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
        const current_archived_status = window.location.hash === '#products-archived' ? 1 : 0;
        try {
            const response = await fetch(this.api_url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: ids })
            });
            
            if (!response.ok) {
                // 处理 401 错误 - 会话过期
                if (response.status === 401) {
                    this.handle_session_expired();
                    return;
                }
                
                const result = await response.json();
                throw new Error(result.message || '批量删除失败');
            }

            const result = await response.json();
            this.eventBus.emit('toast:show', { message: `成功删除 ${result.deleted_count || 0} 个产品`, type: 'success' });
            this.selected_product_ids.clear();
            this.update_bulk_actions_panel();
            this.load_products({ archived: current_archived_status });
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `批量删除失败: ${error.message}`, type: 'error' });
        }
    }
    
    handle_archive_filter_change() {
        this.selected_product_ids.clear();
        this.update_bulk_actions_panel();
        this.load_products();
    }
    
    handle_bulk_archive(action) {
        const selected_ids = Array.from(this.selected_product_ids);
        if (selected_ids.length === 0) {
            this.eventBus.emit('toast:show', { message: '请先选择要操作的产品', type: 'error' });
            return;
        }
        
        const action_text = action === 'archive' ? '归档' : '恢复';
        const filtered_ids = this.get_filtered_ids_for_action(selected_ids, action);
        
        if (filtered_ids.length === 0) {
            this.eventBus.emit('toast:show', { message: `没有可${action_text}的产品`, type: 'warning' });
            return;
        }
        
        if (confirm(`确定要${action_text}选中的 ${filtered_ids.length} 个产品吗？`)) {
            this.bulk_archive_products(filtered_ids, action);
        }
    }
    
    get_filtered_ids_for_action(ids, action) {
        return ids.filter(id => {
            const product = this.all_products.find(p => p.id === id);
            if (!product) return false;
            
            if (action === 'archive') {
                return !product.archived; // Only return non-archived products for archiving
            } else {
                return product.archived; // Only return archived products for unarchiving
            }
        });
    }
    
    async bulk_archive_products(ids, action) {
        const current_archived_status = window.location.hash === '#products-archived' ? 1 : 0;
        try {
            const response = await fetch(this.api_url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action, ids: ids })
            });
            
            if (!response.ok) {
                // 处理 401 错误 - 会话过期
                if (response.status === 401) {
                    this.handle_session_expired();
                    return;
                }
                
                const result = await response.json();
                throw new Error(result.message || `批量${action === 'archive' ? '归档' : '恢复'}失败`);
            }

            const result = await response.json();
            const action_text = action === 'archive' ? '归档' : '恢复';
            this.eventBus.emit('toast:show', { message: `成功${action_text} ${result.affected_count || 0} 个产品`, type: 'success' });
            this.selected_product_ids.clear();
            this.update_bulk_actions_panel();
            this.load_products({ archived: current_archived_status });
        } catch (error) {
            const action_text = action === 'archive' ? '归档' : '恢复';
            this.eventBus.emit('toast:show', { message: `批量${action_text}失败: ${error.message}`, type: 'error' });
        }
    }
    
    /**
     * 处理会话过期的情况
     */
    handle_session_expired() {
        // 显示会话过期提示
        this.eventBus.emit('toast:show', { 
            message: '您的登录已过期，将自动跳转到登录页面', 
            type: 'warning' 
        });
        
        // 延迟 2.5 秒后跳转到登录页面
        setTimeout(() => {
            window.location.href = '/admin/login.html';
        }, 2500);
    }
}
