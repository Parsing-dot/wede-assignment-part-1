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
        'Frequently Asked',
        'Questions',
        'Enterprise ICT',
        'Solutions',
        'We\'ve Got Answers'
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
    // 🔍 3. HOVERPEEK GLOSSARY (Spring Physics & 3D Tilt)
    // ============================================================================
    class HoverPeek {
        constructor() {
            this.terms = document.querySelectorAll('.glossary-term');
            this.wrapper = null;
            this.card = null;
            this.targetX = 0;
            this.targetY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.isHovering = false;
            this.hideTimeout = null;
            this.init();
        }

        init() {
            this.createCard();
            this.animate();

            this.terms.forEach(term => {
                term.addEventListener('mouseenter', (e) => this.showCard(e, term));
                term.addEventListener('mouseleave', () => this.scheduleHide());
                term.addEventListener('mousemove', (e) => this.updateTarget(e));
            });

            this.card.addEventListener('mouseenter', () => this.cancelHide());
            this.card.addEventListener('mouseleave', () => this.scheduleHide());
        }

        createCard() {
            this.wrapper = document.createElement('div');
            this.wrapper.className = 'peek-wrapper';
            
            this.card = document.createElement('div');
            this.card.className = 'peek-card';
            this.card.innerHTML = `
                <div class="peek-header">
                    <i class="fas fa-book-open"></i>
                    <span class="peek-term-name">Term</span>
                </div>
                <p class="peek-definition">Definition goes here.</p>
                <a href="#" target="_blank" class="peek-link">
                    <i class="fab fa-google"></i> Search Meaning on Google
                </a>
            `;
            
            this.wrapper.appendChild(this.card);
            document.body.appendChild(this.wrapper);
        }

        showCard(e, term) {
            this.cancelHide();
            const termName = term.getAttribute('data-term');
            const termDef = term.getAttribute('data-def');
            
            this.card.querySelector('.peek-term-name').textContent = termName;
            this.card.querySelector('.peek-definition').textContent = termDef;
            this.card.querySelector('.peek-link').href = `https://www.google.com/search?q=what+is+${encodeURIComponent(termName)}+in+ICT+networking`;
            
            this.targetX = e.clientX;
            this.targetY = e.clientY - 20;
            this.currentX = this.targetX;
            this.currentY = this.targetY;
            
            this.isHovering = true;
            this.card.classList.add('is-visible');
        }

        scheduleHide() {
            this.hideTimeout = setTimeout(() => {
                this.isHovering = false;
                this.card.classList.remove('is-visible');
            }, 200);
        }

        cancelHide() {
            clearTimeout(this.hideTimeout);
            this.isHovering = true;
        }

        updateTarget(e) {
            this.targetX = e.clientX;
            this.targetY = e.clientY - 20;
        }

        animate() {
            this.currentX += (this.targetX - this.currentX) * 0.15;
            this.currentY += (this.targetY - this.currentY) * 0.15;

            if (this.isHovering || this.card.classList.contains('is-visible')) {
                const rotateY = ((this.currentX - (window.innerWidth / 2)) / (window.innerWidth / 2)) * 8;
                const rotateX = 5; 
                
                this.wrapper.style.left = `${this.currentX}px`;
                this.wrapper.style.top = `${this.currentY}px`;
                this.wrapper.style.transform = `translate(-50%, -100%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    if (window.matchMedia('(min-width: 769px)').matches) {
        new HoverPeek();
    }

    // ============================================================================
    // 🔐 4. SIGNUP / LOGIN MODAL
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
    // ✨ 5. SCROLL REVEAL FOR FAQ ITEMS
    // ============================================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.transitionDelay = `${index * 0.08}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    faqItems.forEach(item => observer.observe(item));

    console.log('✨ Mdukazi Projects — FAQ page fully loaded!');
    console.log('🫧 Gooey text is morphing...');
    console.log('🔍 Hover over highlighted terms to see definitions.');
    console.log('🔐 Signup/Login modal ready.');

})();