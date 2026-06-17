// Authentication System - No password hashing as requested
// Data stored in localStorage (simulating JSON file)

class AuthSystem {
    constructor() {
        this.usersKey = 'mdukazi_users';
        this.currentUserKey = 'mdukazi_current_user';
        this.initializeUsers();
    }

    initializeUsers() {
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    signup(name, email, password) {
        const users = this.getUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user with client data
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // No hashing as requested
            createdAt: new Date().toISOString(),
            clientData: {
                service: 'DIA 100Mbps',
                speed: '100 Mbps',
                balance: 0,
                dueDate: this.getNextBillingDate(),
                paymentHistory: [],
                issues: []
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true, message: 'Account created successfully', user: newUser };
    }

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            return { success: true, message: 'Login successful', user: user };
        }

        return { success: false, message: 'Invalid email or password' };
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        const userData = localStorage.getItem(this.currentUserKey);
        return userData ? JSON.parse(userData) : null;
    }

    updateUserClientData(clientData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].clientData = clientData;
            this.saveUsers(users);
            localStorage.setItem(this.currentUserKey, JSON.stringify(users[userIndex]));
            return true;
        }
        return false;
    }

    getNextBillingDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date.toISOString().split('T')[0];
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchModal(fromId, toId) {
    closeModal(fromId);
    openModal(toId);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Form Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const result = auth.login(email, password);
            
            if (result.success) {
                alert('Login successful!');
                window.location.href = 'portal.html';
            } else {
                alert(result.message);
            }
        });
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const termsChecked = document.getElementById('termsCheckbox').checked;

            if (!termsChecked) {
                alert('Please agree to the Terms and Conditions');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const result = auth.signup(name, email, password);
            
            if (result.success) {
                alert('Account created successfully! Please login.');
                switchModal('signupModal', 'loginModal');
                document.getElementById('signupForm').reset();
            } else {
                alert(result.message);
            }
        });
    }
});

function logout() {
    auth.logout();
}