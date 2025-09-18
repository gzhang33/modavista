// Contact Messages - Filters and Sorting functionality

// Apply saved mobile filters
function applyMobileSavedFilters() {
    try {
        let raw = localStorage.getItem(MOBILE_FILTERS_STORAGE_KEY);
        if (!raw) raw = localStorage.getItem('admin_mobile_filters');
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (typeof saved !== 'object' || !saved) return;

        const normalizeString = (val) => {
            if (val == null) return '';
            if (Array.isArray(val)) {
                const first = val.find(v => typeof v === 'string') || '';
                return String(first).trim();
            }
            return typeof val === 'string' ? val.trim() : '';
        };
        
        const mapStatus = (s) => {
            const v = s.toLowerCase();
            if (v === 'unfinished' || s === '未完成') return '未完成';
            if (v === 'pending' || s === '待定' || s === '待处理') return '待定';
            if (v === 'in_progress' || s === '进行中' || s === '处理中') return '进行中';
            if (v === 'done' || s === '完成' || s === '已完成') return '完成';
            return '';
        };
        
        const mapTime = (t) => {
            const v = t.toLowerCase();
            if (v === 'today' || t === '今天') return 'today';
            if (v === 'week' || t === '本周') return 'week';
            if (v === 'month' || t === '本月') return 'month';
            if (v === 'year' || t === '今年') return 'year';
            return '';
        };

        currentFilters.status = mapStatus(normalizeString(saved.status));
        currentFilters.time = mapTime(normalizeString(saved.time));
        currentFilters.search = normalizeString(saved.search);

        const searchInput = document.getElementById('search-messages');
        if (searchInput && currentFilters.search) {
            searchInput.value = currentFilters.search;
        }

        document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#time-filters .filter-btn').forEach(b => b.classList.remove('active'));
        const statusBtn = document.querySelector(`#status-filters .filter-btn[data-status="${currentFilters.status}"]`);
        const timeBtn = document.querySelector(`#time-filters .filter-btn[data-time="${currentFilters.time}"]`);
        const allStatusBtn = document.querySelector('#status-filters .filter-btn[data-status=""]');
        const allTimeBtn = document.querySelector('#time-filters .filter-btn[data-time=""]');
        (statusBtn || allStatusBtn)?.classList.add('active');
        (timeBtn || allTimeBtn)?.classList.add('active');

        applyFilters();
    } catch (e) {
        console.warn('Failed to apply saved mobile filters:', e);
    }
}

// Apply filters to message list
function applyFilters() {
    filteredMessages = contactMessages.filter(message => {
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const searchableText = `${message.name} ${message.email} ${message.message}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        // Status filter
        if (currentFilters.status) {
            if (currentFilters.status === '未完成') {
                if (message.todo.status !== '待定' && message.todo.status !== '进行中') return false;
            } else {
                if (message.todo.status !== currentFilters.status) return false;
            }
        }
        
        // Time filter
        if (currentFilters.time) {
            const messageDate = new Date(message.created_at);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch (currentFilters.time) {
                case 'today':
                    const messageToday = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
                    if (messageToday.getTime() !== today.getTime()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (messageDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (messageDate < monthAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                    if (messageDate < yearAgo) return false;
                    break;
            }
        }
        
        return true;
    });
    
    filteredMessages = sortMessages(filteredMessages, sortCriterion);
    renderMessages();
    updateFilterStatusPanel();
}

// Set filter value
function setFilter(type, value) {
    currentFilters[type] = value;
    applyFilters();
    updateFilterStatusPanel();
}

// Sort messages
function sortMessages(list, criterion) {
    if (!Array.isArray(list)) return [];
    const arr = list.slice();
    switch (criterion) {
        case 'newest':
            return arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
            return arr.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        case 'name_az':
            return arr.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
        case 'name_za':
            return arr.sort((a,b) => (b.name || '').localeCompare(a.name || ''));
        default:
            return arr; // relevance: keep original order
    }
}

// Clear all filters
function clearAllFilters() {
    currentFilters = { search: '', status: '', time: '' };
    try { localStorage.removeItem(MOBILE_FILTERS_STORAGE_KEY); } catch (e) {}
    
    const searchInput = document.getElementById('search-messages');
    if (searchInput) searchInput.value = '';
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.filter-btn[data-status=""], .filter-btn[data-time=""]').forEach(btn => btn.classList.add('active'));
    
    applyFilters();
}

// Update filter status panel
function updateFilterStatusPanel() {
    const panel = document.getElementById('filter-status-panel');
    const content = document.querySelector('#filter-status-panel .filter-status-content');
    const countEl = document.querySelector('#filter-status-panel .filter-status-count');
    
    if (!panel || !content || !countEl) return;
    
    const activeFilters = [];
    
    if (currentFilters.status) {
        let statusText = '';
        if (currentFilters.status === '待定') statusText = '待处理';
        else if (currentFilters.status === '进行中') statusText = '处理中';
        else if (currentFilters.status === '完成') statusText = '已完成';
        else if (currentFilters.status === '未完成') statusText = '未完成';
        
        if (statusText) {
            activeFilters.push({
                type: 'status',
                text: `状态: ${statusText}`,
                value: currentFilters.status
            });
        }
    }
    
    if (currentFilters.time) {
        let timeText = '';
        if (currentFilters.time === 'today') timeText = '今天';
        else if (currentFilters.time === 'week') timeText = '本周';
        else if (currentFilters.time === 'month') timeText = '本月';
        else if (currentFilters.time === 'year') timeText = '今年';
        
        if (timeText) {
            activeFilters.push({
                type: 'time',
                text: `时间: ${timeText}`,
                value: currentFilters.time
            });
        }
    }
    
    if (activeFilters.length > 0) {
        panel.classList.remove('hidden');
        countEl.textContent = `${activeFilters.length} 项`;
        
        content.innerHTML = activeFilters.map(filter => `
            <div class="filter-tag" data-type="${filter.type}">
                <span>${filter.text}</span>
                <button type="button" class="filter-tag-remove" data-type="${filter.type}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        document.querySelectorAll('.filter-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.getAttribute('data-type');
                if (type) {
                    currentFilters[type] = '';
                    applyFilters();
                    updateFilterStatusPanel();
                }
            });
        });
    } else {
        panel.classList.add('hidden');
    }
}

// Setup sort dropdown
function setupSortDropdown() {
    const toggle = document.getElementById('sort-toggle');
    const menu = document.getElementById('sort-menu');
    const label = document.getElementById('sort-label');
    if (!toggle || !menu || !label) return;
    
    const MAP = {
        relevance: '排序：相关性', newest: '排序：最新', oldest: '排序：最早',
        name_az: '排序：姓名 A → Z', name_za: '排序：姓名 Z → A'
    };
    
    function closeMenu(){ menu.classList.remove('is-open'); }
    
    toggle.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        menu.classList.toggle('is-open'); 
    });
    
    menu.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-sort]');
        if (!btn) return;
        sortCriterion = btn.getAttribute('data-sort');
        label.textContent = MAP[sortCriterion] || '排序：相关性';
        closeMenu();
        filteredMessages = sortMessages(filteredMessages, sortCriterion);
        renderMessages();
    });
    
    document.addEventListener('click', (e) => { 
        if (!e.target.closest('.sort-dropdown')) closeMenu(); 
    });
}

// Setup inline filters (desktop)
function setupInlineFilters() {
    const statusBtn = document.getElementById('status-filter-button');
    const statusDd = document.getElementById('status-filter-dropdown');
    const statusCur = document.getElementById('status-filter-current');

    function closeAll(){
        statusDd && statusDd.classList.remove('is-open');
        statusBtn && statusBtn.classList.remove('is-open');
    }

    function mapStatusLabel(val){
        if (!val) return '';
        if (val === '待定') return '待处理';
        if (val === '进行中') return '处理中';
        if (val === '完成') return '已完成';
        if (val === '未完成') return '未完成';
        return '';
    }

    function updateButtons(){
        if (statusCur) statusCur.textContent = mapStatusLabel(currentFilters.status);
    }

    window.updateMessageFilterButtons = updateButtons;
    updateButtons();

    if (statusBtn && statusDd) {
        statusBtn.addEventListener('click', (e)=>{
            e.stopPropagation();
            const open = statusDd.classList.contains('is-open');
            closeAll();
            if (!open) { statusDd.classList.add('is-open'); statusBtn.classList.add('is-open'); }
        });
        statusDd.addEventListener('click', (e)=>{
            const opt = e.target.closest('.filter-option');
            if (!opt) return;
            const val = opt.getAttribute('data-status') || '';
            setFilter('status', val);
            updateButtons();
            closeAll();
        });
    }

    document.addEventListener('click', (e)=>{
        if (!e.target.closest('.filter-group')) closeAll();
    });
}
