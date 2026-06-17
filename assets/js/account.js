(function() {
    'use strict';

    // Redirect if already logged in
    const currentUser = localStorage.getItem('mdukazi_current_user');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        window.location.href = user.isAdmin ? 'admin.html' : 'portal.html';
    }

    // DOM Elements
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const toggleContainer = document.getElementById('toggleContainer');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const animatedText = document.getElementById('animatedText');
    const underlinePath = document.querySelector('.underline-path');

    let currentMode = 'login';

    // Toggle Switch Logic
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === currentMode) return;

            currentMode = mode;
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (mode === 'register') {
                toggleContainer.classList.add('register');
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                animatedText.textContent = 'Create Account';
            } else {
                toggleContainer.classList.remove('register');
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                animatedText.textContent = 'Welcome Back';
            }

            // Re-trigger SVG draw animation
            underlinePath.style.animation = 'none';
            void underlinePath.offsetWidth; // Force reflow
            underlinePath.style.animation = 'drawLine 1s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        });
    });

    // Set initial active state
    document.querySelector('[data-mode="login"]').classList.add('active');

    // ==============================
    // 🗄️ SIMULATED JSON DATABASE
    // ==============================
    // Browsers cannot write directly to server .json files without a backend.
    // localStorage perfectly mimics a JSON structure for this demo.
    
    function getUsers() {
        const users = localStorage.getItem('mdukazi_users_db');
        return users ? JSON.parse(users) : [];
    }

    function saveUsers(users) {
        localStorage.setItem('mdukazi_users_db', JSON.stringify(users));
    }

    function findUser(email) {
        return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // ==============================
    // 📝 REGISTER HANDLER
    // ==============================
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const msg = document.getElementById('registerMessage');
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        if (findUser(email)) {
            msg.textContent = 'Email already registered. Please sign in.';
            msg.className = 'form-message error';
            return;
        }

        // Demo: Plain text password as requested
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, 
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        const users = getUsers();
        users.push(newUser);
        saveUsers(users);

        msg.textContent = 'Account created successfully! Redirecting...';
        msg.className = 'form-message success';
        
        // Simulate API delay
        setTimeout(() => {
            localStorage.setItem('mdukazi_current_user', JSON.stringify(newUser));
            window.location.href = 'portal.html';
        }, 1200);
    });

    // ==============================
    // 🔐 LOGIN HANDLER
    // ==============================
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const msg = document.getElementById('loginMessage');
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const user = findUser(email);
        if (!user) {
            msg.textContent = 'Account not found. Please register.';
            msg.className = 'form-message error';
            return;
        }

        if (user.password !== password) {
            msg.textContent = 'Incorrect password. Please try again.';
            msg.className = 'form-message error';
            return;
        }

        msg.textContent = 'Login successful! Redirecting...';
        msg.className = 'form-message success';

        setTimeout(() => {
            localStorage.setItem('mdukazi_current_user', JSON.stringify(user));
            window.location.href = user.isAdmin ? 'admin.html' : 'portal.html';
        }, 1000);
    });

    // ==============================
    // 🚪 GLOBAL LOGOUT HELPER
    // ==============================
    // Call window.auth.logout() from any portal page to sign out
    window.auth = window.auth || {};
    window.auth.logout = function() {
        localStorage.removeItem('mdukazi_current_user');
        window.location.href = 'account.html';
    };

    // Export helper to view JSON in console (for debugging/demo)
    window.auth.exportJSON = function() {
        console.log('📦 Mdukazi Users JSON:', getUsers());
        alert('Check browser console (F12) to see the JSON database.');
    };

    console.log('✨ Account page initialized. JSON simulation active.');
})();