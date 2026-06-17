/**
 * Mdukazi Projects - Main JavaScript
 * Interactive animations and functionality
 */

(function() {
    'use strict';

    // ============================================
    // 1. BUTTON RIPPLE & LOADING EFFECTS
    // ============================================
    function initButtons() {
        const buttons = document.querySelectorAll('.animated-button');
        
        buttons.forEach(button => {
            // Ripple effect on click
            button.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                
                ripple.className = 'button-ripple';
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
                
                this.appendChild(ripple);
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
            
            // Loading state toggle (for demo)
            if (button.id === 'primaryBtn') {
                button.addEventListener('click', function(e) {
                    // Prevent default if it's a link
                    e.preventDefault();
                    
                    // Toggle loading state
                    const isLoading = this.dataset.loading === 'true';
                    const content = this.querySelector('.button-content');
                    
                    if (!isLoading) {
                        // Show loading
                        this.dataset.loading = 'true';
                        this.classList.add('button-loading');
                        content.innerHTML = '<span class="button-spinner"></span> Loading...';
                        
                        // Simulate async operation
                        setTimeout(() => {
                            this.dataset.loading = 'false';
                            this.classList.remove('button-loading');
                            content.innerHTML = '<i class="fas fa-rocket"></i> Explore Services';
                            
                            // Show success feedback
                            const originalColor = this.style.backgroundColor;
                            this.style.backgroundColor = '#2ecc71';
                            this.style.color = '#fff';
                            setTimeout(() => {
                                this.style.backgroundColor = originalColor;
                                this.style.color = '';
                            }, 1000);
                        }, 2000);
                    }
                });
            }
            
            // Hover effect - subtle glow
            button.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 8px 32px rgba(189, 55, 69, 0.3)';
            });
            
            button.addEventListener('mouseleave', function() {
                if (!this.classList.contains('button-primary')) {
                    this.style.boxShadow = 'none';
                } else {
                    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
            });
        });
    }

    // ============================================
    // 2. COUNTER ANIMATION FOR STATS
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    const duration = 2000;
                    const startTime = performance.now();
                    
                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);
                        
                        el.textContent = current + (target > 100 ? '+' : '');
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            el.textContent = target + (target > 100 ? '+' : '');
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }

    // ============================================
    // 3. SCROLL REVEAL ANIMATIONS
    // ============================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.feature-card, .benefit-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ============================================
    // 4. PARALLAX HERO PARTICLES
    // ============================================
    function initParallaxParticles() {
        const particles = document.querySelectorAll('.particle');
        const hero = document.querySelector('.hero.is-primary');
        
        if (!hero || particles.length === 0) return;
        
        document.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            particles.forEach((particle, index) => {
                const speed = 20 + index * 5;
                const moveX = x * speed;
                const moveY = y * speed;
                particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }

    // ============================================
    // 5. TYPING EFFECT FOR HERO TITLE
    // ============================================
    function initTypingEffect() {
        const title = document.getElementById('hero-title');
        if (!title) return;
        
        const originalText = title.textContent;
        const chars = originalText.split('');
        title.textContent = '';
        
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < chars.length) {
                title.textContent += chars[index];
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    // ============================================
    // 6. MOBILE MENU ACCESSIBILITY
    // ============================================
    function initMobileMenu() {
        const toggle = document.getElementById('nav-toggle');
        const burger = document.querySelector('.navbar-burger');
        
        if (toggle && burger) {
            // Update aria-expanded
            toggle.addEventListener('change', function() {
                const isExpanded = this.checked;
                burger.setAttribute('aria-expanded', isExpanded);
            });
            
            // Close menu when clicking a link (mobile)
            document.querySelectorAll('.navbar-menu .navbar-item').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        toggle.checked = false;
                        burger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    }

    // ============================================
    // 7. SMOOTH SCROLL FOR INTERNAL LINKS
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const navHeight = document.querySelector('.main-nav').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // 8. ACTIVE NAV LINK ON SCROLL
    // ============================================
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-menu .navbar-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.remove('is-active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('is-active');
                        }
                    });
                }
            });
        }, { threshold: 0.4 });
        
        sections.forEach(section => observer.observe(section));
    }

    // ============================================
    // 9. FEATURE CARD GLOW ON HOVER
    // ============================================
    function initCardGlow() {
        const cards = document.querySelectorAll('.feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                this.style.setProperty('--mouse-x', x + 'px');
                this.style.setProperty('--mouse-y', y + 'px');
                this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(189, 55, 69, 0.05) 0%, transparent 70%)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.background = '';
            });
        });
    }

    // ============================================
    // 10. INITIALIZE ALL
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        // Run all initializations
        initButtons();
        animateCounters();
        initScrollReveal();
        initParallaxParticles();
        initTypingEffect();
        initMobileMenu();
        initSmoothScroll();
        initActiveNavLink();
        initCardGlow();
        
        console.log('🚀 Mdukazi Projects - Interactive features loaded');
    });

})();