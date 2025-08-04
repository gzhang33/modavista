class AdminApp {
    constructor() {
        // DOM元素获取
        this.productsTableBody = document.getElementById('products-table-body');
        this.productFormSection = document.getElementById('product-form-section');
        this.productForm = document.getElementById('product-form');
        this.formTitle = document.getElementById('form-title');
        this.productIdInput = document.getElementById('product-id');
        this.addProductBtn = document.getElementById('add-product-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.toast = document.getElementById('toast-notification');
        this.logoutLink = document.getElementById('logout-link');

        // 新增的元素
        this.refreshStatsBtn = document.getElementById('refresh-stats');
        this.searchProductsInput = document.getElementById('search-products');
        this.filterCategorySelect = document.getElementById('filter-category');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        
        // 媒体库元素
        this.mediaGalleryContainer = document.getElementById('media-gallery');
        this.refreshGalleryBtn = document.getElementById('refresh-gallery');
        this.imagePreviewModal = document.getElementById('image-preview-modal');
        this.modalImage = document.getElementById('modal-image');
        this.closeModal = document.querySelector('.close-modal');
        
        // 数据
        this.products = [];
        this.categories = [];

        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEventListeners();
        await this.loadInitialData();
    }

    // 统一加载初始数据
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadProducts(),
                this.loadDashboardStats(), // 新增
                this.loadMedia() // 加载媒体
            ]);
            this.updateDashboardStats();
        } catch (error) {
            this.showToast(`初始化数据失败: ${error.message}`, 'error');
        }
    }

    // 加载仪表盘高级统计
    async loadDashboardStats() {
        try {
            const response = await fetch('../api/dashboard_stats.php');
            if (!response.ok) throw new Error('无法加载统计数据');
            const stats = await response.json();
            this.renderDashboardCharts(stats);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // 新增：加载媒体库数据
    async loadMedia() {
        try {
            const response = await fetch('../api/media.php');
            if (!response.ok) throw new Error('无法加载媒体库');
            const mediaItems = await response.json();
            this.renderMediaGallery(mediaItems);
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // 检查用户登录状态
    async checkAuth() {
        try {
            const response = await fetch('../api/check_session.php');
            const data = await response.json();
            if (!data.loggedIn) {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = 'login.html';
        }
    }

    // 用户登出
    async logout() {
        try {
            await fetch('../api/logout.php');
            this.showToast('您已成功退出登录', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            this.showToast('退出失败，请重试', 'error');
        }
    }

    // 从API加载产品
    async loadProducts() {
        try {
            const response = await fetch('../api/products.php');
            if (!response.ok) throw new Error('Failed to fetch products');
            this.products = await response.json();
            this.filterProducts(); // 使用 filterProducts 替代直接渲染
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    // 从API加载分类
    async loadCategories() {
        try {
            const response = await fetch('../api/categories.php');
            if (!response.ok) throw new Error('无法获取分类');
            this.categories = await response.json();
            this.populateCategorySelects();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    // 渲染产品表格
    renderProductsTable(productsToRender = this.products) {
        this.productsTableBody.innerHTML = '';
        if (productsToRender.length === 0) {
            this.productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">没有找到符合条件的产品。</td></tr>';
            return;
        }
        productsToRender.forEach(p => {
            const row = document.createElement('tr');
            const imageSrc = p.defaultImage ? `../${p.defaultImage}` : '../images/placeholder.svg';
            row.innerHTML = `
                <td><img src="${imageSrc}" alt="${p.name}" class="table-product-image"></td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td class="description-cell">${p.description}</td>
                <td>${p.media ? p.media.length : 0}</td>
                <td>${p.views || 0}</td>
                <td>
                    <button class="btn-icon btn-edit" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            this.productsTableBody.appendChild(row);
        });
    }

    // 更新仪表盘统计
    updateDashboardStats() {
        document.getElementById('total-products').textContent = this.products.length;
        const totalViews = this.products.reduce((sum, p) => sum + (parseInt(p.views) || 0), 0);
        document.getElementById('total-views').textContent = totalViews;
        const totalMedia = this.products.reduce((sum, p) => sum + (p.media ? p.media.length : 0), 0);
        document.getElementById('total-media').textContent = totalMedia;
        document.getElementById('total-categories').textContent = this.categories.length;
    }

    // 渲染仪表盘图表和列表
    renderDashboardCharts(stats) {
        // 渲染热门产品
        const popularList = document.getElementById('popular-products');
        popularList.innerHTML = '';
        if (stats.popular_products.length > 0) {
            stats.popular_products.forEach(p => {
                const item = document.createElement('div');
                item.className = 'popular-product-item';
                item.innerHTML = `
                    <span>${p.name}</span>
                    <span class="views-count"><i class="fas fa-eye"></i> ${p.views}</span>
                `;
                popularList.appendChild(item);
            });
        } else {
            popularList.innerHTML = '<p>暂无数据</p>';
        }

        // 渲染分类分布
        const categoryChart = document.getElementById('category-distribution');
        categoryChart.innerHTML = '';
        if (stats.category_distribution.length > 0) {
            stats.category_distribution.forEach(c => {
                const item = document.createElement('div');
                item.className = 'category-dist-item';
                const totalProductsWithCategory = this.products.filter(p => p.category === c.category).length;
                const percentage = totalProductsWithCategory > 0 ? ((c.product_count / totalProductsWithCategory) * 100).toFixed(1) : 0;
                item.innerHTML = `
                    <div class="dist-item-info">
                        <span class="category-name">${c.category}</span>
                        <span class="category-count">${c.product_count} 个 (${percentage}%)</span>
                    </div>
                    <div class="dist-item-bar-container">
                        <div class="dist-item-bar" style="width: ${percentage}%;"></div>
                    </div>
                `;
                categoryChart.appendChild(item);
            });
        } else {
            categoryChart.innerHTML = '<p>暂无数据</p>';
        }

        // 渲染最近更新
        const recentList = document.getElementById('recent-activities');
        recentList.innerHTML = '';
        if (stats.recent_updates.length > 0) {
             stats.recent_updates.forEach(p => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <p><strong>${p.name}</strong></p>
                    <small>更新于: ${new Date(p.createdAt).toLocaleString()}</small>
                `;
                recentList.appendChild(item);
            });
        } else {
            recentList.innerHTML = '<p>暂无更新</p>';
        }
    }

    // 上传文件
    async uploadFiles(files) {
        if (!files || files.length === 0) return [];
        const formData = new FormData();
        for (const file of files) {
            formData.append('media[]', file, file.name);
        }
        try {
            const response = await fetch('../api/upload.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'File upload failed');
            return result.paths || [];
        } catch (error) {
            this.showToast(`Upload error: ${error.message}`, 'error');
            return [];
        }
    }

    // 保存产品 (核心逻辑)
    async saveProduct(productData, newFiles) {
        try {
            const newImagePaths = await this.uploadFiles(newFiles);
            const existingMedia = this.getCurrentMediaFromPreviews();
            productData.media = [...existingMedia, ...newImagePaths];

            // 自动设置默认图片
            if (!productData.defaultImage && productData.media.length > 0) {
                productData.defaultImage = productData.media[0];
            } else if (productData.media.length === 0) {
                productData.defaultImage = '';
            }

            const response = await fetch('../api/products.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save product');

            this.showToast(result.message, 'success');
            this.resetForm();
            await this.loadInitialData(); // 重新加载所有数据
        } catch (error) {
            this.showToast(`Save failed: ${error.message}`, 'error');
        }
    }
    
    // 删除产品
    async deleteProduct(id) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
        try {
            const response = await fetch(`../api/products.php?id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            this.showToast(result.message, 'success');
            await this.loadInitialData(); // 重新加载所有数据
        } catch (error) {
            this.showToast(`Delete failed: ${error.message}`, 'error');
        }
    }

    // 新增：渲染媒体库
    renderMediaGallery(mediaItems) {
        this.mediaGalleryContainer.innerHTML = '';
        if (mediaItems.length === 0) {
            this.mediaGalleryContainer.innerHTML = '<p class="text-center">媒体库为空。</p>';
            return;
        }

        let usedCount = 0;
        mediaItems.forEach(item => {
            if (item.is_used) usedCount++;
            const itemEl = document.createElement('div');
            itemEl.className = 'media-gallery-item';
            itemEl.dataset.path = item.path;

            const usageStatus = item.is_used 
                ? '<span class="usage-tag used">已使用</span>' 
                : '<span class="usage-tag unused">未使用</span>';

            itemEl.innerHTML = `
                <img src="../${item.path}" alt="媒体文件" loading="lazy">
                <div class="media-info">
                    ${usageStatus}
                    <button class="btn-icon btn-delete-media" data-path="${item.path}" ${item.is_used ? 'disabled' : ''} title="${item.is_used ? '无法删除已使用的图片' : '删除图片'}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.mediaGalleryContainer.appendChild(itemEl);
        });

        // 更新媒体库统计
        document.getElementById('total-images').textContent = mediaItems.length;
        document.getElementById('used-images').textContent = usedCount;
        document.getElementById('unused-images').textContent = mediaItems.length - usedCount;
    }

    // 新增：删除媒体文件
    async deleteMedia(path) {
        if (!confirm(`确定要永久删除图片 "${path}" 吗？此操作不可撤销。`)) return;
        
        try {
            const response = await fetch('../api/media.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            this.showToast(result.message, 'success');
            await this.loadMedia(); // 重新加载媒体库
        } catch (error) {
            this.showToast(`删除失败: ${error.message}`, 'error');
        }
    }

    // 表单和事件处理
    bindEventListeners() {
        this.addProductBtn.addEventListener('click', () => this.showForm(true));
        this.cancelEditBtn.addEventListener('click', () => this.resetForm());
        this.logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // 导航切换
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.getAttribute('data-section');
                
                document.querySelectorAll('.content-section.active').forEach(s => s.classList.remove('active'));
                document.getElementById(`${sectionId}-section`).classList.add('active');
                
                document.querySelectorAll('.nav-item.active').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        this.refreshStatsBtn.addEventListener('click', async () => {
            this.showToast('正在刷新数据...', 'info');
            await this.loadInitialData();
            this.showToast('数据已更新', 'success');
        });

        this.refreshGalleryBtn.addEventListener('click', async () => {
            this.showToast('正在刷新媒体库...', 'info');
            await this.loadMedia();
            this.showToast('媒体库已更新', 'success');
        });

        this.mediaGalleryContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-media');
            if (deleteBtn) {
                this.deleteMedia(deleteBtn.dataset.path);
                return;
            }

            const img = e.target.closest('img');
            if (img) {
                this.modalImage.src = img.src;
                this.imagePreviewModal.style.display = 'block';
            }
        });
        
        this.closeModal.addEventListener('click', () => {
            this.imagePreviewModal.style.display = 'none';
        });

        this.searchProductsInput.addEventListener('input', () => this.filterProducts());
        this.filterCategorySelect.addEventListener('change', () => this.filterProducts());
        this.clearFiltersBtn.addEventListener('click', () => {
            this.searchProductsInput.value = '';
            this.filterCategorySelect.value = '';
            this.filterProducts();
        });

        this.productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(this.productForm);
            const productData = {
                id: formData.get('id'),
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                defaultImage: this.getCurrentMediaFromPreviews()[0] || null,
            };
            const mediaInput = document.getElementById('media');
            await this.saveProduct(productData, mediaInput.files);
        });

        this.productsTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.btn-edit')) {
                const id = e.target.closest('.btn-edit').dataset.id;
                const product = this.products.find(p => p.id === id);
                this.showForm(false, product);
            }
            if (e.target.closest('.btn-delete')) {
                const id = e.target.closest('.btn-delete').dataset.id;
                this.deleteProduct(id);
            }
        });
    }

    // 新增：根据条件过滤产品并重新渲染表格
    filterProducts() {
        const searchTerm = this.searchProductsInput.value.toLowerCase();
        const category = this.filterCategorySelect.value;

        const filteredProducts = this.products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchTerm);
            const categoryMatch = category ? p.category === category : true;
            return nameMatch && categoryMatch;
        });

        this.renderProductsTable(filteredProducts);
    }

    showForm(isNew, product = null) {
        this.resetForm();
        this.productFormSection.classList.remove('hidden');
        if (isNew) {
            this.formTitle.textContent = '添加新产品';
        } else if (product) {
            this.formTitle.textContent = '编辑产品';
            this.productIdInput.value = product.id;
            this.productForm.name.value = product.name;
            this.productForm.category.value = product.category;
            this.productForm.description.value = product.description;
            this.renderMediaPreviews(product.media || []);
        }
        this.productFormSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    resetForm() {
        this.productForm.reset();
        this.productIdInput.value = '';
        this.formTitle.textContent = '添加新产品';
        document.getElementById('current-media-previews').innerHTML = '';
        this.productFormSection.classList.add('hidden');
    }

    renderMediaPreviews(mediaList) {
        const previewsContainer = document.getElementById('current-media-previews');
        previewsContainer.innerHTML = '';
        mediaList.forEach(mediaPath => {
            previewsContainer.appendChild(this.createMediaPreview(mediaPath));
        });
    }

    createMediaPreview(mediaPath) {
        const wrapper = document.createElement('div');
        wrapper.className = 'media-preview-item';
        wrapper.innerHTML = `
            <img src="../${mediaPath}" alt="Preview">
            <button type="button" class="remove-media-btn" data-path="${mediaPath}">&times;</button>
        `;
        wrapper.querySelector('.remove-media-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            wrapper.remove();
        });
        return wrapper;
    }
    
    getCurrentMediaFromPreviews() {
        return Array.from(document.querySelectorAll('#current-media-previews .remove-media-btn'))
                    .map(btn => btn.dataset.path);
    }
    
    // 填充所有分类下拉列表
    populateCategorySelects() {
        const selects = [
            document.getElementById('category'),
            document.getElementById('filter-category')
        ];
        
        selects.forEach(select => {
            if (!select) return;
            const currentVal = select.value;
            select.innerHTML = ''; // 清空

            // 为筛选器添加 "所有分类" 选项
            if (select.id === 'filter-category') {
                const allOption = document.createElement('option');
                allOption.value = '';
                allOption.textContent = '所有分类';
                select.appendChild(allOption);
            }

            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });

            select.value = currentVal; // 恢复之前选中的值
        });
    }

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast show ${type}`;
        setTimeout(() => {
            this.toast.className = 'toast';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 简单的检查，防止在 login.html 页面上因缺少元素而报错
    if (document.getElementById('dashboard-container')) {
        if (!window.adminApp) {
            window.adminApp = new AdminApp();
        }
    }
}); 