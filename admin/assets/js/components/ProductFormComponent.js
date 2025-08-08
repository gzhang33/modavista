// htdocs/admin/assets/js/components/ProductFormComponent.js
import BaseComponent from './BaseComponent.js';

export default class ProductFormComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.form = this.element.querySelector('#product-form');
        this.form_title = this.element.querySelector('#form-title');
        this.cancel_btn = this.element.querySelector('#cancel-edit-btn');
        this.current_media_previews = this.element.querySelector('#current-media-previews');
        this.media_input = this.element.querySelector('#media');
        this.object_urls = [];
        this.category_select = this.element.querySelector('#category');
        
        this.api_url = '../api/products.php';

        this.eventBus.on('product:edit', (product) => this.show_form(product));
        this.eventBus.on('products:loaded', (products) => this.update_categories(products));

        this.form.addEventListener('submit', (e) => this.handle_form_submit(e));
        this.cancel_btn.addEventListener('click', () => this.hide_form());

        // 动态创建“新选择图片预览”容器，显示在已保存预览的下方
        this.new_media_previews = this.element.querySelector('#new-media-previews');
        if (!this.new_media_previews) {
            this.new_media_previews = document.createElement('div');
            this.new_media_previews.id = 'new-media-previews';
            this.new_media_previews.className = 'media-previews new-media-previews';
            this.current_media_previews.insertAdjacentElement('afterend', this.new_media_previews);
        }

        // 监听文件选择变更，立即展示预览
        if (this.media_input) {
            this.media_input.addEventListener('change', (e) => this.handle_media_change(e));
        }
    }

    show_form(product = null) {
        this.show();
        this.form.reset();
        this.current_media_previews.innerHTML = '';
        this.clear_new_media_previews();
        
        if (product) {
            this.form_title.textContent = '编辑产品';
            Object.keys(product).forEach(key => {
                const el = this.form.querySelector(`[name="${key}"]`);
                if(el) el.value = product[key];
            });
            this.form.querySelector('#product-id').value = product.id;
            this.show_current_media_previews(product.media || []);
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
        if (this.media_input) {
            this.media_input.value = '';
        }
    }
    
    update_categories(products) {
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
        const current_val = this.category_select.value;
        this.category_select.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.category_select.appendChild(option);
        });
        this.category_select.value = current_val;
    }

    async handle_form_submit(e) {
        e.preventDefault();
        const form_data = new FormData(this.form);
        const product_id = form_data.get('id');
        
        try {
            const response = await fetch(this.api_url, {
                method: 'POST',
                body: form_data,
            });
            
            if (!response.ok) {
                // 处理 401 错误 - 会话过期
                if (response.status === 401) {
                    this.handle_session_expired();
                    return;
                }
                
                const error_data = await response.json();
                throw new Error(error_data.message || 'An unknown error occurred.');
            }
            
            await response.json();

            this.hide_form();
            this.eventBus.emit('toast:show', { message: product_id ? '产品更新成功！' : '产品添加成功！', type: 'success' });
            this.eventBus.emit('products:reload');
            
        } catch (error) {
            this.eventBus.emit('toast:show', { message: `操作失败: ${error.message}`, type: 'error' });
        }
    }

    show_current_media_previews(media) {
        this.current_media_previews.innerHTML = media.map(m => `
            <div class="media-preview-item">
                <img src="../${m}" alt="media">
            </div>
        `).join('');
    }
    
    // 处理文件选择并展示即时预览
    handle_media_change(event) {
        const files = Array.from(event.target.files || []);
        this.render_selected_media_previews(files);
    }

    // 渲染新选择的图片预览（与已保存图片并列显示在其下方）
    render_selected_media_previews(files) {
        this.clear_new_media_previews();
        if (!files.length) return;

        const fragment = document.createDocumentFragment();
        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            this.object_urls.push(url);

            const wrapper = document.createElement('div');
            wrapper.className = 'media-preview-item new';

            const img = document.createElement('img');
            img.src = url;
            img.alt = file.name || 'new media';

            wrapper.appendChild(img);
            fragment.appendChild(wrapper);
        });

        // 添加一个轻微标题，帮助用户区分
        const title = document.createElement('div');
        title.className = 'media-previews-title';
        title.textContent = '新选择的图片预览';

        this.new_media_previews.appendChild(title);
        this.new_media_previews.appendChild(fragment);
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
