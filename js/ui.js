// This module provides reusable UI components.

export { showModal, showConfirmModal, showToast, debounce };

// showModal for general information or error messages
function showModal(title, message) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseButton = document.getElementById('modal-close-button');

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modal.classList.remove('hidden');

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 50);

    modalCloseButton.onclick = () => {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(-50px)';
    };
}

// showConfirmModal for actions that require user confirmation
function showConfirmModal(title, message, onConfirmCallback) {
    const modal = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('confirm-modal-title');
    const modalMessage = document.getElementById('confirm-modal-message');
    const confirmButton = document.getElementById('confirm-modal-proceed');
    const cancelButton = document.getElementById('confirm-modal-cancel');

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modal.classList.remove('hidden');

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 50);

    const closeConfirmModal = () => {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(-50px)';
        // Remove event listeners to prevent multiple calls
        confirmButton.onclick = null;
        cancelButton.onclick = null;
    };

    confirmButton.onclick = () => {
        onConfirmCallback();
        closeConfirmModal();
    };

    cancelButton.onclick = () => {
        closeConfirmModal();
    };
}

// showToast for transient notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'} text-white"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// Debounce function to limit the rate at which a function gets called
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
