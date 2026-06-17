(function() {
    'use strict';

    // ============================================================================
    // 🍔 1. NAVBAR ENHANCEMENTS
    // ============================================================================
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelectorAll('.navbar-item');
    const mainNav = document.querySelector('.main-nav');

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && navToggle.checked) navToggle.checked = false;
        });
    });

    // Add a nice shadow to the navbar when scrolling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainNav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            mainNav.style.backdropFilter = 'blur(10px)';
        } else {
            mainNav.style.boxShadow = '0 2px 10px rgba(189, 55, 69, 0.3)';
            mainNav.style.backdropFilter = 'none';
        }
    });

    // ============================================================================
    // 🧵 2. DIGITAL LOOM BACKGROUND (Hero Canvas)
    // ============================================================================
    // Translated the React component to Vanilla JS. Uses company colors for threads.
    // Uses 'destination-out' to fade trails, preserving the CSS gradient background.
    class DigitalLoom {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.threads = [];
            this.animId = null;
            
            // Company Colors for threads
            this.threadColors = [
                'rgba(239, 205, 209, 0.6)', // Cotton Rose
                'rgba(206, 105, 116, 0.5)', // Lobster Pink
                'rgba(255, 255, 255, 0.4)'  // White
            ];
            this.threadCount = 60;
            
            if (this.canvas) this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.threads = Array.from({ length: this.threadCount }, () => new Thread(this));
        }

        animate() {
            // Erase trails slowly to reveal the CSS gradient underneath
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw threads with 'lighter' for a glowing effect
            this.ctx.globalCompositeOperation = 'lighter';
            this.threads.forEach(thread => {
                thread.update(this);
                thread.draw(this);
            });
            
            this.animId = requestAnimationFrame(() => this.animate());
        }
    }

    class Thread {
        constructor(parent) {
            this.parent = parent;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.parent.width;
            this.y = Math.random() * this.parent.height;
            this.speed = Math.random() * 0.5 + 0.2;
            this.amplitude = Math.random() * 30 + 15;
            this.frequency = Math.random() * 0.02 + 0.005;
            this.phase = Math.random() * Math.PI * 2;
            this.color = this.parent.threadColors[Math.floor(Math.random() * this.parent.threadColors.length)];
        }

        update(parent) {
            this.x += this.speed;
            if (this.x > parent.width + 300) {
                this.x = -300;
                this.y = Math.random() * parent.height;
            }
        }

        draw(parent) {
            const ctx = parent.ctx;
            const startX = Math.max(this.x - 300, 0);
            
            ctx.beginPath();
            ctx.moveTo(
                startX,
                this.y + Math.sin(startX * this.frequency + this.phase) * this.amplitude
            );
            
            for (let i = startX; i < this.x; i++) {
                ctx.lineTo(
                    i,
                    this.y + Math.sin(i * this.frequency + this.phase) * this.amplitude
                );
            }
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    // Inject canvas into hero
    const hero = document.querySelector('.about-hero');
    if (hero) {
        const canvas = document.createElement('canvas');
        canvas.id = 'loom-canvas';
        hero.insertBefore(canvas, hero.firstChild);
        new DigitalLoom('loom-canvas');
    }

    // ============================================================================
    // 📅 3. EXPANDABLE TIMELINE (Spring Animation)
    // ============================================================================
    // Mimics framer-motion's useSpring by using a bouncy cubic-bezier in CSS
    document.querySelectorAll('.timeline-item').forEach(item => {
        const year = item.querySelector('.timeline-year');
        if (!year) return;

        // Add chevron icon dynamically
        const chevron = document.createElement('i');
        chevron.className = 'fas fa-chevron-down timeline-chevron';
        year.appendChild(chevron);

        // Click to toggle expansion
        item.addEventListener('click', () => {
            item.classList.toggle('is-expanded');
        });
    });

    // ============================================================================
    // ✨ 4. SCROLL REVEAL FOR CARDS
    // ============================================================================
    const revealElements = document.querySelectorAll('.info-card, .value-item, .info-block');
    
    // Set initial state via JS
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));

    console.log('✨ Mdukazi Projects — About page fully loaded!');
    console.log('🧵 Digital Loom background is weaving...');
    console.log('📅 Click on any timeline year to expand our history.');

})();