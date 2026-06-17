(function() {
    'use strict';

    // ============================================================================
    // 🍔 1. NAVBAR ENHANCEMENTS
    // ============================================================================
    const navToggle = document.getElementById('nav-toggle');
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

    // ============================================================================
    // 🌐 2. NETWORK NODES HERO CANVAS
    // ============================================================================
    // Creates a dynamic "data packet / network node" effect using company colors.
    class NetworkNodes {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
            this.nodes = [];
            this.connectionDistance = 120;
            this.nodeCount = 60;
            
            this.colors = [
                'rgba(239, 205, 209, 0.8)', // Cotton Rose
                'rgba(206, 105, 116, 0.7)', // Lobster Pink
                'rgba(255, 255, 255, 0.6)'  // White
            ];
            
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
            
            this.nodes = Array.from({ length: this.nodeCount }, () => ({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            }));
        }

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // Update and draw nodes
            this.nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                if (node.x < 0 || node.x > this.width) node.vx *= -1;
                if (node.y < 0 || node.y > this.height) node.vy *= -1;
                
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = node.color;
                this.ctx.fill();
            });
            
            // Draw connections
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.connectionDistance) {
                        const opacity = 1 - (distance / this.connectionDistance);
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                        this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(() => this.animate());
        }
    }
    new NetworkNodes('faq-canvas');

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
            this.animate(); // Start RAF loop for smooth Lerp

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
            
            // Snap position to prevent flying across screen
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
            // Lerp (Linear Interpolation) for buttery smooth spring physics
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

    // Initialize HoverPeek only on desktop
    if (window.matchMedia('(min-width: 769px)').matches) {
        new HoverPeek();
    }

    // ============================================================================
    // ✨ 4. SCROLL REVEAL FOR FAQ ITEMS
    // ============================================================================
    const revealElements = document.querySelectorAll('.faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => observer.observe(el));

    console.log('✨ Mdukazi Projects — FAQ page fully loaded!');
    console.log('🌐 Network nodes are connecting...');
    console.log('🔍 Hover over highlighted terms to see definitions.');

})();