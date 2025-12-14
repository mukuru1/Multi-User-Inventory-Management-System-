const registerForm = document.getElementById('registerForm');
const alertBox = document.getElementById('alertBox');

function showAlert(message, type = 'danger') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
}