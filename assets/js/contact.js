(function() {
    'use strict';

    // ============================================================================
    // 🍔 1. NAVBAR ENHANCEMENTS
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
    // 🫧 2. GOOEY TEXT ANIMATION (Hero)
    // ============================================================================
    const texts = [
        'Get In Touch',
        'Contact Us',
        'We\'re Here',
        'To Help You',
        'Reach Out'
    ];
    const morphTime = 1.8;
    const cooldownTime = 0.5;

    const text1El = document.getElementById('gooeyText1');
    const text2El = document.getElementById('gooeyText2');

    if (text1El && text2El) {
        let textIndex = texts.length - 1;
        let time = new Date();
        let morph = 0;
        let cooldown = cooldownTime;

        const setMorph = (fraction) => {
            const blur2 = Math.min(8 / (fraction + 0.01) - 8, 100);
            text2El.style.filter = `blur(${blur2}px)`;
            text2El.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

            const fraction1 = 1 - fraction;
            const blur1 = Math.min(8 / (fraction1 + 0.01) - 8, 100);
            text1El.style.filter = `blur(${blur1}px)`;
            text1El.style.opacity = `${Math.pow(fraction1, 0.4) * 100}%`;
        };

        const doCooldown = () => {
            morph = 0;
            text2El.style.filter = '';
            text2El.style.opacity = '100%';
            text1El.style.filter = '';
            text1El.style.opacity = '0%';
        };

        const doMorph = () => {
            morph -= cooldown;
            cooldown = 0;
            let fraction = morph / morphTime;
            if (fraction > 1) {
                cooldown = cooldownTime;
                fraction = 1;
            }
            setMorph(fraction);
        };

        function animate() {
            requestAnimationFrame(animate);
            const newTime = new Date();
            const shouldIncrementIndex = cooldown > 0;
            const dt = (newTime.getTime() - time.getTime()) / 1000;
            time = newTime;

            cooldown -= dt;

            if (cooldown <= 0) {
                if (shouldIncrementIndex) {
                    textIndex = (textIndex + 1) % texts.length;
                    text1El.textContent = texts[textIndex % texts.length];
                    text2El.textContent = texts[(textIndex + 1) % texts.length];
                }
                doMorph();
            } else {
                doCooldown();
            }
        }
        animate();
    }

    // ============================================================================
    // 🔐 3. SIGNUP / LOGIN MODAL
    // ============================================================================
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const toggleLink = document.getElementById('toggleLink');
    const toggleText = document.getElementById('toggleText');
    const nameField = document.getElementById('nameField');
    const signupName = document.getElementById('signupName');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');

    let isLoginMode = true;

    function openModal(mode) {
        isLoginMode = (mode === 'login');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (isLoginMode) {
            modalTitle.textContent = 'Sign In';
            modalSubtitle.textContent = 'Welcome back to Mdukazi Projects';
            authSubmitBtn.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleLink.textContent = 'Sign Up';
            nameField.style.display = 'none';
        } else {
            modalTitle.textContent = 'Create Account';
            modalSubtitle.textContent = 'Join Mdukazi Projects today';
            authSubmitBtn.textContent = 'Sign Up';
            toggleText.textContent = 'Already have an account?';
            toggleLink.textContent = 'Sign In';
            nameField.style.display = 'block';
        }
    }

    function closeModalFn() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('authForm').reset();
        nameField.style.display = 'none';
    }

    if(loginBtn) loginBtn.addEventListener('click', () => openModal('login'));
    if(signupBtn) signupBtn.addEventListener('click', () => openModal('signup'));
    if(closeModal) closeModal.addEventListener('click', closeModalFn);
    if(modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModalFn(); });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModalFn();
    });

    if(toggleLink) toggleLink.addEventListener('click', () => {
        openModal(isLoginMode ? 'signup' : 'login');
    });

    const authForm = document.getElementById('authForm');
    if(authForm) authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();
        const name = signupName.value.trim();

        if (!email || !password) { alert('Please fill in all required fields.'); return; }
        if (password.length < 6) { alert('Password must be at least 6 characters.'); return; }
        if (!isLoginMode && !name) { alert('Please enter your full name.'); return; }

        const action = isLoginMode ? 'signed in' : 'signed up';
        alert(`✅ Successfully ${action} as ${email}!`);
        closeModalFn();
    });

    // ============================================================================
    // ✉️ 4. CONTACT FORM HANDLER
    // ============================================================================
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Simulate sending
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                contactForm.style.display = 'none';
                formSuccess.style.display = 'block';
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }

    // ============================================================================
    // ✨ 5. SCROLL REVEAL
    // ============================================================================
    const revealElements = document.querySelectorAll('.reveal-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    console.log('✨ Mdukazi Projects — Contact page fully loaded!');
    console.log('🫧 Gooey text is morphing...');
    console.log('🔐 Signup/Login modal ready.');
})();