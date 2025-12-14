/* Multi-User Inventory Management System
	 Single script to handle register, login, inventory UI and admin seeding.
*/

(function () {
	// Storage keys
	const USERS_KEY = 'ims_users';
	const INVENTORIES_KEY = 'ims_inventories';
	const THEME_KEY_PREFIX = 'ims_theme_'; // per-user theme: THEME_KEY_PREFIX + username

	// Helpers - storage
	function getUsers() {
		try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
	}
	function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

	function getInventories() {
		try { return JSON.parse(localStorage.getItem(INVENTORIES_KEY)) || {}; } catch { return {}; }
	}
	function saveInventories(inv) { localStorage.setItem(INVENTORIES_KEY, JSON.stringify(inv)); }

	function seedAdmin() {
		const users = getUsers();
		if (!users.find(u => u.username === 'admin')) {
			users.push({ username: 'admin', names: 'Administrator', phone: '', password: 'admin123', isAdmin: true });
			saveUsers(users);
		}
		const inv = getInventories();
		if (!inv['admin']) inv['admin'] = [];
		saveInventories(inv);
	}

	// Utility
	function showAlert(container, msg, type = 'success', timeout = 2500) {
		if (!container) {
			console[type === 'error' ? 'warn' : 'log'](msg);
			return;
		}
		container.textContent = msg;
		container.classList.remove('success', 'error');
		container.classList.add(type === 'error' ? 'error' : 'success', 'show');
		setTimeout(() => { container.classList.remove('show'); }, timeout);
	}

	function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

	// Auth helpers
	function getCurrentUser() { return sessionStorage.getItem('ims_currentUser'); }
	function setCurrentUser(username) { sessionStorage.setItem('ims_currentUser', username); }
	function clearCurrentUser() { sessionStorage.removeItem('ims_currentUser'); }

	// Validation helpers
	function validItemName(n) { return /^[A-Za-z\s]+$/.test(n.trim()); }
	function positiveNumber(v) { return !isNaN(v) && Number(v) > 0; }

	// Register page
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
			if (!username || !names || !password) return showAlert(alertBox, 'Please fill out all fields', 'error');
			const users = getUsers();
			if (users.find(u => u.username === username)) return showAlert(alertBox, 'Username already exists', 'error');
			users.push({ username, names, phone, password, isAdmin:false });
			saveUsers(users);
			const inv = getInventories(); inv[username] = []; saveInventories(inv);
			showAlert(alertBox, 'Registration successful. You can now login.', 'success');
			form.reset();
			setTimeout(() => { window.location.href = 'login.html'; }, 900);
		});
	}

	// Login page
	function initLogin() {
		const form = document.getElementById('loginForm');
		const alertBox = document.getElementById('alertBox');
		if (!form) return;
		form.addEventListener('submit', function (e) {
			e.preventDefault();
			const username = form.username.value.trim();
			const password = form.password.value;
			const users = getUsers();
			const user = users.find(u => u.username === username && u.password === password);
			if (!user) return showAlert(alertBox, 'Invalid credentials', 'error');
			setCurrentUser(user.username);
			showAlert(alertBox, 'Login successful', 'success');
			setTimeout(() => {
				if (user.isAdmin) window.location.href = 'admin.html';
				else window.location.href = 'invetory.html';
			}, 700);
		});
	}

	// Inventory page
	function initInventory() {
		const current = getCurrentUser();
		if (!current) return; // page should redirect if not logged in
		const userNameEl = document.getElementById('userName'); if (userNameEl) userNameEl.textContent = current;
		const alertBox = document.getElementById('alertBox');
		const addBtn = document.getElementById('addItemBtn');
		const itemModal = document.getElementById('itemModal');
		const closeModal = document.getElementById('closeModal');
		const itemForm = document.getElementById('itemForm');
		const inventoryBody = document.getElementById('inventoryBody');
		const emptyState = document.getElementById('emptyState');
		const searchInput = document.getElementById('searchInput');
		const statusFilter = document.getElementById('statusFilter');
		const logoutBtn = document.getElementById('logoutBtn');
		const themeToggle = document.getElementById('themeToggle');
		const themeText = document.getElementById('themeText');

		if (logoutBtn) logoutBtn.addEventListener('click', () => { clearCurrentUser(); window.location.href = 'login.html'; });

		// Theme
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

		// Keyboard shortcut (Ctrl+J)
		document.addEventListener('keydown', (ev) => {
			if (ev.ctrlKey && ev.key.toLowerCase() === 'j') {
				const key = THEME_KEY_PREFIX + current;
				const isDark = document.body.classList.toggle('dark');
				localStorage.setItem(key, isDark ? 'dark' : 'light');
				if (themeText) themeText.textContent = isDark ? 'Light' : 'Dark';
			}
		});

		// Modal controls
		function openModal() { if (itemModal) itemModal.classList.add('show'); }
		function closeItemModal() { if (itemModal) itemModal.classList.remove('show'); itemForm && itemForm.reset(); editingId = null; document.getElementById('modalTitle') && (document.getElementById('modalTitle').textContent = 'Add New Item'); }
		if (addBtn) addBtn.addEventListener('click', () => { openModal(); });
		if (closeModal) closeModal.addEventListener('click', closeItemModal);
		if (itemModal) itemModal.addEventListener('click', (e) => { if (e.target === itemModal) closeItemModal(); });

		// Inventory data operations
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

		// Delegated actions
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

		// Form submit for add/edit
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

		// Search & filter
		if (searchInput) searchInput.addEventListener('input', renderItems);
		if (statusFilter) statusFilter.addEventListener('change', renderItems);

		// Initial render
		renderItems();
	}
 
	// Admin functions (only active if admin page elements exist)
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
		}

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

		// Add user form
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

		// Delegated user actions
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
	}

	// Page-specific init
	document.addEventListener('DOMContentLoaded', function () {
		seedAdmin(); // ensure admin exists
		// Apply global theme if no user logged in
		const cur = getCurrentUser();
		if (!cur) {
			const t = localStorage.getItem('ims_theme_global') || 'light';
			document.body.classList.toggle('dark', t === 'dark');
			document.addEventListener('keydown', (ev) => { if (ev.ctrlKey && ev.key.toLowerCase() === 'j') { const isDark = document.body.classList.toggle('dark'); localStorage.setItem('ims_theme_global', isDark ? 'dark' : 'light'); } });
		}

		initRegister();
		initLogin();

		// Inventory page redirect/protection
		if (document.title && document.title.toLowerCase().includes('inventory')) {
			if (!getCurrentUser()) { window.location.href = 'login.html'; return; }
			initInventory();
		}

		// Admin page guard
		if (document.title && document.title.toLowerCase().includes('admin')) {
			const user = getCurrentUser(); if (!user) { window.location.href = 'login.html'; return; }
			const users = getUsers(); const u = users.find(x => x.username === user);
			if (!u || !u.isAdmin) { window.location.href = 'invetory.html'; return; }
			initAdmin();
		}
	});

})();

