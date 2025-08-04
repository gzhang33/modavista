// Admin Script for Static Version - Using localStorage for data persistence

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productTableBody = document.getElementById('products-table-body');
    const productFormSection = document.getElementById('product-form-section');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const mediaInput = document.getElementById('media');
    const currentMediaPreviews = document.getElementById('current-media-previews');
    const toast = document.getElementById('toast-notification');
    const logoutLink = document.getElementById('logout-link');
    
    // Filter elements
    const searchInput = document.getElementById('search-products');
    const categoryFilter = document.getElementById('filter-category');
    const clearFiltersBtn = document.getElementById('clear-filters');

    // State Variables
    let availableCategories = [];
    let allProducts = [];
    let filteredProducts = [];

    // --- Initial Execution ---
    // 检查登录状态
    checkAuthStatus();
    
    // 初始化导航系统
    initNavigation();
    
    // 初始化统计功能
    initDashboardStats();
    
    // 设置事件监听器
    setupEventListeners();
    
    // --- Navigation System ---
    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.getAttribute('data-section');
                
                // 更新导航状态
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // 显示对应内容区域
                contentSections.forEach(section => section.classList.remove('active'));
                const targetElement = document.getElementById(`${targetSection}-section`);
                if (targetElement) {
                    targetElement.classList.add('active');
                }
                
                // 根据选择的部分加载相应数据
                if (targetSection === 'dashboard') {
                    loadDashboardData();
                } else if (targetSection === 'products') {
                    initializeProductsSection();
                } else if (targetSection === 'gallery') {
                    loadMediaGallery();
                }
            });
        });
    }

    // --- Dashboard Statistics ---
    function initDashboardStats() {
        const refreshBtn = document.getElementById('refresh-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                loadDashboardData();
                showToast('统计数据已刷新', 'success');
            });
        }
        
        // 默认加载dashboard数据
        loadDashboardData();
    }

    async function loadDashboardData() {
        try {
            const products = await fetchProducts();
            updateStatistics(products);
            renderPopularProducts(products);
            renderCategoryDistribution(products);
            renderRecentActivities(products);
        } catch (error) {
    
            showToast('加载统计数据失败', 'error');
        }
    }

    function updateStatistics(products) {
        // 计算统计数据
        const totalProducts = products.length;
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const totalCategories = categories.length;
        const totalMedia = products.reduce((sum, p) => sum + (p.media ? p.media.length : 0), 0);

        // 更新显示
        const totalProductsEl = document.getElementById('total-products');
        const totalViewsEl = document.getElementById('total-views');
        const totalCategoriesEl = document.getElementById('total-categories');
        const totalMediaEl = document.getElementById('total-media');

        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (totalViewsEl) totalViewsEl.textContent = totalViews;
        if (totalCategoriesEl) totalCategoriesEl.textContent = totalCategories;
        if (totalMediaEl) totalMediaEl.textContent = totalMedia;
    }

    function renderPopularProducts(products) {
        const container = document.getElementById('popular-products');
        if (!container) return;

        // 按浏览量排序，取前5个
        const popularProducts = products
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        if (popularProducts.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无产品数据</div>';
            return;
        }

        container.innerHTML = popularProducts.map(product => {
            const imageSrc = product.defaultImage ? 
                `../${product.defaultImage}` : 
                '../images/placeholder.svg';
            
            return `
                <div class="popular-product-item">
                    <img src="${imageSrc}" alt="${product.name}" class="popular-product-image"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';">
                    <div class="popular-product-info">
                        <div class="popular-product-name">${product.name}</div>
                        <div class="popular-product-category">${product.category || '未分类'}</div>
                    </div>
                    <div class="popular-product-views">${product.views || 0} 次浏览</div>
                </div>
            `;
        }).join('');
    }

    function renderCategoryDistribution(products) {
        const container = document.getElementById('category-distribution');
        if (!container) return;

        // 统计分类分布
        const categoryCount = {};
        products.forEach(product => {
            const category = product.category || '未分类';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        const categories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1]);

        if (categories.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无分类数据</div>';
            return;
        }

        container.innerHTML = categories.map(([category, count]) => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-count">${count}</span>
            </div>
        `).join('');
    }

    function renderRecentActivities(products) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        // 按创建时间排序，取最近5个
        const recentProducts = products
            .filter(p => p.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentProducts.length === 0) {
            container.innerHTML = '<div class="text-center" style="color: #718096; padding: 1rem;">暂无最近活动</div>';
            return;
        }

        container.innerHTML = recentProducts.map(product => {
            const date = new Date(product.createdAt);
            const timeAgo = getTimeAgo(date);
            
            return `
                <div class="activity-item">
                    <div class="activity-text">添加了产品 "${product.name}"</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return '刚刚';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} 天前`;
        return `${Math.floor(diffInSeconds / 2592000)} 个月前`;
    }

    // --- Media Gallery Functions ---
    async function loadMediaGallery() {
        try {
            const products = await fetchProducts();
            renderMediaGallery(products);
            
            // 设置刷新按钮事件
            const refreshBtn = document.getElementById('refresh-gallery');
            if (refreshBtn) {
                refreshBtn.onclick = () => {
                    loadMediaGallery();
                    showToast('媒体库已刷新', 'success');
                };
            }
        } catch (error) {
            showToast('加载媒体库失败', 'error');
        }
    }

    function renderMediaGallery(products) {
        const gallery = document.getElementById('media-gallery');
        const totalImagesEl = document.getElementById('total-images');
        const usedImagesEl = document.getElementById('used-images');
        const unusedImagesEl = document.getElementById('unused-images');
        
        if (!gallery) return;

        // 收集所有媒体文件
        const allMedia = new Set();
        const usedMedia = new Map(); // 文件名 -> 使用的产品列表
        
        products.forEach(product => {
            // 添加默认图片
            if (product.defaultImage) {
                const fileName = product.defaultImage.split('/').pop();
                allMedia.add(fileName);
                if (!usedMedia.has(fileName)) {
                    usedMedia.set(fileName, []);
                }
                usedMedia.get(fileName).push(product.name);
            }
            
            // 添加媒体图片
            if (product.media && Array.isArray(product.media)) {
                product.media.forEach(mediaPath => {
                    const fileName = mediaPath.split('/').pop();
                    allMedia.add(fileName);
                    if (!usedMedia.has(fileName)) {
                        usedMedia.set(fileName, []);
                    }
                    usedMedia.get(fileName).push(product.name);
                });
            }
        });

        // 模拟获取所有可用的图片文件（实际应用中可通过API获取）
        const availableImages = [
            'defaultImage-1752510652191-954140200.jpg',
            'defaultImage-1752511253553-628430007.jpg',
            'defaultImage-1752512179627-483524609.jpg',
            'defaultImage-1752610950768-647209981.jpg',
            'media-1752672207742-245485399.jpg',
            'media-1752672207775-776118702.jpg',
            'media-1752672207791-908322700.jpg',
            'placeholder.svg'
        ];

        // 更新统计
        const totalImages = availableImages.length;
        const usedImages = usedMedia.size;
        const unusedImages = totalImages - usedImages;

        if (totalImagesEl) totalImagesEl.textContent = totalImages;
        if (usedImagesEl) usedImagesEl.textContent = usedImages;
        if (unusedImagesEl) unusedImagesEl.textContent = unusedImages;

        // 渲染媒体项
        gallery.innerHTML = availableImages.map(fileName => {
            const isUsed = usedMedia.has(fileName);
            const usedInProducts = isUsed ? usedMedia.get(fileName) : [];
            
            return `
                <div class="media-item">
                    <img src="../images/${fileName}" alt="${fileName}" class="media-image"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';">
                    <div class="media-info">
                        <div class="media-name">${fileName}</div>
                        <span class="media-status ${isUsed ? 'used' : 'unused'}">
                            ${isUsed ? '已使用' : '未使用'}
                        </span>
                        ${isUsed ? `
                            <div class="media-products">
                                使用于: ${usedInProducts.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- Product Management Functions ---
    async function initializeProductsSection() {
        try {
            // 在这里设置按钮监听器
            const addProductBtn = document.getElementById('add-product-btn');
            if (addProductBtn) {
                addProductBtn.addEventListener('click', () => showForm());
            }

            const products = await fetchProducts();
            allProducts = products;
            filteredProducts = [...allProducts];
            
            // 从产品中获取分类
            availableCategories = loadCategoriesFromProducts();
            
            // 填充分类过滤器
            populateCategoryFilter();
            
            // 渲染产品表格
            renderTable(filteredProducts);
            
        } catch (error) {
            showToast('加载产品数据失败', 'error');
        }
    }
    
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        renderTable(filteredProducts);
    }

    function renderTable(products) {
        if (!productTableBody) return;
        
        productTableBody.innerHTML = '';
        
        if (!products || products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: #666;">没有找到产品数据</td></tr>';
            renderMobileCards([]);
            return;
        }
        
        products.forEach(p => {
            // 修复图片路径
            const imageSrc = p.defaultImage ? `../${p.defaultImage}` : '../images/placeholder.svg';
            
            const row = `
                <tr>
                    <td>
                        <div class="image-container">
                            <img src="${imageSrc}" 
                                 alt="${p.name}" 
                                 class="product-thumbnail"
                                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
                        </div>
                    </td>
                    <td class="product-name-cell">${p.name}</td>
                    <td><span class="product-category-cell">${p.category || '未分类'}</span></td>
                    <td class="product-description-cell" title="${p.description || ''}">${(p.description || '-').substring(0, 50)}${p.description && p.description.length > 50 ? '...' : ''}</td>
                    <td>${p.media ? p.media.length : 0}</td>
                    <td class="views-cell">${p.views || 0}</td>
                    <td class="product-actions-cell">
                        <button class="action-btn edit-btn" data-id="${p.id}">编辑</button>
                        <button class="action-btn delete-btn" data-id="${p.id}">删除</button>
                    </td>
                </tr>`;
            productTableBody.innerHTML += row;
        });
        
        // 同时更新移动端卡片视图
        renderMobileCards(products);
    }
    
    function renderMobileCards(products) {
        const mobileContainer = document.getElementById('products-grid') || createMobileContainer();
        if (!mobileContainer) return;
        
        mobileContainer.innerHTML = '';
        
        if (!products || products.length === 0) {
            mobileContainer.innerHTML = '<div class="text-center" style="padding: 2rem; color: #666;">没有找到产品数据</div>';
            return;
        }
        
        products.forEach(p => {
            // 修复移动端卡片的图片路径
            const imageSrc = p.defaultImage ? `../${p.defaultImage}` : '../images/placeholder.svg';
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-card-header">
                    <img src="${imageSrc}" 
                         alt="${p.name}" 
                         class="product-card-image"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';">
                    <div class="product-card-info">
                        <div class="product-card-name">${p.name}</div>
                        <span class="product-card-category">${p.category || '未分类'}</span>
                    </div>
                </div>
                <div class="product-card-details">
                    <div class="product-card-detail">
                        <span class="product-card-detail-label">描述</span>
                        <span class="product-card-detail-value">${(p.description || '-').substring(0, 30)}${p.description && p.description.length > 30 ? '...' : ''}</span>
                    </div>
                    <div class="product-card-detail">
                        <span class="product-card-detail-label">媒体</span>
                        <span class="product-card-detail-value">${p.media ? p.media.length : 0} 个文件</span>
                    </div>
                    <div class="product-card-detail">
                        <span class="product-card-detail-label">浏览量</span>
                        <span class="product-card-detail-value">${p.views || 0}</span>
                    </div>
                </div>
                ${p.description ? `<div class="product-card-description">${p.description}</div>` : ''}
                <div class="product-card-actions">
                    <button class="action-btn edit-btn" data-id="${p.id}">编辑</button>
                    <button class="action-btn delete-btn" data-id="${p.id}">删除</button>
                </div>
            `;
            mobileContainer.appendChild(card);
        });
        
        // 为移动端卡片添加事件监听
        handleMobileEvents(mobileContainer);
    }
    
    function createMobileContainer() {
        const container = document.createElement('div');
        container.id = 'products-grid';
        container.className = 'products-grid';
        
        // 在表格容器后插入
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer && tableContainer.parentNode) {
            tableContainer.parentNode.insertBefore(container, tableContainer.nextSibling);
        }
        
        return container;
    }

    function showForm(product = null) {
        if (!productFormSection) {
            return;
        }
        
        productFormSection.classList.remove('hidden');
        
        if (product) {
            formTitle.textContent = '编辑产品';
            document.getElementById('product-id').value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description || '';
            document.getElementById('category').value = product.category || '';
            
            // 显示当前媒体预览
            showCurrentMediaPreviews(product);
        } else {
            formTitle.textContent = '添加新产品';
            productForm.reset();
            document.getElementById('product-id').value = '';
            if (currentMediaPreviews) {
                currentMediaPreviews.innerHTML = '';
            }
        }
        
        // 滚动到表单
        productFormSection.scrollIntoView({ behavior: 'smooth' });
    }

    function showCurrentMediaPreviews(product) {
        if (!currentMediaPreviews) return;
        
        currentMediaPreviews.innerHTML = '';
        
        // 显示默认图片
        if (product.defaultImage) {
            const img = document.createElement('img');
            img.src = `../${product.defaultImage}`;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.border = '2px solid #007bff';
            img.title = '默认图片';
            currentMediaPreviews.appendChild(img);
        }
        
        // 显示其他媒体
        if (product.media && Array.isArray(product.media)) {
            product.media.forEach(mediaPath => {
                const img = document.createElement('img');
                img.src = `../${mediaPath}`;
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '4px';
                img.style.border = '1px solid #ddd';
                currentMediaPreviews.appendChild(img);
            });
        }
    }

    function hideForm() {
        if (productFormSection) {
            productFormSection.classList.add('hidden');
        }
    }

    function showToast(message, type = 'success') {
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast toast-${type}`;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // --- Authentication Functions ---
    function checkAuthStatus() {
        // 简化的认证检查 - 只检查 localStorage
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }
        
        // 可选：检查登录时间（24小时过期）
        const loginTime = localStorage.getItem('adminLoginTime');
        if (loginTime) {
            const sessionDuration = Date.now() - parseInt(loginTime);
            const maxDuration = 24 * 60 * 60 * 1000; // 24小时
            
            if (sessionDuration > maxDuration) {
                console.log('会话已过期');
                logout();
                return;
            }
        }
    }
    
    function logout() {
        // 简化的登出 - 只清理 localStorage
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'login.html';
    }

    // --- Data Management Functions ---
    const API_URL = '../api/products.php';

    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            showToast(`加载产品数据失败: ${error.message}`, 'error');
            return [];
        }
    }
    
    // --- Category Management ---
    function getDefaultCategories() {
        return ['maglia', 'camicia', 'abito', 'giubotto', 'giacca', 'top', 'Pantaloni', 'gonna'];
    }
    
    function loadCategoriesFromProducts() {
        const categories = new Set();
        allProducts.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
        
        // 合并默认分类和产品中的分类
        const defaultCats = getDefaultCategories();
        defaultCats.forEach(cat => categories.add(cat));
        
        return Array.from(categories).sort();
    }

    // --- Product CRUD Operations ---
    async function createProduct(formData) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData, // 直接发送 FormData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '创建失败');
            }
            return await response.json();
        } catch (error) {
            showToast(`创建产品失败: ${error.message}`, 'error');
            return null;
        }
    }
    
    async function updateProduct(id, formData) {
        try {
            // 将 ID 添加到 FormData 中
            formData.append('id', id);
            
            const response = await fetch(API_URL, {
                method: 'POST', // 依然使用 POST
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '更新失败');
            }
            return await response.json();
        } catch (error) {
            showToast(`更新产品失败: ${error.message}`, 'error');
            return null;
        }
    }
    
    async function deleteProduct(id) {
        try {
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '删除失败');
            }
            return await response.json();
        } catch (error) {
            showToast(`删除产品失败: ${error.message}`, 'error');
            return null;
        }
    }

    // --- UI Functions ---
    
    function populateCategoryFilter() {
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">所有分类</option>';
            availableCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }

        // 同时填充表单中的分类选择器
        const formCategorySelect = document.getElementById('category');
        if (formCategorySelect) {
            formCategorySelect.innerHTML = '';
            
            // 添加现有分类
            availableCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                formCategorySelect.appendChild(option);
            });
            
            // 添加常用分类选项
            const commonCategories = ['abito', 'accessori', 'scarpe', 'borse'];
            commonCategories.forEach(category => {
                if (!availableCategories.includes(category)) {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    formCategorySelect.appendChild(option);
                }
            });
        }
    }

    // --- Filter Functions ---
    function clearFilters() {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        applyFilters();
    }

    // --- File Upload Simulation ---
    function handleFilePreview(files) {
        if (!currentMediaPreviews || !files.length) return;
        
        currentMediaPreviews.innerHTML = '';
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '80px';
                    img.style.height = '80px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid #ddd';
                    img.style.margin = '0 10px 10px 0';
                    currentMediaPreviews.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Mobile Functions ---
    function setupMobileMenu() {
        // 创建移动端菜单按钮
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.setAttribute('aria-label', 'Toggle menu');
        document.body.appendChild(mobileToggle);
        
        const sidebar = document.querySelector('.sidebar');
        
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            mobileToggle.innerHTML = sidebar.classList.contains('mobile-open') ? '✕' : '☰';
        });
        
        // 点击主内容区域时关闭菜单
        document.querySelector('.main-content').addEventListener('click', () => {
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                mobileToggle.innerHTML = '☰';
            }
        });
        
        // ESC键关闭菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                mobileToggle.innerHTML = '☰';
            }
        });
    }
    
    function handleMobileEvents(container) {
        if (!container) return;
        
        // 为移动端卡片添加事件监听
        container.addEventListener('click', async (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const product = allProducts.find(p => p.id === id);
                if (product) {
                    showForm(product);
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                const product = allProducts.find(p => p.id === id);
                if (product && confirm(`确定要删除产品 "${product.name}" 吗？`)) {
                    const result = await deleteProduct(id);
                    if (result) {
                        showToast('产品删除成功！');
                        // 重新从API加载数据以刷新列表
                        allProducts = await fetchProducts();
                        applyFilters();
                    }
                }
            }
        });
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // 导航已在 initNavigation() 中设置
        
        // 取消按钮
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideForm);
        }
        
        // 表单提交
        if (productForm) {
            productForm.addEventListener('submit', handleFormSubmit);
        }
        
        // 搜索和过滤
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', applyFilters);
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = '';
                applyFilters();
            });
        }
        
        // 退出登录
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    logout();
                }
            });
        }
        
        // Table event delegation
        if (productTableBody) {
            productTableBody.addEventListener('click', async (e) => {
                if (e.target.classList.contains('edit-btn')) {
                    const id = e.target.dataset.id;
                    const product = allProducts.find(p => p.id === id);
                    if (product) {
                        showForm(product);
                    }
                } else if (e.target.classList.contains('delete-btn')) {
                    const id = e.target.dataset.id;
                    const product = allProducts.find(p => p.id === id);
                    if (product && confirm(`确定要删除产品 "${product.name}" 吗？`)) {
                        const result = await deleteProduct(id);
                        if (result) {
                            showToast('产品删除成功！');
                            // 重新从API加载数据以刷新列表
                            allProducts = await fetchProducts();
                            applyFilters();
                        }
                    }
                }
            });
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const submitButton = productForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在保存...';

        try {
            const formData = new FormData(productForm);
            const productId = formData.get('id');
            
            // 验证必填字段
            if (!formData.get('name') || !formData.get('category')) {
                showToast('产品名称和分类是必填项', 'error');
                throw new Error('表单验证失败');
            }
            
            // 创建或更新产品
            let result;
            if (productId) {
                result = await updateProduct(productId, formData);
            } else {
                result = await createProduct(formData);
            }

            // 更新界面
            if (result && (result.id || result.message)) { // 检查一个有效的成功响应
                hideForm();
                showToast(productId ? '产品更新成功！' : '产品添加成功！', 'success');
                
                allProducts = await fetchProducts();
                availableCategories = loadCategoriesFromProducts();
                populateCategoryFilter();
                applyFilters();
            } else {
                // Error toast is shown inside create/updateProduct, so just throw
                throw new Error(productId ? '更新产品失败' : '添加产品失败');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // 恢复按钮状态
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    // 设置媒体输入监听器
    if (mediaInput) {
        mediaInput.addEventListener('change', () => {
            handleFilePreview(mediaInput.files);
        });
    }

    // --- Initialization ---
    async function initializeApp() {
        try {
            
            // 检查关键DOM元素是否存在
            if (!productTableBody) {
                return;
            }
            
            allProducts = await fetchProducts();
            
            filteredProducts = [...allProducts];
            
            // 从产品中获取分类
            availableCategories = loadCategoriesFromProducts();
            
            // 填充分类过滤器
            populateCategoryFilter();
            
            // 渲染产品表格
            renderTable(filteredProducts);
            
            // 设置移动端功能
            setupMobileMenu();
            
        } catch (error) {
            showToast('应用初始化失败', 'error');
        }
    }

    // 开始初始化
    initializeApp();
    
    // 添加数据导出功能
    window.exportProducts = function() {
        try {
            const dataStr = JSON.stringify(allProducts, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `products-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('产品数据已导出');
        } catch (error) {
            showToast('导出失败', 'error');
        }
    };

    // 添加重置数据功能
    window.resetProducts = function() {
        if (confirm('确定要重置所有产品数据吗？此操作不可逆！将清空数据库中的所有产品！')) {
            // 这个功能在API模式下需要一个特殊的API端点来完成，暂时禁用
            showToast('此功能在当前模式下被禁用。', 'error');
        }
    };
    
}); 
