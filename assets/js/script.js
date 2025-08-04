// Modern Fashion E-commerce Product Display Script
class ProductGrid {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.loading = true;
    this.currentCategory = 'all';

    this.categoryFilter = document.getElementById('category-filter');
    this.sortFilter = document.getElementById('sort-filter');
    this.resetBtn = document.getElementById('reset-filters');
    
    this.init();
  }

  async init() {
    // Load products and categories in parallel
    await Promise.all([this.loadProducts(), this.loadCategories()]);

    this.filteredProducts = [...this.products];
    this.renderProducts();
    // Navigation filters are setup after categories are rendered
    this.setupMobileNavigation();
    this.setupDynamicContent(); // New method for dynamic behaviors
    this.handleInitialRoute();
    this.setupBrowserNavigation();

    if (this.categoryFilter && this.sortFilter && this.resetBtn) {
      this.setupFilters();
    }
  }

  async loadProducts() {
    try {
      const response = await fetch('api/products.php');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.products = await response.json();
      this.loading = false;
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError();
    }
  }

  async loadCategories() {
    try {
      const response = await fetch('api/categories.php');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const categories = await response.json();
      this.renderNavigation(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      const navContainer = document.querySelector('.main-nav ul');
      if (navContainer) {
        navContainer.innerHTML = '<li data-categories="all" class="active"><a href="#">Tutti i Prodotti</a></li>';
        this.setupNavigationFilters(); 
      }
    }
  }

  renderNavigation(categories) {
    const navContainer = document.querySelector('.main-nav ul');
    if (!navContainer) return;

    const allProductsHTML = '<li data-categories="all" class="active"><a href="#">Tutti i Prodotti</a></li>';
    const categoriesHTML = categories.map(category => `
      <li data-categories="${category}"><a href="#">${category}</a></li>
    `).join('');

    navContainer.innerHTML = allProductsHTML + categoriesHTML;
    this.setupNavigationFilters(); // Re-setup listeners after dynamic render
  }

  renderProducts() {
    const grid = document.getElementById('product-list');
    if (!grid) {
      return;
    }
    
    const productsToRender = this.filteredProducts;
    
    if (!productsToRender || productsToRender.length === 0) {
      grid.innerHTML = this.getEmptyState();
      return;
    }

    const cardsHTML = productsToRender.map(product => this.createProductCard(product)).join('');
    grid.innerHTML = cardsHTML;
    
    setTimeout(() => {
      this.verifyAndFixImages();
    }, 10);
    
    // We call setupDynamicContent which includes observing cards for animation
    this.setupDynamicContent();
  }
  
  verifyAndFixImages() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    
    const images = grid.querySelectorAll('img');
    
    images.forEach((img) => {
      if (img.dataset.verified) return;
      img.dataset.verified = 'true';
      
      if (!img.src || img.src === window.location.href || img.src === '') {
        img.src = './images/placeholder-optimized.svg';
      }
      
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      } else if (img.complete && img.naturalHeight === 0) {
        img.src = './images/placeholder-optimized.svg';
        img.classList.add('error');
      }
    });
  }

  createProductCard(product) {
    const isNew = this.isNewProduct(product);
    let imageSrc = product.defaultImage || 'images/placeholder-optimized.svg';

    return `
      <article class="product-card" data-product-id="${product.id}" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-image-container image-container">
          ${this.createProductBadges(isNew)}
          <img 
            src="${imageSrc}" 
            alt="${product.name}" 
            class="product-img"
            loading="lazy"
            decoding="async"
            onload="this.classList.add('loaded')"
            onerror="this.src='images/placeholder-optimized.svg'; this.classList.add('error');"
          >
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${product.category || ''}</p>
        </div>
      </article>
    `;
  }

  createProductBadges(isNew) {
    let badges = '';
    if (isNew) badges += '<span class="product-badge badge-new">New</span>';
    return badges ? `<div class="product-badges">${badges}</div>` : '';
  }

  isNewProduct(product) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return product.createdAt && new Date(product.createdAt) > thirtyDaysAgo;
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      });
    }, 3000);
  }

  showError() {
    const grid = document.getElementById('product-list');
    if (!grid) return;
    
    grid.innerHTML = `
      <div class="error-state">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3>Impossibile caricare i prodotti</h3>
          <p>Controlla la connessione internet e riprova, oppure torna più tardi.</p>
          <div class="error-actions">
            <button onclick="location.reload()" class="retry-btn">Ricarica</button>
            <button onclick="window.history.back()" class="back-btn">Torna Indietro</button>
          </div>
        </div>
      </div>
    `;
  }

  getEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-content">
          <div class="empty-icon">📦</div>
          <h3>Nessun prodotto disponibile</h3>
          <p>Non ci sono prodotti in questa categoria, prova altre categorie o torna più tardi.</p>
          <div class="empty-actions">
            <button onclick="document.querySelector('[data-categories=\\"all\\"]').click()" class="show-all-btn">Mostra Tutti i Prodotti</button>
          </div>
        </div>
      </div>
    `;
  }

  setupFilters() {
    if(!this.categoryFilter || !this.sortFilter || !this.resetBtn) return;
    this.categoryFilter.addEventListener('change', () => this.applyFilters());
    this.sortFilter.addEventListener('change', () => this.applyFilters());
    this.resetBtn.addEventListener('click', () => this.resetFilters());
  }
  
  applyFilters() {
    const category = this.categoryFilter.value;
    const sortValue = this.sortFilter.value;

    let tempProducts = [...this.products];

    if (category !== 'all') {
      tempProducts = tempProducts.filter(p => p.category === category);
    }

    if (sortValue === 'newest') {
      tempProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default sorting
    }

    this.filteredProducts = tempProducts;
    this.renderProducts();
  }
  
  resetFilters() {
    this.categoryFilter.value = 'all';
    this.sortFilter.value = 'featured';
    this.filteredProducts = [...this.products];
    this.renderProducts();
  }

  setupNavigationFilters() {
    const navContainer = document.querySelector('.main-nav ul');
    if(navContainer) {
      navContainer.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
          e.preventDefault();
          const navItem = link.closest('li');
          if (navItem && navItem.dataset.categories) {
            const category = navItem.dataset.categories;
            this.filterByCategory(category);
            this.updateNavigationState(navItem);
            this.updateURL(category);
          }
        }
      });
    }
  }

  filterByCategory(category) {
    this.currentCategory = category || 'all';
    
    if (this.currentCategory === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === this.currentCategory
      );
    }
    
    this.renderProducts();
  }

  updateNavigationState(activeItem) {
    document.querySelectorAll('.main-nav ul li').forEach(item => {
      item.classList.remove('active');
    });
    
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  setupBrowserNavigation() {
    window.addEventListener('popstate', (event) => {
      const category = event.state?.category || this.getCategoryFromURL();
      this.filterByCategory(category);
      
      const navItem = document.querySelector(`[data-categories="${category}"]`) || document.querySelector('[data-categories="all"]');
      
      if (navItem) {
        this.updateNavigationState(navItem);
      }
    });
  }

  getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category') || 'all';
  }

  updateURL(category) {
    const url = category && category !== 'all' 
      ? `${window.location.origin}${window.location.pathname}?category=${encodeURIComponent(category)}`
      : `${window.location.origin}${window.location.pathname}`;
    
    window.history.pushState({ category }, '', url);
  }

  handleInitialRoute() {
    const category = this.getCategoryFromURL();
    
    const navItem = document.querySelector(`[data-categories="${category}"]`) || document.querySelector('[data-categories="all"]');
    if (navItem) {
        this.filterByCategory(category);
        this.updateNavigationState(navItem);
    }
  }

  setupMobileNavigation() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileToggle && mainNav) {
      this.handleMobileToggle = (e) => {
        e.stopPropagation();
        mainNav.classList.toggle('active');
        const isActive = mainNav.classList.contains('active');
        mobileToggle.textContent = isActive ? '✕' : '☰';
        mobileToggle.setAttribute('aria-expanded', isActive);
      };
      
      mobileToggle.addEventListener('click', this.handleMobileToggle);
      
      mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          mainNav.classList.remove('active');
          mobileToggle.textContent = '☰';
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      document.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          mobileToggle.textContent = '☰';
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          mainNav.classList.remove('active');
          mobileToggle.textContent = '☰';
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  setupDynamicContent() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        try {
          const target = document.querySelector(targetId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (error) {
          console.warn(`Invalid selector for smooth scroll: ${targetId}`);
        }
      });
    });

    // Fade-in animation on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elementsToObserve = document.querySelectorAll('.section-title, .section-subtitle, .contact-info-item, .footer-section, .product-card');
    elementsToObserve.forEach(el => observer.observe(el));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // The init.js script should be responsible for initializing the app
  // This avoids race conditions and ensures dependencies are loaded.
  // We assume init.js will instantiate new ProductGrid();
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
