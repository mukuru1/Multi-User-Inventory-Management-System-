const registerForm = document.getElementById('registerForm');
const alertBox = document.getElementById('alertBox');
const loginForm = document.getElementById('loginForm');

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

function initLogin() {
		const form = document.getElementById('loginForm');
		const alertBox = document.getElementById('alertBox');
		if (!form)
             return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const username = form.username.value.trim();
			const password = form.password.value;
			const users = getUsers();
			const user = users.find(u => u.username === username && u.password === password);
			if (!user)
                 return showAlert(alertBox, 'Invalid credentials', 'error');
			setCurrentUser(user.username);
			showAlert(alertBox, 'Login successful', 'success');
			setTimeout(() => {
				if (user.isAdmin) window.location.href = 'admin.html';
				else window.location.href = 'invetory.html';
			}, 700);
		});
	}

    let currentUser = null;
let allItems = [];
let editingItemId = null;

const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const inventoryBody = document.getElementById('inventoryBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const themeToggle = document.getElementById('themeToggle');

if (logoutBtn) logoutBtn.addEventListener('click', () => { clearCurrentUser(); window.location.href = 'login.html'; });

   function showAlert(message, type = 'danger') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    const themeText = document.getElementById('themeText');
    if (theme === 'dark') {
        themeText.textContent = 'Light';
    } else {
        themeText.textContent = 'Dark';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleTheme();
    }
});

function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

function applyStoredTheme() {
			const key = THEME_KEY_PREFIX + current;
			const t = localStorage.getItem(key) || localStorage.getItem('ims_theme_global') || 'light';
			document.body.classList.toggle('dark', t === 'dark');
			if (themeText) themeText.textContent = t === 'dark' ? 'Light' : 'Dark';
		}
		applyStoredTheme();
		if (themeToggle) themeToggle.addEventListener('click', () => {
			const key = THEME_KEY_PREFIX + current;
			const isDark = document.body.classList.toggle('dark');
			localStorage.setItem(key, isDark ? 'dark' : 'light');
			if (themeText) themeText.textContent = isDark ? 'Light' : 'Dark';
		});

        document.addEventListener('keydown', (ev) => {
			if (ev.ctrlKey && ev.key.toLowerCase() === 'j') {
				const key = THEME_KEY_PREFIX + current;
				const isDark = document.body.classList.toggle('dark');
				localStorage.setItem(key, isDark ? 'dark' : 'light');
				if (themeText) themeText.textContent = isDark ? 'Light' : 'Dark';
			}
		});

        function openModal() { if (itemModal) itemModal.classList.add('show'); }
		function closeItemModal() { if (itemModal) itemModal.classList.remove('show'); itemForm && itemForm.reset(); editingId = null; document.getElementById('modalTitle') && (document.getElementById('modalTitle').textContent = 'Add New Item'); }
		if (addBtn) addBtn.addEventListener('click', () => { openModal(); });
		if (closeModal) closeModal.addEventListener('click', closeItemModal);
		if (itemModal) itemModal.addEventListener('click', (e) => { if (e.target === itemModal) closeItemModal(); });


        let editingId = null;
		function getUserItems() { const inv = getInventories(); return inv[current] || []; }
		function saveUserItems(items) { const inv = getInventories(); inv[current] = items; saveInventories(inv); }

		function renderItems() {
			const items = getUserItems();
			const q = (searchInput && searchInput.value.trim().toLowerCase()) || '';
			const status = (statusFilter && statusFilter.value) || '';
			const filtered = items.filter(i => {
				const matchesName = !q || i.name.toLowerCase().includes(q);
				const matchesStatus = !status || i.status === status;
				return matchesName && matchesStatus;
			});

            if (!inventoryBody) return;
			inventoryBody.innerHTML = '';
			if (filtered.length === 0) {
				if (emptyState) emptyState.style.display = 'block';
				return;
			}
			if (emptyState) emptyState.style.display = 'none';
			filtered.forEach(it => {
				const tr = document.createElement('tr');
				tr.innerHTML = `
					<td>${escapeHtml(it.name)}</td>
					<td>${it.quantity}</td>
					<td>$${Number(it.price).toFixed(2)}</td>
					<td>${it.status}</td>
					<td>
						<button class="btn btn-sm" data-action="edit" data-id="${it.id}">Edit</button>
						<button class="btn btn-sm btn-danger" data-action="delete" data-id="${it.id}">Delete</button>
					</td>`;
				inventoryBody.appendChild(tr);
			});
		}

        function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

		
		if (inventoryBody) inventoryBody.addEventListener('click', (e) => {
			const btn = e.target.closest('button'); if (!btn) return;
			const action = btn.getAttribute('data-action'); const id = btn.getAttribute('data-id');
			if (action === 'edit') {
				const items = getUserItems(); const it = items.find(x => x.id === id); if (!it) return;
				document.getElementById('itemName').value = it.name;
				document.getElementById('itemQuantity').value = it.quantity;
				document.getElementById('itemPrice').value = it.price;
				document.getElementById('itemStatus').value = it.status;
				editingId = it.id; document.getElementById('modalTitle').textContent = 'Edit Item'; openModal();
			} else if (action === 'delete') {
				if (!confirm('Delete this item?')) return;
				let items = getUserItems(); items = items.filter(x => x.id !== id); saveUserItems(items); renderItems(); showAlert(alertBox, 'Item deleted', 'success');
			}
		});

        if (itemForm) itemForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const name = document.getElementById('itemName').value.trim();
			const qty = document.getElementById('itemQuantity').value;
			const price = document.getElementById('itemPrice').value;
			const status = document.getElementById('itemStatus').value;
			if (!validItemName(name)) return showAlert(alertBox, 'Name required and should contain only letters', 'error');
			if (!positiveNumber(qty)) return showAlert(alertBox, 'Quantity must be a positive number', 'error');
			if (!positiveNumber(price)) return showAlert(alertBox, 'Price must be a positive number', 'error');
			if (!status) return showAlert(alertBox, 'Status is required', 'error');

			const items = getUserItems();
			if (editingId) {
				const idx = items.findIndex(x => x.id === editingId);
				if (idx > -1) {
					items[idx] = { ...items[idx], name, quantity: Number(qty), price: Number(price), status };
					saveUserItems(items); showAlert(alertBox, 'Item updated', 'success');
				}
			} else {
				items.push({ id: generateId(), name, quantity: Number(qty), price: Number(price), status });
				saveUserItems(items); showAlert(alertBox, 'Item added', 'success');
			}
			renderItems(); closeItemModal();
		});

		if (searchInput) searchInput.addEventListener('input', renderItems);
		if (statusFilter) statusFilter.addEventListener('change', renderItems);
		renderItems();

		function initAdmin() {
		const current = getCurrentUser(); if (!current) return;
		const usersTable = document.getElementById('usersTable');
		const addUserForm = document.getElementById('addUserForm');
		const alertBox = document.getElementById('alertBox');
		const allItemsBody = document.getElementById('allItemsBody');
		const filterUser = document.getElementById('filterUser');
		const filterStatus = document.getElementById('filterStatus');
		if (!usersTable && !addUserForm && !allItemsBody) return; // nothing to do

		function renderUsers() {
			const users = getUsers(); if (!usersTable) return;
			usersTable.innerHTML = '';
			users.forEach(u => {
				const tr = document.createElement('tr');
				tr.innerHTML = `<td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.names)}</td><td>${escapeHtml(u.phone)}</td><td>${u.isAdmin? 'Admin':'User'}</td><td><button class="btn btn-sm" data-action="edit-user" data-username="${u.username}">Edit</button> <button class="btn btn-sm btn-danger" data-action="delete-user" data-username="${u.username}">Delete</button></td>`;
				usersTable.appendChild(tr);
			});
		} }

		function renderAllItems() {
			const inv = getInventories(); if (!allItemsBody) return;
			const uFilter = filterUser && filterUser.value;
			const sFilter = filterStatus && filterStatus.value;
			allItemsBody.innerHTML = '';
			Object.keys(inv).forEach(username => {
				if (uFilter && uFilter !== username) return;
				inv[username].forEach(it => {
					if (sFilter && sFilter !== it.status) return;
					const tr = document.createElement('tr');
					tr.innerHTML = `<td>${escapeHtml(it.name)}</td><td>${it.quantity}</td><td>$${Number(it.price).toFixed(2)}</td><td>${it.status}</td><td>${escapeHtml(username)}</td>`;
					allItemsBody.appendChild(tr);
				});
			});
		}

		if (addUserForm) addUserForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const username = addUserForm.username.value.trim();
			const names = addUserForm.name.value.trim();
			const phone = addUserForm.phone.value.trim();
			const password = addUserForm.password.value;
			if (!username || !names || !password) return showAlert(alertBox, 'Fill all fields', 'error');
			const users = getUsers(); if (users.find(u => u.username === username)) return showAlert(alertBox, 'Username exists', 'error');
			users.push({ username, names, phone, password, isAdmin:false }); saveUsers(users);
			const inv = getInventories(); inv[username] = []; saveInventories(inv);
			showAlert(alertBox, 'User added', 'success'); addUserForm.reset(); renderUsers();
		});

	if (usersTable) usersTable.addEventListener('click', (e) => {
			const btn = e.target.closest('button'); if (!btn) return; const action = btn.getAttribute('data-action'); const username = btn.getAttribute('data-username');
			if (action === 'delete-user') {
				if (!confirm('Delete user and their items?')) return;
				let users = getUsers(); users = users.filter(u => u.username !== username); saveUsers(users);
				const inv = getInventories(); delete inv[username]; saveInventories(inv);
				showAlert(alertBox, 'User deleted', 'success'); renderUsers(); renderAllItems();
			}
			// edit-user could be implemented with a modal; skip for brevity unless UI exists
		});

		renderUsers(); renderAllItems();
		if (filterUser) filterUser.addEventListener('change', renderAllItems);
		if (filterStatus) filterStatus.addEventListener('change', renderAllItems);
	