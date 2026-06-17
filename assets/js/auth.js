// Authentication System - Updated with Admin Support
// Hardcoded admin credentials for development

const ADMIN_CREDENTIALS = {
    email: 'admin@mdukaziprojects.co.za',
    password: 'admin123'
};

class AuthSystem {
    constructor() {
        this.usersKey = 'mdukazi_users';
        this.currentUserKey = 'mdukazi_current_user';
        this.specialsKey = 'mdukazi_specials';
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.specialsKey)) {
            const defaultSpecials = [
                {
                    id: 1,
                    title: 'Summer Promotion',
                    description: 'Get 2 months free when you sign up for 12-month contract',
                    badge: 'Limited Time',
                    startDate: '2026-06-01',
                    endDate: '2026-08-31',
                    targetServices: 'All Services',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Business Bundle',
                    description: 'DIA + CCTV + VPN at 15% off',
                    badge: 'New',
                    startDate: '2026-06-01',
                    endDate: '2026-12-31',
                    targetServices: 'Business Packages',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(this.specialsKey, JSON.stringify(defaultSpecials));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getSpecials() {
        return JSON.parse(localStorage.getItem(this.specialsKey) || '[]');
    }

    saveSpecials(specials) {
        localStorage.setItem(this.specialsKey, JSON.stringify(specials));
    }

    signup(name, email, password) {
        const users = this.getUsers();
        
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            clientData: {
                service: 'DIA 100Mbps',
                speed: '100 Mbps',
                balance: 2999,
                dueDate: this.getNextBillingDate(),
                paymentHistory: [],
                issues: [],
                monthsPaid: []
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true, message: 'Account created successfully', user: newUser };
    }

    login(email, password) {
        // Check admin credentials
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const adminUser = {
                id: 0,
                name: 'Administrator',
                email: email,
                isAdmin: true
            };
            localStorage.setItem(this.currentUserKey, JSON.stringify(adminUser));
            return { success: true, message: 'Admin login successful', user: adminUser, isAdmin: true };
        }

        // Check client credentials
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem(this.currentUserKey, JSON.stringify(user));
            return { success: true, message: 'Login successful', user: user, isAdmin: false };
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
        if (!currentUser || currentUser.isAdmin) return false;

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

    // Admin functions
    getAllClients() {
        return this.getUsers();
    }

    getAllIssues() {
        const users = this.getUsers();
        const allIssues = [];
        
        users.forEach(user => {
            if (user.clientData && user.clientData.issues) {
                user.clientData.issues.forEach(issue => {
                    allIssues.push({
                        ...issue,
                        clientName: user.name,
                        clientEmail: user.email,
                        clientId: user.id
                    });
                });
            }
        });
        
        return allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    getAllPayments() {
        const users = this.getUsers();
        const allPayments = [];
        
        users.forEach(user => {
            if (user.clientData && user.clientData.paymentHistory) {
                user.clientData.paymentHistory.forEach(payment => {
                    allPayments.push({
                        ...payment,
                        clientName: user.name,
                        clientEmail: user.email,
                        clientId: user.id
                    });
                });
            }
        });
        
        return allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getOutstandingAccounts() {
        const users = this.getUsers();
        return users.filter(user => 
            user.clientData && user.clientData.balance > 0
        );
    }

    createSpecial(specialData) {
        const specials = this.getSpecials();
        const newSpecial = {
            id: Date.now(),
            ...specialData,
            createdAt: new Date().toISOString()
        };
        specials.push(newSpecial);
        this.saveSpecials(specials);
        return newSpecial;
    }

    deleteSpecial(specialId) {
        const specials = this.getSpecials();
        const filtered = specials.filter(s => s.id !== specialId);
        this.saveSpecials(filtered);
    }

    updateIssueStatus(issueId, clientId, status, response) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === clientId);
        
        if (userIndex !== -1) {
            const issueIndex = users[userIndex].clientData.issues.findIndex(i => i.id === issueId);
            if (issueIndex !== -1) {
                users[userIndex].clientData.issues[issueIndex].status = status;
                users[userIndex].clientData.issues[issueIndex].response = response;
                users[userIndex].clientData.issues[issueIndex].resolvedAt = new Date().toISOString();
                this.saveUsers(users);
                return true;
            }
        }
        return false;
    }

    getAnalytics() {
        const users = this.getUsers();
        const payments = this.getAllPayments();
        
        // Monthly signups
        const monthlySignups = {};
        users.forEach(user => {
            const month = user.createdAt.substring(0, 7);
            monthlySignups[month] = (monthlySignups[month] || 0) + 1;
        });

        // Service distribution
        const serviceDistribution = {};
        users.forEach(user => {
            if (user.clientData && user.clientData.service) {
                const service = user.clientData.service;
                serviceDistribution[service] = (serviceDistribution[service] || 0) + 1;
            }
        });

        // Total revenue
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Total outstanding
        const totalOutstanding = users.reduce((sum, u) => 
            sum + (u.clientData ? u.clientData.balance : 0), 0
        );

        return {
            totalClients: users.length,
            totalRevenue: totalRevenue,
            totalOutstanding: totalOutstanding,
            monthlySignups: monthlySignups,
            serviceDistribution: serviceDistribution,
            recentSignups: users.slice(-5).reverse(),
            recentPayments: payments.slice(0, 5)
        };
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
                if (result.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'portal.html';
                }
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

function adminLogout() {
    auth.logout();
}