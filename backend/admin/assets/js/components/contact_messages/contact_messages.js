// Contact Messages Management Component
import BaseComponent from '../shared/BaseComponent.js';
import apiClient from '../../utils/apiClient.js';
import { handle_session_expired } from '../../utils/session.js';

export default class ContactMessagesComponent extends BaseComponent {
    constructor(selector, eventBus) {
        super(selector, eventBus);
        
        this.messages = [];
        this.filteredMessages = [];
        this.mobileStorageKey = 'admin_mobile_filters_messages';
        
        // DOM elements
        this.messagesTableBody = document.getElementById('messages-table-body');
        this.searchInput = document.getElementById('search-messages');
        this.dateFilter = document.getElementById('date-filter');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.emptyState = document.getElementById('empty-state');
        this.messageModal = document.getElementById('message-modal');
        this.messageDetails = document.getElementById('message-details');
        this.todoModal = document.getElementById('todo-modal');
        this.todoForm = document.getElementById('todo-form');
        this.currentMessageId = null;
        
        this.init();
    }
    
    init() {
        this.loadMessages();
        this.bindEvents();
    }
    
    bindEvents() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterMessages());
        }
        
        // Date filter
        if (this.dateFilter) {
            this.dateFilter.addEventListener('change', () => this.filterMessages());
        }
        
        // Clear filters
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }
        
        // Refresh button
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.loadMessages());
        }
        
        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target === this.messageModal) {
                this.closeModal();
            }
        });
    }
    
    loadMessages() {
        this.showLoading();
        console.log('Loading contact messages...');
        
        fetch('../api/contact_messages.php')
        .then(response => {
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // handle_session_expired();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data);
            
            if (data.success) {
                this.messages = data.data || [];
                this.filteredMessages = [...this.messages];
                this.applyMobileSavedFilters();
                console.log('Loaded messages:', this.messages);
                this.renderMessages();
                this.showToast('数据加载成功', 'success');
            } else {
                throw new Error(data.message || 'Failed to load messages');
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            this.showToast('加载数据失败: ' + error.message, 'error');
            this.messages = [];
            this.filteredMessages = [];
            this.renderMessages();
        })
        .finally(() => {
            this.hideLoading();
        });
    }
    
    filterMessages() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const dateFilter = this.dateFilter.value;
        const saved = this.getMobileSavedFilters();
        const statusPreset = saved && Array.isArray(saved.status) ? saved.status[0] : '';
        const timePreset = saved && Array.isArray(saved.time) ? saved.time[0] : '';
        
        this.filteredMessages = this.messages.filter(message => {
            // Search filter
            if (searchTerm) {
                const searchFields = [
                    message.name,
                    message.email,
                    message.message
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Date filter (UI dropdown)
            if (dateFilter) {
                const messageDate = new Date(message.created_at);
                const now = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        if (messageDate < today) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (messageDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (messageDate < monthAgo) return false;
                        break;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        if (messageDate < yearAgo) return false;
                        break;
                }
            }
            // Mobile saved status filter
            if (statusPreset) {
                if (statusPreset === '未完成') {
                    if (!(message.todo.status === '待定' || message.todo.status === '进行中')) return false;
                } else if (message.todo.status !== statusPreset) {
                    return false;
                }
            }
            // Mobile saved time filter
            if (timePreset) {
                const messageDate2 = new Date(message.created_at);
                const now2 = new Date();
                let from = new Date(now2);
                if (timePreset === 'today') from = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());
                else if (timePreset === 'week') from.setDate(now2.getDate() - 7);
                else if (timePreset === 'month') from.setMonth(now2.getMonth() - 1);
                else if (timePreset === 'year') from.setFullYear(now2.getFullYear() - 1);
                if (messageDate2 < from) return false;
            }
            
            return true;
        });
        
        this.renderMessages();
    }

    getMobileSavedFilters() {
        try { return JSON.parse(localStorage.getItem(this.mobileStorageKey) || '{}'); } catch(_) { return {}; }
    }
    
    clearFilters() {
        this.searchInput.value = '';
        this.dateFilter.value = '';
        this.filteredMessages = [...this.messages];
        this.renderMessages();
    }
    
    renderMessages() {
        if (!this.messagesTableBody) return;
        
        if (this.filteredMessages.length === 0) {
            this.messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-state-content">
                            <i class="fas fa-inbox"></i>
                            <p>暂无数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.messagesTableBody.innerHTML = this.filteredMessages.map(message => `
            <tr class="message-row" data-id="${message.id}">
                <td class="message-id-cell">${message.id}</td>
                <td class="message-name-cell">${this.escapeHtml(message.name)}</td>
                <td class="message-email-cell">
                    <a href="mailto:${this.escapeHtml(message.email)}" class="email-link">
                        ${this.escapeHtml(message.email)}
                    </a>
                </td>
                <td class="message-content-cell">
                    <div class="message-preview">
                        ${this.truncateText(this.escapeHtml(message.message), 100)}
                    </div>
                </td>
                <td class="message-ip-cell">${this.escapeHtml(message.ip_address || '—')}</td>
                <td class="message-date-cell">${this.formatDateTime(message.created_at)}</td>
                <td class="message-actions-cell sticky-right">
                    <button class="btn btn-sm btn-primary view-btn" onclick="contactMessagesComponent.viewMessage(${message.id})" title="查看详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success todo-btn" onclick="contactMessagesComponent.openTodoModal(${message.id})" title="待办事项">
                        <i class="fas fa-tasks"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Render mobile cards
        const cards = document.getElementById('messages-cards');
        if (cards) {
            cards.innerHTML = this.filteredMessages.map(message => `
                <div class="message-card" data-id="${message.id}">
                    <div class="message-card__title">${this.escapeHtml(message.name)} <span class="message-card__meta">${this.escapeHtml(message.email)}</span></div>
                    <div class="message-card__row">${this.truncateText(this.escapeHtml(message.message), 100)}</div>
                    <div class="message-card__meta">
                        <span class="message-card__badge">#${message.id}</span>
                        <span class="message-card__badge">${this.formatDateTime(message.created_at)}</span>
                        <span class="message-card__badge">${this.escapeHtml(message.ip_address || '—')}</span>
                        <span class="message-card__badge">${this.escapeHtml((message.todo && message.todo.status) || '待定')}</span>
                    </div>
                    <div class="message-card__actions">
                        <a class="message-card__btn message-card__btn--primary" href="javascript:void(0)" onclick="contactMessagesComponent.viewMessage(${message.id})"><i class="fas fa-eye"></i> 查看</a>
                        <a class="message-card__btn" href="javascript:void(0)" onclick="contactMessagesComponent.openTodoModal(${message.id})"><i class="fas fa-tasks"></i> 待办</a>
                    </div>
                </div>
            `).join('');
        }
    }
    
    viewMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        this.messageDetails.innerHTML = `
            <div class="message-detail">
                <div class="detail-row">
                    <label>ID:</label>
                    <span>${message.id}</span>
                </div>
                <div class="detail-row">
                    <label>姓名:</label>
                    <span>${this.escapeHtml(message.name)}</span>
                </div>
                <div class="detail-row">
                    <label>邮箱:</label>
                    <span>
                        <a href="mailto:${this.escapeHtml(message.email)}" class="email-link">
                            ${this.escapeHtml(message.email)}
                        </a>
                    </span>
                </div>
                <div class="detail-row">
                    <label>IP地址:</label>
                    <span>${this.escapeHtml(message.ip_address || '—')}</span>
                </div>
                <div class="detail-row">
                    <label>提交时间:</label>
                    <span>${this.formatDateTime(message.created_at)}</span>
                </div>
                <div class="detail-row">
                    <label>留言内容:</label>
                    <div class="message-content">
                        ${this.formatMessageContent(message.message)}
                    </div>
                </div>
            </div>
        `;
        
        this.messageModal.style.display = 'block';
    }
    
    closeModal() {
        this.messageModal.style.display = 'none';
    }
    
    openTodoModal(messageId) {
        this.currentMessageId = messageId;
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        // 填充表单数据
        const statusSelect = document.getElementById('todo-status');
        const notesTextarea = document.getElementById('todo-notes');
        
        if (message.todo) {
            statusSelect.value = message.todo.status;
            notesTextarea.value = message.todo.notes || '';
        } else {
            statusSelect.value = '待定';
            notesTextarea.value = '';
        }
        
        this.todoModal.style.display = 'block';
    }
    
    closeTodoModal() {
        this.todoModal.style.display = 'none';
        this.currentMessageId = null;
    }
    
    saveTodo() {
        if (!this.currentMessageId) return;
        
        const formData = {
            action: 'update_todo',
            message_id: this.currentMessageId,
            status: document.getElementById('todo-status').value,
            notes: document.getElementById('todo-notes').value
        };
        
        fetch('../api/contact_messages.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                this.showToast('待办事项已保存', 'success');
                this.closeTodoModal();
                this.loadMessages(); // 重新加载数据
            } else {
                throw new Error(result.message || 'Failed to save todo');
            }
        })
        .catch(error => {
            console.error('Error saving todo:', error);
            this.showToast('保存失败: ' + error.message, 'error');
        });
    }
    
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }
    
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        if (this.eventBus) {
            this.eventBus.emit('toast:show', { message, type });
        }
    }
    
    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatMessageContent(message) {
        return this.escapeHtml(message).replace(/\n/g, '<br>');
    }
}

// Initialize component
document.addEventListener('DOMContentLoaded', () => {
    // Simple event bus implementation
    class SimpleEventBus {
        constructor() {
            this.events = {};
        }
        
        on(eventName, listener) {
            if (!this.events[eventName]) {
                this.events[eventName] = [];
            }
            this.events[eventName].push(listener);
        }
        
        emit(eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].forEach(listener => listener(data));
            }
        }
    }
    
    // Simple toast implementation
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast toast-${type}`;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }
    
    const eventBus = new SimpleEventBus();
    eventBus.on('toast:show', (data) => showToast(data.message, data.type));
    
    // Initialize contact messages component
    window.contactMessagesComponent = new ContactMessagesComponent('#messages-section', eventBus);
});

// Global modal functions
window.closeModal = function() {
    if (window.contactMessagesComponent) {
        window.contactMessagesComponent.closeModal();
    }
};

window.closeTodoModal = function() {
    if (window.contactMessagesComponent) {
        window.contactMessagesComponent.closeTodoModal();
    }
};

window.saveTodo = function() {
    if (window.contactMessagesComponent) {
        window.contactMessagesComponent.saveTodo();
    }
};
