// 全新的、模块化的 product.js

document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
});

/**
 * 初始化产品详情页
 */
async function initProductPage() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        displayError('ID prodotto non valido o mancante.');
        return;
    }

    try {
        const product = await fetchProductDetails(productId);
        renderProductDetails(product);
        fetchAndRenderRelatedProducts(product.category, product.id);
    } catch (error) {
        displayError(error.message);
    }
}

/**
 * 从 URL 获取产品 ID
 * @returns {string|null} 产品ID
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/** 
 * 从 API 获取单个产品的详细信息
 * @param {string} productId - 产品ID
 * @returns {Promise<Object>} 产品数据
 */
async function fetchProductDetails(productId) {
    const response = await fetch(`/api/products.php?id=${productId}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Prodotto non trovato.');
        }
        throw new Error('Impossibile caricare i dettagli del prodotto.');
    }
    return await response.json();
}

/**
 * 渲染主产品的详细信息
 * @param {Object} product - 产品数据
 */
function renderProductDetails(product) {
    const container = document.getElementById('product-details-content');
    if (!container) return;
    
    document.title = `${product.name} - Moda Italiana`;

    const images = product.media && product.media.length > 0 ? product.media : [];
    if (product.defaultImage && !images.includes(product.defaultImage)) {
        images.unshift(product.defaultImage);
    }

    const breadcrumbsHTML = `
        <div class="breadcrumbs">
            <a href="/">Home</a> / 
            <a href="/#collection">Collezione</a> / 
            <span>${product.name}</span>
        </div>`;

    const imageGalleryHTML = `
        <div class="product-gallery">
            <div class="main-image-container">
                <img src="${images.length > 0 ? '/' + images[0] : '/images/placeholder.svg'}" alt="Immagine principale di ${product.name}" id="main-product-image" class="main-image loaded">
            </div>
            <div class="product-media-thumbnails" id="thumbnail-images">
                ${images.map((img, index) => `
                    <img src="/${img}" alt="Miniatura ${index + 1}" class="thumbnail-image ${index === 0 ? 'active' : ''}" data-src="/${img}">
                `).join('')}
            </div>
        </div>`;

    const productInfoHTML = `
        <div class="product-info">
            <h1 class="product-title">${product.name}</h1>
            <div class="product-fabric">
                <h4>Descrizione</h4>
                <p class="product-description">${product.description || 'Nessuna descrizione disponibile.'}</p>
            </div>
            <div class="product-options">
                <h4>Categoria</h4>
                <p>${product.category}</p>
            </div>
        </div>`;

    container.innerHTML = `
        ${breadcrumbsHTML}
        <div class="product-layout">
            ${imageGalleryHTML}
            ${productInfoHTML}
        </div>
    `;

    // 渲染完成后再绑定事件
    setupImageGalleryListeners();
}

/**
 * 为图片库（主图和缩略图）绑定事件监听
 */
function setupImageGalleryListeners() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-image');

    // 确保主图片显示（处理错误情况）
    if (mainImage) {
        mainImage.onerror = () => { 
            mainImage.src = '/images/placeholder.svg';
            mainImage.classList.add('loaded');
        };
    }

    thumbnails.forEach(thumb => {
        // 添加加载完成事件监听
        thumb.addEventListener('load', () => {
            thumb.classList.add('loaded');
        });

        // 如果图片已经加载完成，立即添加loaded类
        if (thumb.complete && thumb.naturalWidth > 0) {
            thumb.classList.add('loaded');
        }

        thumb.addEventListener('click', () => {
            const newSrc = thumb.dataset.src;
            if (!mainImage.src.endsWith(newSrc)) {
                mainImage.classList.remove('loaded');
                mainImage.style.opacity = '0';
                setTimeout(() => {
                    mainImage.src = newSrc;
                    // 等待新图片加载完成后再显示
                    mainImage.addEventListener('load', function showNewImage() {
                        mainImage.classList.add('loaded');
                        mainImage.style.opacity = '1';
                        mainImage.removeEventListener('load', showNewImage);
                    });
                }, 200);
            }
            
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });

        // 缩略图错误处理
        thumb.onerror = () => { 
            thumb.src = '/images/placeholder.svg'; 
            thumb.classList.add('loaded'); // 即使错误也显示占位图
        };
    });
}

/**
 * 获取并渲染相关产品
 * @param {string} category - 当前产品的分类
 * @param {string} currentProductId - 当前产品的ID，用于排除
 */
async function fetchAndRenderRelatedProducts(category, currentProductId) {
    const container = document.getElementById('related-products-grid');
    if (!container) return;

    try {
        const response = await fetch(`/api/products.php?category=${encodeURIComponent(category)}&exclude=${encodeURIComponent(currentProductId)}`);
        const relatedProducts = await response.json();

        if (relatedProducts && relatedProducts.length > 0) {
            container.innerHTML = relatedProducts.map(createProductCard).join('');
        } else {
            container.innerHTML = '<p>Nessun prodotto correlato trovato.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Impossibile caricare i prodotti correlati.</p>';
    }
}

/**
 * 创建单个产品卡的HTML
 * @param {Object} product - 产品数据
 * @returns {string} HTML字符串
 */
function createProductCard(product) {
    const fallbackFromMedia = Array.isArray(product.media) && product.media.length > 0 ? product.media[0] : null;
    const chosenPath = product.defaultImage || fallbackFromMedia;
    const imageSrc = chosenPath ? `/${chosenPath}` : '/images/placeholder.svg';
    return `
      <article class="product-card related-product" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-image-container spinner">
          <img 
            src="${imageSrc}" 
            alt="${product.name}" 
            class="product-img" 
            loading="lazy"
            onload="this.closest('.product-image-container').classList.add('loaded');this.closest('.product-image-container').classList.remove('spinner');"
            onerror="this.onerror=null; this.src='/images/placeholder.svg'; this.closest('.product-image-container').classList.add('loaded'); this.closest('.product-image-container').classList.remove('spinner');"
          >
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category}</p>
        </div>
      </article>
    `;
}

/**
 * 在页面上显示错误信息
 * @param {string} message - 要显示的错误信息
 */
function displayError(message) {
    const container = document.getElementById('product-details-content');
    if (container) {
        container.innerHTML = `<div class="error-state">${message}</div>`;
    }
    // 隐藏相关产品部分
    const relatedSection = document.querySelector('.related-products-section');
    if (relatedSection) {
        relatedSection.style.display = 'none';
    }
} 