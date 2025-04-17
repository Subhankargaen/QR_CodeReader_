// Sample user data (replace with actual data from your backend)
let users = [
    { username: 'user1', email: 'user1@example.com', status: 'active' },
    { username: 'user2', email: 'user2@example.com', status: 'blocked' },
    { username: 'user3', email: 'user3@example.com', status: 'active' }
];

// DOM Elements
const totalUsersElement = document.getElementById('totalUsers');
const activeUsersElement = document.getElementById('activeUsers');
const blockedUsersElement = document.getElementById('blockedUsers');
const userTableBody = document.getElementById('userTableBody');
const userSearch = document.getElementById('userSearch');
const logoutBtn = document.querySelector('.logout-btn');

// Initialize the admin panel
function initAdminPanel() {
    updateStats();
    renderUserTable();
    setupEventListeners();
}

// Update statistics
function updateStats() {
    const total = users.length;
    const active = users.filter(user => user.status === 'active').length;
    const blocked = users.filter(user => user.status === 'blocked').length;

    totalUsersElement.textContent = total;
    activeUsersElement.textContent = active;
    blockedUsersElement.textContent = blocked;
}

// Render user table
function renderUserTable(filteredUsers = users) {
    userTableBody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${user.status}">${user.status}</span>
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser('${user.username}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn block-btn" onclick="toggleUserStatus('${user.username}')">
                    <i class="fas ${user.status === 'active' ? 'fa-lock' : 'fa-unlock'}"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Search functionality
function setupEventListeners() {
    userSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        renderUserTable(filteredUsers);
    });

    logoutBtn.addEventListener('click', () => {
        // Add logout functionality here
        window.location.href = 'login.html';
    });
}

// User management functions
function editUser(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        // Implement edit functionality
        console.log('Editing user:', user);
    }
}

function toggleUserStatus(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        user.status = user.status === 'active' ? 'blocked' : 'active';
        updateStats();
        renderUserTable();
    }
}

function deleteUser(username) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.username !== username);
        updateStats();
        renderUserTable();
    }
}

// Initialize the admin panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const isAdmin = localStorage.getItem('isAdmin');
    
    if (!isLoggedIn || !isAdmin) {
        window.location.href = 'login.html';
        return;
    }

    // Get admin username and display it
    const adminUsername = localStorage.getItem('username');
    document.getElementById('admin-username').textContent = adminUsername;

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Update total users count
    document.getElementById('total-users').textContent = registeredUsers.length;

    // Get last login time
    const lastLoginTime = localStorage.getItem('lastLoginTime');
    if (lastLoginTime) {
        const formattedTime = new Date(lastLoginTime).toLocaleString();
        document.getElementById('last-login').textContent = formattedTime;
    }

    // Populate login table
    const loginTableBody = document.getElementById('login-table-body');
    loginTableBody.innerHTML = '';

    registeredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        
        const timeCell = document.createElement('td');
        timeCell.textContent = user.lastLoginTime ? 
            new Date(user.lastLoginTime).toLocaleString() : 
            'Never logged in';
        
        const statusCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = user.isBlocked ? 'status-blocked' : 'status-active';
        statusSpan.textContent = user.isBlocked ? 'Blocked' : 'Active';
        statusCell.appendChild(statusSpan);
        
        const actionsCell = document.createElement('td');
        const blockButton = document.createElement('button');
        blockButton.className = user.isBlocked ? 'unblock-btn' : 'block-btn';
        blockButton.innerHTML = user.isBlocked ? '<i class="fas fa-unlock"></i> Unblock' : '<i class="fas fa-lock"></i> Block';
        blockButton.onclick = () => toggleUserBlock(user.email);
        actionsCell.appendChild(blockButton);
        
        row.appendChild(emailCell);
        row.appendChild(timeCell);
        row.appendChild(statusCell);
        row.appendChild(actionsCell);
        
        loginTableBody.appendChild(row);
    });

    // Handle navigation
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            
            // Update active state
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Show/hide sections
            document.querySelectorAll('.admin-content > div').forEach(section => {
                section.style.display = 'none';
            });

            // Show the appropriate section
            if (target === 'users') {
                document.querySelector('.dashboard-section').style.display = 'block';
            } else {
                document.getElementById(target).style.display = 'block';
            }
        });
    });

    // Load saved settings
    loadSettings();

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('username');
        localStorage.removeItem('lastLoginTime');
        window.location.href = 'login.html';
    });

    // Handle search
    const searchInput = document.querySelector('.admin-search input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = loginTableBody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const email = row.cells[0].textContent.toLowerCase();
            if (email.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// Settings Functions
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('websiteSettings')) || {
        theme: {
            primaryColor: '#00ffff',
            bgColor: '#1a1a1a',
            textColor: '#ffffff'
        },
        content: {
            title: 'Quantum Coder',
            welcomeMessage: 'Welcome to Quantum Coder',
            footerText: '© 2024 Quantum Coder. All rights reserved.'
        },
        security: {
            sessionTimeout: 30
        }
    };

    // Load theme settings
    document.getElementById('primary-color').value = settings.theme.primaryColor;
    document.getElementById('bg-color').value = settings.theme.bgColor;
    document.getElementById('text-color').value = settings.theme.textColor;

    // Load content settings
    document.getElementById('website-title').value = settings.content.title;
    document.getElementById('welcome-message').value = settings.content.welcomeMessage;
    document.getElementById('footer-text').value = settings.content.footerText;

    // Load security settings
    document.getElementById('session-timeout').value = settings.security.sessionTimeout;
}

function saveThemeSettings() {
    const settings = JSON.parse(localStorage.getItem('websiteSettings')) || {};
    settings.theme = {
        primaryColor: document.getElementById('primary-color').value,
        bgColor: document.getElementById('bg-color').value,
        textColor: document.getElementById('text-color').value
    };
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    showNotification('Theme settings saved successfully!');
}

function saveContentSettings() {
    const settings = JSON.parse(localStorage.getItem('websiteSettings')) || {};
    settings.content = {
        title: document.getElementById('website-title').value,
        welcomeMessage: document.getElementById('welcome-message').value,
        footerText: document.getElementById('footer-text').value
    };
    localStorage.setItem('websiteSettings', JSON.stringify(settings));
    showNotification('Content settings saved successfully!');
}

function changeAdminPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials')) || {};
    adminCredentials.password = newPassword;
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
    showNotification('Admin password updated successfully!');
}

function clearCache() {
    localStorage.removeItem('websiteSettings');
    localStorage.removeItem('adminCredentials');
    showNotification('Cache cleared successfully!');
}

function backupData() {
    const backup = {
        users: JSON.parse(localStorage.getItem('registeredUsers')),
        settings: JSON.parse(localStorage.getItem('websiteSettings')),
        admin: JSON.parse(localStorage.getItem('adminCredentials'))
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-coder-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Backup created successfully!');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function displayUsers(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';

    if (users.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 20px;">
                No registered users found
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // Format registration date
        const registrationDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        tr.innerHTML = `
            <td>${user.email}</td>
            <td>${registrationDate}</td>
            <td>
                <span class="status-badge ${user.isAdmin ? 'status-active' : 'status-inactive'}">
                    ${user.isAdmin ? 'Admin' : 'User'}
                </span>
            </td>
            <td>
                <button class="action-btn view-btn" onclick="viewUser('${user.email}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editUser('${user.email}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.email}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function viewUser(email) {
    // Get user details
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        alert(`User Details:\nEmail: ${user.email}\nRole: ${user.isAdmin ? 'Admin' : 'User'}`);
    }
}

function editUser(email) {
    // Get user details
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        const newRole = user.isAdmin ? 'User' : 'Admin';
        if (confirm(`Do you want to change ${email}'s role to ${newRole}?`)) {
            user.isAdmin = !user.isAdmin;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            displayUsers(users);
        }
    }
}

function deleteUser(email) {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const updatedUsers = users.filter(u => u.email !== email);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        displayUsers(updatedUsers);
    }
}

// Function to toggle user block status
function toggleUserBlock(email) {
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
        const user = users[userIndex];
        const isBlocked = !user.isBlocked;
        
        if (confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) {
            users[userIndex].isBlocked = isBlocked;
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            // Update the UI
            const row = document.querySelector(`tr:has(td:contains('${email}'))`);
            if (row) {
                const statusCell = row.cells[2];
                const statusSpan = statusCell.querySelector('span');
                const blockButton = row.cells[3].querySelector('button');
                
                statusSpan.className = isBlocked ? 'status-blocked' : 'status-active';
                statusSpan.textContent = isBlocked ? 'Blocked' : 'Active';
                
                blockButton.className = isBlocked ? 'unblock-btn' : 'block-btn';
                blockButton.innerHTML = isBlocked ? '<i class="fas fa-unlock"></i> Unblock' : '<i class="fas fa-lock"></i> Block';
            }
            
            showNotification(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully!`);
        }
    }
} 