// htdocs/admin/assets/js/components/add_product.js
import BaseComponent from './BaseComponent.js';
import apiClient from '/admin/assets/js/utils/apiClient.js';
import { handle_session_expired } from '../utils/session.js';

export default class ProductFormComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.form = this.element.querySelector('#product-form');
        this.form_title = this.element.querySelector('#form-title');
        this.cancel_btn = this.element.querySelector('#cancel-edit-btn');
        this.current_media_previews = this.element.querySelector('#current-media-previews');
        this.media_input = this.element.querySelector('#media');
        this.media_dropzone = this.element.querySelector('#media-dropzone');
        this.siblings_panel = this.element.querySelector('#siblings-panel');
        this.media_order = []; // 记录 media 排序和默认图设置
        this.media_to_delete = new Set();
        this.object_urls = [];
        this.variant_object_urls = new Map(); // 存储每个变体的URL引用
        this.main_dropzone_url = null; // 记录主上传框的临时 URL，便于替换与释放
        this.category_select = this.element.querySelector('#category');
        this.material_select = this.element.querySelector('#material');
        this.color_select = this.element.querySelector('#color');
        this.add_variant_btn = this.element.querySelector('#add-variant-row');
        this.variants_meta_input = this.element.querySelector('#variants-meta');
        
        this.api_url = '../api/products.php';

        this.eventBus.on('product:edit', (product) => this.show_form(product));
        this.eventBus.on('products:loaded', (products) => this.update_categories(products));
        this.eventBus.on('products:loaded', (products) => this.update_materials(products));
        this.eventBus.on('products:loaded', (products) => this.update_colors(products));
        
        // 监听翻译事件
        this.eventBus.on('translation:apply', (translations) => this.handle_translation_apply(translations));
        this.eventBus.on('translation:generated', (translations) => this.handle_translation_generated(translations));

        this.form.addEventListener('submit', (e) => this.handle_form_submit(e));
        if (this.cancel_btn) {
            this.cancel_btn.addEventListener('click', () => this.hide_form());
        }

        // 动态创建“新选择图片预览”容器，显示在已保存预览的下方
        this.new_media_previews = this.element.querySelector('#new-media-previews');
        if (!this.new_media_previews) {
            this.new_media_previews = document.createElement('div');
            this.new_media_previews.id = 'new-media-previews';
            this.new_media_previews.className = 'media-previews new-media-previews';
            this.current_media_previews.insertAdjacentElement('afterend', this.new_media_previews);
        }

        // 监听文件选择变更与拖拽上传（统一绑定）
        if (this.media_input) {
            this.media_input.addEventListener('change', (e) => this.handle_media_change(e));
        }
        if (this.media_dropzone && this.media_input) {
            this.setup_dropzone(this.media_dropzone, this.media_input, (input_el) => this.handle_media_change({ target: input_el }));
        }

        if (this.add_variant_btn) {
            const open_new_variant = () => this.add_variant_row(true);
            this.add_variant_btn.addEventListener('click', open_new_variant);
            this.add_variant_btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open_new_variant();
                }
            });
        }

        // Ensure categories and materials are loaded when the form page is standalone
        this.update_categories([]);
        this.update_materials([]);
        this.update_colors([]);
    }

    async show_form(product = null) {
        this.show();
        this.form.reset();
        this.current_media_previews.innerHTML = '';
        this.clear_new_media_previews();
        this.clear_all_variant_previews();
        // if (this.variants_container) this.variants_container.innerHTML = ''; // REMOVED
        if (this.variants_meta_input) this.variants_meta_input.value = '';
        
        // 确保下拉菜单选项已加载
        await Promise.all([
            this.update_categories([]),
            this.update_materials([]),
            this.update_colors([])
        ]);
        
        // 如果只传了 id，需要先拉取详情（独立编辑模式）
        if (product && product.id && (!product.name && !product.base_name && !product.category)) {
            try {
                const detail = await apiClient.get('/products.php', { id: product.id });
                return this.show_form(detail);
            } catch (e) {
                this.eventBus.emit('toast:show', { message: '加载产品详情失败', type: 'error' });
            }
        }

        if (product) {
            this.form_title.textContent = '编辑产品';
            
            // 设置产品ID
            this.form.querySelector('#product-id').value = product.id;
            
            // 设置产品名称（base_name）
            const name_input = this.form.querySelector('#name');
            if (name_input) {
                name_input.value = product.base_name || '';
            }
            
            // 设置分类
            if (this.category_select && product.category) {
                this.category_select.value = product.category;
            }
            
            // 设置材质
            if (this.material_select && product.material) {
                this.material_select.value = product.material;
            }
            
            // 设置颜色
            if (this.color_select && product.color) {
                this.color_select.value = product.color;
            }
            
            // 设置描述
            const description_input = this.form.querySelector('#description');
            if (description_input) {
                description_input.value = product.description || '';
            }
            
            // 显示媒体预览
            this.show_current_media_previews(product.media || [], product.defaultImage || null);
            
            // 渲染同组变体
            this.render_siblings(product);
        } else {
            this.form_title.textContent = '添加新产品';
            this.form.querySelector('#product-id').value = '';
        }
        this.element.scrollIntoView({ behavior: 'smooth' });
    }

    hide_form() {
        this.hide();
        this.form.reset();
        this.current_media_previews.innerHTML = '';
        this.clear_new_media_previews();
        this.clear_all_variant_previews();
        if (this.media_input) {
            this.media_input.value = '';
        }
        // Remove added variant rows
        const added_variant_rows = this.siblings_panel.querySelectorAll('.variant-row');
        added_variant_rows.forEach(row => row.remove());
        // Re-append add variant button if it was removed by some logic or initial state
        if (this.add_variant_btn && !this.siblings_panel.contains(this.add_variant_btn)) {
            this.siblings_panel.appendChild(this.add_variant_btn);
        }
    }
    
    async update_categories(products) {
        let categories = [];
        try {
            // add_product 页面下拉统一显示意大利语
            categories = await apiClient.getCategories('it');
        } catch (error) {
            console.error('Failed to load categories:', error);
            categories = Array.isArray(products)
                ? [...new Set(products.map(p => p.category).filter(Boolean))].sort()
                : [];
        }
        const current_val = this.category_select?.value || '';
        if (!this.category_select) return;
        this.category_select.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            // 修复：使用正确的字段映射
            // 如果category是对象（来自API），使用name作为显示文本和值
            // 如果category是字符串（来自产品数据），直接使用
            if (typeof category === 'object' && category.name) {
                option.value = category.name;
                option.textContent = category.name;
            } else {
                option.value = category;
                option.textContent = category;
            }
            this.category_select.appendChild(option);
        });
        this.category_select.value = current_val;
    }

    async update_materials(products) {
        let materials = [];
        try {
            // add_product 页面下拉统一显示意大利语
            materials = await apiClient.getMaterials('it');
        } catch (error) {
            console.error('Failed to load materials:', error);
            materials = Array.isArray(products)
                ? [...new Set(products.map(p => p.material).filter(Boolean))].sort()
                : [];
        }
        const current_val = this.material_select?.value || '';
        if (!this.material_select) return;
        this.material_select.innerHTML = '<option value="">请选择材质</option>';
        materials.forEach(material => {
            const option = document.createElement('option');
            option.value = material; // 使用材质名称作为值
            option.textContent = material; // 使用材质名称作为显示文本
            this.material_select.appendChild(option);
        });
        this.material_select.value = current_val;
    }

    async update_colors(products) {
        let colors = [];
        try {
            const lang = 'it';
            colors = await apiClient.getColors(lang);
        } catch (error) {
            console.error('Failed to load colors:', error);
            colors = Array.isArray(products)
                ? [...new Set(products.map(p => p.color).filter(Boolean))].sort()
                : [];
        }
        const current_val = this.color_select?.value || '';
        if (this.color_select) {
            this.color_select.innerHTML = '<option value="">请选择颜色</option>';
            colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color; // 使用颜色名称作为值
                option.textContent = color; // 使用颜色名称作为显示文本
                this.color_select.appendChild(option);
            });
            this.color_select.value = current_val;
        }
        // 更新所有变体行的颜色选项
        this.update_all_variant_color_options(colors);
    }
    
    async populate_variant_color_options(row) {
        try {
            const lang = 'it';
            const colors = await apiClient.getColors(lang);
            const color_select = row.querySelector('.variant-color-select');
            if (color_select) {
                color_select.innerHTML = '<option value="">请选择颜色</option>';
                colors.forEach(color => {
                    const option = document.createElement('option');
                    option.value = color; // 使用颜色名称作为值
                    option.textContent = color; // 使用颜色名称作为显示文本
                    color_select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Failed to populate variant color options:', error);
        }
    }

    update_all_variant_color_options(colors) {
        const variant_rows = this.siblings_panel?.querySelectorAll('.variant-row') || [];
        variant_rows.forEach(row => {
            const color_select = row.querySelector('.variant-color-select');
            if (color_select) {
                const current_val = color_select.value;
                color_select.innerHTML = '<option value="">请选择颜色</option>';
                colors.forEach(color => {
                    const option = document.createElement('option');
                    option.value = color; // 使用颜色名称作为值
                    option.textContent = color; // 使用颜色名称作为显示文本
                    color_select.appendChild(option);
                });
                color_select.value = current_val;
            }
        });
    }

    async handle_form_submit(e) {
        e.preventDefault();
        // 防抖：避免重复提交导致重复创建产品
        if (this.is_saving === true) {
            return;
        }
        this.is_saving = true;

        // 禁用保存按钮，提升交互明确性
        const save_btn = this.form?.querySelector('button[type="submit"], button.save-product');
        if (save_btn) { try { save_btn.disabled = true; } catch (_) {} }
        const form_data = new FormData(this.form);
        const product_id = form_data.get('id');
        // 收集变体结构：索引与颜色名
        const variants_meta = [];
        const rows = Array.from(this.siblings_panel?.querySelectorAll('.variant-row') || []);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const color_select_input = row.querySelector('select[name="variant_color[]"]');
            const file_input = row.querySelector('input[type="file"]');
            // Skip if both color and file input are missing, or if it's the add variant button's place holder
            if ((!color_select_input && !file_input) || row.id === 'add-variant-row') continue; 

            const color = (color_select_input?.value || '').trim();
            if (!color) {
                this.eventBus.emit('toast:show', { message: '请为每个颜色填写颜色名称', type: 'error' });
                return;
            }
            const declared_index_attr = file_input?.getAttribute('data-variant-index');
            const declared_index = declared_index_attr ? parseInt(declared_index_attr, 10) : i;
            variants_meta.push({ index: declared_index, color });
        }

        if (variants_meta.length > 0) {
            form_data.set('variants_meta', JSON.stringify(variants_meta));
        }
        // 附加媒体排序/删除/默认图
        if (this.media_order && this.media_order.length > 0) {
            form_data.set('media_order', JSON.stringify(this.media_order));
        }
        if (this.media_to_delete && this.media_to_delete.size > 0) {
            form_data.set('delete_media', JSON.stringify(Array.from(this.media_to_delete)));
        }
        const default_input = this.form.querySelector('input[name="default_image_path"][type="hidden"]');
        if (default_input && default_input.value) {
            form_data.set('default_image_path', default_input.value);
        }
        
        try {
            const response = await apiClient.post('/products.php', form_data);
            
            // 获取保存后的产品ID（优先后端返回的 product_id；更新时也返回）
            const saved_product_id = response.product_id || product_id || null;
            
            // 同步翻译内容到数据库
            await this.sync_translations_to_database(saved_product_id);

            this.hide_form();
            this.eventBus.emit('toast:show', { message: product_id ? '产品更新成功！' : '产品添加成功！', type: 'success' });
            // 在独立页面完成后自动返回列表（新增与编辑页面都返回列表）
            const path = (window && window.location && window.location.pathname) ? window.location.pathname : '';
            if (path.indexOf('/admin/add_product.php') !== -1 || path.indexOf('/admin/edit_product.php') !== -1) {
                setTimeout(() => { window.location.href = 'dashboard.php#products'; }, 600);
                return;
            }
            // 内联模式回退到刷新列表
            this.eventBus.emit('products:reload');
            
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `操作失败: ${error.message}`, type: 'error' });
        } finally {
            this.is_saving = false;
            if (save_btn) { try { save_btn.disabled = false; } catch (_) {} }
        }
    }

    add_variant_row(auto_open = false) {
        const index = this.siblings_panel.querySelectorAll('.variant-row').length;
        const row = document.createElement('div');
        row.className = 'variant-chip variant-row';
        row.innerHTML = `
            <button type="button" class="variants__remove" title="移除此变体" aria-label="移除">×</button>
            <div class="upload-dropzone variant-dropzone" role="button" tabindex="0" aria-label="添加颜色图片">
                <label class="plus" style="cursor:pointer;display:flex;align-items:center;justify-content:center;width:100%;height:100%">+</label>
                <input type="file" class="dropzone-input variant-file-input" name="variant_media_${index}[]" accept="image/*" multiple data-variant-index="${index}">
            </div>
            <div class="variant-media-previews" id="variant-preview-${index}"></div>
            <select class="form-control variant-color-select" name="variant_color[]" style="max-width:180px;min-width:160px;">
                <option value="">请选择颜色</option>
            </select>
        `;
        // Insert new variant before the add-variant-row button
        this.siblings_panel.insertBefore(row, this.add_variant_btn);
        // 暂时隐藏“添加颜色”按钮，待当前变体选择了文件后再显示，避免双“+”困惑
        if (this.add_variant_btn) {
            this.add_variant_btn.style.display = 'none';
        }
        
        // 填充颜色选项
        this.populate_variant_color_options(row).then(() => {
            const color_select = row.querySelector('.variant-color-select');
            if (color_select) {
                try { color_select.focus(); } catch (_) {}
            }
        });
        
        // 绑定事件
        const remove_btn = row.querySelector('.variants__remove');
        const file_input = row.querySelector('.variant-file-input');
        const dropzone = row.querySelector('.variant-dropzone');
        
        // 当用户取消选择且没有任何文件、也没有预览时，自动删除空行
        const cleanup_if_empty = () => {
            const has_files = file_input && file_input.files && file_input.files.length > 0;
            const has_preview = row.querySelector('.variant-media-previews .media-preview-item');
            if (!has_files && !has_preview) {
                row.remove();
            }
        };
        
        remove_btn.addEventListener('click', () => {
            this.clear_variant_preview_urls(row);
            row.remove();
            if (this.add_variant_btn) this.add_variant_btn.style.display = '';
        });
        
        file_input.addEventListener('change', (e) => {
            if (!e.target.files || e.target.files.length === 0) {
                cleanup_if_empty();
                return;
            }
            this.handle_variant_media_change(e, index);
            if (this.add_variant_btn) this.add_variant_btn.style.display = '';
        });

        if (dropzone && file_input) {
            this.setup_dropzone(dropzone, file_input, (input_el) => {
                if (!input_el.files || input_el.files.length === 0) {
                    cleanup_if_empty();
                    return;
                }
                this.handle_variant_media_change({ target: input_el }, index);
                if (this.add_variant_btn) this.add_variant_btn.style.display = '';
            });
        }

        // 自动打开文件选择器
        if (auto_open && file_input) {
            // 使用微任务确保节点已插入 DOM
            Promise.resolve().then(() => file_input.click());
        }
    }

    handle_variant_media_change(event, variant_index) {
        const files = Array.from(event.target.files || []);
        // 清除旧的变体预览与URL
        this.clear_variant_preview_urls_by_index(variant_index);
        const preview_container = document.getElementById(`variant-preview-${variant_index}`);
        if (preview_container) {
            preview_container.innerHTML = '';
        }
        // 将变体上传按钮与预览合并：在有文件时用首图填充上传框，点击可替换
        const row = this.siblings_panel?.querySelector(`#variant-preview-${variant_index}`)?.closest('.variant-row');
        if (row) {
            const dropzone = row.querySelector('.variant-dropzone');
            const file_input = row.querySelector('.variant-file-input');
            if (dropzone && file_input) {
                if (files.length > 0) {
                    const url = files[0] ? URL.createObjectURL(files[0]) : '';
                    dropzone.classList.add('has-preview');
                    dropzone.style.backgroundImage = `url('${url}')`;
                    dropzone.style.backgroundSize = 'cover';
                    dropzone.style.backgroundPosition = 'center';
                    const plus = dropzone.querySelector('.plus');
                    if (plus) plus.style.visibility = 'hidden';
                    // 预览模式下禁用覆盖全区域的 input，避免原生与自定义点击同时触发
                    const overlay_input = dropzone.querySelector('.dropzone-input') || file_input;
                    if (overlay_input) overlay_input.style.pointerEvents = 'none';
                    // 点击预览替换文件
                    const open_picker = () => file_input.click();
                    dropzone.onclick = open_picker;
                } else {
                    // 无文件时恢复默认上传按钮
                    dropzone.classList.remove('has-preview');
                    dropzone.style.backgroundImage = '';
                    const plus = dropzone.querySelector('.plus');
                    if (plus) plus.style.visibility = '';
                    // 恢复 input 的事件能力
                    const overlay_input = dropzone.querySelector('.dropzone-input') || file_input;
                    if (overlay_input) overlay_input.style.pointerEvents = '';
                    dropzone.onclick = null;
                }
            }
        }
    }

    render_variant_media_previews(files, variant_index) {
        const preview_container = document.getElementById(`variant-preview-${variant_index}`);
        if (!preview_container) return;

        // 清理之前的预览
        this.clear_variant_preview_urls_by_index(variant_index);

        if (!files.length) {
            preview_container.innerHTML = '';
            return;
        }

        const { fragment, urls } = this.build_preview_fragment(files, 'variant-preview');
        // 存储URLs以便后续清理
        this.variant_object_urls.set(variant_index, urls);
        preview_container.appendChild(fragment);
    }

    clear_variant_preview_urls(row) {
        const file_input = row.querySelector('.variant-file-input');
        if (file_input) {
            const variant_index = parseInt(file_input.getAttribute('data-variant-index'));
            this.clear_variant_preview_urls_by_index(variant_index);
        }
    }

    clear_variant_preview_urls_by_index(variant_index) {
        const urls = this.variant_object_urls.get(variant_index);
        if (urls && urls.length) {
            urls.forEach((url) => URL.revokeObjectURL(url));
        }
        this.variant_object_urls.delete(variant_index);
        
        const preview_container = document.getElementById(`variant-preview-${variant_index}`);
        if (preview_container) {
            preview_container.innerHTML = '';
        }
        // 同步恢复对应上传框的外观
        const row = preview_container ? preview_container.closest('.variant-row') : null;
        if (row) {
            const dropzone = row.querySelector('.variant-dropzone');
            if (dropzone) {
                dropzone.classList.remove('has-preview');
                dropzone.style.backgroundImage = '';
                dropzone.onclick = null;
                const plus = dropzone.querySelector('.plus');
                if (plus) plus.style.visibility = '';
            }
        }
    }

    clear_all_variant_previews() {
        // 清理所有变体预览的URLs
        for (const [index, urls] of this.variant_object_urls) {
            if (urls && urls.length) {
                urls.forEach((url) => URL.revokeObjectURL(url));
            }
        }
        this.variant_object_urls.clear();
        
        // 清理所有预览容器
        const preview_containers = this.siblings_panel?.querySelectorAll('.variant-media-previews') || [];
        preview_containers.forEach(container => {
            container.innerHTML = '';
        });
        // 恢复所有变体上传框为默认外观
        const dropzones = this.siblings_panel?.querySelectorAll('.variant-dropzone') || [];
        dropzones.forEach(dropzone => {
            dropzone.classList.remove('has-preview');
            dropzone.style.backgroundImage = '';
            dropzone.onclick = null;
            const plus = dropzone.querySelector('.plus');
            if (plus) plus.style.visibility = '';
        });
    }

    show_current_media_previews(media, default_image = null) {
        if (!Array.isArray(media)) media = [];
        // 初始化 media_order
        this.media_order = media.slice();
        // 确保有默认图的输入
        let default_input = this.form.querySelector('input[name="default_image_path"][type="hidden"]');
        if (!default_input) {
            default_input = document.createElement('input');
            default_input.type = 'hidden';
            default_input.name = 'default_image_path';
            this.form.appendChild(default_input);
        }
        default_input.value = default_image || (media[0] || '');

        const render = () => {
            // 确保上传方框存在并位于容器内最后
            if (this.media_dropzone && !this.current_media_previews.contains(this.media_dropzone)) {
                this.current_media_previews.appendChild(this.media_dropzone);
            }
            // 清除除上传方框外的所有子节点
            Array.from(this.current_media_previews.children).forEach(child => {
                if (child !== this.media_dropzone) child.remove();
            });

            if (!this.media_order || this.media_order.length === 0) {
                const placeholder = document.createElement('div');
                placeholder.className = 'text-muted';
                placeholder.style.padding = '.5rem 0';
                placeholder.textContent = '暂无已保存图片';
                this.current_media_previews.insertBefore(placeholder, this.media_dropzone);
            } else {
                const fragment = document.createDocumentFragment();
                this.media_order.forEach((m) => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'media-preview-item draggable';
                    wrapper.setAttribute('data-path', m);
                    wrapper.setAttribute('draggable', 'true');
                    wrapper.innerHTML = `
                        <img src="${m && m.startsWith('/') ? m : ('/' + m)}" alt="media">
                        <button type="button" class="media-remove" aria-label="删除" data-path="${m}">×</button>
                    `;
                    fragment.appendChild(wrapper);
                });
                this.current_media_previews.insertBefore(fragment, this.media_dropzone);
            }

            // 删除：右上角 X
            this.current_media_previews.querySelectorAll('.media-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const path = btn.getAttribute('data-path');
                    this.media_to_delete.add(path);
                    this.media_order = this.media_order.filter(p => p !== path);
                    // 第一张自动设为封面
                    if (default_input.value === path) default_input.value = this.media_order[0] || '';
                    render();
                });
            });

            // 拖拽排序
            const items = Array.from(this.current_media_previews.querySelectorAll('.media-preview-item.draggable'));
            let drag_src_el = null;
            items.forEach(el => {
                el.addEventListener('dragstart', (e) => {
                    drag_src_el = el;
                    el.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                });
                el.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const dragging = this.current_media_previews.querySelector('.dragging');
                    if (!dragging || dragging === el) return;
                    const children = Array.from(this.current_media_previews.children);
                    const src_index = children.indexOf(dragging);
                    const target_index = children.indexOf(el);
                    if (src_index < 0 || target_index < 0) return;
                    if (src_index < target_index) {
                        this.current_media_previews.insertBefore(dragging, el.nextSibling);
                    } else {
                        this.current_media_previews.insertBefore(dragging, el);
                    }
                });
            });
            this.current_media_previews.addEventListener('drop', () => {
                // 根据 DOM 顺序重建 media_order（忽略上传方框）
                const paths = Array.from(this.current_media_previews.querySelectorAll('.media-preview-item'))
                    .map(node => node.getAttribute('data-path'));
                this.media_order = paths;
                // 第一张自动设为封面
                if (this.media_order.length > 0) default_input.value = this.media_order[0];
                // 始终把上传方框放到末尾
                if (this.media_dropzone) this.current_media_previews.appendChild(this.media_dropzone);
            });
            // 再次确保上传方框在最后
            if (this.media_dropzone) this.current_media_previews.appendChild(this.media_dropzone);
        };
        render();
    }
    
    // 处理文件选择并展示即时预览
    handle_media_change(event) {
        const files = Array.from(event.target.files || []);
        // 不再渲染额外“新选择的图片预览”，直接与上传按钮合并
        this.clear_new_media_previews();
        // 将主产品上传按钮与预览合并：在有文件时用首图填充上传框，点击可替换
        if (this.media_dropzone) {
            if (files.length > 0) {
                // 释放旧 URL
                if (this.main_dropzone_url) {
                    try { URL.revokeObjectURL(this.main_dropzone_url); } catch (_) {}
                    this.main_dropzone_url = null;
                }
                const url = files[0] ? URL.createObjectURL(files[0]) : '';
                this.main_dropzone_url = url;
                this.media_dropzone.classList.add('has-preview');
                this.media_dropzone.style.backgroundImage = `url('${url}')`;
                this.media_dropzone.style.backgroundSize = 'cover';
                this.media_dropzone.style.backgroundPosition = 'center';
                const plus = this.media_dropzone.querySelector('.plus');
                if (plus) plus.style.visibility = 'hidden';
                // 预览模式下禁用覆盖全区域的 input，避免原生与自定义点击同时触发
                const overlay_input = this.media_dropzone.querySelector('.dropzone-input') || this.media_input;
                if (overlay_input) overlay_input.style.pointerEvents = 'none';
                const open_picker = () => this.media_input && this.media_input.click();
                this.media_dropzone.onclick = open_picker;
            } else {
                this.media_dropzone.classList.remove('has-preview');
                this.media_dropzone.style.backgroundImage = '';
                const plus = this.media_dropzone.querySelector('.plus');
                if (plus) plus.style.visibility = '';
                const overlay_input = this.media_dropzone.querySelector('.dropzone-input') || this.media_input;
                if (overlay_input) overlay_input.style.pointerEvents = '';
                this.media_dropzone.onclick = null;
            }
        }
    }

    // 渲染新选择的图片预览（与已保存图片并列显示在其下方）
    render_selected_media_previews(files) {
        this.clear_new_media_previews();
        if (!files.length) return;

        const { fragment, urls } = this.build_preview_fragment(files, 'new');
        this.object_urls.push(...urls);

        // 添加一个轻微标题，帮助用户区分
        const title = document.createElement('div');
        title.className = 'media-previews-title';
        title.textContent = '新选择的图片预览';

        this.new_media_previews.appendChild(title);
        this.new_media_previews.appendChild(fragment);
    }

    // 构建通用预览片段（返回 { fragment, urls }）
    build_preview_fragment(files, extra_class = '') {
        const fragment = document.createDocumentFragment();
        const urls = [];
        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            urls.push(url);

            const wrapper = document.createElement('div');
            wrapper.className = `media-preview-item${extra_class ? ' ' + extra_class : ''}`;

            const img = document.createElement('img');
            img.src = url;
            img.alt = file.name || 'media';

            wrapper.appendChild(img);
            fragment.appendChild(wrapper);
        });
        return { fragment, urls };
    }

    async render_siblings(product) {
        if (!this.siblings_panel) return;

        // Clear only dynamically added variant rows, keep the add-variant-row button.
        Array.from(this.siblings_panel.children).forEach(child => {
            if (child !== this.add_variant_btn) {
                child.remove();
            }
        });

        // 优先使用后端 siblings 字段
        let siblings = Array.isArray(product.siblings) ? product.siblings : [];
        // 如果没有 siblings 字段，尝试通过 product_id 拉取
        if ((!siblings || siblings.length === 0) && product.product_id) {
            try {
                const items = await apiClient.get('/products.php', { product_id: product.product_id });
                siblings = Array.isArray(items) ? items : [];
            } catch (_) {}
        }
        // 将当前也加入（去重）
        const map = new Map();
        const push_unique = (it) => { if (!map.has(it.id)) map.set(it.id, it); };
        push_unique({ id: product.id, name: product.name, defaultImage: product.defaultImage });
        siblings.forEach(push_unique);
        const list = Array.from(map.values()).filter(item => item.id !== product.id); // 过滤掉当前产品

        // Render existing sibling chips
        list.forEach(it => {
            const is_active = String(it.id) === String(product.id);
            const img = it.defaultImage ? (it.defaultImage.startsWith('/') ? it.defaultImage : `/${it.defaultImage}`) : 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill="#f1f5f9"/></svg>');
            
            // 创建与产品媒体预览相同的结构
            const wrapper = document.createElement('div');
            wrapper.className = `media-preview-item${is_active ? ' active' : ''}`;
            wrapper.setAttribute('data-id', it.id);
            wrapper.innerHTML = `
                <img src="${img}" alt="${it.name}">
                <button type="button" class="media-remove" aria-label="删除" data-id="${it.id}">×</button>
            `;
            
            // 添加点击事件到整个容器
            wrapper.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不跳转
                if (e.target.classList.contains('media-remove')) {
                    return;
                }
                const vid = wrapper.getAttribute('data-id');
                if (String(vid) !== String(product.id)) {
                    window.location.href = `edit_product.php?id=${vid}`;
                }
            });
            
            // 添加删除按钮事件
            const removeBtn = wrapper.querySelector('.media-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    // 这里可以添加删除同组颜色的逻辑
                    this.eventBus.emit('toast:show', { message: '删除同组颜色功能待实现', type: 'info' });
                });
            }
            
            // Insert existing sibling chips before the add-variant-row button
            this.siblings_panel.insertBefore(wrapper, this.add_variant_btn);
        });
    }

    // 清理新预览并释放 URL 资源
    clear_new_media_previews() {
        if (this.object_urls && this.object_urls.length) {
            this.object_urls.forEach((u) => URL.revokeObjectURL(u));
        }
        this.object_urls = [];
        if (this.new_media_previews) {
            this.new_media_previews.innerHTML = '';
        }
        // 恢复主上传框外观
        if (this.media_dropzone) {
            this.media_dropzone.classList.remove('has-preview');
            this.media_dropzone.style.backgroundImage = '';
            this.media_dropzone.onclick = null;
            const plus = this.media_dropzone.querySelector('.plus');
            if (plus) plus.style.visibility = '';
        }
    }
    
    // 翻译功能处理方法
    handle_translation_apply(translations) {
        // 将翻译内容暂存到缓存中，不直接覆盖表单
        this.cache_translations(translations);
    }

    handle_translation_generated(translations) {
        console.log('翻译已生成:', translations);
        // 可以在这里添加翻译生成后的处理逻辑
    }

    cache_translations(translations) {
        // 将翻译内容暂存到sessionStorage中
        if (translations && typeof translations === 'object') {
            sessionStorage.setItem('pending_translations', JSON.stringify(translations));
            this.eventBus.emit('toast:show', {
                type: 'success',
                message: '翻译内容已暂存，保存产品时将同步到数据库'
            });
        }
    }

    get_cached_translations() {
        // 获取暂存的翻译内容
        const cached = sessionStorage.getItem('pending_translations');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error('解析缓存的翻译内容失败:', e);
                return null;
            }
        }
        return null;
    }

    clear_cached_translations() {
        // 清除暂存的翻译内容
        sessionStorage.removeItem('pending_translations');
    }

    async sync_translations_to_database(product_id) {
        // 同步翻译内容到数据库
        const cached_translations = this.get_cached_translations();
        if (!cached_translations || !product_id) {
            return;
        }

        try {
            // 调用翻译API保存翻译到数据库
            const response = await apiClient.post('/translation.php', {
                action: 'save_translations',
                product_id: product_id,
                translations: cached_translations
            });

            if (response.success) {
                console.log('翻译内容已同步到数据库');
                // 清除缓存
                this.clear_cached_translations();
            }
        } catch (error) {
            console.error('同步翻译内容到数据库失败:', error);
            // 显示错误提示给用户
            this.eventBus.emit('toast:show', {
                type: 'error',
                message: '翻译内容同步失败: ' + (error.message || '未知错误')
            });
        }
    }

    apply_translations_to_form(translations, target_language = 'it') {
        if (!translations || typeof translations !== 'object') return;

        // 应用产品名称翻译
        if (translations.name && translations.name[target_language]) {
            const nameInput = this.form.querySelector('#name');
            if (nameInput) {
                const currentValue = nameInput.value.trim();
                if (!currentValue || confirm('是否要覆盖当前的产品名称？')) {
                    nameInput.value = translations.name[target_language];
                }
            }
        }

        // 应用产品描述翻译
        if (translations.description && translations.description[target_language]) {
            const descriptionInput = this.form.querySelector('#description');
            if (descriptionInput) {
                const currentValue = descriptionInput.value.trim();
                if (!currentValue || confirm('是否要覆盖当前的产品描述？')) {
                    descriptionInput.value = translations.description[target_language];
                }
            }
        }

        // 显示成功消息
        this.eventBus.emit('toast:show', {
            type: 'success',
            message: '翻译已应用到表单，请检查并确认内容'
        });
    }

    // 获取当前表单的产品ID（用于翻译API调用）
    get_product_id_for_translation() {
        const productIdInput = this.form.querySelector('#product-id');
        return productIdInput?.value ? parseInt(productIdInput.value) : null;
    }
    
    // 统一由 utils/session.js 处理
}

// 通用拖拽上传绑定（统一产品媒体与变体媒体行为）
ProductFormComponent.prototype.setup_dropzone = function(dropzone, file_input, on_change) {
    // 简单的防抖，避免同一次交互触发两次文件选择
    let last_open_ts = 0;
    const open_picker = (e) => { 
        // 当处于预览模式时，避免与“预览点击替换”的自定义处理重复触发
        if (dropzone.classList.contains('has-preview')) {
            return;
        }
        const now = Date.now();
        if (now - last_open_ts < 300) return;
        // 若点击来源是嵌套的 <input type="file">，不再重复触发
        const target = e?.target;
        if (target && (target === file_input || (target.closest && target.closest('input[type="file"]')))) {
            return;
        }
        last_open_ts = now;
        if (file_input) file_input.click(); 
    };
    // 如果容器声明使用原生 label(for) 触发，则不再绑定自定义 click 打开
    const use_native = dropzone.hasAttribute('data-use-native');
    if (!use_native) {
        // 阻止 input 自身的点击冒泡，避免触发父级 dropzone 的点击处理造成二次弹窗
        if (file_input) {
            file_input.addEventListener('click', (e) => { e.stopPropagation(); });
        }
        dropzone.addEventListener('click', open_picker);
    }
    dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open_picker();
        }
    });
    const preventNoDrop = (e) => { e.preventDefault(); e.stopPropagation(); };
    // 在 dragenter/over/leave 阶段阻止默认，以便显示样式；drop 时单独处理
    ['dragenter','dragover','dragleave'].forEach((evt) => dropzone.addEventListener(evt, preventNoDrop));
    dropzone.addEventListener('dragover', () => dropzone.classList.add('dragover'));
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer?.files || []);
        const dt = new DataTransfer();
        Array.from(file_input.files || []).forEach((f) => dt.items.add(f));
        files.forEach((f) => dt.items.add(f));
        file_input.files = dt.files;
        if (typeof on_change === 'function') on_change(file_input);
    });
};
