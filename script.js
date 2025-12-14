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

function clearAllErrors() {
    ['username', 'name', 'phone', 'password', 'confirmPassword'].forEach(field => {
        clearError(field + 'Error');
    });
}

function validateName(name) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name) && name.trim().length > 0;
}

function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateForm(formData) {
    let isValid = true;
    clearAllErrors();

    if (!formData.username.trim()) {
        showError('usernameError', 'Username is required');
        isValid = false;
    }

    if (!validateName(formData.name)) {
        showError('nameError', 'Name must contain only letters');
        isValid = false;
    }

    if (!validatePhone(formData.phone)) {
        showError('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }

    if (!validatePassword(formData.password)) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

function initRegister() {
		const form = document.getElementById('registerForm');
		const alertBox = document.getElementById('alertBox');
		if (!form) return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const username = form.username.value.trim();
			const names = form.name.value.trim();
			const phone = form.phone.value.trim();
			const password = form.password.value;
			if (!username || !names || !password)

                 return showAlert(alertBox, 'Please fill out all fields', 'error');
			const users = getUsers();
			if (users.find(u => u.username === username))
                
                return showAlert(alertBox, 'Username already exists', 'error');
			users.push({ username, names, phone, password, isAdmin:false });
			saveUsers(users);
			const inv = getInventories(); inv[username] = []; saveInventories(inv);
			showAlert(alertBox, 'Registration successful. You can now login.', 'success');
			form.reset();
			setTimeout(() => { window.location.href = 'login.html'; }, 900);
		});
	}

    function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
}