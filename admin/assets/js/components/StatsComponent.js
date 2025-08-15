// htdocs/admin/assets/js/components/StatsComponent.js
import BaseComponent from './BaseComponent.js';

export default class StatsComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        this.api_url = '../api/dashboard_stats.php';
        this.refresh_btn = this.element.querySelector('#refresh-stats');

        this.eventBus.on('products:loaded', (products) => this.update_statistics(products));

        if(this.refresh_btn) {
            this.refresh_btn.addEventListener('click', () => {
                 this.eventBus.emit('products:reload');
                 this.eventBus.emit('toast:show', { message: '统计数据已刷新', type: 'success' });
            });
        }
    }

    update_statistics(products) {
        if (!products) return;

        const total_products = products.length;
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const total_categories = categories.length;

        this.element.querySelector('#total-products').textContent = total_products;
        this.element.querySelector('#total-categories').textContent = total_categories;

        this.render_popular_products(products);
        this.render_category_distribution(products);
        this.render_recent_activities(products);
    }
    
    render_popular_products(products) {
        const container = this.element.querySelector('#popular-products');
        if (!container) return;
        const latest_products = products.filter(p => p.createdAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (latest_products.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无产品数据</div>';
            return;
        }
        container.innerHTML = latest_products.map(product => `
            <div class="popular-product-item">
                <img src="${product.defaultImage ? `../${product.defaultImage}` : '../images/placeholder.svg'}" alt="${product.name}" class="popular-product-image">
                <div class="popular-product-info">
                    <div class="popular-product-name">${product.name}</div>
                    <div class="popular-product-category">${product.category || '未分类'}</div>
                </div>
                <div class="popular-product-time">${this.get_time_ago(new Date(product.createdAt))}</div>
            </div>`).join('');
    }

    render_category_distribution(products) {
        const container = this.element.querySelector('#category-distribution');
        if (!container) return;
        const category_count = {};
        products.forEach(product => {
            const category = product.category || '未分类';
            category_count[category] = (category_count[category] || 0) + 1;
        });
        const categories = Object.entries(category_count).sort((a, b) => b[1] - a[1]);
        if (categories.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无分类数据</div>';
            return;
        }
        container.innerHTML = categories.map(([category, count]) => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-count">${count}</span>
            </div>`).join('');
    }

    render_recent_activities(products) {
        const container = this.element.querySelector('#recent-activities');
        if (!container) return;
        const recent_products = products.filter(p => p.createdAt).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent_products.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无最近活动</div>';
            return;
        }
        container.innerHTML = recent_products.map(product => `
            <div class="activity-item">
                <div class="activity-text">添加了产品 "${product.name}"</div>
                <div class="activity-time">${this.get_time_ago(new Date(product.createdAt))}</div>
            </div>`).join('');
    }

    get_time_ago(date) {
        const now = new Date();
        const diff_in_seconds = Math.floor((now - date) / 1000);
        if (diff_in_seconds < 60) return '刚刚';
        if (diff_in_seconds < 3600) return `${Math.floor(diff_in_seconds / 60)} 分钟前`;
        if (diff_in_seconds < 86400) return `${Math.floor(diff_in_seconds / 3600)} 小时前`;
        return `${Math.floor(diff_in_seconds / 86400)} 天前`;
    }
}
