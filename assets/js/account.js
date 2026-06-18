// account.js - Account Page Interactions
(function() {
    'use strict';

    // ============================================================================
    // 🍔 NAVBAR ENHANCEMENTS
    // ============================================================================
    const navToggle = document.getElementById('nav-toggle');
    const navbarMenu = document.getElementById('navbarMenu');
    const navLinks = document.querySelectorAll('.navbar-item');
    const mainNav = document.querySelector('.main-nav');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navToggle.checked) navToggle.checked = false;
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            mainNav.style.backdropFilter = 'blur(10px)';
        } else {
            mainNav.style.boxShadow = '0 2px 10px rgba(189, 55, 69, 0.3)';
            mainNav.style.backdropFilter = 'none';
        }
    });

    function handleNavbarResize() {
        if (window.innerWidth >= 769) {
            if (navToggle) navToggle.checked = false;
            if (navbarMenu) navbarMenu.style.display = 'flex';
        } else {
            if (navbarMenu) navbarMenu.style.display = '';
        }
    }
    window.addEventListener('resize', handleNavbarResize);
    handleNavbarResize();

    // ============================================================================
    // 🎯 MODE TOGGLE WITH ANIMATED TEXT
    // ============================================================================
    const modeToggle = document.getElementById('modeToggle');
    const toggleBtns = modeToggle.querySelectorAll('.toggle-btn');
    const animatedTitle = document.getElementById('animatedTitle');
    const animatedSubtitle = document.getElementById('animatedSubtitle');
    const underlinePath = document.querySelector('.underline-path');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authMessage = document.getElementById('authMessage');

    const modeContent = {
        login: {
            title: 'Welcome Back',
            subtitle: 'Sign in to access your enterprise portal',
            path: 'M 0,10 Q 75,0 150,10 Q 225,20 300,10'
        },
        signup: {
            title: 'Join Us Today',
            subtitle: 'Create your account in just a few steps',
            path: 'M 0,10 Q 75,20 150,10 Q 225,0 300,10'
        }
    };

    let currentMode = 'login';

    // Animate the title change
    function animateTitleChange(newTitle, newSubtitle, newPath) {
        // Fade out current title
        animatedTitle.style.opacity = '0';
        animatedTitle.style.transform = 'translateY(-20px)';
        animatedSubtitle.style.opacity = '0';
        
        // Reset underline animation
        underlinePath.style.animation = 'none';
        underlinePath.offsetHeight; // Force reflow
        underlinePath.setAttribute('d', newPath);
        underlinePath.style.animation = 'drawUnderline 1.5s ease-in-out forwards';

        setTimeout(() => {
            animatedTitle.textContent = newTitle;
            animatedSubtitle.textContent = newSubtitle;
            animatedTitle.style.opacity = '1';
            animatedTitle.style.transform = 'translateY(0)';
            animatedSubtitle.style.opacity = '1';
        }, 200);
    }

    // Switch mode
    function switchMode(mode) {
        if (mode === currentMode) return;
        currentMode = mode;

        // Update toggle buttons
        toggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update toggle slider position
        modeToggle.dataset.active = mode;

        // Animate text change
        const content = modeContent[mode];
        animateTitleChange(content.title, content.subtitle, content.path);

        // Switch forms
        if (mode === 'login') {
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        }

        // Clear messages
        hideMessage();
    }

    // Toggle button click handlers
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    // Hover effect on animated text wrapper
    const animatedWrapper = document.getElementById('animatedTextWrapper');
    animatedWrapper.addEventListener('mouseenter', () => {
        if (currentMode === 'login') {
            underlinePath.setAttribute('d', 'M 0,10 Q 75,20 150,10 Q 225,0 300,10');
        } else {
            underlinePath.setAttribute('d', 'M 0,10 Q 75,0 150,10 Q 225,20 300,10');
        }
    });

    animatedWrapper.addEventListener('mouseleave', () => {
        underlinePath.setAttribute('d', modeContent[currentMode].path);
    });

    // ============================================================================
    // 📝 FORM HANDLERS
    // ============================================================================
    function showMessage(type, text) {
        authMessage.textContent = text;
        authMessage.className = `auth-message show ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }

    function hideMessage() {
        authMessage.classList.remove('show');
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const result = auth.login(email, password);

        if (result.success) {
            showMessage('success', `✅ ${result.message}! Redirecting...`);
            
            // Redirect based on user role
            setTimeout(() => {
                if (result.user.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'portal.html';
                }
            }, 1200);
        } else {
            showMessage('error', `❌ ${result.message}`);
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            showMessage('error', '❌ Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showMessage('error', '❌ Password must be at least 6 characters');
            return;
        }

        const result = auth.register({ name, email, phone, password });

        if (result.success) {
            showMessage('success', `✅ ${result.message}! Please login.`);
            signupForm.reset();
            
            // Auto-switch to login mode after 1.5s
            setTimeout(() => {
                switchMode('login');
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginEmail').focus();
            }, 1500);
        } else {
            showMessage('error', `❌ ${result.message}`);
        }
    });

    // ============================================================================
    // 🔐 AUTO-LOGIN CHECK
    // ============================================================================
    // If user is already logged in, redirect them
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
        showMessage('success', `✅ Already logged in as ${currentUser.name}. Redirecting...`);
        setTimeout(() => {
            if (currentUser.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'portal.html';
            }
        }, 1500);
    }

    // ============================================================================
    // 🎨 INITIAL ANIMATION
    // ============================================================================
    // Trigger initial underline animation on page load
    window.addEventListener('load', () => {
        const path = document.querySelector('.underline-path');
        path.style.animation = 'drawUnderline 1.5s ease-in-out forwards';
    });

    console.log('✨ Mdukazi Projects — Account page loaded');
    console.log('🔐 Demo credentials: admin@mdukazi.co.za / admin123');
    console.log('🔐 Demo client: client@mdukazi.co.za / client123');
})();