// Contact Messages - Status management functionality

// Toggle status dropdown
function toggleStatusDropdown(messageId, el) {
    // Close all open menus and remove active states
    document.querySelectorAll('.status-dropdown-menu').forEach(menu => { 
        menu.style.display = 'none'; 
    });
    document.querySelectorAll('.clickable-status').forEach(status => { 
        status.classList.remove('active'); 
    });
    
    // Toggle current dropdown within card/table row
    const container = el ? el.closest('.status-dropdown') : document.querySelector(`[data-message-id="${messageId}"] .status-dropdown`);
    if (!container) return;
    
    const dropdown = container.querySelector('.status-dropdown-menu');
    const statusBadge = container.querySelector('.clickable-status');
    if (!dropdown || !statusBadge) return;
    
    const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
    dropdown.style.display = isHidden ? 'block' : 'none';
    statusBadge.classList.toggle('active', isHidden);
}

// Update status
function updateStatus(messageId, newStatus) {
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    // Close dropdown menu
    const dropdown = document.getElementById(`dropdown-${messageId}`);
    const statusBadge = document.querySelector(`[data-message-id="${messageId}"] .clickable-status`);
    if (dropdown) dropdown.style.display = 'none';
    if (statusBadge) statusBadge.classList.remove('active');
    
    const currentNotes = message.todo ? message.todo.notes || '' : '';
    saveTodo(messageId, newStatus, currentNotes);
}

// Open notes modal (simple prompt)
function openNotesModal(messageId) {
    const message = contactMessages.find(m => m.id === messageId);
    if (!message) return;
    
    const currentNotes = message.todo ? message.todo.notes || '' : '';
    const notes = prompt('请输入备注:', currentNotes);
    if (notes !== null) {
        const currentStatus = message.todo ? message.todo.status : '待定';
        saveTodo(messageId, currentStatus, notes);
    }
}

// Setup status dropdown event listeners
function setupStatusDropdownListeners() {
    // Click outside to close dropdowns
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.status-dropdown')) {
            document.querySelectorAll('.status-dropdown-menu').forEach(menu => { 
                menu.style.display = 'none'; 
            });
            document.querySelectorAll('.clickable-status').forEach(status => { 
                status.classList.remove('active'); 
            });
        }
    });
}
