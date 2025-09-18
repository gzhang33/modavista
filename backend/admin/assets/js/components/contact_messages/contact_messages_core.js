// Contact Messages - Core functionality
let contactMessages = [];
let filteredMessages = [];
let currentModalMessageId = null;
let currentFilters = { search: '', status: '', time: '' };
const MOBILE_FILTERS_STORAGE_KEY = 'admin_mobile_filters_messages';
let sortCriterion = 'relevance';

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

function getStatusIcon(status) {
    switch(status) {
        case '待定': return 'fa-clock';
        case '进行中': return 'fa-spinner';
        case '完成': return 'fa-check-circle';
        default: return 'fa-question';
    }
}

function getStatusText(status) {
    switch(status) {
        case '待定': return '待处理';
        case '进行中': return '处理中';
        case '完成': return '已完成';
        default: return '未知';
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    if (toast) {
        toast.textContent = message;
        toast.className = `toast toast-${type}`;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
}

// Loading indicators
function showLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.style.display = 'none';
}

// Main data loading function
function loadMessages() {
    showLoading();
    console.log('Loading contact messages...');
    
    fetch('/backend/api/contact_messages.php')
    .then(response => {
        console.log('API response status:', response.status);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('API response data:', data);
        if (data.success) {
            contactMessages = data.data || [];
            console.log('Loaded messages:', contactMessages);
            applyMobileSavedFilters();
            applyFilters();
            if (window.updateMessageFilterButtons) window.updateMessageFilterButtons();
            showToast('数据加载成功', 'success');
        } else {
            throw new Error(data.message || 'Failed to load messages');
        }
    })
    .catch(error => {
        console.error('Error loading messages:', error);
        showToast('加载数据失败: ' + error.message, 'error');
        contactMessages = [];
        filteredMessages = [];
        renderMessages();
        updateFilterStatusPanel();
    })
    .finally(() => { hideLoading(); });
}

// Save todo (status and notes)
function saveTodo(messageId, status, notes) {
    const formData = {
        action: 'update_todo',
        message_id: messageId,
        status: status,
        notes: notes
    };
    
    fetch('/backend/api/contact_messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(result => {
        if (result.success) {
            showToast('保存成功', 'success');
            
            const message = contactMessages.find(m => m.id === messageId);
            if (message) {
                message.todo.status = status;
                message.todo.notes = notes;
                message.is_processed = (status === '完成') ? true : false;
                message.processed_at = (status === '完成') ? new Date().toISOString() : null;
            }
            
            if (currentModalMessageId === messageId) {
                updateModalDisplay();
            }
            
            applyFilters();
        } else {
            throw new Error(result.message || 'Failed to save todo');
        }
    })
    .catch(error => {
        console.error('Error saving todo:', error);
        showToast('保存失败: ' + error.message, 'error');
    });
}
